const Company = require('@models/company');
const Vacancy = require('@models/vacancy');
const Student = require('@models/student');

// Company controller functions that get/set vacancy related info.
module.exports = {
    // Company creates new vacancy:
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

        // Create new vacancy.
        const vacancy = await new Vacancy(details);
        await vacancy.save();

        // Add vacancy to company's vacancy list.
        company.vacancies.push(vacancy._id);
        await company.save()
        return res.status(200).json({status: "ok"});
    },

    // Company calls a student for this vacancy:
    apply: async (req, res, next) => {
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

        // Add vacancy to student's vacancy list.
        if (student.vacancies.indexOf(req.body.vacancyId) > -1) {
            return res.status(409).json({error: "student was already called"});
        }
        student.vacancies.push(req.body.vacancyId);
        await student.save();

        // Add student to vacancies students list.
        vacancy.companyApplied.push({
            studentId: req.body.studentId,
            status: "pending",
        });
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

        // If offer was discarded, it couldn't be changed.
        if (vacancy.studentApplied[studentIndex].status === "discarded") {
            return res.status(400).json({error: "company already discarded offer"});
        }

        // Accepts student's offer.
        vacancy.studentApplied[studentIndex].status = "accepted";
        await vacancy.save();

        return res.status(200).json({status: "ok"});
    },

    // Company rejects student's request.
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

        // If offer was discarded, it couldn't be changed.
        if (vacancy.studentApplied[studentIndex].status === "discarded") {
            return res.status(400).json({error: "company already discarded offer"});
        }

        // Reject offer.
        vacancy.studentApplied[studentIndex].status = "rejected";
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
};
