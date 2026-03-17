const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }
}, { timestamps: true });

// Ensure a student and teacher only have one conversation per course
conversationSchema.index({ student: 1, teacher: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);
