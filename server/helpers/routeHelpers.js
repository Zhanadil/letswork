const joi = require('joi');

const authSchema = joi.object().keys({
    email: joi.string().email({ minDomainAtoms: 2 }).required(),
    password: joi.string().required(),
});
const studentRegSchema = joi.object().keys({
    email: joi.string().email({ minDomainAtoms: 2 }).required(),
    password: joi.string().required(),
});
const companyRegSchema = studentRegSchema.keys({
    name: joi.string().required(),
});
const newVacancySchema = joi.object().keys({
    description: joi.string(),
    demands: joi.array().items(joi.string()),
    type: joi.array().items(joi.string()),
    minSalary: joi.number(),
    maxSalary: joi.number(),
    vacancyField: joi.string().required(),
    vacancyName: joi.string().required(),
});
const studentVacancyApplySchema = joi.object().keys({
    vacancyId: joi.string().required(),
    coverLetter: joi.string().required(),
});
const studentVacancyApplicationSchema = joi.object().keys({
    vacancyId: joi.string().required(),
});
const companyVacancyApplicationSchema = studentVacancyApplicationSchema.keys({
    studentId: joi.string().required()
});
const getVacancySchema = joi.object().keys({
    incoming: joi.string(),
    outgoing: joi.string()
});
const studentAnswerSchema = joi.object().keys({
    answers: joi.array().items(joi.string()),
});
const getVacancyById = joi.object().keys({
    requirements: joi.object().keys({
        description: joi.number(),
        demands: joi.number(),
        type: joi.number(),
        minSalary: joi.number(),
        maxSalary: joi.number(),
        vacancyField: joi.number(),
        vacancyName: joi.number(),
        companyId: joi.number(),
        companyName: joi.number(),
    }),
});
const deleteQuestionSchema = joi.object().keys({
    setNumber: joi.number().min(0).required(),
    questionNumber: joi.number().min(0).required(),
});
const updateQuestionSchema = joi.object().keys({
    questionType: joi.string().valid('openended', 'multichoice', 'singlechoice', 'dropdown').required(),
    setNumber: joi.number().min(0).required(),
    questionNumber: joi.number().min(0).required(),
    questionText: joi.string().required(),
    answers: joi.array().items(joi.string()).required(),
});
const getAllVacancies = getVacancyById.keys({
    filter: joi.object().keys({
        minSalary: joi.number(),
        maxSalary: joi.number(),
        type: joi.array().items(joi.string()),
        vacancyField: joi.string(),
    }),
});

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
        authSchema,
        studentRegSchema,
        companyRegSchema,
        newVacancySchema,
        studentVacancyApplySchema,
        studentVacancyApplicationSchema,
        companyVacancyApplicationSchema,
        getVacancySchema,
        studentAnswerSchema,
        getVacancyById,
        getAllVacancies,
        updateQuestionSchema,
        deleteQuestionSchema,
    },
};
