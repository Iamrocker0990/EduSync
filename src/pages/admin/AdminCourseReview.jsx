import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, X, ArrowLeft, BookOpen, Clock, User, DollarSign } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import api from '../../services/api'; // Direct API for admin specific calls or use adminService

const AdminCourseReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                // reusing public getCourseById or admin specific if needed.
                // adminService usually has specific methods.
                // Assuming public GET works for ID if we are admin (logic in controller supports this)
                const response = await api.get(`/courses/${id}`);
                setCourse(response.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load course details.");
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

    const handleAction = async (status) => {
        try {
            // Using specific routes as requested
            if (status === 'approved') {
                await api.put(`/admin/courses/${id}/approve`);
            } else {
                await api.put(`/admin/courses/${id}/reject`);
            }
            alert(`Course ${status} successfully!`);
            navigate('/admin');
        } catch (err) {
            console.error(err);
            alert(`Failed to ${status} course.`);
        }
    };

    if (loading) return (
        <DashboardLayout userType="admin" title="Review Course">
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        </DashboardLayout>
    );

    if (error || !course) return (
        <DashboardLayout userType="admin" title="Review Course">
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                {error || "Course not found"}
            </div>
            <Button variant="ghost" onClick={() => navigate('/admin')} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
        </DashboardLayout>
    );

    return (
        <DashboardLayout userType="admin" title="Review Course">
            <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-6 pl-0 hover:bg-transparent hover:text-blue-600">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Pending Courses
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="overflow-hidden">
                        <div className="h-64 bg-slate-200 relative">
                            {course.thumbnail ? (
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400">
                                    <BookOpen className="h-16 w-16" />
                                </div>
                            )}
                            <div className="absolute top-4 left-4">
                                <Badge variant={course.status === 'approved' ? 'success' : course.status === 'rejected' ? 'danger' : 'warning'}>
                                    {course.status.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                        <div className="p-8">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{course.title}</h1>

                            <div className="flex flex-wrap gap-4 mb-6 text-sm text-slate-600 dark:text-gray-300">
                                <div className="flex items-center">
                                    <User className="h-4 w-4 mr-2" />
                                    {course.instructor?.name || 'Unknown Instructor'}
                                </div>
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Created: {new Date(course.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    {course.category}
                                </div>
                            </div>

                            <div className="prose max-w-none text-slate-600 dark:text-gray-300">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Description</h3>
                                <p className="whitespace-pre-wrap">{course.description}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Teacher & Structure Info */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Teacher Qualifications</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-gray-400">Experience</p>
                                <p className="font-medium">{course.experienceYears} Years</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-gray-400">Specialization</p>
                                <p className="font-medium">{course.specialization}</p>
                            </div>
                            {course.portfolioLink && (
                                <div className="md:col-span-2">
                                    <p className="text-sm text-slate-500 dark:text-gray-400">Portfolio</p>
                                    <a href={course.portfolioLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{course.portfolioLink}</a>
                                </div>
                            )}
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">What Students Will Learn</h3>
                        <ul className="space-y-2">
                            {course.learningOutcomes?.map((outcome, i) => (
                                <li key={i} className="flex items-start">
                                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                                    <span className="text-slate-700 dark:text-gray-200">{outcome}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    {/* Modules/Lessons Preview (Optional but helpful) */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Course Content</h3>
                        {course.modules && course.modules.length > 0 ? (
                            <div className="space-y-4">
                                {course.modules.map((module, i) => (
                                    <div key={i} className="border rounded-lg p-4">
                                        <h4 className="font-semibold">{module.title}</h4>
                                        <ul className="mt-2 space-y-1 ml-4 list-disc text-sm text-slate-600 dark:text-gray-300">
                                            {module.lessons.map((lesson, j) => (
                                                <li key={j}>{lesson.title} ({lesson.type})</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 dark:text-gray-400 italic">No content added yet.</p>
                        )}
                    </Card>
                </div>

                {/* Sidebar / Actions */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Action Required</h3>
                        <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">Review the course details and content compliance before making a decision.</p>

                        <div className="space-y-3">
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleAction('approved')}
                            >
                                <Check className="h-4 w-4 mr-2" /> Approve Course
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleAction('rejected')}
                            >
                                <X className="h-4 w-4 mr-2" /> Reject Course
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider text-xs">Metadata</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-gray-400">Price</span>
                                <span className="font-medium font-mono">${course.price}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-gray-400">Level</span>
                                <span className="font-medium">{course.level}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-gray-400">Duration</span>
                                <span className="font-medium">{course.duration}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminCourseReview;
