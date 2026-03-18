const User = require('../models/User');
const Course = require('../models/Course');

/**
 * @desc    Get all teachers for an institution
 * @route   GET /api/institution/teachers
 * @access  Private/Institution
 */
const getInstitutionTeachers = async (req, res) => {
    try {
        console.log("Fetching teachers for Institution ID:", req.user._id);
        const teachers = await User.find({
            institutionId: req.user._id,
            role: 'teacher'
        }).select('-password');

        console.log("Found teachers:", teachers.length);
        res.json(teachers);
    } catch (error) {
        console.error('Error fetching teachers for institution:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Update teacher approval status
 * @route   PATCH /api/institution/teacher/:id/:status
 * @access  Private/Institution
 */
const updateTeacherStatus = async (req, res) => {
    try {
        const { id, status } = req.params;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be approved or rejected.' });
        }

        const teacher = await User.findOne({ _id: id, institutionId: req.user._id, role: 'teacher' });

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found or does not belong to your institution' });
        }

        teacher.approvalStatus = status;
        teacher.approvedBy = req.user._id;
        teacher.approvedAt = Date.now();
        const updatedTeacher = await teacher.save();

        res.json(updatedTeacher);
    } catch (error) {
        console.error('Error updating teacher status:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Get all courses created by teachers under the institution
 * @route   GET /api/institution/courses
 * @access  Private/Institution
 */
const getInstitutionCourses = async (req, res) => {
    try {
        // Find all teachers associated with this institution
        const teachers = await User.find({
            institutionId: req.user._id,
            role: 'teacher'
        }).select('_id');

        const teacherIds = teachers.map(t => t._id);

        // Fetch courses where the instructor is in the teacherIds list
        // Apply status filter if provided (e.g., ?status=pending)
        const query = { instructor: { $in: teacherIds } };
        if (req.query.status) {
            query.status = req.query.status;
        }

        const courses = await Course.find(query)
            .populate('instructor', 'name email')
            .sort({ createdAt: -1 });

        res.json(courses);
    } catch (error) {
        console.error('Error fetching institution courses:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Approve or Reject a course by Institution
 * @route   PATCH /api/institution/course/:id/:status
 * @access  Private/Institution
 */
const updateCourseStatus = async (req, res) => {
    try {
        const { id, status } = req.params;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be approved or rejected.' });
        }

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Verify the course instructor belongs to this institution
        const teacher = await User.findOne({
            _id: course.instructor,
            institutionId: req.user._id,
            role: 'teacher'
        });

        if (!teacher) {
            return res.status(403).json({ message: 'Unauthorized: Course instructor does not belong to your institution' });
        }

        course.status = status;
        course.actionTimestamp = Date.now();
        const updatedCourse = await course.save();

        res.json(updatedCourse);
    } catch (error) {
        console.error('Error updating course status:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getInstitutionTeachers,
    updateTeacherStatus,
    getInstitutionCourses,
    updateCourseStatus
};
