const Student = require('@models/student');
const { signToken } = require('@controllers/helpers/token');

// Student Controller functions that are used in authentication.
module.exports = {
    // Sign Up a user by email
    signUp: async (req, res, next) => {
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

    signIn: async (req, res, next) => {
        const token = await signToken(req.account);
        return res.status(200).json({ token });
    },

    // Sign up a user by google account
    googleOAuth: async (req, res, next) => {
        const token = await signToken(req.account);
        return res.status(200).json({ token });
    },
};
