const JWT = require('jsonwebtoken');
const { JWT_SECRET } = require('@configuration');

// Registers JsonWebToken for a user
module.exports = {
    signToken: async (user) => {
        return await JWT.sign({
            iss: 'john',
            sub: {
                id: user.id,
            },
            iat: Date.now(),
            exp: new Date().setDate(new Date().getDate() + 1)
        }, JWT_SECRET);
    }
}
