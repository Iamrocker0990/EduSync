const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const args = process.argv.slice(2);
        const email = args[0];
        const password = args[1];

        if (!email || !password) {
            console.log('Usage: node scripts/create-admin.js <email> <password>');
            console.log('Example: node scripts/create-admin.js admin@example.com admin123');
            process.exit(1);
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            // Update to admin if exists
            userExists.role = 'admin';
            userExists.password = password; // Will be hashed by pre-save hook
            await userExists.save();
            console.log(`User ${email} updated to admin with new password.`);
        } else {
            // Create new admin
            await User.create({
                name: 'Admin User',
                email,
                password,
                role: 'admin',
                accountStatus: 'ACTIVE'
            });
            console.log(`Admin user created: ${email}`);
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();