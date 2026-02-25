// server/routes/courses.js
const express = require('express');
const router = express.Router();
const { protect, teacher } = require('../middleware/auth');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const {
    getAllCourses,
    getTeacherCourses,
    getCourseById,
    createCourse,
    addLesson,
    updateCourse,
    deleteCourse
} = require('../controllers/courseController');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'edusync/courses',
        resource_type: 'auto', // Allows video and images
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB limit checked before upload
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video and image uploads are allowed'));
        }
    }
});

// Routes
router.get('/', getAllCourses);
router.get('/mine', protect, teacher, getTeacherCourses);
router.get('/:id', getCourseById);
router.post('/', protect, teacher, createCourse);
router.post('/:id/lessons', protect, teacher, addLesson);
router.put('/:id', protect, teacher, updateCourse);
router.delete('/:id', protect, teacher, deleteCourse);

// Video Upload Route (Kept inline as it's tightly coupled with multer middleware)
router.post('/upload/video', protect, teacher, upload.single('video'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // req.file.path contains the secure Cloudinary URL 
        const url = req.file.path;
        res.status(201).json({ url });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Upload failed' });
    }
});

// Image Upload Route
router.post('/upload/image', protect, teacher, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }
        // req.file.path contains the secure Cloudinary URL 
        const url = req.file.path;
        res.status(201).json({ url });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Upload failed' });
    }
});

module.exports = router;