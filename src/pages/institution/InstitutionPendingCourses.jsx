import React, { useState, useEffect } from 'react';
import { BookOpen, Check, X, Shield, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { institutionSidebarItems } from '../../config/sidebarConfig';

const InstitutionPendingCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/institution/courses');
            setCourses(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Failed to load courses");
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`/institution/course/${id}/${status}`);
            setCourses(prev => prev.map(c =>
                c._id === id ? { ...c, status } : c
            ));
        } catch (err) {
            console.error(err);
            alert(`Failed to ${status} course`);
        }
    };

    if (loading) return (
        <DashboardLayout userType="institution" title="Manage Courses" sidebarItems={institutionSidebarItems}>
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        </DashboardLayout>
    );

    const pendingCourses = courses.filter(c => c.status === 'pending');
    const approvedCourses = courses.filter(c => c.status === 'approved');

    return (
        <DashboardLayout userType="institution" title="Manage Courses" sidebarItems={institutionSidebarItems}>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Course Management</h2>
                <p className="text-slate-500">Approve or reject courses created by teachers in your institution.</p>
            </div>

            {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}

            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-medium text-slate-900">Pending Course Approvals</h3>
                </div>
                {pendingCourses.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">No pending courses.</div>
                ) : (
                    <ul className="divide-y divide-slate-200">
                        {pendingCourses.map(course => (
                            <li key={course._id} className="p-6 hover:bg-slate-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 min-w-[40px] rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                                            <BookOpen className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-900">{course.title}</h4>
                                            <p className="text-sm text-slate-500">
                                                Created by: {course.instructor ? course.instructor.name : 'Unknown Teacher'} • {course.category || 'Uncategorized'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusUpdate(course._id, 'approved')}>
                                            <Check className="h-4 w-4 mr-1" /> Approve
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleStatusUpdate(course._id, 'rejected')}>
                                            <X className="h-4 w-4 mr-1" /> Reject
                                        </Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="bg-white rounded-lg shadow mt-8">
                <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-medium text-slate-900">Approved Courses</h3>
                </div>
                {approvedCourses.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">No approved courses yet.</div>
                ) : (
                    <ul className="divide-y divide-slate-200">
                        {approvedCourses.map(course => (
                            <li key={course._id} className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 min-w-[40px] rounded-lg bg-green-100 flex items-center justify-center text-green-600 mr-4">
                                            <BookOpen className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-900">{course.title}</h4>
                                            <p className="text-sm text-slate-500">
                                                Created by: {course.instructor ? course.instructor.name : 'Unknown Teacher'}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Approved
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </DashboardLayout>
    );
};

export default InstitutionPendingCourses;
