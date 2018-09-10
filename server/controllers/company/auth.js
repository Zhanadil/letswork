const to = require('await-to-js').default;
const nanoid = require('nanoid');

const Company = require('@models/company');
const TemporaryCompany = require('@models/temporary/company');
const { signToken } = require('@controllers/helpers/token');
const mailer = require('@controllers/mailer');
const { hashPassword } = require('@controllers/helpers/auth');

// Company authorization methods controller
module.exports = {
    // Регистрация, требуются почта, пароль и название компании
    signUp: async (req, res, next) => {
        const { name, email, password } = req.value.body;

        // Check if email is already used
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

        var foundTemporaryCompany;
        // Если компания уже пыталась зарегестрироваться, но не подтвердила почту,
        // то повторно выслать ссылку подтверждения
        [err, foundTemporaryCompany] = await to(
            TemporaryCompany.findOne({ 'credentials.email': email })
        )
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (foundTemporaryCompany) {
            // Обновляем ссылку и дату истечения срока
            foundTemporaryCompany.url = await nanoid();
            foundTemporaryCompany.dateUpdated = Date.now();
            await foundTemporaryCompany.save();
            mailer.sendCompanyRegistrationEmail(foundTemporaryCompany);

            return res.status(200).json({ status: "ok" });
        }

        // Создаем временный аккаунт, который удаляется через 24 часа, если
        // компания не пройдет по ссылке
        var url = await nanoid();

        const hashedPassword = await hashPassword(password);

        const newCompany = await new TemporaryCompany({
            credentials: {
                method: 'local',
                email,
                password: hashedPassword,
            },
            name,
            url,
        });
        await newCompany.save();
        mailer.sendCompanyRegistrationEmail(newCompany);

        return res.status(200).json({status: "ok"});
    },

    // Подтверждение аккаунта, если ссылка верная, то переносим данные
    // с временного аккаунта на постоянный
    verify: async (req, res, next) => {
        // Проверяем что временная компания существует и сразу удаляем
        var err, temporaryCompany;
        [err, temporaryCompany] = await to(
            TemporaryCompany.findOneAndRemove({url: req.params.url})
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (!temporaryCompany) {
            return res.status(204).json({error: "company not found"});
        }

        // Создаем постоянный аккаунт и сохраняем его
        const newCompany = new Company({
            credentials: {
                method: 'local',
                email: temporaryCompany.credentials.email,
                password: temporaryCompany.credentials.password,
            },
            name: temporaryCompany.name,
        });
        await newCompany.save();

        // Возвращаем токен
        const token = await signToken(newCompany);
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

        return res.status(200).json({status: "ok"});
    },

    // Sign up a user by google account
    googleOAuth: async (req, res, next) => {
        const token = await signToken(req.account);
        res.status(200).json({ token });
    },
};
