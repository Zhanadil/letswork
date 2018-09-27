const to = require('await-to-js').default;

const Questionnaire = require('@models/questionnaire');

// Все функции администратора
module.exports = {
    // Обновить(создать если не существует) вопрос по номеру сета и номеру вопроса
    //
    // /POST /admin/questionnaire/question/update
    // req.body: {
    //      setNumber: String,
    //      questionNumber: String,
    //      questionType: enum: ['openended', 'multichoice', 'singlechoice', 'dropdown'],
    //      questionText: String,
    //      answers: [String],
    // }
    updateQuestion: async (req, res, next) => {
        var err, questionSet;

        // Ищем сет вопросов в базе данных
        [err, questionSet] = await to(
            Questionnaire.QuestionSet.findOne({
                setNumber: req.body.setNumber,
            })
        );
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Если сета нет в базе, то вернуть ошибку
        if (!questionSet) {
            return res.status(400).json({ error: "question set not found" });
        }

        // Обнуляем номер сета, чтобы он не был прописан в документе вопроса.
        req.body.setNumber = undefined;

        // Находим индекс вопроса, если вопроса нет, то вставляем в конец
        var questionIndex = questionSet.questions.findIndex(
            Questionnaire.findQuestion(req.body.questionNumber)
        );
        if (questionIndex === -1) {
            questionIndex = questionSet.questions.length;
        }
        questionSet.questions[questionIndex] = req.body;

        // Сортируем вопросы по номерам
        questionSet.questions.sort(Questionnaire.questionCompare());
        await questionSet.save();

        return res.status(200).json({ status: "ok" });
    },

    // Удалить вопрос по номеру сета и номеру вопроса
    //
    // /POST /admin/questionnaire/question/delete
    // req.body: {
    //      setNumber: String,
    //      questionNumber: String,
    // }
    deleteQuestion: async (req, res, next) => {
        var err, questionSet;

        // Ищем вопрос в базе данных
        [err, questionSet] = await to(
            Questionnaire.QuestionSet.findOne({
                setNumber: req.body.setNumber,
            })
        );
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Если сета вопросов нет в базе, вернуть ошибку
        if (!questionSet) {
            return res.status(400).json({ error: "question set not found" });
        }

        // Находим индекс вопроса
        var questionIndex = questionSet.questions.findIndex(
            Questionnaire.findQuestion(req.body.questionNumber)
        );
        if (questionIndex === -1) {
            return res.status(400).json({ error: "question not found"});
        }

        // Удаляем вопрос
        questionSet.questions.splice(questionIndex, 1);

        // Сохраняем документ
        [err] = await to(
            questionSet.save()
        );
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        return res.status(200).json({ status: "ok" });
    }
};
