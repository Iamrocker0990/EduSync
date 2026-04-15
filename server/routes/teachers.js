const express = require('express');
const router = express.Router();
const { protect, teacher } = require('../middleware/auth');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');

// @desc    Get Teacher Dashboard Stats
// @route   GET /api/teachers/dashboard
router.get('/dashboard', protect, teacher, async (req, res) => {
    try {
        const teacherId = req.user._id;

        // 1. Get all courses created by this teacher
        const courses = await Course.find({ instructor: teacherId });
        const courseIds = courses.map(course => course._id);

        // 2. Calculate Total Stats
        const totalCourses = courses.length;

        // Count UNIQUE students enrolled across all teacher's courses
        const uniqueStudents = await Enrollment.aggregate([
            { $match: { course: { $in: courseIds } } },
            { $group: { _id: "$student" } },
            { $count: "total" }
        ]);
        const totalStudents = uniqueStudents.length > 0 ? uniqueStudents[0].total : 0;

        // Count total assignments created by this teacher
        const totalAssignments = await Assignment.countDocuments({
            teacherId: teacherId
        });

        // Count total quizzes created by this teacher
        const totalQuizzes = await Quiz.countDocuments({
            instructor: teacherId
        });

        // 3. Get Recent Activity (Last 5 enrollments)
        const recentEnrollments = await Enrollment.find({ course: { $in: courseIds } })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('student', 'name email')
            .populate('course', 'title');

        const recentActivity = recentEnrollments
            .filter(enroll => enroll.student && enroll.course) // Guard against deleted refs
            .map(enroll => ({
                type: 'enrollment',
                user: enroll.student.name,
                action: 'enrolled in',
                target: enroll.course.title,
                time: new Date(enroll.createdAt).toLocaleDateString()
            }));

        // 4. Calculate Data for "Active Students per Course" Chart
        // We group enrollments by course to see which is most popular
        const studentDistribution = await Enrollment.aggregate([
            { $match: { course: { $in: courseIds } } },
            { $group: { _id: "$course", count: { $sum: 1 } } }
        ]);

        // Map aggregation results back to course titles
        const chartData = studentDistribution.map(item => {
            const course = courses.find(c => c._id.toString() === item._id.toString());
            return {
                name: course ? course.title : 'Unknown Course',
                count: item.count,
                total: 100, // Capacity (arbitrary for online courses)
                color: 'bg-blue-500'
            };
        });

        // 5. Send the Response
        res.json({
            stats: {
                totalCourses,
                totalStudents,
                totalAssignments,
                pendingQuizzes: totalQuizzes
            },
            recentActivity,
            chartData,
            upcomingClasses: [] // Placeholder until Live Class model exists
        });

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get all students enrolled in teacher's courses with progress
// @route   GET /api/teacher/students
router.get('/students', protect, teacher, async (req, res) => {
    try {
        const teacherId = req.user._id;

        // 1. Get all courses created by this teacher
        const courses = await Course.find({ instructor: teacherId });
        const courseIds = courses.map(course => course._id);

        if (courseIds.length === 0) {
            return res.json([]);
        }

        // 2. Get all enrollments for these courses
        const enrollments = await Enrollment.find({ course: { $in: courseIds } })
            .populate('student', 'name email profilePicture')
            .populate('course', 'title level category')
            .sort({ createdAt: -1 });

        // 3. Format the response for the frontend table
        const studentsData = enrollments
            .filter(enroll => enroll.student) // Guard against deleted students
            .map(enroll => ({
                _id: enroll._id, // Enrollment ID
                studentId: enroll.student._id,
                studentName: enroll.student.name,
                studentEmail: enroll.student.email,
                courseId: enroll.course._id,
                courseTitle: enroll.course.title,
                enrolledAt: enroll.enrolledAt || enroll.createdAt,
                progress: enroll.progress || 0,
                completedLessonsCount: enroll.completedLessons ? enroll.completedLessons.length : 0
            }));

        res.json(studentsData);

    } catch (error) {
        console.error("Students List Error:", error);
        res.status(500).json({ message: 'Server Error fetching students' });
    }
});

module.exports = router;