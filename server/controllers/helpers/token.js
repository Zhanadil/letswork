const JWT = require('jsonwebtoken');
const { JWT_SECRET } = require('@configuration');
const Student = require('@models/student');
const Company = require('@models/company');

// Registers JsonWebToken for a user
module.exports = {
    signToken: async (user) => {
        if (!user) {
            return null;
        }
        var type = '';
        if (user instanceof Company) {
            type = 'company';
        } else if (user instanceof Student) {
            type = 'student';
        }
        var confirmed = false;
        if (!user.credentials) {
            return null;
        }
        if (user.credentials.confirmed) {
            confirmed = true;
        }
        return await JWT.sign({
            iss: 'john',
            sub: {
                id: user.id,
                type: type,
                confirmed: confirmed,
            },
            iat: Date.now(),
            exp: new Date().setDate(new Date().getDate() + 1)
        }, JWT_SECRET);
    }
}
