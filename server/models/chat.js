const mongoose = require('mongoose');

const conversationSchema = mongoose.Schema({
    companyId: String,
    studentId: String,
});

const messageSchema = mongoose.Schema({
    authorId: String,
    authorType: {
        type: String,
        enum: ['student', 'company'],
    },
    conversationId: String,
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
const Conversation = mongoose.model('conversation', conversationSchema);

module.exports = {
    Message,
    Conversation,
};