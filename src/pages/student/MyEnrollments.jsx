import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, PlayCircle, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import courseService from '../../services/courseService';

const MyEnrollments = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                const data = await courseService.getMyEnrollments();
                setEnrollments(data);
            } catch (err) {
                console.error("Failed to fetch enrollments:", err);
                setError("Failed to load your enrollments.");
            } finally {
                setLoading(false);
            }
        };
        fetchEnrollments();
    }, []);

    if (loading) return (
        <DashboardLayout userType="student" title="My Learning">
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout userType="student" title="My Learning">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-6">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.length > 0 ? (
                    enrollments.map((enrollment) => (
                        <Card key={enrollment._id} className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
                            <div className="h-40 overflow-hidden relative bg-slate-200">
                                {enrollment.course.thumbnail ? (
                                    <img
                                        src={enrollment.course.thumbnail}
                                        alt={enrollment.course.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400">
                                        <BookOpen className="h-12 w-12" />
                                    </div>
                                )}
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-bold text-slate-900 mb-2 truncate" title={enrollment.course.title}>
                                    {enrollment.course.title}
                                </h3>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                                    {enrollment.course.description}
                                </p>

                                {enrollment.course.duration && (
                                    <div className="flex items-center text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md mb-4 max-w-max">
                                        <Clock className="w-3 h-3 mr-1 text-slate-400" />
                                        {enrollment.course.duration}
                                    </div>
                                )}

                                <div className="mt-auto">
                                    <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${enrollment.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-500">{enrollment.progress}% Complete</span>
                                        <Link to={`/student/courses/${enrollment.course._id}`}>
                                            <Button size="sm" className="flex items-center">
                                                <PlayCircle className="h-4 w-4 mr-2" /> Continue
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                        <BookOpen className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">No Enrollments Yet</h3>
                        <p className="text-slate-500 mb-6">Explore our catalog and start learning today!</p>
                        <Button onClick={() => navigate('/student/catalog')}>Browse Courses</Button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default MyEnrollments;
