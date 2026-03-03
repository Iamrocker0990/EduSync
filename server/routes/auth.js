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

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password, role, otp } = req.body;

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

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'student',
        });

        // Delete OTP after successful registration
        await OTP.deleteOne({ email });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
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
    const { email, password, role } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // If a role was provided by the client (student/teacher tab),
        // enforce that it matches the actual user role.
        if (!role || user.role !== role) {
            return res.status(403).json({
                message: `Forbidden: Please sign in as a ${user.role} instead.`,
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
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
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Update user profile (username)
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    const { name } = req.body;

    if (!name || name.trim().length < 3) {
        return res.status(400).json({ message: 'Username must be at least 3 characters long' });
    }

    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = name.trim();
            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("🔥 UPDATE PROFILE ERROR:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
