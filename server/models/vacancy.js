const mongoose = require('mongoose');

// Vacancy DB
// Contains vacancy information including vacancy name, description, salaries,
// company id, all students who applied, all students who were called by the company.
const applicationSchema = mongoose.Schema({
    studentId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'discarded'],
        required: true,
    },
});

const vacancySchema = mongoose.Schema({
    description: String,
    demands: [String],
    type: [String],
    minSalary: Number,
    maxSalary: Number,
    vacancyName: {
        type: String,
        required: true,
    },
    companyId: {
        type: String,
        required: true,
    },
    companyApplied: [applicationSchema],
    studentApplied: [applicationSchema],
});

const vacancy = mongoose.model('vacancy', vacancySchema);

module.exports = vacancy;
