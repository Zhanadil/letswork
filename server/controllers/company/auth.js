const to = require('await-to-js').default;
const nanoid = require('nanoid');

const Company = require('@models/company');
const { signToken } = require('@controllers/helpers/token');
const mailer = require('@controllers/mailer');
const { hashPassword } = require('@controllers/helpers/auth');

// Company authorization methods controller
module.exports = {
    // Регистрация: требуются почта, пароль и название компании
    signUp: async (req, res, next) => {
        const { name, email, password } = req.value.body;

        // Проверяем, что почта не используется
        var err, foundCompany;
        [err, foundCompany] = await to(
            Company.findOne({ 'credentials.email': email })
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (foundCompany) {
            return res.status(403).json({ error: "Email is already in use" });
        }

        // Создаем токен для подтверждения, он будет выслан по почте
        var confirmationToken = await nanoid();

        // Создаем аккаунт, с неподтвержденной почтой, и добавляем токен для
        // подтверждения
        const hashedPassword = await hashPassword(password);
        const newCompany = new Company({
            credentials: {
                method: 'local',
                email: email,
                password: hashedPassword,
                confirmed: false,
                confirmationToken: confirmationToken,
            },
            name: name,
        });

        // Сохраняем аккаунт и отправляем почту
        await newCompany.save();
        mailer.sendCompanyRegistrationEmail(newCompany);

        // Возвращаем токен для доступа к сайту
        const token = await signToken(newCompany);
        return res.status(200).json({ token });
    },

    // Подтверждаем аккаунт если ссылка верная
    verify: async (req, res, next) => {
        // Проверяем что компания существует
        var err, company;
        [err, company] = await to(
            Company.findOne({ 'credentials.confirmationToken': req.params.token })
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (!company) {
            return res.status(204).json({error: "company not found"});
        }

        // Подтверждаем почту
        company.credentials.confirmed = true;
        company.credentials.confirmationToken = undefined;

        // Сохраняем изменения и возвращаем токен
        await company.save();
        const token = await signToken(company);
        return res.status(200).json({ token });
    },

    signIn: async (req, res, next) => {
        const token = await signToken(req.account);
        res.status(200).json({ token });
    },

    // Высылает ссылку на обновление пароля
    sendForgotPasswordLink: async (req, res, next) => {
        var err, company;
        // Ищем компанию по почте
        [err, company] = await to(
            Company.findOne({
                'email': req.params.email
            })
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (!company) {
            return res.status(401).json({error: "email is not used"});
        }

        // Создаем уникальную ссылку для обновления пароля
        //  (практически уникальную, для подтверждения см.
        //  https://www.npmjs.com/package/nanoid)
        company.credentials.forgotPasswordUrl = await nanoid();
        // Устанавливаем время на установку пароля 24 часа
        company.credentials.forgotPasswordExpirationDate =
            new Date(Date.now() + 24*60*60*1000);

        await company.save();

        mailer.sendCompanyForgotPasswordLink(company);

        return res.status(200).json({status: "ok"});
    },

    // Подтверждает, что ссылка на "забыли пароль" верна, но не меняет его
    forgotPasswordConfirmation: async (req, res, next) => {
        var err, company;
        // Проверяет, что компания с такой ссылкой существует
        [err, company] = await to(
            Company.findOne({
                'credentials.forgotPasswordUrl': req.params.url
            })
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (!company) {
            return res.status(400).json({error: "wrong url, student not found"});
        }

        if (!company.credentials.forgotPasswordExpirationDate ||
                new Date() > company.forgotPasswordExpirationDate) {
            company.credentials.forgotPasswordUrl = null;
            company.credentials.forgotPasswordExpirationDate = null;
            await company.save();

            return res.status(403).json({error: "link expired"});
        }

        // Даем компании 10 минут, чтобы заполнить форму нового пароля
        company.credentials.forgotPasswordExpirationDate = new Date(Date.now() + 10*60*1000);
        await company.save();

        return res.status(200).json({status: "ok"});
    },

    // Меняет пароль на новый если компания запрашивала изменение
    changePassword: async (req, res, next) => {
        var err, company;
        // Находит компанию по ссылка изменения пароля
        [err, company] = await to(
            Company.findOne({
                'credentials.forgotPasswordUrl': req.params.url
            })
        )
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (!company) {
            return res.status(400).json({error: "wrong url, student not found"});
        }

        // Если время на ссылку истекло, то удаляем ссылку и возвращаем ошибку
        if (!company.credentials.forgotPasswordExpirationDate ||
                new Date() > company.credentials.forgotPasswordExpirationDate) {
            company.credentials.forgotPasswordUrl = null;
            company.credentials.forgotPasswordExpirationDate = null;
            await company.save();

            return res.status(403).json({error: "link expired"});
        }

        // Обновляем пароль и удаляем ссылку
        company.credentials.password = await hashPassword(req.body.password);
        company.credentials.forgotPasswordUrl = null;
        company.credentials.forgotPasswordExpirationDate = null;
        await company.save();

        const token = await signToken(company);

        return res.status(200).json({token});
    },

    // Sign up a user by google account
    googleOAuth: async (req, res, next) => {
        const token = await signToken(req.account);
        res.status(200).json({ token });
    },
};
