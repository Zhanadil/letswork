const Company = require('@models/company');
const Student = require('@models/student');
const { signToken } = require('@controllers/helpers');

// Company authorization methods controller
module.exports = {
    // Sign Up a user by email
    companySignUp: async (req, res, next) => {
        const { name, email, password } = req.value.body;

        // Check if email is already used
        const foundCompany = await Company.findOne({
            '$or': [
                { 'credentials.email': email },
                { 'name': name },
            ]
        });
        if (foundCompany) {
            if (foundCompany.name === name) {
                return res.status(403).json({ error: "company name is already in use" });
            }
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

    companySignIn: async (req, res, next) => {
        const token = await signToken(req.account);
        res.status(200).json({ token });
    },

    // Sign up a user by google account
    companyGoogleOAuth: async (req, res, next) => {
        const token = await signToken(req.account);
        res.status(200).json({ token });
    },

    // Sign Up a user by email
    studentSignUp: async (req, res, next) => {
        const { email, password } = req.value.body;

        // Check if email is already used
        const foundStudent = await Student.findOne({ 'credentials.email': email });
        if (foundStudent) {
            return res.status(403).json({ error: "Email is already in use" });
        }

        const newStudent = new Student({
            credentials: {
                method: 'local',
                email,
                password,
            }
        });
        await newStudent.save();

        return res.status(200).json({ token: await signToken(newStudent) });
    },

    studentSignIn: async (req, res, next) => {
        const token = await signToken(req.account);

        if (req.account.userType === "admin") {
            return res.status(200).json({
                token,
                isAdmin: true,
            })
        }

        return res.status(200).json({ token });
    },

    // Sign up a user by google account
    studentGoogleOAuth: async (req, res, next) => {
        const token = await signToken(req.account);
        return res.status(200).json({ token });
    },
};
