const to = require('await-to-js').default;
const nanoid = require('nanoid/async');

const Student = require('@models/student');
const TemporaryStudent = require('@models/temporary/student');
const { signToken } = require('@controllers/helpers/token');
const mailer = require('@controllers/mailer');

// Student Controller functions that are used in authentication.
module.exports = {
    // Регистрация студента по почте и паролю
    signUp: async (req, res, next) => {
        var err, foundStudent;
        const { email, password } = req.value.body;

        // Если почта уже используется, то вернуть ошибку
        [err, foundStudent] = await to(
            Student.findOne({ 'credentials.email': email })
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (foundStudent) {
            return res.status(403).json({ error: "Email is already in use" });
        }

        var foundTemporaryStudent;
        // Если студент уже пытался зарегестрироваться, но не подтвердил почту,
        // то повторно выслать ссылку подтверждения
        [err, foundTemporaryStudent] = await to(
            TemporaryStudent.findOne({ 'credentials.email': email })
        )
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (foundTemporaryStudent) {
            // Обновляем ссылку и дату истечения срока
            foundTemporaryStudent.url = await nanoid();
            foundTemporaryStudent.dateUpdated = Date.now();
            await foundTemporaryStudent.save();
            mailer.sendStudentRegistrationEmail(foundTemporaryStudent);

            return res.status(200).json({ status: "ok" });
        }

        // Создаем временный аккаунт, который удаляется через 24 часа, если
        // студент не пройдет по ссылке
        var url = await nanoid();

        const newStudent = await new TemporaryStudent({
            credentials: {
                method: 'local',
                email,
                password,
            },
            url,
        });
        await newStudent.save();
        mailer.sendStudentRegistrationEmail(newStudent);

        return res.status(200).json({ status: "ok" });
    },

    // Подтверждение аккаунта, если ссылка верная, то переносим данные
    // с временного аккаунта на постоянный
    verify: async (req, res, next) => {
        // Проверяем что временный студент существует и сразу удаляем
        var err, temporaryStudent;
        [err, temporaryStudent] = await to(
            TemporaryStudent.findOneAndRemove({url: req.params.url})
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (!temporaryStudent) {
            return res.status(204).json({error: "student not found"});
        }

        // Создаем постоянный аккаунт и сохраняем его
        const newStudent = new Student({
            credentials: {
                method: 'local',
                email: temporaryStudent.credentials.email,
                password: temporaryStudent.credentials.password,
            }
        });
        await newStudent.save();

        // Возвращаем токен
        const token = await signToken(newStudent);
        return res.status(200).json({ token });
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
