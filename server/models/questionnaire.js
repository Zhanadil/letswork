const mongoose = require('mongoose');

// База данных вопросов анкет
// Содержит айди сета, айди вопроса в сете,
// Тип вопроса: ["открытый вопрос", "мультивариантный", "одновариантный", "дропдаун"]
// и возможные варианты ответа.
// TODO:
// Возможно нужно будет добавить пререквизиты для вопросов или даже сетов
const questionsSchema = mongoose.Schema({
    setNumber: Number,
    questionNumber: Number,
    questionText: String,
    questionType: {
        type: String,
        enum: ['openended', 'multichoice', 'singlechoice', 'dropdown'],
    },
    answers: [String],
});

// База данных ответов
// Содержит айди студента, айди сета, айди вопроса в сете, и массив ответов
// В случае если тип вопроса не 'multichoice', то массив должен содержать
// только один ответ
const answersSchema = mongoose.Schema({
    studentId: String,
    setNumber: Number,
    questionNumber: Number,
    answers: [String],
});

const Question = mongoose.model('question', questionsSchema);
const Answer = mongoose.model('answer', answersSchema);

module.exports = {
    Question,
    Answer,
};
