const Company = require('@models/company');
const Student = require('@models/student');
const { Conversation, Message } = require('@models/chat');
const helpers = require('@controllers/helpers');
const logger = require('@root/logger');

const to = require('await-to-js').default;

// Функции запросов связанных с чатами(диалогами).
module.exports = {
    // Контроллер возвращает сообщения идущие перед заданным сообщением по айди
    //
    // GET /student/chat/:conversationId/:cursor/:limit
    studentGetChat: async (req, res, next) => {
        // Проверяем, что чат существует
        var [err, conversation] = await to(
            Conversation.findById(req.params.conversationId)
        );
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        if (!conversation) {
            return res.status(400).json({
                error: "incorrect conversation id"
            });
        }

        // Проверяем, что у студента есть доступ
        if (conversation.studentId !== req.account.id) {
            return res.status(403).json({
                error: "not authorized for this conversation"
            });
        }

        // Если последнее сообщение указано, то меняем фильтр
        var request = {
            conversationId: req.params.conversationId
        };
        if (req.params.cursor !== "_") {
            request._id = {'$lt': req.params.cursor };
        }

        [err, messages] = await to(
            Message.find(request).sort({ '_id': -1 }).limit(parseInt(req.params.limit))
        );
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        return res.status(200).json({
            messages
        });
    },

    // Контроллер возвращает последнее сообщение в чате
    //
    // GET /student/chat/last-message/:conversationId
    studentGetLastChatMessage: async (req, res, next) => {
        // Проверяем, что чат существует
        var [err, conversation] = await to(
            Conversation.findById(req.params.conversationId)
        );
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }
        if (!conversation) {
            return res.status(400).json({
                error: "incorrect conversation id"
            });
        }

        // Проверяем, что у студента есть доступ
        if (conversation.studentId !== req.account.id) {
            return res.status(403).json({
                error: "not authorized for this conversation"
            });
        }

        // Находим последнее сообщение в чате
        var message;
        [err, message] = await to(
            Message.findOne({
                conversationId: req.params.conversationId
            }).sort({ '_id': -1 })
        );
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        return res.status(200).json({
            message
        });
    },
};
