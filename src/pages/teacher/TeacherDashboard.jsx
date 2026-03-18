import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import courseService from '../../services/courseService'; // Import service
import { BookOpen, Users, FileText, Award, BarChart2, MessageCircle, Plus, Upload, Calendar } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // sidebarItems removed to use default from DashboardLayout

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. AUTH & ROLE CHECK (Fixes Persistence & Redirects)
                const userInfoString = localStorage.getItem('userInfo');

                if (!userInfoString) {
                    navigate('/login');
                    return;
                }

                const { token, role } = JSON.parse(userInfoString);

                // Security: Kick out students trying to access teacher dashboard
                if (role !== 'teacher' && role !== 'admin') {
                    navigate('/student');
                    return;
                }

                // 2. FETCH REAL DATA USING SERVICE
                // 2. FETCH REAL DATA USING SERVICE
                const dashboard = await courseService.getDashboardData();

                setDashboardData({
                    stats: dashboard.stats,
                    recentActivity: dashboard.recentActivity,
                    chartData: dashboard.chartData || []
                });

                setLoading(false);

            } catch (err) {
                console.error("Dashboard Error:", err);
                if (err.response?.status === 401) {
                    // Handled by interceptor usually, but good to have safeguard
                    localStorage.removeItem('userInfo');
                    navigate('/login');
                }
                setError("Failed to load dashboard data");
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    if (loading) return (
        <DashboardLayout userType="teacher" title="Instructor Dashboard">
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        </DashboardLayout>
    );

    if (error) return <div className="p-10 text-red-500 text-center">{error}</div>;

    return (
        <DashboardLayout userType="teacher" title="Instructor Dashboard">
            {/* 1. DYNAMIC STATS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Courses', value: dashboardData.stats.totalCourses, icon: BookOpen, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
                    { label: 'Total Students', value: dashboardData.stats.totalStudents, icon: Users, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
                    { label: 'Assignments', value: dashboardData.stats.totalAssignments, icon: FileText, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
                    { label: 'Pending Quizzes', value: dashboardData.stats.pendingQuizzes, icon: Award, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
                ].map((stat, index) => (

                    <Card key={index} className="p-6 flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${stat.bg}`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                        </div>
                    </Card>

                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* 2. RECENT ACTIVITY (Real Enrollments) */}
                <Card className="lg:col-span-2 p-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Recent Enrollments</h2>
                    <div className="space-y-6">
                        {dashboardData.recentActivity.length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-400 text-sm">No students have enrolled yet.</p>

                        ) : (
                            dashboardData.recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-start space-x-4 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
                                        {activity.user.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-900 dark:text-slate-300">
                                            <span className="font-bold text-slate-900 dark:text-white">{activity.user}</span> {activity.action} <span className="font-medium text-blue-600 dark:text-blue-400">{activity.target}</span>
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))

                        )}
                    </div>
                </Card>

                {/* 3. QUICK ACTIONS */}
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Quick Actions</h2>
                    </div>
                    <div className="space-y-4">

                        <Button className="w-full" onClick={() => navigate('/teacher/create-course')}>
                            <Plus className="h-4 w-4 mr-2" /> Create New Course
                        </Button>
                        <Button className="w-full" variant="outline" onClick={() => navigate('/teacher/courses')}>
                            <Upload className="h-4 w-4 mr-2" /> Manage Content
                        </Button>
                    </div>
                </Card>
            </div>

            {/* 4. ACTIVE STUDENTS CHART (Dynamic) - Removed Popular Courses per request */}
        </DashboardLayout>
    );
};

export default TeacherDashboard;