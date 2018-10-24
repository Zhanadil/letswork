const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    authorId: String,
    authorType: {
        type: String,
        enum: ['student', 'company'],
    },
    receiverId: String,
    messageType: {
        type: String,
        enum: ['text'],
    },
    text: String,
    timeSent: {
        type: Date,
        default: Date.now,
    },
});

const Message = mongoose.model('message', messageSchema);

module.exports = Message;
