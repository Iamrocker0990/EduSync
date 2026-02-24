require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const result = await mongoose.connection.collection('courses').updateMany(
            { status: { $ne: 'approved' } },
            { $set: { status: 'approved' } }
        );
        console.log(`Raw Approved ${result.modifiedCount} courses using $ne: approved.`);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
