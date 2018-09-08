const mongoose = require('mongoose');

const credentialsSchema = require('@models/credentials_schema').temporaryCredentialsSchema;

const temporaryStudentSchema = mongoose.Schema({
    credentials: credentialsSchema,
    url: String,
    dateUpdated: {
        type: Date,
        default: Date.now,
        expires: 86400,
    },
});

const temporaryStudent = mongoose.model('temporaryStudent', temporaryStudentSchema);

module.exports = temporaryStudent;
