const mongoose = require('mongoose');

// Schema of application, contains vacancyId, company id, student id, and
// the status of the application.
const applicationSchema = mongoose.Schema({
    vacancyId: String,
    companyId: String,
    studentId: String,
    status: {
        type: String,
        enum: ['pending', 'canceled', 'accepted', 'rejected'],
    },
    // С чьей стороны отправлена заявка
    sender: {
        type: String,
        enum: ['student', 'company'],
    },
    studentDiscarded: Boolean,
    companyDiscarded: Boolean,
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
});

const application = mongoose.model('application', applicationSchema);
const vacancy = mongoose.model('vacancy', vacancySchema);

module.exports = {
    Application: application,
    Vacancy: vacancy,
};
