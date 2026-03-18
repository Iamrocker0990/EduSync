import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboardService'; // Import service
import { BookOpen, CheckCircle, Clock, Award, PlayCircle, ArrowRight, TrendingUp } from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';


const StudentDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Token check handled by api.js
                // User role check if needed

                const data = await dashboardService.getStudentDashboard();
                setDashboardData(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching dashboard:", err);
                // Auth error handled by interceptor
                setError("Failed to load dashboard data.");
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [navigate]);

    const totalCourses = dashboardData?.stats?.totalCourses || 0;
    const totalCompletedLessons = dashboardData?.stats?.totalCompletedLessons || 0;

    if (loading) {
        return (
            <DashboardLayout userType="student" title="Welcome back!">
                <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
                    <div
                        className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"
                    />
                    <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading your dashboard...</p>

                </div>
            </DashboardLayout>
        );
    }

    const userName = JSON.parse(localStorage.getItem('userInfo'))?.name?.split(' ')[0] || 'Student';

    return (
        <DashboardLayout userType="student" title={`Hello, ${userName}!`}>
            <div
                className="space-y-10"
            >
                {/* Hero Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Active Courses', value: totalCourses, icon: BookOpen, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
                        { label: 'Lessons Done', value: totalCompletedLessons, icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
                        { label: 'Study Hours', value: '12.5h', icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
                        { label: 'Achievements', value: '4', icon: Award, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
                    ].map((stat, index) => (

                        <Card key={index} className="p-6 border-none ring-1 ring-slate-100 shadow-sm hover:ring-primary/20 transition-all">
                            <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-2xl ${stat.bg}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{stat.label}</p>
                                </div>

                            </div>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Active Courses */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Continue Learning</h2>
                            <Link to="/student/courses" className="text-primary font-bold text-sm hover:underline flex items-center">
                                View all <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {dashboardData?.courses?.length > 0 ? (
                                dashboardData.courses.slice(0, 4).map((course) => (
                                    <div key={course._id}>
                                        <Card className="overflow-hidden group border-none ring-1 ring-slate-100 hover:ring-primary/20 transition-all shadow-sm hover:shadow-xl hover:shadow-primary/5">
                                            <div className="h-40 overflow-hidden relative">
                                                <img
                                                    src={course.thumbnail || 'https://via.placeholder.com/800x400'}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                <div className="absolute bottom-4 left-4 right-4">
                                                    <div className="w-full bg-white/20 rounded-full h-1.5 backdrop-blur-md overflow-hidden">
                                                        <div
                                                            style={{ width: `${course.progress}%` }}
                                                            className="bg-white h-full"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <h3 className="font-bold text-slate-900 dark:text-white mb-4 line-clamp-1 group-hover:text-primary transition-colors">{course.title}</h3>
                                                <div className="flex items-center justify-between mb-6">
                                                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{course.progress}% Complete</span>
                                                    <span className="text-xs font-bold text-primary bg-primary/5 dark:bg-primary/10 px-2 py-1 rounded">Resume</span>
                                                </div>

                                                <Link to={`/student/courses/${course._id}`}>
                                                    <Button size="sm" className="w-full group-hover:bg-primary group-hover:text-white border-none ring-1 ring-primary/10">
                                                        Continue Lesson
                                                    </Button>
                                                </Link>
                                            </div>
                                        </Card>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                    <p className="text-slate-500 font-medium mb-4">You haven't started any courses yet.</p>
                                    <Link to="/">
                                        <Button variant="outline">Browse Catalog</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Activity / Sidebar */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Learning Path</h2>
                            <Card className="p-6 space-y-6 border-none ring-1 ring-slate-100 dark:ring-slate-800">

                                <div className="space-y-4">
                                    {[
                                        { title: 'Complete HOC Module', status: 'In Progress', icon: PlayCircle, color: 'text-blue-500' },
                                        { title: 'Take Python Quiz', status: 'Pending', icon: Clock, color: 'text-amber-500' },
                                        { title: 'Watch Intro Video', status: 'Completed', icon: CheckCircle, color: 'text-emerald-500' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center space-x-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer group">
                                            <div className={`${item.color} group-hover:scale-110 transition-transform`}>
                                                <item.icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{item.status}</p>
                                            </div>
                                        </div>

                                    ))}
                                </div>
                                <Button variant="outline" className="w-full text-xs h-10">View Full Schedule</Button>
                            </Card>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Upcoming Live</h2>

                            <div className="space-y-4">
                                <div className="p-5 bg-gradient-to-br from-primary to-indigo-600 rounded-3xl text-white shadow-lg shadow-primary/20">
                                    <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Happening Soon</p>
                                    <h4 className="text-lg font-bold mb-4 leading-tight">Advanced React Architecture with Sarah</h4>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Starts in 45m</span>
                                        <Button size="sm" className=" text-primary hover:bg-slate-50 border-none px-4 py-1 h-8 text-xs font-bold">Set Reminder</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentDashboard;
