import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Teacher Pages
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import TeacherCourses from '../pages/teacher/TeacherCourses';
import CreateCourse from '../pages/teacher/CreateCourse';
import UploadContent from '../pages/teacher/UploadContent';
import TeacherAssignments from '../pages/teacher/TeacherAssignments';
import TeacherQuizzes from '../pages/teacher/TeacherQuizzes';
import StudentsList from '../pages/teacher/StudentsList';
import Reports from '../pages/teacher/Reports';
import TeacherMessages from '../pages/teacher/TeacherMessages';
import CourseContent from '../pages/teacher/CourseContent';
import CreateAssignment from '../pages/teacher/CreateAssignment';
import CreateQuiz from '../pages/teacher/CreateQuiz';
import TeacherAssignmentSubmissions from '../pages/teacher/TeacherAssignmentSubmissions';

const TeacherRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<TeacherDashboard />} />
            <Route path="/courses" element={<TeacherCourses />} />
            <Route path="/create-course" element={<CreateCourse />} />
            <Route path="/edit-course/:id" element={<CreateCourse />} />
            <Route path="/upload" element={<UploadContent />} />
            <Route path="/assignments" element={<TeacherAssignments />} />
            <Route path="/quizzes" element={<TeacherQuizzes />} />
            <Route path="/students" element={<StudentsList />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/messages" element={<TeacherMessages />} />
            <Route path="/course/:courseId/content" element={<CourseContent />} />
            <Route path="/course/:courseId/assignments/create" element={<CreateAssignment />} />
            <Route path="/course/:courseId/assignments/:assignmentId/grade" element={<TeacherAssignmentSubmissions />} />
            <Route path="/course/:courseId/quiz/create" element={<CreateQuiz />} />
        </Routes>
    );
};

export default TeacherRoutes;
