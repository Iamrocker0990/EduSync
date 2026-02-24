require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const Course = require('./models/Course');
        const courses = await Course.find({ status: 'pending' });
        let count = 0;
        for (let c of courses) {
            c.status = 'approved';
            await c.save();
            count++;
        }
        console.log(`Approved ${count} courses.`);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
