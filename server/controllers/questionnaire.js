const to = require('await-to-js').default;

const { Question, Answer } = require('@models/questionnaire');

// Все общие запросы связанные с анктой студентов
module.exports = {
    // Контроллер возвращает вопрос анкеты по номеру сета и номеру вопроса
    //
    // GET /questionnaire/question/:setNumber/:questionNumber
    getQuestion: async (req, res, next) => {
        var err, question;

        // Ищем вопрос в базе данных
        [err, question] = await to(
            Question.findOne({
                setNumber: req.params.setNumber,
                questionNumber: req.params.questionNumber,
            })
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }

        // Если вопроса нет в базе
        if (!question) {
            return res.status(204).json({status: "Вопроса нет в базе данных"});
        }
        // Возвращаем вопрос
        return res.status(200).json({question});
    },

    // Контроллер возвращает сет вопросов анкеты по номеру сета
    //
    // GET /questionnaire/set-questions/:setNumber
    getSetQuestions: async (req, res, next) => {
        var err, questions;

        // Ищем вопрос в базе данных
        [err, questions] = await to(
            Question.find({
                setNumber: req.params.setNumber,
            }).sort({questionNumber: 1})
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }

        // Возвращаем сет вопросов
        return res.status(200).json({questions});
    },

    // Контроллер возвращает все вопросовы анкеты
    //
    // GET /questionnaire/all-questions
    getAllQuestions: async (req, res, next) => {
        var err, questions;

        // Ищем вопрос в базе данных
        [err, questions] = await to(
            Question.find({}).sort({setNumber: 1, questionNumber: 1})
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }

        // Возвращаем сет вопросов
        return res.status(200).json({questions});
    },
};
