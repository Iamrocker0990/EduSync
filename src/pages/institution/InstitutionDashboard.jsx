import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, Clock, BookOpen } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import api from '../../services/api';

const InstitutionDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalTeachers: 0,
        pendingTeachers: 0,
        approvedTeachers: 0,
        totalCourses: 0,
        pendingCourses: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Assuming we have an endpoint that either gives stats or we compute it from the teachers list
                const teachersRes = await api.get('/institution/teachers');
                const coursesRes = await api.get('/institution/courses');

                const pendingT = teachersRes.data.filter(t => t.approvalStatus === 'pending').length;
                const approvedT = teachersRes.data.filter(t => t.approvalStatus === 'approved').length;

                const pendingC = coursesRes.data.filter(c => c.status === 'pending').length;

                setStats({
                    totalTeachers: teachersRes.data.length,
                    pendingTeachers: pendingT,
                    approvedTeachers: approvedT,
                    totalCourses: coursesRes.data.length,
                    pendingCourses: pendingC,
                });
            } catch (error) {
                console.error("Failed to load institution stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <DashboardLayout userType="institution" title="Institution Overview">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    const statCards = [
        { title: 'Total Teachers', value: stats.totalTeachers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', link: '/institution/teachers' },
        { title: 'Pending Teachers', value: stats.pendingTeachers, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', link: '/institution/teachers' },
        { title: 'Pending Courses', value: stats.pendingCourses, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-100', link: '/institution/courses' },
    ];

    return (
        <DashboardLayout userType="institution" title="Institution Overview">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Welcome to your Institution Portal</h2>
                <p className="text-slate-500">Manage your teachers and monitor course activities.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <Card key={index} className="p-6 flex items-center space-x-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(stat.link)}>
                        <div className={`p-4 rounded-xl ${stat.bg}`}>
                            <stat.icon className={`h-8 w-8 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => navigate('/institution/teachers')} className="flex items-center p-4 border border-slate-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left">
                        <Clock className="h-6 w-6 text-primary mr-3" />
                        <div>
                            <h4 className="font-semibold text-slate-900">Review Teachers</h4>
                            <p className="text-sm text-slate-500">Approve or reject teacher applications</p>
                        </div>
                    </button>
                    <button onClick={() => navigate('/institution/courses')} className="flex items-center p-4 border border-slate-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left">
                        <BookOpen className="h-6 w-6 text-primary mr-3" />
                        <div>
                            <h4 className="font-semibold text-slate-900">Review Courses</h4>
                            <p className="text-sm text-slate-500">Approve or reject pending courses</p>
                        </div>
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InstitutionDashboard;
