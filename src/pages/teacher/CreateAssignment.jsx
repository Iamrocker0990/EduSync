import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    BookOpen, FileText, CheckCircle, Users, Settings,
    Plus, Calendar, Clock, ChevronLeft, Upload, Save
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const CreateAssignment = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        dueTime: '',
        maxMarks: 100,
        submissionType: 'file',
        fileUrl: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Combine date and time
            const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime || '23:59'}`);

            const payloadData = new FormData();
            payloadData.append('courseId', courseId);
            payloadData.append('title', formData.title);
            payloadData.append('description', formData.description);
            payloadData.append('dueDate', dueDateTime.toISOString());
            payloadData.append('maxMarks', formData.maxMarks);
            payloadData.append('submissionType', formData.submissionType);

            if (selectedFile) {
                payloadData.append('file', selectedFile);
            } else if (formData.fileUrl) {
                payloadData.append('fileUrl', formData.fileUrl);
            }

            await axios.post(`${import.meta.env.VITE_API_URL}/assignments`, payloadData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            navigate(`/teacher/course/${courseId}/content`);
        } catch (error) {
            console.error("Error creating assignment:", error);
            alert("Failed to create assignment");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            setFormData(prev => ({ ...prev, fileUrl: '' })); // reset any string URL if a file is selected
        }
    };

    return (
        <DashboardLayout userType="teacher" title="Create Assignment">
            <div className="max-w-3xl mx-auto">
                <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent text-slate-500 hover:text-blue-600 transition-colors" onClick={() => navigate(-1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back to Course
                </Button>

                <Card className="p-8 border-t-4 border-t-primary shadow-lg">
                    <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Create New Assignment</h2>
                            <p className="text-slate-500 text-sm mt-1">Fill in the details below to assign work to your students.</p>
                        </div>
                        <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-primary">
                            <FileText className="h-6 w-6" />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="label">Assignment Title *</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Final Project Proposal"
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="label">Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="input-field h-40 resize-none leading-relaxed"
                                placeholder="Provide detailed instructions, requirements, and grading criteria..."
                                required
                            ></textarea>
                            <p className="text-xs text-slate-400 text-right mt-1">{formData.description.length} characters</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="label">Due Date *</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={formData.dueDate}
                                        onChange={handleChange}
                                        className="input-field pl-10"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label">Due Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type="time"
                                        name="dueTime"
                                        value={formData.dueTime}
                                        onChange={handleChange}
                                        className="input-field pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="label">Total Marks *</label>
                                <input
                                    type="number"
                                    name="maxMarks"
                                    value={formData.maxMarks}
                                    onChange={handleChange}
                                    className="input-field"
                                    min="0"
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Submission Type</label>
                                <select
                                    name="submissionType"
                                    value={formData.submissionType}
                                    onChange={handleChange}
                                    className="input-field bg-white"
                                >
                                    <option value="file">File Upload</option>
                                    <option value="text">Text Only</option>
                                    <option value="both">File & Text</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="label">Attachments (Optional)</label>
                            <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group ${selectedFile || formData.fileUrl ? 'border-green-300 bg-green-50' : 'border-slate-300 hover:border-primary hover:bg-slate-50'}`}>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {selectedFile || formData.fileUrl ? (
                                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3 shadow-sm">
                                            <CheckCircle className="h-6 w-6" />
                                        </div>
                                        <span className="text-sm font-semibold text-green-800">File Attached Successfully</span>
                                        <span className="text-xs text-green-600 mt-1 max-w-xs truncate">{selectedFile ? selectedFile.name : formData.fileUrl}</span>
                                        <span className="text-xs text-green-500 mt-4 underline group-hover:text-green-700">Click to replace</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3 group-hover:bg-blue-50 group-hover:text-primary transition-colors">
                                            <Upload className="h-6 w-6" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-700">Click or drag a file to upload</p>
                                        <p className="text-xs text-slate-500 mt-1">PDF, DOCX, Images supported</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-8 mt-4 border-t border-slate-100">
                            <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="mr-4">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="px-8 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">
                                {loading ? (
                                    <span className="flex items-center">Creating...</span>
                                ) : (
                                    <span className="flex items-center"><Save className="h-4 w-4 mr-2" /> Create Assignment</span>
                                )}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>

            <style>{`
                .label { @apply block text-sm font-medium text-slate-700 mb-2; }
                .input-field { @apply w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400 text-slate-700; }
            `}</style>
        </DashboardLayout>
    );
};

export default CreateAssignment;
