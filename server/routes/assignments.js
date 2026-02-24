const express = require('express');
const router = express.Router();
const { protect, teacher, student } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
    createAssignment,
    getCourseAssignments,
    getTeacherAssignments,
    getStudentAssignments,
    getAssignmentById,
    submitAssignment,
    getSubmissions,
    gradeSubmission,
    getMySubmission
} = require('../controllers/assignmentController');

router.post('/', protect, teacher, upload.single('file'), createAssignment);
router.get('/', protect, teacher, getTeacherAssignments);
router.get('/student', protect, student, getStudentAssignments);
router.get('/course/:courseId', protect, getCourseAssignments);
router.get('/:id', protect, getAssignmentById);
router.post('/:id/submit', protect, student, upload.single('file'), submitAssignment);
router.get('/:id/my-submission', protect, student, getMySubmission);
router.get('/:id/submissions', protect, teacher, getSubmissions);
router.put('/submissions/:id/grade', protect, teacher, gradeSubmission);

module.exports = router;
