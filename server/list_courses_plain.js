require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const Course = require('./models/Course');
        const courses = await Course.find({}, 'title status');
        console.log(`Total courses: ${courses.length}`);
        for (const c of courses) {
            console.log(`- ${c.title} (${c.status})`);
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
