const Vacancy = require('@models/vacancy');

// Public controller functions that gets, but not changes all public
// vacancy related information.
module.exports = {
    getVacancyIds: async (req, res, next) => {
        await Vacancy.aggregate([{"$project": {_id: 1}}], function(err, vacancies) {
                if (err) {
                    return res.status(500).json({error: "db error"});
                }
                res.status(200).json({ids: vacancies.map(x => x._id)});
            });
    },

    getVacancies: async (req, res, next) => {
        await Vacancy.find({})
    },
};
