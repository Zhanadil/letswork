const Student = require('@models/student');
const { Vacancy, Application } = require('@models/vacancy');

// Student Controller functions that are related to vacancies.
module.exports = {
    // Студент отправляет заявку на вакансию
    // req.body: {
    //      vacancyId: String
    // }
    apply: async (req, res, next) => {
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

    // Student cancels his own request.
    cancel: async (req, res, next) => {
        // Find the vacancy.
        var vacancy = await Vacancy.findById(req.body.vacancyId, function(err) {
            if (err) {
                return res.status(500).json({error: err.message});
            }
        });
        if (!vacancy) {
            return res.status(400).json({error: "vacancy not found"});
        }

        // Find the student.
        var student = await Student.findById(req.account._id, function(err) {
            if (err) {
                return res.status(500).json({error: err.message});
            }
        });
        if (!student) {
            return res.status(400).json({error: "student not found"});
        }

        // Find the application in vacancy's applications array.
        var applicationIndex = vacancy.studentApplied.findIndex((element) => {
            return element.studentId === req.account._id.toString();
        });
        if (applicationIndex === -1) {
            return res.status(409).json({error: "student didn't apply for position"});
        }

        // If application is beyond pending stage, don't do anything.
        if (vacancy.studentApplied[applicationIndex].status === "rejected" ||
            vacancy.studentApplied[applicationIndex].status === "discarded") {
            return res.status(400).json({error: "application can't be canceled after rejection"});
        }

        // Cancel the application.
        vacancy.studentApplied[applicationIndex].status = "canceled";
        await vacancy.save();

        return res.status(200).json({status: "ok"});
    },

    // Student accepts company's request.
    accept: async (req, res, next) => {
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
        var student = await Student.findById(req.account._id, function(err) {
            if (err) {
                return res.status(500).json({error: "db error"});
            }
        });
        if (!student) {
            return res.status(400).json({error: "student not found"});
        }

        var studentIndex = vacancy.companyApplied.findIndex((element) => {
            return element.studentId === req.account._id.toString();
        });
        if (studentIndex === -1) {
            return res.status(409).json({error: "student wasn't called"});
        }

        // If offer was discarded, it couldn't be changed.
        if (vacancy.companyApplied[studentIndex].status === "discarded") {
            return res.status(400).json({error: "student already discarded offer"});
        }

        // Accepts company's offer.
        vacancy.companyApplied[studentIndex].status = "accepted";
        await vacancy.save();

        return res.status(200).json({status: "ok"});
    },

    // Student rejects company's request.
    reject: async (req, res, next) => {
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
        var student = await Student.findById(req.account._id, function(err) {
            if (err) {
                return res.status(500).json({error: "db error"});
            }
        });
        if (!student) {
            return res.status(400).json({error: "student not found"});
        }

        var studentIndex = vacancy.companyApplied.findIndex((element) => {
            return element.studentId === req.account._id.toString();
        });
        if (studentIndex === -1) {
            return res.status(409).json({error: "student wasn't called"});
        }

        // If offer was discarded, it couldn't be changed.
        if (vacancy.companyApplied[studentIndex].status === "discarded") {
            return res.status(400).json({error: "student already discarded offer"});
        }

        // Reject offer.
        vacancy.companyApplied[studentIndex].status = "rejected";
        await vacancy.save();

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
        var student = await Student.findById(req.account._id, function(err) {
            if (err) {
                return res.status(500).json({error: "db error"});
            }
        });
        if (!student) {
            return res.status(400).json({error: "student not found"});
        }

        var studentIndex = vacancy.companyApplied.findIndex((element) => {
            return element.studentId === req.account._id.toString();
        });
        if (studentIndex === -1) {
            return res.status(409).json({error: "student wasn't called"});
        }

        // Discard only if it was rejected.
        if (vacancy.companyApplied[studentIndex].status !== "rejected") {
            return res.status(400).json({error: "can be discarded only after rejection"});
        }

        // Reject offer.
        vacancy.companyApplied[studentIndex].status = "discarded";
        await vacancy.save();

        return res.status(200).json({status: "ok"});
    },

    // Get all applications related to this student, based on status written in request.
    getVacancies: async (req, res, next) => {
        Vacancy.find({"_id": {"$in": req.account.vacancies}}, (err, vacancies) => {
            var applications = [];
            var vacancyResult = [];
            console.log(vacancies);
            vacancies.forEach(v => {
                console.log(v);
                console.log("companyApplied: ", v.companyApplied);
                v.companyApplied.some(application => {
                    console.log(req.body.incoming + " <--> " + application.status);
                    if (req.body.incoming !== undefined &&
                        req.body.incoming === application.status &&
                        req.account.id === application.studentId) {
                        applications.push({
                            vacancyId: v.id,
                            studentId: application.studentId,
                            state: "incoming",
                        })
                        vacancyResult.push(v);
                        return true;
                    }
                    return false;
                });

                v.studentApplied.some(application => {
                    console.log(req.body.outgoing + " -- " + application.status);
                    if (req.body.outgoing !== undefined &&
                        req.body.outgoing === application.status &&
                        req.account.id === application.studentId) {
                        applications.push({
                            vacancyId: v.id,
                            studentId: application.studentId,
                            state: "outgoing",
                        })
                        vacancyResult.push(v);
                        return true;
                    }
                    return false;
                });
            });
            res.status(200).send({
                vacancies: vacancyResult,
                applications,
            });
        });
    }
};
