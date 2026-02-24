import React, { useState, useEffect } from 'react';
import { BookOpen, Users, FileText, Award, BarChart2, MessageCircle, Plus, Upload, Video, Link as LinkIcon, Trash } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';

const UploadContent = () => {
    const navigate = useNavigate();
    // sidebarItems removed to use default from DashboardLayout

    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [moduleTitle, setModuleTitle] = useState('Module 1');
    const [lessonTitle, setLessonTitle] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const onDrop = React.useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setUploadedFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'video/*': [] }, maxFiles: 1 });

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const userInfoString = localStorage.getItem('userInfo');
                if (!userInfoString) {
                    navigate('/login');
                    return;
                }
                const { token, role } = JSON.parse(userInfoString);
                if (role !== 'teacher' && role !== 'admin') {
                    navigate('/student');
                    return;
                }
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/courses/mine`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCourses(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load your courses');
            }
        };
        fetchCourses();
    }, [navigate]);

    const handleSubmit = async () => {
        try {
            setError('');
            setSuccess('');
            setIsSubmitting(true);

            if (!selectedCourse) {
                setError('Select a course');
                return;
            }
            if (!lessonTitle.trim()) {
                setError('Lesson title is required');
                return;
            }
            if (!uploadedFile) {
                setError('Please upload a video file for this lesson');
                return;
            }

            const userInfoString = localStorage.getItem('userInfo');
            if (!userInfoString) {
                navigate('/login');
                return;
            }
            const { token } = JSON.parse(userInfoString);

            // Upload Video
            const fd = new FormData();
            fd.append('video', uploadedFile);
            const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL}/courses/upload/video`, fd, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            const contentUrl = uploadRes.data.url;

            await axios.post(
                `${import.meta.env.VITE_API_URL}/courses/${selectedCourse}/lessons`,
                {
                    moduleTitle: moduleTitle || 'Module 1',
                    lessonTitle,
                    type: 'video',
                    content: contentUrl,
                    duration: '',
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess('Lesson added successfully');
            setLessonTitle('');
            setUploadedFile(null);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to add lesson';
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout userType="teacher" title="Upload Content">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Course Structure */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6">
                        <h3 className="font-bold text-slate-900 mb-4">Select Course</h3>
                        <select
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none bg-white mb-6 hover:border-slate-300 transition-all duration-200 cursor-pointer"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            <option value="">Select a course...</option>
                            {courses.map((course) => (
                                <option key={course._id} value={course._id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>

                        {selectedCourse && (
                            <div className="text-sm text-slate-600">
                                Lessons will be added to this course.
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Panel: Upload Form */}
                <div className="lg:col-span-2">
                    <Card className="p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Add New Lesson</h2>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Input
                                        label="Module Title"
                                        placeholder="e.g., Module 1: Introduction"
                                        value={moduleTitle}
                                        onChange={(e) => setModuleTitle(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="Lesson Title"
                                        placeholder="e.g., Understanding Hooks"
                                        value={lessonTitle}
                                        onChange={(e) => setLessonTitle(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">Content Type</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-primary bg-primary/5 text-primary transition-all">
                                        <Video className="h-6 w-6 mb-2" />
                                        <span className="text-sm font-medium text-center">Video Lesson</span>
                                    </div>
                                </div>
                            </div>

                            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${isDragActive ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-primary hover:bg-primary/5'}`}>
                                <input {...getInputProps()} />
                                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                {isDragActive ? (
                                    <p className="text-lg font-medium text-primary">Drop the files here ...</p>
                                ) : (
                                    <>
                                        <p className="text-lg font-medium text-slate-900">Drag and drop video file</p>
                                        <p className="text-sm text-slate-500 mt-2">MP4, WebM up to 2GB</p>
                                    </>
                                )}
                                <Button variant="outline" className="mt-6" type="button">Browse Files</Button>
                            </div>

                            {uploadedFile && (
                                <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Video className="h-5 w-5 text-primary mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{uploadedFile.name}</p>
                                            <p className="text-xs text-slate-500">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setUploadedFile(null)} className="text-slate-400 hover:text-red-500">
                                        <Trash className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                                    {success}
                                </div>
                            )}

                            <div className="flex justify-end pt-6 border-t border-slate-100">
                                <Button onClick={handleSubmit} isLoading={isSubmitting}>Add Lesson to Course</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UploadContent;