const Student = require('@models/student');

// Public controller functions that gets, but not changes all public
// company related information.
module.exports = {
    getStudentIds: async (req, res, next) => {
        await Student.aggregate([{"$project": {_id: 1}}], function(err, students) {
                if (err) {
                    return res.status(500).json({error: "db error"});
                }
                res.status(200).json({ids: students.map(x => x._id)});
            });
    },
};
