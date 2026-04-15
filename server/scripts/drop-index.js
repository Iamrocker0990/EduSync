require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edusync', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    try {
        await mongoose.connection.collection('conversations').dropIndex('student_1_teacher_1_course_1');
        console.log('Index dropped successfully');
    } catch (error) {
        console.log('Index might not exist or another error:', error.message);
    }
    process.exit(0);
});
