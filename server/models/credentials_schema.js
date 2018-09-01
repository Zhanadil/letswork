const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const credentialsSchema = mongoose.Schema({
    method: {
        type: String,
        enum: ['local', 'google'],
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
    },
    password: String,
    googleId: String
});

// Hash password before saving it.
credentialsSchema.pre('save', async function(next) {
    try {
        if (this.method !== 'local') {
            return next();
        }

        if (this.isModified('password')) {
            const salt = await bcrypt.genSalt(10);

            const passwordHash = await bcrypt.hash(this.password, salt);

            this.password = passwordHash;
        }
        next();
    } catch(error) {
        next(error);
    }
});

credentialsSchema.methods.isValidPassword = async function(newPassword) {
    try {
        return await bcrypt.compare(newPassword, this.password);
    } catch(error) {
        throw new Error(error);
    }
}

module.exports = credentialsSchema;
