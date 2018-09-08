const to = require('await-to-js').default;
const nanoid = require('nanoid');

const Company = require('@models/company');
const TemporaryCompany = require('@models/temporary/company');
const { signToken } = require('@controllers/helpers/token');
const mailer = require('@controllers/mailer');

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

        const newCompany = await new TemporaryCompany({
            credentials: {
                method: 'local',
                email,
                password,
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

    // Sign up a user by google account
    googleOAuth: async (req, res, next) => {
        const token = await signToken(req.account);
        res.status(200).json({ token });
    },
};
