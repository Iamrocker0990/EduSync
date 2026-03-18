const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

/**
 * @desc    Enroll in a course
 * @route   POST /api/enrollments/:courseId
 * @access  Private/Student
 */
const enrollInCourse = async (req, res) => {
    try {
        const studentId = req.user._id;
        const courseId = req.params.courseId;

        // 1. Check if course exists and is approved
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (course.status !== 'approved') {
            return res.status(400).json({ message: 'Cannot enroll in a non-approved course' });
        }

        // 2. Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({ student: studentId, course: courseId });
        if (existingEnrollment) {
            return res.status(400).json({ message: 'You are already enrolled in this course' });
        }

        // 3. Create Enrollment
        const enrollment = new Enrollment({
            student: studentId,
            course: courseId,
            status: 'enrolled',
            progress: 0
        });

        await enrollment.save();

        res.status(201).json({ message: 'Successfully enrolled!', enrollment });
    } catch (error) {
        console.error("Error enrolling in course:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Get my enrollments
 * @route   GET /api/enrollments/my-enrollments
 * @access  Private/Student
 */
const getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user._id })
            .populate({
                path: 'course',
                select: 'title thumbnail description duration instructor',
                populate: {
                    path: 'instructor',
                    select: 'name'
                }
            })
            .sort({ enrolledAt: -1 });

        // Filter out enrollments where the course might have been deleted
        const validEnrollments = enrollments.filter(e => e.course);

        res.json(validEnrollments);
    } catch (error) {
        console.error("Error fetching enrollments:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    enrollInCourse,
    getMyEnrollments
};
