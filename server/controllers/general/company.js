const Company = require('@models/company');

// Public controller functions that gets, but not changes all public
// company related information.
module.exports = {
    // /company/:id
    // returns company by id.
    // request contains requirements that output should match,
    // like show only name, description and email

    // example: /company/5b6cc829e3956907dc4532cd
    // req.requirements = {name:1, email:1}
    // will return name and email of this company.
    getCompanyById: (req, res, next) => {
        var requirements = req.body.requirements || {};
        delete requirements['credentials.password'];
        console.log(requirements);
        console.log(req.params.id);
        Company.findById(req.params.id, requirements, (err, company) => {
            console.log(company);
            if (err) {
                return res.status(500).json(err);
            }
            return res.status(200).json(company);
        });
    },
};
