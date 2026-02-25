const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const { protect, admin, teacher } = require('../middleware/auth');
const {
    createAssignment,
    getTeacherAssignments,
    getStudentAssignments,
    submitAssignment,
    getAssignmentSubmissions,
    gradeSubmission
} = require('../controllers/assignmentController');

// Multer storage for teacher assignments
const assignmentStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'edusync/assignments',
        resource_type: 'auto',
    }
});
const uploadAssignment = multer({ storage: assignmentStorage });

// Multer storage for student submissions
const submissionStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'edusync/submissions',
        resource_type: 'auto',
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
