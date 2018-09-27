const to = require('await-to-js').default;

const Questionnaire = require('@models/questionnaire');

// Все общие запросы связанные с анктой студентов
module.exports = {
    // Контроллер возвращает сет вопросов анкеты по номеру сета
    //
    // GET /questionnaire/question-set/:setNumber
    getQuestionSet: async (req, res, next) => {
        var err, questionSet;

        // Ищем сет в базе данных
        [err, questionSet] = await to(
            Questionnaire.QuestionSet.find({
                setNumber: req.params.setNumber,
            })
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }

        // Возвращаем сет вопросов
        return res.status(200).json({ questionSet });
    },

    // Контроллер возвращает все сеты вопросов
    //
    // GET /questionnaire/all-question-sets
    getAllQuestionSets: async (req, res, next) => {
        var err, questionSets;

        // Ищем сеты в базе данных
        [err, questionSets] = await to(
            Questionnaire.QuestionSet.find({}).sort({ setNumber: 1 })
        );
        if (err) {
            return res.status(500).json({error: err.message});
        }

        // Возвращаем сеты вопросов
        return res.status(200).json({ questionSets });
    },
};
