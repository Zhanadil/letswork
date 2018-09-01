const mongoose = require('mongoose');

// Schema of application, contains id of a student who applied/was called, and
// status of the application.
const applicationSchema = mongoose.Schema({
    studentId: String,
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'discarded'],
    },
});

// Vacancy DB
// Contains vacancy information including vacancy name, description, salaries,
// company id, all students who applied, all students who were called by the company.
const vacancySchema = mongoose.Schema({
    description: String,
    demands: [String],
    type: [String],
    minSalary: Number,
    maxSalary: Number,
    vacancyField: String,
    vacancyName: String,
    companyId: String,
    companyName: String,
    companyApplied: [applicationSchema],
    studentApplied: [applicationSchema],
});

const vacancy = mongoose.model('vacancy', vacancySchema);

module.exports = vacancy;
