const Company = require('@models/company');
const { signToken } = require('@controllers/helpers/token');

// Company authorization methods controller 
module.exports = {
    // Sign Up a user by email
    signUp: async (req, res, next) => {
        const { name, email, password } = req.value.body;

        // Check if email is already used
        const foundCompany = await Company.findOne({ 'credentials.email': email });
        if (foundCompany) {
            return res.status(403).json({ error: "Email is already in use" });
        }

        const newCompany = new Company({
            credentials: {
                method: 'local',
                email,
                password,
            },
            name,
        });
        await newCompany.save();

        res.status(200).json({ token: await signToken(newCompany) });
    },

    signIn: async (req, res, next) => {
        const token = await signToken(req.account);
        res.status(200).json({ token });
    },

    // Sign up a user by google account
    googleOAuth: async (req, res, next) => {
        const token = await signToken(req.account);
        res.status(200).json({ token });
    },
};
