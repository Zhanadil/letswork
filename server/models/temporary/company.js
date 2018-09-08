const mongoose = require('mongoose');

const credentialsSchema = require('@models/credentials_schema').temporaryCredentialsSchema;

const temporaryCompanySchema = mongoose.Schema({
    credentials: credentialsSchema,
    name: {
        type: String,
        unique: true
    },
    url: String,
    dateUpdated: {
        type: Date,
        default: Date.now,
        expires: 86400,
    },
});

const temporaryCompany = mongoose.model('temporaryCompany', temporaryCompanySchema);

module.exports = temporaryCompany;
