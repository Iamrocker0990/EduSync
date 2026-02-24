const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration with secure filename generation
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate a safe, random filename to prevent path traversal and collisions
        crypto.randomBytes(16, (err, raw) => {
            if (err) return cb(err);
            const ext = path.extname(file.originalname);
            cb(null, `${raw.toString('hex')}${ext}`);
        });
    }
});

// File validation
const fileFilter = (req, file, cb) => {
    // Allowed extensions and corresponding mime types (optional to check mime, but good practice)
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.zip', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`), false);
    }
};

// Configured multer instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit
    }
});

module.exports = upload;
