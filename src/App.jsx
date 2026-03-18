import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import SignupPage from './pages/public/SignupPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';

// Routes Components
import StudentRoutes from './routes/StudentRoutes';
import TeacherRoutes from './routes/TeacherRoutes';

// Super Admin Pages
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';

// Institution Pages
import InstitutionDashboard from './pages/institution/InstitutionDashboard';
import PendingTeachers from './pages/institution/PendingTeachers';
import InstitutionPendingCourses from './pages/institution/InstitutionPendingCourses';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminCourseReview from './pages/admin/AdminCourseReview';

// Layout
import PrivateRoute from './components/Routing/PrivateRoute';

/* =======================
        App
======================= */
function App() {
  const location = useLocation();

  return (
    <Routes location={location}>

      {/* ---------- Public Routes ---------- */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* ---------- Student Routes ---------- */}
      <Route element={<PrivateRoute allowedRoles={['student']} />}>
        <Route path="/student/*" element={<StudentRoutes />} />
      </Route>

      {/* ---------- Teacher Routes ---------- */}
      <Route element={<PrivateRoute allowedRoles={['teacher']} />}>
        <Route path="/teacher/*" element={<TeacherRoutes />} />
      </Route>

      {/* ---------- Admin/Login Routes ---------- */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ---------- Super Admin Routes ---------- */}
      <Route element={<PrivateRoute allowedRoles={['superadmin', 'admin']} />}>
        <Route path="/superadmin" element={<SuperAdminDashboard />} />
        {/* Course reviews if they still exist for superadmin */}
        <Route path="/admin/course/:id/review" element={<AdminCourseReview />} />
      </Route>

      {/* ---------- Institution Routes ---------- */}
      <Route element={<PrivateRoute allowedRoles={['institution']} />}>
        <Route path="/institution" element={<InstitutionDashboard />} />
        <Route path="/institution/teachers" element={<PendingTeachers />} />
        <Route path="/institution/courses" element={<InstitutionPendingCourses />} />
      </Route>

      {/* ---------- Fallback ---------- */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;
