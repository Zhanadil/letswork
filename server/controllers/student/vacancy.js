const Student = require('@models/student');
const Vacancy = require('@models/vacancy');

// Student Controller functions that are related to vacancies.
module.exports = {
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
        var student = await Student.findById(req.account._id, function(err) {
            if (err) {
                return res.status(500).json({error: "db error"});
            }
        });
        if (!student) {
            return res.status(400).json({error: "student not found"});
        }

        if (student.vacancies.indexOf(req.body.vacancyId) > -1) {
            return res.status(409).json({error: "student already applied"});
        }

        // Add vacancy to student's vacancy list.
        student.vacancies.push(req.body.vacancyId);
        await student.save();

        // Add student to vacancies students list.
        vacancy.studentApplied.push({
            studentId: req.account._id,
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
};
