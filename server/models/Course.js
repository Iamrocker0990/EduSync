const mongoose = require('mongoose');

// 1. Lesson Schema (The Pages)
// This is a "sub-document". It lives inside the Course, not on its own.
const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    // We strictly limit types to 'video', 'document', etc.
    type: { type: String, enum: ['video', 'document', 'quiz', 'text'], required: true },
    content: { type: String, required: true },
    duration: { type: String }, // e.g., "10 min"
});

// 2. Module Schema (The Chapters)
// A course is made of modules, and modules are made of lessons.
const moduleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    lessons: [lessonSchema], // This is an array (list) of the lessons above
});

// 3. The Main Course Schema (The Book)
const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: [5, 'Title must be at least 5 characters long']
    },
    description: {
        type: String,
        required: true,
        minlength: [20, 'Description must be at least 20 characters long']
    },

    // LINKING: This connects the course to a specific Instructor (User)
    // "ref: 'User'" tells Mongoose to look in the User collection for this ID.
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    thumbnail: { type: String, default: '' }, // URL to the image
    modules: [moduleSchema], // The list of chapters defined above

    price: {
        type: Number,
        default: 0,
        min: [0, 'Price must be a positive number']
    },
    category: { type: String, required: true },
    level: { type: String, required: true },
    duration: { type: String, required: true },

    // Teacher Info (Auto-populated from teacher profile)
    experienceYears: {
        type: Number,
        default: 0,
        min: 0
    },
    specialization: {
        type: String,
        default: ''
    },
    portfolioLink: {
        type: String,
        // match: [
        //     /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        //     'Please use a valid URL'
        // ]
    },
    certifications: {
        type: String
    },

    // Course Structure
    learningOutcomes: [{
        type: String,
        required: true
    }],
    prerequisites: [{
        type: String
    }],
    targetAudience: [{
        type: String
    }],
    estimatedDuration: {
        type: Number, // in hours
        required: true,
        min: 0
    },
    modulesCount: {
        type: Number,
        default: 0
    },

    // Status Timeline
    actionTimestamp: {
        type: Date // When it was approved/rejected
    },

    // Certificate settings
    certificateSettings: {
        template: { type: String, enum: ['modern', 'classic', 'minimalistic'], default: 'modern' },
        logo: { type: String, default: '' },
        themeColor: { type: String, default: '#3b82f6' }
    },

    // 4. Status (Admin Approval)
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);