const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const to = require('await-to-js').default;

const Student = require('@models/student');
const Company = require('@models/company');
const { Conversation, Message } = require('@models/chat');

const helpers = require('@socket-controllers/helpers');

const onReceiveMessage = (socket, data) => {
    // Контроль получения сообщений
    // {
    //     conversationId: String,
    //     receiverId: String,
    //     messageType: enum('text', 'image', 'document'),
    //     text: String,
    //     timeSent: Date,
    // }
    socket.on('chat_message', async (message, returnCall) => {
        // Валидация входных данных
        const validateResult =
            helpers.validateBody(helpers.receiveMessageSchema, message);
        if (validateResult) {
            returnCall({
                status: 'error',
                message: validateResult,
            });
            return;
        }

        // Проверка на существование чата по айди
        var err, conversation = null;
        if (message.conversationId) {
            [err, conversation] = await to(
                Conversation.findById(message.conversationId)
            );
            if (err) {
                returnCall({
                    status: 'error',
                    message: err.message
                });
                return;
            }
        }

        // Если не нашли чат по айди
        if (!conversation) {
            // Если айди получателя не указан, то возвращаем ошибку
            if (!message.receiverId) {
                returnCall({
                    status: 'error',
                    message: 'conversation not found',
                });
                return;
            }

            var companyId, studentId;
            if (data.userType === 'company') {
                companyId = data.userId;
                studentId = message.receiverId;
            } else {
                companyId = message.receiverId;
                studentId = data.userId;
            }

            // Находим чат по собеседникам
            [err, conversation] = await to(
                Conversation.findOne({
                    companyId,
                    studentId,
                })
            );
            if (err) {
                returnCall({
                    status: 'error',
                    message: err.message,
                });
                return;
            }

            // Если не нашли и так, то создаем новый
            if (!conversation) {
                [err, conversation] = await to(
                    new Conversation({
                        companyId,
                        studentId
                    }).save()
                );
                if (err) {
                    returnCall({
                        status: 'error',
                        message: err.message,
                    });
                    return;
                }
            }

            message.conversationId = conversation.id;
        }

        // Добавляем сообщение в базу данных
        var [err, chatMessage] = await to(
            new Message({
                messageType: message.messageType,
                authorId: data.userId,
                authorType: data.userType,
                conversationId: message.conversationId,
                text: message.text,
                timeSent: message.timeSent,
            }).save()
        );
        if (err) {
            returnCall({
                status: 'error',
                message: err.message,
            });
            return;
        }

        conversation.lastMessage = chatMessage;
        [err, conversation] = await to(
            conversation.save()
        );
        if (err) {
            returnCall({
                status: 'error',
                message: err.message,
            });
            return;
        }

        // Находим тип и айди получателя
        var receiverType;
        if (data.userType === 'company') {
            receiverType = 'student';
        } else if (data.userType === 'student') {
            receiverType = 'company';
        }

        var receiverId;
        if (receiverType === 'student') {
            receiverId = conversation.studentId;
        } else if (receiverType === 'company') {
            receiverId = conversation.companyId;
        }

        // Отправляем сообщение в комнату получателя
        socket.in(receiverType + receiverId).emit('chat_message', chatMessage);

        returnCall({ status: 'ok' });
    });
}

module.exports = {
    control: (socket, data) => {
        onReceiveMessage(socket, data);
    }
}
