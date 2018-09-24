const to = require('await-to-js').default;
const nanoid = require('nanoid/async');

const Student = require('@models/student');
const { signToken } = require('@controllers/helpers/token');
const mailer = require('@controllers/mailer');
const { hashPassword } = require('@controllers/helpers/auth');

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

        const hashedPassword = await hashPassword(password);
        var confirmationToken = await nanoid();

        // Создаем постоянный аккаунт и сохраняем его
        const newStudent = new Student({
            credentials: {
                method: 'local',
                email: email,
                password: hashedPassword,
                confirmed: false,
                confirmationToken: confirmationToken,
            }
        });
        await newStudent.save();

        mailer.sendStudentRegistrationEmail(newStudent);

        // Возвращаем токен
        const token = await signToken(newStudent);
        return res.status(200).json({ token });
    },

    // Подтверждение аккаунта, если ссылка верная, то переносим данные
    // с временного аккаунта на постоянный
    verify: async (req, res, next) => {
        // Проверяем что студент существует
        var err, student;
        [err, student] = await to(
            Student.findOne({'credentials.confirmationToken': req.params.token})
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (!student) {
            return res.status(400).json({error: "student not found"});
        }

        // Подтверждаем его почту
        student.credentials.confirmed = true;
        student.credentials.confirmationToken = undefined;

        // Сохраняем и возвращаем токен
        await student.save();
        const token = await signToken(student);
        return res.status(200).json({ token });
    },

    signIn: async (req, res, next) => {
        const token = await signToken(req.account);
        return res.status(200).json({ token });
    },

    // Высылает ссылку на обновление пароля
    sendForgotPasswordLink: async (req, res, next) => {
        var err, student;
        // Ищем студента по почте
        [err, student] = await to(
            Student.findOne({
                'email': req.params.email
            })
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (!student) {
            return res.status(401).json({error: "email is not used"});
        }

        // Создаем уникальную(практически,
        //  для подтверждения см.
        //  https://www.npmjs.com/package/nanoid) ссылку для обновления пароля
        student.credentials.forgotPasswordUrl = await nanoid();
        // Устанавливаем время на установку пароля 24 часа
        student.credentials.forgotPasswordExpirationDate = new Date(Date.now() + 24*60*60*1000);

        await student.save();

        mailer.sendStudentForgotPasswordLink(student);

        return res.status(200).json({status: "ok"});
    },

    // Подтверждает, что ссылка на "забыли пароль" верна, но не меняет его
    forgotPasswordConfirmation: async (req, res, next) => {
        var err, student;
        // Ищет, что студент с такой ссылкой существует
        [err, student] = await to(
            Student.findOne({
                'credentials.forgotPasswordUrl': req.params.url
            })
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (!student) {
            return res.status(400).json({error: "wrong url, student not found"});
        }

        console.log(`expiration date: ${student.credentials.forgotPasswordExpirationDate}`);
        console.log(`Date.now(): ${new Date()}`);
        if (!student.credentials.forgotPasswordExpirationDate ||
                new Date() > student.forgotPasswordExpirationDate) {
            student.credentials.forgotPasswordUrl = null;
            student.credentials.forgotPasswordExpirationDate = null;
            await student.save();

            return res.status(403).json({error: "link expired"});
        }

        // Даем студенту 10 минут, чтобы заполнить форму нового пароля
        student.credentials.forgotPasswordExpirationDate = new Date(Date.now() + 10*60*1000);
        await student.save();

        return res.status(200).json({status: "ok"});
    },

    // Меняет пароль на новый если студент запрашивал изменение
    changePassword: async (req, res, next) => {
        var err, student;
        // Находит студента по ссылка изменения пароля
        [err, student] = await to(
            Student.findOne({
                'credentials.forgotPasswordUrl': req.params.url
            })
        )
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (!student) {
            return res.status(400).json({error: "wrong url, student not found"});
        }

        // Если время на ссылку истекло, то удаляем ссылку и возвращаем ошибку
        if (!student.credentials.forgotPasswordExpirationDate ||
                new Date() > student.credentials.forgotPasswordExpirationDate) {
            student.credentials.forgotPasswordUrl = null;
            student.credentials.forgotPasswordExpirationDate = null;
            await student.save();

            return res.status(403).json({error: "link expired"});
        }

        // Обновляем пароль и удаляем ссылку
        student.credentials.password = await hashPassword(req.body.password);
        student.credentials.forgotPasswordUrl = null;
        student.credentials.forgotPasswordExpirationDate = null;
        await student.save();

        const token = await signToken(company);

        return res.status(200).json({token});
    },

    // Sign up a user by google account
    googleOAuth: async (req, res, next) => {
        const token = await signToken(req.account);
        return res.status(200).json({ token });
    },
};
