const Company = require('@models/company');
const Vacancy = require('@models/vacancy');

// Company controller functions that get/set vacancy related info.
module.exports = {
    newVacancy: async (req, res, next) => {
        var details = {};
        details.companyId = req.account.id;
        details.vacancyName = req.body.vacancyName;
        details.description = req.body.description;
        details.demands = req.body.demands;
        details.type = req.body.type;
        details.minSalary = req.body.minSalary;
        details.maxSalary = req.body.maxSalary;

        const vacancy = new Vacancy(details);
        vacancy.save(function(err) {
            if (err) {
                return res.status(500).json({error: "db error"});
            }
            return res.status(200).json({'status': 'ok'});
        });
    },

    apply: async (req, res, next) => {
        await Vacancy.findById(req.body.vacancyId, function(err, vacancy) {
            if (err) {
                return res.status(500).json({error: "db error"});
            }
            if (!vacancy) {
                return res.status(400).json({error: "vacancy not found"});
            }
            vacancy.companyApplied.push({
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

    getVacancies: async (req, res, next) => {
        await Vacancy.find({}, function(err, vacancies) {
            if (err) {
                return res.status(500).json({error: "db error"});
            }
            res.status(200).json({vacancies});
        });
    },
};
