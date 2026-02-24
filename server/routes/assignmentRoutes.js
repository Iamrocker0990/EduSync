const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, admin, teacher } = require('../middleware/auth');
const {
    createAssignment,
    getTeacherAssignments,
    getStudentAssignments,
    submitAssignment,
    getAssignmentSubmissions,
    gradeSubmission
} = require('../controllers/assignmentController');

// Ensure upload directories exist
const assignmentsDir = path.join(__dirname, '../uploads/assignments');
const submissionsDir = path.join(__dirname, '../uploads/submissions');
if (!fs.existsSync(assignmentsDir)) fs.mkdirSync(assignmentsDir, { recursive: true });
if (!fs.existsSync(submissionsDir)) fs.mkdirSync(submissionsDir, { recursive: true });

// Multer storage for teacher assignments
const assignmentStorage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/assignments/');
    },
    filename(req, file, cb) {
        cb(null, `assignment-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const uploadAssignment = multer({ storage: assignmentStorage });

// Multer storage for student submissions
const submissionStorage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/submissions/');
    },
    filename(req, file, cb) {
        cb(null, `submission-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const uploadSubmission = multer({ storage: submissionStorage });

// Routes
router.post('/', protect, teacher, uploadAssignment.single('document'), createAssignment);
router.get('/teacher', protect, teacher, getTeacherAssignments);
router.get('/student', protect, getStudentAssignments); // Student route just needs protect in this setup

// Assignment specific routes
router.get('/:id/submissions', protect, teacher, getAssignmentSubmissions);
router.post('/:id/submit', protect, uploadSubmission.single('document'), submitAssignment); // Students

// Submission specific routes
router.put('/submissions/:id/grade', protect, teacher, gradeSubmission);

module.exports = router;
