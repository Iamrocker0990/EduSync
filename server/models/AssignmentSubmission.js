const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    submissionText: { type: String, default: '' },
    submissionFile: { type: String, default: '' }, // URL/Path to the submitted document
    status: {
        type: String,
        enum: ['pending', 'submitted', 'graded'],
        default: 'submitted' // 'pending' would be if we tracked unsubmitted explicitly, but usually it's just 'submitted' upon creation
    },
    score: { type: Number, default: null },
    feedback: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
