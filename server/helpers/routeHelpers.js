const joi = require('joi');

module.exports = {
    // Helper that checks that request body corresponds to a schema
    validateBody: (schema) => {
        return (req, res, next) => {
            const result = joi.validate(req.body, schema);

            if (result.error) {
                return res.status(400).json(result.error);
            }

            if (!req.value) {
                req.value = {};
            }

            req.value['body'] = result.value;

            next();
        }
    },

    // Schemas used in validateBody function
    schemas: {
        authSchema: joi.object().keys({
            email: joi.string().email({ minDomainAtoms: 2 }).required(),
            password: joi.string().required(),
        }),
        studentRegSchema: joi.object().keys({
            email: joi.string().email({ minDomainAtoms: 2 }).required(),
            password: joi.string().required(),
        }),
        companyRegSchema: joi.object().keys({
            email: joi.string().email({ minDomainAtoms: 2 }).required(),
            password: joi.string().required(),
            name: joi.string().required(),
        }),
        newVacancySchema: joi.object().keys({
            description: joi.string(),
            demands: joi.array().items(joi.string()),
            type: joi.array().items(joi.string()),
            minSalary: joi.number(),
            maxSalary: joi.number(),
            vacancyField: joi.string().required(),
            vacancyName: joi.string().required(),
        }),
        studentVacancyApplicationSchema: joi.object().keys({
            vacancyId: joi.string().required(),
        }),
        companyVacancyApplicationSchema: joi.object().keys({
            vacancyId: joi.string().required(),
            studentId: joi.string().required()
        }),
        getVacancySchema: joi.object().keys({
            incoming: joi.string(),
            outgoing: joi.string()
        }),
        studentAnswerSchema: joi.object().keys({
            answers: joi.array().items(joi.string()),
        }),
    },
};
