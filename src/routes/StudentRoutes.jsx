import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import MyCourses from '../pages/student/MyCourses';
import CourseDetail from '../pages/student/CourseDetail';
import Assignments from '../pages/student/Assignments';
import Quizzes from '../pages/student/Quizzes';
import Messages from '../pages/student/Messages';
import Settings from '../pages/student/Settings';
import StudentCourseList from '../pages/student/StudentCourseList';
import MyEnrollments from '../pages/student/MyEnrollments';
import TakeQuiz from '../pages/student/TakeQuiz';
import AssignmentSubmission from '../pages/student/AssignmentSubmission';

const StudentRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<StudentDashboard />} />
            <Route path="/courses" element={<MyCourses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/catalog" element={<StudentCourseList />} />
            <Route path="/learn" element={<MyEnrollments />} />
            <Route path="/quiz/:id" element={<TakeQuiz />} />
            <Route path="/assignment/:id" element={<AssignmentSubmission />} />
        </Routes>
    );
};

export default StudentRoutes;
