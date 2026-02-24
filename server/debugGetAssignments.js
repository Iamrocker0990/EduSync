const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Enrollment = require('./models/Enrollment');
const Assignment = require('./models/Assignment');

const debugStudentAssignments = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edusync');

        const student = await User.findOne({ email: 'student@test.com' });

        console.log("Student ID:", student._id);

        const enrollments = await Enrollment.find({ student: student._id });
        console.log("All Enrollments for student:", enrollments);

        const activeEnrollments = await Enrollment.find({ student: student._id, status: 'active' });
        console.log("Active Enrollments:", activeEnrollments);

        const courseIds = activeEnrollments.map(e => e.course);
        const assignments = await Assignment.find({ course: { $in: courseIds } });
        console.log("Assignments for those courses:", assignments);

        const assignments2 = await Assignment.find({});
        console.log("All assignments in DB:", assignments2);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

debugStudentAssignments();
