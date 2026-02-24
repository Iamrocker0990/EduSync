require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const Course = require('./models/Course');
        const courses = await Course.find({}, 'title status instructor createdBy price category');
        console.log(JSON.stringify(courses, null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
