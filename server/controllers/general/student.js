const Student = require('@models/student');

// Public controller functions that gets, but not changes all public
// student related information.
module.exports = {
    // /student/ids/:page/:limit
    // :limit = number of vacancies per page
    // :page = page number starting from 0

    // returns ids of students that should be rendered on the page.

    // example: /student/ids/1/10
    // get students on the 2nd page with 10 entries per page
    getStudentIds: async (req, res, next) => {
        var filter = {};
        // Setting up filters based on request
        if (req.body.filter !== undefined) {
            // TODO: set up filters
        }

        Student.find(filter, {'_id': 1})
            .sort({'_id': -1})
            .skip(req.params.page*req.params.limit)
            .limit(parseInt(req.params.limit))
            .exec((err, students) => {
                res.status(200).json(students.map(x => x._id));
            });
    },

    // /student/:page/:limit
    // :limit = number of vacancies per page
    // :page = page number starting from 0

    // returns students that should be rendered on the page.
    // request contains requirements that output should match,
    // like show only firstName, lastName and email

    // example: /student/1/10
    // request.requirements = {firstName: 1, email: 1}
    // get students on the 2nd page with 10 entries per page
    // returns only first names and emails.
    getStudents: (req, res, next) => {
        var requirements = req.body.requirements || {};
        delete requirements['credentials.password'];
        var filter = {};
        if (req.body.filter !== undefined) {
            // TODO: set up filters
        }

        Student.find(filter, requirements)
            .sort({'_id': -1})
            .skip(req.params.page*req.params.limit)
            .limit(parseInt(req.params.limit))
            .exec((err, students) => {
                res.status(200).json(students);
            });
    },

    // /student/:id
    // returns student by id.
    // request contains requirements that output should match,
    // like show only firstName, lastName and email

    // example: /student/5b6cc829e3956907dc4532cd
    // req.requirements = {firstName:1, email:1}
    // will return firstName and email of this student.
    getStudentById: (req, res, next) => {
        var requirements = req.body.requirements || {};
        delete requirements['credentials.password'];
        Student.findById(req.params.id, requirements, (err, student) => {
            if (err) {
                return res.status(500).json(err);
            }
            return res.status(200).json(student);
        });
    },
};
