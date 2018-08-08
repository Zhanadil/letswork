const Student = require('@models/student');
const Vacancy = require('@models/vacancy');

// Student Controller functions that are related to vacancies.
module.exports = {
    apply: async (req, res, next) => {
        await Vacancy.findById(req.body.vacancyId, function(err, vacancy) {
            if (err) {
                return res.status(500).json({error: "db error"});
            }
            if (!vacancy) {
                return res.status(400).json({error: "vacancy not found"});
            }
            vacancy.studentApplied.push({
                studentId: req.body.studentId,
                status: "pending",
            });
            vacancy.save(function(err) {
                if (err) {
                    return res.status(500).json({error: "db error"});
                }
                return res.status(200).json({status: "ok"});
            });
        });
    },
};
