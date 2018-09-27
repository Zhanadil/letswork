const to = require('await-to-js').default;

const { Question, Answer } = require('@models/questionnaire');

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
        var err, question;

        // Ищем вопрос в базе данных
        [err, question] = await to(
            Question.findOne({
                setNumber: req.body.setNumber,
                questionNumber: req.body.questionNumber,
            })
        );
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Если вопрос есть в базе
        if (question) {
            question.set(req.body);
            await question.save();
            return res.status(200).json({ status: "ok" });
        }
        // Создаем новый вопрос
        question = await new Question(req.body);
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        await question.save();

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
        var err, question;

        // Ищем вопрос в базе данных
        [err, question] = await to(
            Question.findOne({
                setNumber: req.body.setNumber,
                questionNumber: req.body.questionNumber,
            })
        );
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Если вопроса нет в базе, вернуть ошибку
        if (!question) {
            return res.status(400).json({ error: "question not found" });
        }

        // Удаляем вопрос
        [err] = await to(
            question.remove()
        );
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        return res.status(200).json({ status: "ok" });
    }
};
