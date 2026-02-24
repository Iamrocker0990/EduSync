require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const Course = require('./models/Course');
        const updated = await Course.updateMany({ status: 'pending' }, { $set: { status: 'approved' } });
        console.log(`Approved ${updated.modifiedCount} courses.`);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
