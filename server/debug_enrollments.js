require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');

async function debugEnrollments() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        // Find a teacher
        const teacher = await User.findOne({ role: 'teacher' });
        if (!teacher) {
            console.log("No teacher found.");
            process.exit(0);
        }
        console.log("Found Teacher:", teacher.name, teacher._id);

        const courses = await Course.find({ instructor: teacher._id });
        console.log("Found Courses:", courses.length);
        const courseIds = courses.map(course => course._id);

        console.log("Querying enrollments for course IDs:", courseIds);
        const enrollments = await Enrollment.find({ course: { $in: courseIds } })
            .populate('student', 'name email')
            .populate('course', 'title status')
            .sort({ enrolledAt: -1 });

        console.log("Found Enrollments:", enrollments.length);
        if (enrollments.length > 0) {
            console.log(enrollments[0]);
        }

    } catch (err) {
        console.error("DEBUG ERROR:", err);
    } finally {
        console.log("Done.");
        process.exit(0);
    }
}

debugEnrollments();
