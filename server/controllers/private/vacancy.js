const Vacancy = require('@models/vacancy');

// Public controller functions that gets, but not changes all private
// vacancy related information.
module.exports = {
    getVacancyById: async (req, res, next) => {
        await Vacancy.findById(req.params.id, function (err, vacancy) {
            console.log(vacancy);
            res.status(200).json(vacancy);
        });
    },
};
