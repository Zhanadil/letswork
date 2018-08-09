const Student = require('@models/student');
const Company = require('@models/company');

// Company controller functions that are used to get/set profile information.
module.exports = {
    // Get company name by id.
    getName: async (req, res, next) => {
        // Find company -> return company name
        Company.findById(req.account.id, function(err, company) {
            if (err) {
                return res.status(500).json({error: "Company not found"});
            }

            res.status(200).json({ "name": company.name });
        })
    },

    getPhone: async (req, res, next) => {
        Company.findById(req.account.id, function(err, company) {
            if (err) {
                return res.status(500).json({error: "Company not found"});
            }

            res.status(200).json({ "phone": company.phone });
        })
    },

    getDescription: async (req, res, next) => {
        Company.findById(req.account.id, function(err, company) {
            if (err) {
                return res.status(500).json({error: "Company not found"});
            }

            res.status(200).json({ "description": company.description });
        })
    },

    // Get full profile information, excluding password and registration method.
    getStudentById: async (req, res, next) => {
        Student.findById(req.params.id, function(err, student) {
            if (err) {
                return res.status(500).json({ error: "Student not found" });
            }
            var result = {};
            result.id = student.id;
            result.email = student.credentials.email;
            result.firstName = student.firstName;
            result.lastName = student.lastName;
            result.phone = student.phone;
            /*result.profilePicture = student.profilePicture;
            result.profileThumbnail = student.profileThumbnail;*/
            result.description = student.description;
            return res.status(200).json(result);
        });
    },

    // Get profile information based on request:
    // Input example:
    //      {"id": true, "email": true}
    // Output:
    //      {"id": "... company id ...", "email": "johndoe@hotmail.com"}
    getProfile: async (req, res, next) => {
        Company.findById(req.account.id, function(err, student) {
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
};
