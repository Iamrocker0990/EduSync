const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Storage configuration for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'edusync/general', // Optional: organized by folder in Cloudinary
        allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'zip', 'png', 'jpg', 'jpeg'],
        resource_type: 'auto' // Important for non-image files like PDFs/Docs
    },
});

// Configured multer instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit check is still maintained locally before upload
    }
});

module.exports = upload;
