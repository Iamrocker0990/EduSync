const mongoose = require('mongoose');
require('dotenv').config();

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edusync';

const resetDatabase = async () => {
    try {
        console.log(`Connecting to MongoDB at: ${URI}...`);
        await mongoose.connect(URI);
        console.log('Connected.');

        console.log('Dropping the entire edusync database to start fresh...');
        await mongoose.connection.db.dropDatabase();
        console.log('✅ Database dropped successfully! All courses, users, and enrollments have been deleted.');

        console.log('Starting fresh! You can now run "node scripts/create-admin.js" to create your new SuperAdmin account.');
    } catch (error) {
        console.error('Error connecting to or wiping database:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

resetDatabase();
