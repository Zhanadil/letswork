const Student = require('@models/student');

// Student Controller functions that are used to get/set profile info.
module.exports = {
    // Update first name of the user
    updateFirstName: async (req, res, next) => {
        if (req.body.firstName === undefined) {
            return res.status(400).json({error: "firstName not received"});
        }
        // Find the user -> update first name -> save
        Student.findById(req.account.id, function(err, student) {
            if (err) {
                return res.status(500).json({error: "Student not found"});
            }

            student.firstName = req.body.firstName;
            student.save(function (err, updatedStudent) {
                if (err) return res.status(500).json({error: "db error"});
                return res.status(200).json({status: "ok"});
            });
        })
    },

    // Get student's first name by id.
    getFirstName: async (req, res, next) => {
        Student.findById(req.account.id, function(err, student) {
            if (err) {
                return res.status(500).json({error: "Student not found"});
            }

            return res.status(200).json({ "firstName": student.firstName });
        })
    },

    updateLastName: async (req, res, next) => {
        if (req.body.lastName === undefined) {
            return res.status(400).json({error: "lastName not received"});
        }
        Student.findById(req.account.id, function(err, student) {
            if (err) {
                return res.status(500).json({error: "Student not found"});
            }

            student.lastName = req.body.lastName;
            student.save(function (err, updatedStudent) {
                if (err) return res.status(500).json({error: "db error"});
                return res.status(200).json({status: "ok"});
            });
        })
    },

    getLastName: async (req, res, next) => {
        Student.findById(req.account.id, function(err, student) {
            if (err) {
                return res.status(500).json({error: "Student not found"});
            }

            return res.status(200).json({ "lastName": student.lastName });
        })
    },

    updatePhone: async (req, res, next) => {
        if (req.body.phone === undefined) {
            return res.status(400).json({error: "phone not received"});
        }
        Student.findById(req.account.id, function(err, student) {
            if (err) {
                return res.status(500).json({error: "Student not found"});
            }

            student.phone = req.body.phone;
            student.save(function (err, updatedStudent) {
                if (err) return res.status(500).json({error: "db error"});
                return res.status(200).json({status: "ok"});
            });
        })
    },

    getPhone: async (req, res, next) => {
        Student.findById(req.account.id, function(err, student) {
            if (err) {
                return res.status(500).json({error: "Student not found"});
            }

            return res.status(200).json({ "phone": student.phone });
        })
    },

    updateDescription: async (req, res, next) => {
        if (req.body.description === undefined) {
            return res.status(400).json({error: "description not received"});
        }
        Student.findById(req.account.id, function(err, student) {
            if (err) {
                return res.status(500).json({error: "Student not found"});
            }

            student.description = req.body.description;
            student.save(function (err, updatedStudent) {
                if (err) return res.status(500).json({error: "db error"});
                return res.status(200).json({status: "ok"});
            });
        })
    },

    getDescription: async (req, res, next) => {
        Student.findById(req.account.id, function(err, student) {
            if (err) {
                return res.status(500).json({error: "Student not found"});
            }

            return res.status(200).json({ "description": student.description });
        })
    },

    saveProfilePicture: async (req, res, next) => {
        Student.findById(req.account.id, function(err, student) {
            if (err) {
                return res.status(500).json({error: "Student not found"});
            }
            console.log(student);
            student.profileThumbnail = req.files.picture.data;
            student.save(function (err, updatedStudent) {
                if (err) return res.status(500).json({error: "db error"});
                return res.status(200).json({status: "ok"});
            });
        });
    },

    // Get full profile information, excluding password and registration method
    getFullProfile: async (req, res, next) => {
        Student.findById(req.account.id, function(err, student) {
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
    //      {"id": "... student id ...", "email": "johndoe@hotmail.com"}
    getProfile: async (req, res, next) => {
        Student.findById(req.account.id, function(err, student) {
            if (err) {
                return res.status(500).json({error: "Student not found"});
            }
            var result = {};
            if (req.body.id !== undefined) {
                result.id = student.id;
            }
            if (req.body.email !== undefined) {
                result.email = student.credentials.email;
            }
            if (req.body.firstName !== undefined) {
                result.firstName = student.firstName;
            }
            if (req.body.lastName !== undefined) {
                result.lastName = student.lastName;
            }
            if (req.body.phone !== undefined) {
                result.phone = student.phone;
            }
            if (req.body.description !== undefined) {
                result.description = student.description;
            }
            return res.status(200).json(result);
        });
    },

    get: async (req, res, next) => {
        var Users = await Student.find({});
        return res.status(200).json({users: Users});
    }
};
