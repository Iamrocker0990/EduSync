// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header (split by space)
            token = req.headers.authorization.split(' ')[1];

            // DEBUGGING: Remove this console.log after you fix the error
            console.log("Incoming Token:", token);

            // SAFETY CHECK: If token is "null", "undefined" or empty
            if (!token || token === 'null' || token === 'undefined') {
                return res.status(401).json({ message: 'Not authorized, invalid token format' });
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Decoded Token Data:", decoded);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                console.log("Protect Middleware: User not found for ID", decoded.id);
                return res.status(401).json({ message: 'User not found' });
            }

            console.log("Protect Middleware: Authenticated User Role -", req.user.role);

            next();
        } catch (error) {
            console.error("JWT Verification Error:", error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, reqNext) => {
    // Kept "admin" route protection to explicitly check for admin OR superadmin.
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
        reqNext();
    } else {
        res.status(403).json({ message: 'Forbidden: Not authorized as an admin or superadmin' });
    }
};

const superadmin = (req, res, next) => {
    if (req.user && (req.user.role === 'superadmin' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Not authorized as superadmin' });
    }
}

const teacher = (req, res, next) => {
    // Allow admins to act as teachers too for testing
    if (req.user && (['teacher', 'admin', 'superadmin', 'institution'].includes(req.user.role))) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Not authorized as a teacher' });
    }
};

const student = (req, res, next) => {
    if (req.user && req.user.role === 'student') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Not authorized as a student' });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        console.log("Authorize Roles Check. User Role:", req.user?.role, "Allowed Roles:", roles);
        if (!req.user || !roles.includes(req.user.role)) {
            console.log("Authorize Roles FAILED. Access Denied.");
            return res.status(403).json({ message: 'Access denied: Unauthorized role' });
        }
        next();
    };
};

module.exports = { protect, admin, superadmin, teacher, student, authorizeRoles };