const Vacancy = require('@models/vacancy');

// Setting up filters based on request
filterOut = function(filter) {
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

// Public controller functions that gets, but not changes all public
// vacancy related information.
module.exports = {
    // /vacancy/ids/:page/:limit
    // :limit = number of vacancies per page
    // :page = page number starting from 0

    // returns ids of vacancies that should be rendered on the page.
    // request contains filter that matches things like minSalary, vacancyField, etc..

    // example: /vacancy/ids/1/10
    // request.filter = {minSalary: 100000, type: ["full-time"]}
    // get full-time vacancies with minSalary over 100000 on the
    // 2nd page with 10 entries per page
    getVacancyIds: async (req, res, next) => {
        Vacancy.find(filterOut(req.body.filter), {'_id': 1})
            .sort({'_id': -1})
            .skip(req.params.page*req.params.limit)
            .limit(parseInt(req.params.limit))
            .exec((err, vacancies) => {
                res.status(200).json(vacancies.map(x => x._id));
            });
    },

    // /vacancy/:page/:limit
    // :limit = number of vacancies per page
    // :page = page number starting from 0

    // returns vacancies that should be rendered on the page.
    // request contains filter that matches things like minSalary, vacancyField, etc..
    // request also contains requirements that output should match,
    // like show only minSalary, vacancyName and companyId

    // example: /vacancy/1/10
    // request.filter = {minSalary: 100000, type: ["full-time"]}
    // request.requirements = {vacancyName: 1, companyId: 1}
    // get full-time vacancies with minSalary over 100000 on the
    // 2nd page with 10 entries per page
    // returns only vacancy names and company ids.
    getVacancies: (req, res, next) => {
        var requirements = req.body.requirements || {};

        Vacancy.find(filterOut(req.body.filter), requirements)
            .sort({'_id': -1})
            .skip(req.params.page*req.params.limit)
            .limit(parseInt(req.params.limit))
            .exec((err, vacancies) => {
                res.status(200).json(vacancies);
            });
    },

    // /vacancy/:id
    // request contains requirements that output should match,
    // like show only minSalary, vacancyName and companyId
    // returns vacancy by id.

    // example: /vacancy/5b6cc829e3956907dc4532cd
    // req.requirements = {companyId:1, vacancyName:1}
    // will return companyId and vacancyName of this vacancy.
    getVacancyById: (req, res, next) => {
        var requirements = req.body.requirements || {};
        Vacancy.findById(req.params.id, requirements, (err, vacancy) => {
            if (err) {
                return res.status(500).json(err);
            }
            return res.status(200).json(vacancy);
        });
    },
};
