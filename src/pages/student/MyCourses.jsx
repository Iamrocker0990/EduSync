import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Video, FileText, BarChart2, Award, MessageCircle, Search, Filter, Clock, User } from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';

const MyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const userInfoString = localStorage.getItem('userInfo');
                if (!userInfoString) {
                    navigate('/login');
                    return;
                }
                const { token } = JSON.parse(userInfoString);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/student/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // The dashboard endpoint returns object { stats, courses }, we just need courses
                setCourses(response.data.courses || []);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching courses:", err);
                if (err.response?.status === 401) {
                    localStorage.removeItem('userInfo');
                    navigate('/login');
                }
                setError("Failed to load courses.");
                setLoading(false);
            }
        };

        fetchCourses();
    }, [navigate]);

    const filteredCourses = filter === 'All' ? courses : courses.filter(c => c.status === filter);

    if (loading) {
        return (
            <DashboardLayout userType="student" title="My Courses">
                <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
                    <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium animate-pulse">Loading your courses...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout userType="student" title="My Courses">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-slate-200">
                    {['All', 'In Progress', 'Completed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === f
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                        <Card key={course._id} className="overflow-hidden flex flex-col h-full">
                            <div className="h-40 overflow-hidden relative">
                                <img
                                    src={course.thumbnail || 'https://via.placeholder.com/800x400'}
                                    alt={course.title}
                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                                />
                                <div className="absolute top-3 right-3">
                                    <Badge variant={course.status === 'Completed' ? 'success' : 'primary'}>
                                        {course.status}
                                    </Badge>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-bold text-slate-900 mb-2 text-lg line-clamp-1">{course.title}</h3>
                                <div className="flex items-center text-sm text-slate-500 mb-4">
                                    <User className="h-4 w-4 mr-2" />
                                    <span>{course.instructor || 'Unknown Instructor'}</span>
                                </div>

                                <div className="mb-4">
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                        <span>{course.progress}% Completed</span>
                                        <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${course.status === 'Completed' ? 'bg-green-500' : 'bg-primary'}`}
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Removed Last Accessed as backend doesn't provide it yet */}

                                <div className="mt-auto pt-4 flex gap-2">
                                    {course.status === 'Completed' ? (
                                        <Button size="sm" variant="outline" className="flex-1">Review</Button>
                                    ) : (
                                        <Link to={`/student/courses/${course._id}`} className="flex-1">
                                            <Button size="sm" variant="primary" className="w-full">Continue</Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                        <p className="text-slate-500 font-medium">No courses found matching your filter.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default MyCourses;
