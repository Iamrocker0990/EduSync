import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Clock, BookOpen, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [pendingCourses, setPendingCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch Pending Courses
    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const data = await adminService.getPendingCourses();
            setPendingCourses(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Failed to load pending courses");
            setLoading(false);
        }
    };

    // Handle Approve/Reject
    const handleStatusUpdate = async (id, status) => {
        try {
            await adminService.updateCourseStatus(id, status);
            // Optimistic update or refetch
            setPendingCourses(prev => prev.filter(c => c._id !== id));
            alert(`Course ${status} successfully!`);
        } catch (err) {
            console.error(err);
            alert(`Failed to ${status} course`);
        }
    };

    if (loading) return (
        <DashboardLayout userType="admin" title="Admin Dashboard">
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout userType="admin" title="Admin Dashboard">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Course Review Queue</h2>
                <p className="text-slate-500 dark:text-gray-400">Review and approve courses submitted by instructors.</p>
            </div>

            {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}

            {pendingCourses.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Caught Up!</h3>
                    <p className="text-slate-500 dark:text-gray-400 mt-2">There are no pending courses to review at the moment.</p>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {pendingCourses.map(course => (
                        <Card key={course._id} className="p-6">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                {/* Course Info */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div className="flex space-x-4">
                                            <div className="h-24 w-40 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                                                {course.thumbnail ? (
                                                    <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                                                        <BookOpen className="h-8 w-8" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-700 flex items-center">
                                                        <Clock className="h-3 w-3 mr-1" /> Pending Review
                                                    </span>
                                                    <span className="text-sm text-slate-500 dark:text-gray-400">
                                                        Submitted {new Date(course.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{course.title}</h3>
                                                <p className="text-sm text-slate-600 dark:text-gray-300 mb-2 line-clamp-2">{course.description}</p>
                                                <p className="text-sm text-slate-500 dark:text-gray-400">
                                                    Instructor: <span className="font-semibold text-slate-900 dark:text-white">{course.instructor?.name || 'Unknown'}</span> ({course.instructor?.email})
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                                                    Price: <span className="font-semibold text-slate-900 dark:text-white">{course.price ? `₹${course.price}` : 'Free'}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex md:flex-col justify-end space-x-3 md:space-x-0 md:space-y-3 min-w-[140px]">
                                    <Button
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => handleStatusUpdate(course._id, 'approved')}
                                    >
                                        <Check className="h-4 w-4 mr-2" /> Approve
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-600"
                                        onClick={() => handleStatusUpdate(course._id, 'rejected')}
                                    >
                                        <X className="h-4 w-4 mr-2" /> Reject
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => navigate(`/admin/course/${course._id}/review`)}
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminDashboard;
