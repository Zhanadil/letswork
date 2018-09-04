const JWT = require('jsonwebtoken');

const Company = require('@models/company');
const Student = require('@models/student');
const { Vacancy, Application } = require('@models/vacancy');
const { JWT_SECRET } = require('@configuration');

// Все функции манипулирующие вакансиями
module.exports = {
    // Создать новую вакансию для компании
    // req.body: {
    //      vacancyField: String // Область профессии(IT, Менеджмент, Кулинария)
    //      vacancyName: String  // Название профессии(Джуниор Программист, Повар)
    //      description: String  // Описание
    //      demands: [String]    // Требования
    //      type: [String]       // Тип работы(Полная ставка, стажировка)
    //      minSalary: Int       // Мин зарплата
    //      maxSalary: Int       // Макс зп
    // }
    newVacancy: async (req, res, next) => {
        var details = {};
        details.companyId = req.account.id;
        details.vacancyField = req.body.vacancyField;
        details.vacancyName = req.body.vacancyName;
        details.description = req.body.description;
        details.demands = req.body.demands;
        details.type = req.body.type;
        details.minSalary = req.body.minSalary;
        details.maxSalary = req.body.maxSalary;

        // Find Company which creates the vacancy.
        const company = await Company.findById(details.companyId, (err) => {
            if (err) {
                return res.status(500).json({error: "db error"});
            }
        });

        details.companyName = company.name;

        // Create new vacancy.
        const vacancy = await new Vacancy(details);
        await vacancy.save();

        // Add vacancy to company's vacancy list.
        company.vacancies.push(vacancy._id);
        await company.save()
        return res.status(200).json({status: "ok"});
    },

    // Компания отправляет заявку на вакансию студенту
    // req.body: {
    //      vacancyId: String
    //      studentId: String
    // }
    companyApplication: async (req, res, next) => {
        // Проверяем айди вакансии на действительность
        await Vacancy.findById(req.body.vacancyId, (err, vacancy) => {
            if (err) {
                return res.status(500).json({error: err.message});
            }
            if (!vacancy) {
                return res.status(400).json({error: "vacancy not found"});
            }
            if (vacancy.companyId !== req.account._id.toString()) {
                return res.status(403).json({error: "wrong vacancyId"});
            }
        });

        // Find the student.
        var student = await Student.findById(req.body.studentId, (err) => {
            if (err) {
                return res.status(500).json({error: err.message});
            }
        });
        if (!student) {
            return res.status(400).json({error: "student not found"});
        }

        var application = await Application.findOne(
                {studentId: req.body.studentId, vacancyId: req.body.vacancyId},
                (err) => {
                    if (err) {
                        return res.status(500).json({error: err.message});
                    }
                }
            );

        // Если заявка уже существует
        if (application) {
            // Отправить заявку повторно можно только если статус
            // заявки 'canceled' или 'rejected'
            if (application.status !== 'canceled' && application.status !== 'rejected') {
                return res.status(409).json({
                    error: `student can't be called, current status is: ${application.status}`
                });
            }
            application.status = 'pending';
            application.sender = 'company';
            application.studentDiscarded = false;
            application.companyDiscarded = false;

            await application.save();

            return res.status(200).json({status: "ok"});
        }

        application = await new Application({
            vacancyId: req.body.vacancyId,
            companyId: req.account._id,
            studentId: req.body.studentId,
            status: "pending",
            sender: "company",
            studentDiscarded: false,
            companyDiscarded: false,
        });
        await application.save();

        // Add vacancy to student's vacancy list.
        student.vacancies.push(req.body.vacancyId);
        await student.save();

        return res.status(200).json({status: "ok"});
    },

    // Студент отправляет заявку на вакансию
    // req.body: {
    //      vacancyId: String
    // }
    studentApplication: async (req, res, next) => {
        // Айди компании которая создала вакансию, нужно для создания заявки
        var companyId;
        // Проверяем айди вакансии на действительность
        await Vacancy.findById(req.body.vacancyId, (err, vacancy) => {
            if (err) {
                return res.status(500).json({error: err.message});
            }
            if (!vacancy) {
                return res.status(400).json({error: "vacancy not found"});
            }
            companyId = vacancy.companyId;
        });

        // Find the student.
        var student = await Student.findById(req.account._id, (err) => {
            if (err) {
                return res.status(500).json({error: err.message});
            }
        });
        if (!student) {
            return res.status(400).json({error: "student not found"});
        }

        var application = await Application.findOne(
                {studentId: req.account._id, vacancyId: req.body.vacancyId},
                (err) => {
                    if (err) {
                        return res.status(500).json({error: err.message});
                    }
                }
            );

        // Если заявка уже существует
        if (application) {
            // Отправить заявку повторно можно только если статус
            // заявки 'canceled' или 'rejected'
            if (application.status !== 'canceled' && application.status !== 'rejected') {
                return res.status(409).json({
                    error: `student can't apply, current status is: ${application.status}`
                });
            }
            application.status = 'pending';
            application.sender = 'student';
            application.studentDiscarded = false;
            application.companyDiscarded = false;

            await application.save();

            return res.status(200).json({status: "ok"});
        }

        application = await new Application({
            vacancyId: req.body.vacancyId,
            companyId: companyId,
            studentId: req.account._id,
            status: "pending",
            sender: "student",
            studentDiscarded: false,
            companyDiscarded: false,
        });
        await application.save();

        // Add vacancy to student's vacancy list.
        student.vacancies.push(req.body.vacancyId);
        await student.save();

        return res.status(200).json({status: "ok"});
    },

    // Изменить статус вакансии, requirements для каждого случая брать из statusRequirements.
    // Чтобы изменить статус, для этого нынешний статус должен быть из массива requirements.status
    // И отправитель должен быть requirements.sender
    // Пример использования:
    //
    // VacancyController = require('@controllers/vacancy');
    // ...
    // vacancyRouter.post('/accept',
    //    VacancyController.changeStatus(VacancyController.statusRequirements.studentAccepts, 'accepted'));
    changeStatus: (requirements, finalStatus) => {
        // Middleware для роутера.
        // req.body: {
        //      vacancyId: String
        //      studentId: String // (не требуется если запрос идет со стороны самого студента)
        // }
        return async (req, res, next) => {
            // Проверяем от кого исходил запрос, от студента или от компании
            var sender;
            JWT.verify(req.headers.authorization, JWT_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(500).json({error: err.message});
                }
                sender = decoded.sub.type;
            });
            var studentId = (sender == "company" ? req.body.studentId : req.account._id);
            var vacancyId = req.body.vacancyId;
            // Проверяем айди вакансии на действительность
            await Vacancy.findById(vacancyId, (err, vacancy) => {
                if (err) {
                    return res.status(500).json({error: err.message});
                }
                if (!vacancy) {
                    return res.status(400).json({error: "vacancy not found"});
                }
                // Если запрос исходил от компании, то вакансия должна принодлежать только ей
                if (sender == "company" && vacancy.companyId !== req.account._id.toString()) {
                    return res.status(403).json({error: "wrong vacancyId"});
                }
            });

            // Find the student.
            var student = await Student.findById(studentId, (err) => {
                if (err) {
                    return res.status(500).json({error: err.message});
                }
            });
            if (!student) {
                return res.status(400).json({error: "student not found"});
            }

            var application = await Application.findOne(
                    {studentId, vacancyId},
                    (err) => {
                        if (err) {
                            return res.status(500).json({error: err.message});
                        }
                    }
                );

            // Если заявка не существует
            if (!application) {
                return res.status(400).json({
                    error: "application doesn't exist"
                });
            }

            // Принять заявку можно только если заявка отправлена
            // со стороны студента и статус заявки 'pending'
            if (requirements.status !== undefined &&
                    requirements.status.findIndex((element) => {
                        return element === application.status
                    }) === -1) {
                return res.status(409).json({
                    error: `status can't be changed, current status is: ${application.status}`
                });
            }
            if (requirements.sender !== undefined && application.sender !== requirements.sender) {
                return res.status(409).json({
                    error: `status can't be changed, required sender is ${requirements.sender}`
                });
            }
            application.status = finalStatus;
            application.studentDiscarded = false;
            application.companyDiscarded = false;

            await application.save();

            return res.status(200).json({status: "ok"});
        }
    },

    statusRequirements: {
        studentAccept: {
            sender: 'company',
            status: ['pending']
        },
        studentReject: {
            sender: 'company',
            status: ['pending', 'accepted']
        },
        studentCancel: {
            sender: 'student',
            status: ['pending', 'accepted']
        },
        companyAccept: {
            sender: 'student',
            status: ['pending']
        },
        companyReject: {
            sender: 'student',
            status: ['pending', 'accepted']
        },
        companyCancel: {
            sender: 'company',
            status: ['pending', 'accepted']
        },
    },

    // Студент скрывает заявку
    studentDiscardApplication: async (req, res, next) => {
        const application = await Application.findOne({
                vacancyId: req.body.vacancyId,
                studentId: req.account._id
            }, (err) => {
                if (err) {
                    return res.status(500).json({err: err.message});
                }
            });

        if (!application) {
            res.status(400).json({error: "application doesn't exist"});
        }

        application.studentDiscarded = true;
        await application.save();

        return res.status(200).json({status: "ok"});
    },

    // Студент скрывает заявку
    companyDiscardApplication: async (req, res, next) => {
        const application = await Application.findOne({
                vacancyId: req.body.vacancyId,
                studentId: req.body.studentId
            }, (err) => {
                if (err) {
                    return res.status(500).json({err: err.message});
                }
            });

        if (!application) {
            res.status(400).json({error: "application doesn't exist"});
        }

        application.companyDiscarded = true;
        await application.save();

        return res.status(200).json({status: "ok"});
    },

    // Get all applications related to this company, based on status written in request.
    getCompanyVacancies: async (req, res, next) => {
        Vacancy.find({"_id": {"$in": req.account.vacancies}}, (err, vacancies) => {
            if (err) {
                return res.status(500).json({error: err.message});
            }
            return res.status(200).json({vacancies: vacancies});
        });
    },

    getCompanyApplications: (req, res, next) => {
        var vacancies;
        var applications;
        var studentIds = [];
        var students;
        Vacancy.find({"_id": {"$in": req.account.vacancies}}, (err, queryVacancies) => {
            if (err) {
                return res.status(500).json({error: err.message});
            }
            vacancies = queryVacancies;
            Application.find({"vacancyId": {"$in": req.account.vacancies}, "companyDiscarded": false}, (err, queryApplications) => {
                if (err) {
                    return res.status(500).json({error: err.message});
                }
                applications = queryApplications;
                applications.forEach(v => {
                    studentIds.push(v.studentId);
                });
                Student.find({"_id": {"$in": studentIds}},
                            {"credentials.password": 0, "credentials.method": 0},
                            (err, queryStudents) => {
                    if (err) {
                        return res.status(500).json({error: err.message});
                    }
                    students = queryStudents;
                    return res.status(200).json({
                        vacancies,
                        applications,
                        students,
                    });
                });
            });
        });
    },

    getStudentApplications: (req, res, next) => {
        var vacancies;
        var applications;
        var companyIds = [];
        var companies;
        Vacancy.find({"_id": {"$in": req.account.vacancies}}, (err, queryVacancies) => {
            if (err) {
                return res.status(500).json({error: err.message});
            }
            vacancies = queryVacancies;
            Application.find({"vacancyId": {"$in": req.account.vacancies}, "studentDiscarded": false},
                    (err, queryApplications) => {
                if (err) {
                    return res.status(500).json({error: err.message});
                }
                applications = queryApplications;
                applications.forEach(v => {
                    companyIds.push(v.companyId);
                });
                Company.find({"_id": {"$in": companyIds}},
                            {"credentials.password": 0, "credentials.method": 0},
                            (err, queryCompanies) => {
                    if (err) {
                        return res.status(500).json({error: err.message});
                    }
                    company = queryCompanies;
                    return res.status(200).json({
                        vacancies,
                        applications,
                        company,
                    });
                });
            });
        });
    },
};
