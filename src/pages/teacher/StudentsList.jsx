import React, { useState, useEffect } from 'react';
import { User, BookOpen, Calendar, Mail, CheckCircle, BarChart2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import dashboardService from '../../services/dashboardService';

const StudentsList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const data = await dashboardService.getTeacherStudents();
            setStudents(data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch students:", err);
            setError("Failed to load student progress. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getProgressColor = (progress) => {
        if (progress === 100) return 'bg-green-500';
        if (progress >= 50) return 'bg-blue-500';
        if (progress > 0) return 'bg-yellow-500';
        return 'bg-slate-300';
    };

    return (
        <DashboardLayout userType="teacher" title="Students' Progress">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Enrolled Students Overview</h1>
                <p className="text-slate-500 dark:text-slate-400">Track and monitor your students' learning progress across all your courses.</p>
            </div>


            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : error ? (
                <Card className="p-8 text-center border border-red-100 bg-red-50">
                    <p className="text-red-600 font-medium">{error}</p>
                    <button onClick={fetchStudents} className="mt-4 text-primary hover:text-primary-hover font-medium underline">
                        Try Again
                    </button>
                </Card>
            ) : students.length === 0 ? (
                <Card className="p-16 text-center border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-900/50">
                    <div className="mx-auto w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-4">
                        <User className="h-8 w-8 text-slate-400 dark:text-slate-500 dark:text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Students Enrolled Yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">Once students enroll in your published courses, their detailed learning progress will be displayed here.</p>
                </Card>

            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                    <th className="p-4 px-6 md:px-8">Student</th>
                                    <th className="p-4 px-6">Enrolled Course</th>
                                    <th className="p-4 px-6">Join Date</th>
                                    <th className="p-4 px-6 md:px-8 min-w-[200px]">Progress</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {students.map((student) => (
                                    <tr key={student._id} className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800/50 transition-colors">

                                        <td className="p-4 px-6 md:px-8">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                                                    {student.studentName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{student.studentName}</p>
                                                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                        <Mail className="h-3 w-3 mr-1" />
                                                        {student.studentEmail}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0">
                                                    <BookOpen className="h-4 w-4" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug line-clamp-2">
                                                    {student.courseTitle}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="p-4 px-6">
                                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                <Calendar className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-500 dark:text-gray-400" />

                                                {new Date(student.enrolledAt).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="p-4 px-6 md:px-8">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between text-xs font-semibold">
                                                    <span className={student.progress === 100 ? "text-green-600 dark:text-green-400" : "text-slate-700 dark:text-slate-300"}>
                                                        {student.progress}% Complete
                                                    </span>
                                                    {student.progress === 100 && <CheckCircle className="h-4 w-4 text-green-500" />}
                                                </div>
                                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(student.progress)}`}
                                                        style={{ width: `${student.progress}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium tracking-wider">
                                                    {student.completedLessonsCount} Lessons Finished
                                                </p>
                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default StudentsList;
