import api from './api';

const dashboardService = {
    // Student Dashboard
    getStudentDashboard: async () => {
        const response = await api.get('/student/dashboard');
        return response.data;
    },

    // Teacher Dashboard (if using backend endpoint)
    getTeacherDashboard: async () => {
        const response = await api.get('/teachers/dashboard');
        return response.data;
    },

    // Get all students for a teacher
    getTeacherStudents: async () => {
        const response = await api.get('/teachers/students');
        return response.data;
    }
};

export default dashboardService;
