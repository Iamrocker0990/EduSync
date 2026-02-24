import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    BookOpen, FileText, CheckCircle, Users, Settings,
    Plus, Calendar, Clock, ChevronRight, Download, Edit
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import QuizModule from '../../components/quiz/QuizModule';

const CourseContent = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [activeTab, setActiveTab] = useState('assignments');
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Fetch course details
                const courseRes = await axios.get(`${import.meta.env.VITE_API_URL}/courses/${courseId}`, config);
                setCourse(courseRes.data);

                // Fetch assignments
                const assignRes = await axios.get(`${import.meta.env.VITE_API_URL}/assignments/course/${courseId}`, config);
                setAssignments(assignRes.data);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching course data:", error);
                setLoading(false);
            }
        };

        if (courseId) {
            fetchCourseData();
        }
    }, [courseId, activeTab]); // Refresh when tab changes if needed, mainly for specific tab data

    if (loading) return <div>Loading...</div>;
    if (!course) return <div>Course not found</div>;

    return (
        <DashboardLayout userType="teacher" title={course.title}>
            {/* Header / Tabs */}
            <div className="mb-6 border-b border-slate-200">
                <div className="flex space-x-8 overflow-x-auto">
                    {[
                        { id: 'details', label: 'Course Details' },
                        { id: 'assignments', label: 'Assignments' },
                        { id: 'quizzes', label: 'Quizzes' },
                        { id: 'students', label: 'Students & Grades' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab.id ? 'text-primary' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">

                {/* Assignments Tab */}
                {activeTab === 'assignments' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">Assignments</h2>
                            <Button onClick={() => navigate(`/teacher/course/${courseId}/assignments/create`)}>
                                <Plus className="h-4 w-4 mr-2" /> Create Assignment
                            </Button>
                        </div>

                        {assignments.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-slate-900">No assignments yet</h3>
                                <p className="text-slate-500 mb-4">Create your first assignment to get started</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {assignments.map((assignment) => (
                                    <div key={assignment._id} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-400 transition-colors shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 mb-2">{assignment.title}</h3>
                                                <p className="text-slate-600 mb-4 line-clamp-2">{assignment.description}</p>
                                                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                                    <span className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1.5" />
                                                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <CheckCircle className="h-4 w-4 mr-1.5" />
                                                        {assignment.maxMarks} Points
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button size="sm" variant="outline" onClick={() => navigate(`/teacher/submissions/assignment/${assignment._id}`)}>
                                                    View Submissions
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Quizzes Tab */}
                {activeTab === 'quizzes' && (
                    <div className="space-y-6">
                        <QuizModule userType="teacher" courseId={courseId} />
                    </div>
                )}

                {/* Course Details Tab */}
                {activeTab === 'details' && (
                    <Card className="p-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Course Info</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Title</p>
                                <p className="text-lg text-slate-900">{course.title}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Category</p>
                                <Badge>{course.category}</Badge>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm font-medium text-slate-500 mb-1">Description</p>
                                <p className="text-slate-700 whitespace-pre-wrap">{course.description}</p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Students Tab Placeholder */}
                {activeTab === 'students' && (
                    <div className="text-center py-12">
                        <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-slate-900">Student Management</h3>
                        <p className="text-slate-500">Feature coming in next update.</p>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default CourseContent;
