const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edusync');

        // Note: Do NOT hash the password here because the Mongoose pre('save') hook 
        // in User.js hashes the password automatically on create/save.
        // Doing it twice makes the login fail.

        await User.findOneAndDelete({ email: 'teacher@test.com' });
        await User.findOneAndDelete({ email: 'student@test.com' });

        const teacher = await User.create({
            name: 'Test Teacher',
            email: 'teacher@test.com',
            password: 'password123',
            role: 'teacher',
        });
        console.log('Test teacher created:', teacher.email);

        const student = await User.create({
            name: 'Test Student',
            email: 'student@test.com',
            password: 'password123',
            role: 'student',
        });
        console.log('Test student created:', student.email);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedDB();
