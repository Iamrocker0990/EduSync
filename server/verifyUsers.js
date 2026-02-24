const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User');

dotenv.config();

// Script to un-hash OTP requirement so we can bypass for test users
const updateUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edusync');

        await User.updateMany({ email: { $in: ['teacher@test.com', 'student@test.com'] } }, { isVerified: true });
        console.log("Verified users updated");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
updateUsers();
