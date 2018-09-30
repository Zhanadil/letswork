const fs = require('fs');
const path = require('path');
const Company = require('@models/company');

unnestCompany = function(company) {
    var result = company.toObject();
    result.email = company.credentials.email;
    result.credentials = undefined;
    return result;
}

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

            return res.status(200).json(unnestCompany(company));
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

    // Update profile information
    // Input example:
    //      {"email": "some_email@gmail.com", "name": "Google"}
    updateProfile: (req, res, next) => {
        Company.findById(req.account.id, function(err, company) {
            if (err) {
                return res.status(500).json({error: "Company not found"});
            }
            if (req.body.email !== undefined) {
                company.credentials.email = req.body.email;
            }
            if (req.body.password !== undefined) {
                company.credentials.password = req.body.password;
            }
            if (req.body.name !== undefined) {
                company.name = req.body.name;
            }
            if (req.body.phone !== undefined) {
                company.phone = req.body.phone;
            }
            if (req.body.description !== undefined) {
                company.description = req.body.description;
            }
            company.save(function (err, updatedCompany) {
                if (err) return res.status(500).json({error: "db error"});

                return res.status(200).json(unnestCompany(updatedCompany));
            });
        });
    },

    // Puts Company's avatar image into dir_path folder, sets the name to company's id.
    updateImage: (dir_path) => {
        return (req, res, next) => {
            var file = req.files.avatar;

            var image_name = req.account.id;
            //TODO: support jpg.
        	if (file.mimetype === 'image/png') {
        		image_name += '.png';
        	} else {
        		return res.status(415).send({error: "unsupported file type"});
        	}

            fs.writeFile(path.join(dir_path, image_name), file.data, function(err) {
        		if (err) {
        			return res.status(500).send({error: err.message});
        		}
                return res.status(200).send({status: 'ok'});
        	});
        }
    },
};
