const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const to = require('await-to-js').default;

const Student = require('@models/student');
const Company = require('@models/company');
const Message = require('@models/message');

const onReceiveMessage = (socket, data) => {
    socket.on('chat_message', async (message, returnCall) => {
        // Добавляем сообщение в базу данных
        var [err, chatMessage] = await to(
            new Message({
                authorId: data.userId,
                authorType: data.userType,
                receiverId: message.receiverId,
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

        // Тип получателя это обратное типа отправителя
        // Нужно для того, чтобы узнать комнату получателя
        var receiverType;
        if (data.userType === 'company') {
            receiverType = 'student';
        } else if (data.userType === 'student') {
            receiverType = 'company';
        }

        const receiverId = message.receiverId;
        if (receiverType === 'student') {
            var [err] = await to(
                Student.findById(receiverId)
            );
            if (err) {
                returnCall({
                    status: 'error',
                    message: 'incorrect receiver id',
                });
                return;
            }
        } else if (receiverType === 'company') {
            var [err] = await to(
                Company.findById(receiverId)
            );
            if (err) {
                returnCall({
                    status: 'error',
                    message: 'incorrect receiver id',
                });
                return;
            }
        }

        // Отправляем сообщение в комнату получателя
        socket.in(receiverType + receiverId).emit('chat_message', {
            authorId: data.userId,
            text: message.text,
            timeSent: message.timeSent,
        });

        returnCall({ status: 'ok' });
    });
}

module.exports = {
    control: (socket, data) => {
        onReceiveMessage(socket, data);
    }
}
