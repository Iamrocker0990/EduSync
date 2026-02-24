const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');

const seedCourse = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edusync');

        const teacher = await User.findOne({ email: 'teacher@test.com' });
        const student = await User.findOne({ email: 'student@test.com' });

        if (!teacher || !student) {
            console.error('Test users not found');
            process.exit(1);
        }

        const course = await Course.findOneAndUpdate(
            { title: 'Test Assignments Course' },
            {
                title: 'Test Assignments Course',
                description: 'A course for testing assignment creation and submission',
                instructor: teacher._id,
                category: 'Testing',
                level: 'Beginner',
                duration: '1 Hour',
                status: 'approved',
                createdBy: teacher._id,
                modules: [{
                    title: 'Module 1',
                    lessons: []
                }]
            },
            { upsert: true, new: true }
        );

        console.log('Test course created:', course.title);

        const enrollment = await Enrollment.findOneAndUpdate(
            { student: student._id, course: course._id },
            {
                student: student._id,
                course: course._id,
                status: 'active'
            },
            { upsert: true, new: true }
        );

        console.log('Student enrolled in test course:', enrollment._id);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedCourse();
