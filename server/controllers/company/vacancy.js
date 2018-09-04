const Company = require('@models/company');
const Student = require('@models/student');
const { Vacancy, Application } = require('@models/vacancy');

// Все функции манипулирующие вакансиями со стороны компании
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
    apply: async (req, res, next) => {
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

    // Student accepts company's request.
    accept: async (req, res, next) => {
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

        // Если заявка не существует
        if (!application) {
            return res.status(409).json({
                error: "application doesn't exist"
            });
        }

        // Принять заявку можно только если заявка отправлена
        // со стороны студента и статус заявки 'pending'
        if (application.status !== 'pending') {
            return res.status(409).json({
                error: `application can't be accepted, current status is: ${application.status}`
            });
        }
        if (application.sender !== 'student') {
            return res.status(409).json({
                error: `company application can't be accepted by the company`
            });
        }
        application.status = 'accepted';
        application.studentDiscarded = false;
        application.companyDiscarded = false;

        await application.save();

        return res.status(200).json({status: "ok"});
    },

    // Company rejects student's request.
    reject: async (req, res, next) => {
        console.log(req.account);
        console.log(req);
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

        // Если заявка не существует
        if (!application) {
            return res.status(409).json({
                error: "application doesn't exist"
            });
        }

        // Отклонить заявку можно только если статус заявки 'pending'
        // или 'accepted' (случайно принятая заявка может быть отклонена)
        if (application.status !== 'pending' && application.status !== 'accepted') {
            return res.status(409).json({
                error: `application can't be rejected, current status is: ${application.status}`
            });
        }
        // Отклонить заявку можно только если она отправлена студентом
        if (application.sender !== 'student') {
            return res.status(409).json({
                error: `company application can't be rejected by the company`
            });
        }
        application.status = 'rejected';

        await application.save();

        return res.status(200).json({status: "ok"});
    },

    // Student discards rejected request.
    discard: async (req, res, next) => {
        // Find the vacancy.
        var vacancy = await Vacancy.findById(req.body.vacancyId, function(err) {
            if (err) {
                return res.status(500).json({error: "db error"});
            }
        });
        if (!vacancy) {
            return res.status(400).json({error: "vacancy not found"});
        }

        // Find the student.
        var student = await Student.findById(req.body.studentId, function(err) {
            if (err) {
                return res.status(500).json({error: "db error"});
            }
        });
        if (!student) {
            return res.status(400).json({error: "student not found"});
        }

        var studentIndex = vacancy.studentApplied.findIndex((element) => {
            return element.studentId === req.body.studentId;
        });
        if (studentIndex === -1) {
            return res.status(409).json({error: "company wasn't called"});
        }

        // Discard only if it was rejected.
        if (vacancy.studentApplied[studentIndex].status !== "rejected") {
            return res.status(400).json({error: "can be discarded only after rejection"});
        }

        // Reject offer.
        vacancy.studentApplied[studentIndex].status = "discarded";
        await vacancy.save();

        return res.status(200).json({status: "ok"});
    },

    // Get all applications related to this company, based on status written in request.
    getVacancies: async (req, res, next) => {
        Vacancy.find({"_id": {"$in": req.account.vacancies}}, (err, vacancies) => {
            var applications = [];
            var studentIds = [];
            vacancies.forEach(v => {
                v.companyApplied.forEach(application => {
                    if (req.body.outgoing !== undefined && req.body.outgoing === application.status) {
                        studentIds.push(application.studentId);
                        applications.push({
                            vacancyId: v.id,
                            studentId: application.studentId,
                            state: "outgoing",
                        })
                    }
                });

                v.studentApplied.forEach(application => {
                    if (req.body.incoming !== undefined && req.body.incoming === application.status) {
                        studentIds.push(application.studentId);
                        applications.push({
                            vacancyId: v.id,
                            studentId: application.studentId,
                            state: "incoming",
                        })
                    }
                });
            });
            Student.find({"_id": {"$in": studentIds}},
                        {"credentials.password": 0, "__v": 0},
                        (err, students) => {
                res.status(200).send({
                    vacancies,
                    students,
                    applications,
                });
            })
        });
    },
};
