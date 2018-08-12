const Company = require('@models/company');
const faker = require('faker');

// Company controller functions that are used to get/set profile information.
module.exports = {
    // Update company name.
    updateName: (req, res, next) => {
        if (req.body.name === undefined) {
            return res.status(400).json({error: "name not received"});
        }
        // Find company -> change the name -> save
        Company.findById(req.account.id, function(err, company) {
            if (err) {
                return res.status(500).json({error: "Company not found"});
            }

            company.name = req.body.name;
            company.save(function (err, updatedCompany) {
                if (err) return res.status(500).json({error: "db error"});
                res.status(200).json({status: "ok"});
            });
        })
    },

    // Get company name by id.
    getName: (req, res, next) => {
        // Find company -> return company name
        Company.findById(req.account.id, function(err, company) {
            if (err) {
                return res.status(500).json({error: "Company not found"});
            }

            res.status(200).json({ "name": company.name });
        })
    },

    // Update company contact phone number.
    updatePhone: (req, res, next) => {
        if (req.body.phone === undefined) {
            return res.status(400).json({error: "phone not received"});
        }
        Company.findById(req.account.id, function(err, company) {
            if (err) {
                return res.status(500).json({error: "Company not found"});
            }

            company.phone = req.body.phone;
            company.save(function (err, updatedCompany) {
                if (err) return res.status(500).json({error: "db error"});
                res.status(200).json({status: "ok"});
            });
        })
    },

    getPhone: (req, res, next) => {
        Company.findById(req.account.id, function(err, company) {
            if (err) {
                return res.status(500).json({error: "Company not found"});
            }

            res.status(200).json({ "phone": company.phone });
        })
    },

    updateDescription: (req, res, next) => {
        if (req.body.description === undefined) {
            return res.status(400).json({error: "description not received"});
        }
        Company.findById(req.account.id, function(err, company) {
            if (err) {
                return res.status(500).json({error: "Company not found"});
            }

            company.description = req.body.description;
            company.save(function (err, updatedCompany) {
                if (err) return res.status(500).json({error: "db error"});
                res.status(200).json({status: "ok"});
            });
        })
    },

    getDescription: (req, res, next) => {
        Company.findById(req.account.id, function(err, company) {
            if (err) {
                return res.status(500).json({error: "Company not found"});
            }

            res.status(200).json({ "description": company.description });
        })
    },

    // Get full profile information, excluding password and registration method.
    getFullProfile: (req, res, next) => {
        Company.findById(req.account.id, function(err, company) {
            if (err) {
                return res.status(500).json({ error: "Company not found" });
            }
            var result = {};
            result.id = company.id;
            result.email = company.credentials.email;
            result.name = company.name;
            result.phone = company.phone;
            result.description = company.description;
            return res.status(200).json(result);
        });
    },

    // Get profile information based on request:
    // Input example:
    //      {"id": true, "email": true}
    // Output:
    //      {"id": "... company id ...", "email": "johndoe@hotmail.com"}
    getProfile: (req, res, next) => {
        Company.findById(req.account.id, function(err, company) {
            if (err) {
                return res.status(500).json({error: "Company not found"});
            }
            var result = {};
            if (req.body.id !== undefined) {
                result.id = company.id;
            }
            if (req.body.email !== undefined) {
                result.email = company.credentials.email;
            }
            if (req.body.name !== undefined) {
                result.name = company.name;
            }
            if (req.body.phone !== undefined) {
                result.phone = company.phone;
            }
            if (req.body.description !== undefined) {
                result.description = company.description;
            }
            res.status(200).json(result);
        });
    },

    // WARNING:
    // For test purposes only.
    gen: async (i) => {
        console.log('creating ', i);
        var company = await new Company({
            credentials: {
                method: 'local',
                email: i.toString() + '@gmail.com',
                password: faker.internet.password(),
            },
            name: i.toString(),
        })

        await company.save();
    }
};
