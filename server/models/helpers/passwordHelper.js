const bcrypt = require('bcrypt');

module.exports = {
    hashPassword: async function(next) {
        try {
            if (this.method !== 'local') {
                next();
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
    },
    isValidPassword: async function(newPassword) {
        try {
            return await bcrypt.compare(newPassword, this.password);
        } catch(error) {
            throw new Error(error);
        }
    }
}
