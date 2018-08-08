const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { hashPassword, isValidPassword } = require('@models/helpers/passwordHelper');

const credentialsSchema = mongoose.Schema({
    method: {
        type: String,
        enum: ['local', 'google'],
        required: true,
    },
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
    },
    password: String,
    googleId: String
});

// Hash password before saving it.
credentialsSchema.pre('save', hashPassword);

credentialsSchema.methods.isValidPassword = isValidPassword;

module.exports = credentialsSchema;
