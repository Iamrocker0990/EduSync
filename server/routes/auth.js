const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { protect } = require('../middleware/auth');
const crypto = require('crypto');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Validation Helper
const validateInputs = (email, password) => {
    // Email: Standard regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Password: At least 8 characters
    const passwordRegex = /^.{8,}$/;

    if (!emailRegex.test(email)) {
        return "Please enter a valid email address.";
    }
    if (password && !passwordRegex.test(password)) {
        return "Password must be at least 8 characters long.";
    }
    return null;
};

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address." });
    }

    try {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to DB
        await OTP.findOneAndUpdate(
            { email },
            { otp, createdAt: new Date() },
            { upsert: true, new: true }
        );

        // In a real app, you'd send an actual email here using nodemailer.
        console.log(`------------------------------`);
        console.log(`OTP for ${email}: ${otp}`);
        console.log(`------------------------------`);

        res.status(200).json({ message: 'OTP sent successfully. Check server console for code.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Get all approved institutions
// @route   GET /api/auth/public/institutions
// @access  Public
router.get('/public/institutions', async (req, res) => {
    try {
        const institutions = await User.find({ role: 'institution', approvalStatus: 'approved' }).select('_id name');
        res.json(institutions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password, role, otp, institutionId, experienceYears, specialization, portfolioLink, certifications } = req.body;

    const validationError = validateInputs(email, password);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        // Verify OTP
        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord || otpRecord.otp !== otp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Validate teacher requiring institutionId
        if (role === 'teacher' && !institutionId) {
            return res.status(400).json({ message: 'Teachers must belong to an institution' });
        }

        if (role === 'teacher') {
            const institution = await User.findById(institutionId);
            if (!institution || institution.role !== 'institution' || institution.approvalStatus !== 'approved') {
                return res.status(400).json({ message: 'Invalid or unapproved institution selected.' });
            }
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'student',
            institutionId: role === 'teacher' ? institutionId : undefined,
            experienceYears: role === 'teacher' ? (Number(experienceYears) || 0) : undefined,
            specialization: role === 'teacher' ? (specialization || '') : undefined,
            portfolioLink: role === 'teacher' ? (portfolioLink || '') : undefined,
            certifications: role === 'teacher' ? (certifications || '') : undefined,
        });

        // Delete OTP after successful registration
        await OTP.deleteOne({ email });

        if (user) {
            // Check if approval is still pending
            if (user.approvalStatus === 'pending') {
                return res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    approvalStatus: user.approvalStatus,
                    message: 'Registration successful. Your account is pending approval.'
                });
            }

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                approvalStatus: user.approvalStatus,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password, role, institutionId } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Enforce approval status check
        if (user.approvalStatus !== 'approved') {
            return res.status(403).json({ message: 'Your account is under review. Please wait for approval.' });
        }

        // If a role was provided by the client (student/teacher tab),
        // enforce that it matches the actual user role.
        // Also map 'superadmin' or 'institution' if logging in from respective portals later.
        if (role && user.role !== role && !(role === 'admin' && user.role === 'superadmin')) {
            return res.status(403).json({
                message: `Forbidden: Please sign in as a ${user.role} instead.`,
            });
        }

        if (user.role === 'teacher') {
            if (!institutionId) {
                return res.status(400).json({ message: 'Please select an institution' });
            }
            if (user.institutionId.toString() !== institutionId) {
                return res.status(401).json({ message: 'You are not registered under this institution' });
            }
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            approvalStatus: user.approvalStatus,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("🔥 LOGIN ERROR FULL:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const profileData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        // Include teacher-specific fields
        if (user.role === 'teacher') {
            profileData.experienceYears = user.experienceYears || 0;
            profileData.specialization = user.specialization || '';
            profileData.portfolioLink = user.portfolioLink || '';
            profileData.certifications = user.certifications || '';
        }

        res.json(profileData);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Update user profile (username)
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    const { name, experienceYears, specialization, portfolioLink, certifications } = req.body;

    if (!name || name.trim().length < 3) {
        return res.status(400).json({ message: 'Username must be at least 3 characters long' });
    }

    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = name.trim();

            // Update teacher-specific fields if the user is a teacher
            if (user.role === 'teacher') {
                if (experienceYears !== undefined) user.experienceYears = Number(experienceYears);
                if (specialization !== undefined) user.specialization = specialization;
                if (portfolioLink !== undefined) user.portfolioLink = portfolioLink;
                if (certifications !== undefined) user.certifications = certifications;
            }

            const updatedUser = await user.save();

            const responseData = {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                token: generateToken(updatedUser._id),
            };

            if (updatedUser.role === 'teacher') {
                responseData.experienceYears = updatedUser.experienceYears;
                responseData.specialization = updatedUser.specialization;
                responseData.portfolioLink = updatedUser.portfolioLink;
                responseData.certifications = updatedUser.certifications;
            }

            res.json(responseData);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("🔥 UPDATE PROFILE ERROR:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
