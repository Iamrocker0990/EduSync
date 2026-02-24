require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const Course = require('./models/Course');
        const courses = await Course.find({}, 'title status');
        fs.writeFileSync('courses_dump.json', JSON.stringify(courses, null, 2));
        console.log(`Saved ${courses.length} courses to courses_dump.json`);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
