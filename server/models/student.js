const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const credentialsSchema = require('@models/credentials_schema');
const { hashPassword, isValidPassword } = require('@models/helpers/passwordHelper');

// Students DB
// Student can log in via email, google or [facebook(currently not working)].
// TODO(zhanadil): Add FB registration
// All the information including phone number, photo and user description
// are stored there.
const studentSchema = mongoose.Schema({
    credentials: credentialsSchema,
    firstName: String,
    lastName: String,
    phone: String,
    /*profilePicture: String,
    profileThumbnail: Buffer,*/
    description: String,
});

const student = mongoose.model('student', studentSchema);

module.exports = student;
