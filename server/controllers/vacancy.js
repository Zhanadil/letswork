const JWT = require('jsonwebtoken');

const to = require('await-to-js').default;

const Company = require('@models/company');
const Student = require('@models/student');
const { Vacancy, Application } = require('@models/vacancy');
const { JWT_SECRET } = require('@configuration');

statusId = (requester, status, sender) => {
    if (status === "pending" && sender !== requester) {
        return 1;
    }
    if (status === "pending" && sender === requester) {
        return 2;
    }
    if (status === "accepted") {
        return 3;
    }
    if (status === "rejected") {
        return 4;
    }
    return 0;
}

// Setting up filters based on request
filterOut = filter => {
    if (filter === undefined) {
        return {};
    }
    var result = {};
    if (filter.minSalary !== undefined) {
        result.maxSalary = {'$gte': filter.minSalary};
    }
    if (filter.maxSalary !== undefined) {
        result.minSalary = {'$lte': filter.maxSalary};
    }
    if (filter.type !== undefined) {
        result.type = {'$in': filter.type};
    }
    if (filter.vacancyField !== undefined) {
        result.vacancyField = filter.vacancyField;
    }
    return result;
}

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

    // Удалить вакансию по айди
    removeVacancy: async (req, res, next) => {
        var err, vacancy;
        [err, vacancy] = await to(Vacancy.findById(req.params.id));
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (!vacancy) {
            return res.status(400).json({error: "vacancy doesn't exist"});
        }
        if (vacancy.companyId !== req.account._id.toString()) {
            return res.status(403).json({error: "forbidden, vacancy created by other company"});
        }

        [err] = await to(Vacancy.deleteOne({_id: req.params.id}));
        if (err) {
            return res.status(500).json({error: err.message});
        }

        [err] = await to(Application.deleteMany({vacancyId: req.params.id}));
        if (err) {
            return res.status(500).json({error: err.message});
        }

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
    //      vacancyId: String,
    //      coverLetter: String,
    // }
    studentApplication: async (req, res, next) => {
        // Айди компании которая создала вакансию, нужно для создания заявки
        var err, vacancy;
        // Проверяем айди вакансии на действительность
        [err, vacancy] = await to(
            Vacancy.findById(req.body.vacancyId)
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (!vacancy) {
            return res.status(400).json({error: "vacancy not found"});
        }
        var companyId = vacancy.companyId;

        // Прикладное письмо
        var coverLetter = null;
        if (req.body.coverLetter) {
            coverLetter = req.body.coverLetter;
        }

        // Проверяем айди студента
        var student;
        [err, student] = await to(
            Student.findById(req.account._id)
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (!student) {
            return res.status(400).json({error: "student not found"});
        }

        // Находим заявку
        var application;
        [err, application] = await to(
            Application.findOne(
                {
                    studentId: req.account._id,
                    vacancyId: req.body.vacancyId
                }
            )
        );
        if (err) {
            return res.status(500).json({ error: err.message });
        }

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
            application.coverLetter = coverLetter;
            application.studentDiscarded = false;
            application.companyDiscarded = false;

            await application.save();

            return res.status(200).json({status: "ok"});
        }

        // Если заявка не существует, то создаем новую
        application = await new Application({
            vacancyId: req.body.vacancyId,
            companyId: companyId,
            studentId: req.account._id,
            status: "pending",
            sender: "student",
            coverLetter,
            studentDiscarded: false,
            companyDiscarded: false,
        });
        await application.save();

        // Добавляем вакансию в список вакансий связанных со студентом
        student.vacancies.push(req.body.vacancyId);
        await student.save();

        return res.status(200).json({ status: "ok" });
    },

    // Изменить статус вакансии, requirements для каждого случая брать из statusRequirements.
    // Для того чтобы изменить статус, нынешний статус должен быть из массива requirements.status
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
            var studentId = (sender === "company" ? req.body.studentId : req.account._id);
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
            return res.status(400).json({error: "application doesn't exist"});
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
            return res.status(400).json({error: "application doesn't exist"});
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

    // Возвращает все заявки связанные с компанией и всю информацию о вакансиях
    // и студентах связанных с этими заявками
    getCompanyApplications: async (req, res, next) => {
        var err, applications;
        var vacancies, vacancyIds = [];
        var students, studentIds = [];

        // У нас есть четыре типа фильтров
        var applicationsFilter = {};
        applicationsFilter.companyId = req.account._id;
        applicationsFilter.companyDiscarded = false;
        // 1: Входящие необработанные заявки
        if (req.body.statusId === 1) {
            applicationsFilter.sender = "student";
            applicationsFilter.status = "pending";
        }
        // 2: Исходящие необработанные заявки
        if (req.body.statusId === 2) {
            applicationsFilter.sender = "company";
            applicationsFilter.status = "pending";
        }
        // 3: Принятые заявки
        if (req.body.statusId === 3) {
            applicationsFilter.status = "accepted";
        }
        // 4: Отклоненные заявки
        if (req.body.statusId === 4) {
            applicationsFilter.status = "rejected";
        }
        // Находим все заявки студента, которые он не скрыл в отфильтрованном виде
        [err, applications] = await to(
            Application.find(applicationsFilter).lean()
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }

        // Выписываем айди отфильтрованных вакансий и айди студентов находящихся в заявке
        applications.forEach(v => {
            v.status = statusId("company", v.status, v.sender);
            v.sender = undefined;
            vacancyIds.push(v.vacancyId);
            if (studentIds.indexOf(v.studentId) === -1) {
                studentIds.push(v.studentId);
            }
        });

        // Находим все эти вакансии
        [err, vacancies] = await to(
            Vacancy.find({
                "_id": {
                    "$in": vacancyIds
                }
            })
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }

        // Находим всех студентов, айди которых мы выписали
        [err, students] = await to(
            Student.find(
                {
                    "_id": {
                        "$in": studentIds
                    }
                },
                {
                    "credentials.password": 0,
                    "credentials.method": 0
                }
            )
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }

        // Возвращаем все данные:
        //  Вакансии, Заявки, Студенты
        return res.status(200).json({
            vacancies,
            applications,
            students,
        });
    },

    // Возвращает ВСЕ вакансии и если студент участвовал в них, то вместе со статусом.
    // При этом заранее пагинирует, например: вторая страница 10 запросов
    // Запрос содержит фильтры по мин зп(minSalary), макс зп(maxSalary),
    // область работы(vacancyField), и др.
    // Например: request.filter = {minSalary: 100000, type: ["full-time"]}
    // Также содержит параметры которые нужно вернуть
    // К примеру:
    // request.requirements = {vacancyName: 1, companyId: 1}
    // В таком случае вернет все вакансии с зп выше 100000 на полную ставку
    // Из информации вернет только название вакансий и айди компании
    getAllVacanciesAsStudent: async (req, res, next) => {
        var requirements = req.body.requirements || {};
        var filters = filterOut(req.body.filter);
        var err, vacancies;
        var applications

        // Находим все вакансии в пагинированном виде
        [err, vacancies] = await to(
            Vacancy.find(filters, requirements)
                .sort({'_id': -1})
                .skip(req.params.page*req.params.limit)
                .limit(parseInt(req.params.limit))
                .lean()
                .exec()
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }

        // Находим все заявки студента которые он не скрыл
        [err, applications] = await to(
            Application.find(
                {
                    studentId: req.account._id,
                    studentDiscarded: false,
                },
                {
                    vacancyId: 1,
                    status: 1,
                    sender: 1,
                }
            )
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }

        // Проверяем если на вакансию есть заявка студента,
        // то добавляем статус заявки
        vacancies.forEach((vacancy, i, vacancies) => {
            applications.some(application => {
                if (vacancy._id.toString() === application.vacancyId) {
                    vacancies[i].status =
                        statusId("student", application.status, application.sender);
                    return true;
                }
                return false;
            });
            if (vacancies[i].status === undefined) {
                vacancies[i].status = 0;
            }
        });
        return res.status(200).json({vacancies});
    },

    // Возвращает вакансию по айди и если студент участвовал в ней, то вместе со статусом.
    // Запрос содержит параметры которые нужно вернуть
    // К примеру:
    // request.requirements = {vacancyName: 1, companyId: 1}
    // Из информации вернет только название вакансии и айди компании
    getVacancyByIdAsStudent: async (req, res, next) => {
        var requirements = req.body.requirements || {};
        var err, vacancy;
        var application

        // Находим все вакансии в пагинированном виде
        [err, vacancy] = await to(
            Vacancy.findById(req.params.id, requirements).lean().exec()
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (!vacancy) {
            return res.status(400).json({error: "Vacancy doesn't exist"});
        }

        // Находим все заявки студента которые он не скрыл
        [err, application] = await to(
            Application.findOne(
                {
                    vacancyId: req.params.id,
                    studentId: req.account._id,
                    studentDiscarded: false,
                },
                {
                    vacancyId: 1,
                    status: 1,
                    sender: 1,
                }
            )
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }

        // Проверяем если на вакансию есть заявка студента,
        // то добавляем статус заявки
        if (application) {
            vacancy.status = statusId("student", application.status, application.sender);
        } else {
            vacancy.status = 0;
        }
        return res.status(200).json({vacancy});
    },

    // Возвращает все заявки связанные со студентом и всю информацию о вакансиях
    // и компаниях связанных с этими заявками
    getStudentApplications: async (req, res, next) => {
        var err;
        var vacancies, vacancyIds = [], applications;
        var companies, companyIds = [];

        // У нас есть четыре типа фильтров
        var applicationsFilter = {};
        applicationsFilter.studentId = req.account._id;
        applicationsFilter.studentDiscarded = false;
        // 1: Входящие необработанные заявки
        if (req.body.statusId === 1) {
            applicationsFilter.sender = "company";
            applicationsFilter.status = "pending";
        }
        // 2: Исходящие необработанные заявки
        if (req.body.statusId === 2) {
            applicationsFilter.sender = "student";
            applicationsFilter.status = "pending";
        }
        // 3: Принятые заявки
        if (req.body.statusId === 3) {
            applicationsFilter.status = "accepted";
        }
        // 4: Отклоненные заявки
        if (req.body.statusId === 4) {
            applicationsFilter.status = "rejected";
        }
        // Находим все заявки студента, которые он не скрыл в отфильтрованном виде
        [err, applications] = await to(Application.find(applicationsFilter));
        if (err) {
            return res.status(500).json({error: err.message});
        }

        // Выписываем айди отфильтрованных вакансий и айди компаний создавших эти вакансии
        applications.forEach(v => {
            vacancyIds.push(v.vacancyId);
            if (companyIds.indexOf(v.companyId) === -1) {
                companyIds.push(v.companyId);
            }
        });

        // Находим все эти вакансии
        [err, vacancies] = await to(
            Vacancy.find({
                "_id": {
                    "$in": vacancyIds
                }
            })
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }

        // Находим все компании, айди которых мы выписали
        [err, companies] = await to(
            Company.find(
                {
                    "_id": {
                        "$in": companyIds
                    }
                },
                {
                    "credentials.password": 0,
                    "credentials.method": 0
                }
            )
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }

        // Возвращаем все данные:
        //  Вакансии, Заявки, Компании
        return res.status(200).json({
            vacancies,
            applications,
            companies,
        });
    },
};
