const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

async function runTests() {
    try {
        console.log('--- Starting API Verification ---');

        // 1. Teacher Login
        const teacherRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'teacher@test.com',
            password: 'password123',
            role: 'teacher'
        });
        const teacherToken = teacherRes.data.token;
        console.log('✅ Teacher login successful');

        // 2. Student Login
        const studentRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'student@test.com',
            password: 'password123',
            role: 'student'
        });
        const studentToken = studentRes.data.token;
        console.log('✅ Student login successful');

        // Get course ID for testing
        const coursesRes = await axios.get(`${API_URL}/courses`, {
            headers: { Authorization: `Bearer ${teacherToken}` }
        });
        // Find the test course created earlier
        const testCourse = coursesRes.data.find(c => c.title === 'Test Assignments Course');
        if (!testCourse) {
            throw new Error('Test course not found. Run createTestCourse.js first.');
        }

        // 3. Create an Assignment (Teacher)
        const mockFilePath = path.join(__dirname, 'mock_assignment.txt');
        fs.writeFileSync(mockFilePath, 'This is a mock assignment file.');

        const formData = new FormData();
        formData.append('title', 'API Test Assignment');
        formData.append('description', 'Testing assignment creation via API');
        formData.append('courseId', testCourse._id);
        formData.append('dueDate', new Date(Date.now() + 86400000).toISOString()); // Tomorrow
        formData.append('totalPoints', '100');
        formData.append('document', fs.createReadStream(mockFilePath));

        const createRes = await axios.post(`${API_URL}/assignments`, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${teacherToken}`
            }
        });
        const assignmentId = createRes.data._id;
        console.log('✅ Assignment created successfully! ID:', assignmentId);

        // 4. Student views assignments
        const viewRes = await axios.get(`${API_URL}/assignments/student`, {
            headers: { Authorization: `Bearer ${studentToken}` }
        });
        const foundAssignment = viewRes.data.find(a => a._id === assignmentId);
        if (!foundAssignment) {
            throw new Error("Student cannot see the assignment!");
        }
        console.log('✅ Student successfully fetched the assignment.');

        // 5. Student submits the assignment
        const mockSubmissionPath = path.join(__dirname, 'mock_submission.txt');
        fs.writeFileSync(mockSubmissionPath, 'This is my homework.');

        const submissionData = new FormData();
        submissionData.append('submissionText', 'Here is the assignment you asked for.');
        submissionData.append('document', fs.createReadStream(mockSubmissionPath));

        const submitRes = await axios.post(`${API_URL}/assignments/${assignmentId}/submit`, submissionData, {
            headers: {
                ...submissionData.getHeaders(),
                Authorization: `Bearer ${studentToken}`
            }
        });
        console.log('✅ Student submitted the assignment successfully!');

        // 6. Teacher views submissions
        const subsRes = await axios.get(`${API_URL}/assignments/${assignmentId}/submissions`, {
            headers: { Authorization: `Bearer ${teacherToken}` }
        });
        if (subsRes.data.length === 0) {
            throw new Error("Teacher could not find the submission!");
        }
        const submissionId = subsRes.data[0]._id;
        console.log('✅ Teacher fetched the student submission. ID:', submissionId);

        // 7. Teacher grades submission
        const gradeRes = await axios.put(`${API_URL}/assignments/submissions/${submissionId}/grade`, {
            score: 95,
            feedback: 'Great job!'
        }, {
            headers: { Authorization: `Bearer ${teacherToken}` }
        });
        console.log('✅ Teacher graded the submission successfully! Score:', gradeRes.data.score);

        // Clean up
        fs.unlinkSync(mockFilePath);
        fs.unlinkSync(mockSubmissionPath);

        console.log('🎉 All API verification steps passed!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Verification failed:', err.response?.data || err.message);
        process.exit(1);
    }
}

runTests();
