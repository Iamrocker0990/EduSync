import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Upload, CheckCircle, FileText } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';

const TeacherAssignments = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');
    const [assignments, setAssignments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

    const [formData, setFormData] = useState({
        title: '',
        courseId: '',
        description: '',
        dueDate: '',
        dueTime: '',
        maxMarks: 100,
        submissionType: 'file'
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [assignmentsRes, coursesRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/assignments`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${import.meta.env.VITE_API_URL}/courses/mine`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setAssignments(assignmentsRes.data);
            setCourses(coursesRes.data);
        } catch (error) {
            console.error("Error fetching assignments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime || '23:59'}`);

            const payloadData = new FormData();
            payloadData.append('courseId', formData.courseId);
            payloadData.append('title', formData.title);
            payloadData.append('description', formData.description);
            payloadData.append('dueDate', dueDateTime.toISOString());
            payloadData.append('maxMarks', formData.maxMarks);
            payloadData.append('submissionType', formData.submissionType);

            if (selectedFile) {
                payloadData.append('file', selectedFile);
            }

            await axios.post(`${import.meta.env.VITE_API_URL}/assignments`, payloadData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert("Assignment created successfully");
            setFormData({ title: '', courseId: '', description: '', dueDate: '', dueTime: '', maxMarks: 100, submissionType: 'file' });
            setSelectedFile(null);
            fetchData();
            setActiveTab('all');
        } catch (error) {
            console.error("Error creating assignment:", error);
            alert("Failed to create assignment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const filteredAssignments = assignments.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCourse = selectedCourseFilter === 'all' || a.courseId === selectedCourseFilter;
        const isPast = new Date(a.dueDate) < new Date();
        const status = isPast ? 'Closed' : 'Active';
        const matchesStatus = selectedStatusFilter === 'all' || status.toLowerCase() === selectedStatusFilter.toLowerCase();
        return matchesSearch && matchesCourse && matchesStatus;
    });

    return (
        <DashboardLayout userType="teacher" title="Assignments">
            <div className="mb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex space-x-8">
                    <button onClick={() => setActiveTab('all')} className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'all' ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                        All Assignments
                        {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>}
                    </button>
                    <button onClick={() => setActiveTab('create')} className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'create' ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                        Create Assignment
                        {activeTab === 'create' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>}
                    </button>
                </div>

            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : activeTab === 'all' ? (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search assignments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                        <div className="flex space-x-2">
                            <select value={selectedCourseFilter} onChange={(e) => setSelectedCourseFilter(e.target.value)} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                <option value="all">All Courses</option>
                                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                            </select>
                            <select value={selectedStatusFilter} onChange={(e) => setSelectedStatusFilter(e.target.value)} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                    </div>

                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Assignment Title</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Course</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Due Date</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Status</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                                    {filteredAssignments.length > 0 ? (
                                        filteredAssignments.map((assignment) => {
                                            const isPast = new Date(assignment.dueDate) < new Date();
                                            const statusLabel = isPast ? 'Closed' : 'Active';
                                            return (
                                                <tr key={assignment._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{assignment.title}</td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{assignment.courseName}</td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{new Date(assignment.dueDate).toLocaleString()}</td>
                                                    <td className="px-6 py-4">

                                                        <Badge variant={statusLabel === 'Active' ? 'primary' : 'neutral'}>
                                                            {statusLabel}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button size="sm" variant="outline" onClick={() => navigate(`/teacher/course/${assignment.courseId}/assignments/${assignment._id}/grade`)}>
                                                            View Submissions
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                                No assignments found.

                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto">
                    <Card className="p-8">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                            <FileText className="mr-2 text-primary h-6 w-6" /> Create New Assignment
                        </h2>

                        <form onSubmit={handleCreateAssignment} className="space-y-6">
                            <Input label="Assignment Title" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Final Project Proposal" required />

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Course</label>
                                <select name="courseId" value={formData.courseId} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white dark:bg-slate-800 text-slate-700 dark:text-white" required>
                                    <option value="">Select Course</option>

                                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none h-32 resize-none"
                                    placeholder="Instructions for students..."
                                    required

                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Due Date" type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} required />
                                <Input label="Due Time" type="time" name="dueTime" value={formData.dueTime} onChange={handleInputChange} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Input label="Total Points" type="number" name="maxMarks" value={formData.maxMarks} onChange={handleInputChange} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Submission Type</label>
                                    <select name="submissionType" value={formData.submissionType} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white dark:bg-slate-800 text-slate-700 dark:text-white" required>
                                        <option value="file">File Upload</option>

                                        <option value="text">Text Only</option>
                                        <option value="both">File & Text</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Attachments (Optional)</label>
                                <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer group ${selectedFile ? 'border-green-300 bg-green-50' : 'border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                    <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    {selectedFile ? (
                                        <div className="flex flex-col items-center">
                                            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                                            <p className="text-sm font-semibold text-green-800">{selectedFile.name}</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2 group-hover:text-primary transition-colors" />
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Click or drag a file to upload</p>
                                        </div>
                                    )}

                                </div>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-slate-100">
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Creating Assignment...' : 'Create Assignment'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </DashboardLayout>
    );
};

export default TeacherAssignments;
