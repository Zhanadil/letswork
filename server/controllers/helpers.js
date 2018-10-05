const JWT = require('jsonwebtoken');
const { JWT_SECRET } = require('@configuration');
const Student = require('@models/student');
const Company = require('@models/company');

// Registers JsonWebToken for a user
module.exports = {
    signToken: async (user) => {
        var type = '';
        if (user instanceof Company) {
            type = 'company';
        } else if (user instanceof Student) {
            type = 'student';
        }
        return await JWT.sign({
            iss: 'john',
            sub: {
                id: user.id,
                type: type,
            },
            iat: Date.now(),
            exp: new Date().setDate(new Date().getDate() + 1)
        }, JWT_SECRET);
    }
}
