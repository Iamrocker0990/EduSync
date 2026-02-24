import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Clock, CheckCircle, Upload, FileText, ChevronLeft, AlertCircle, Calendar
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const AssignmentSubmission = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [textSubmission, setTextSubmission] = useState('');
    const [fileUrl, setFileUrl] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Fetch Assignment Details
                const assignRes = await axios.get(`${import.meta.env.VITE_API_URL}/assignments/course/${id}`, config); // This fetches all course assignments, need specific one?
                // Wait, the route is /api/assignments/:id/submissions for teacher...
                // And /api/assignments/course/:courseId for list.
                // I don't have a "get single assignment by ID" route for student yet? 
                // Actually I might just filter from the list or add a route if needed. 
                // Let's check keys. I'll need to fetch the single assignment. 
                // The current routes don't have a "get single assignment" public/student route explicitly usually, 
                // but let's assume I can get it or I need to add it.
                // Re-reading controller... getCourseAssignments is there.
                // I should probably add `getAssignmentById` or just use the list and find it. 
                // For now, let's assume I can fetch all for the course and find it, OR add a route. 
                // Adding a route is cleaner.

                // Let's try to fetch all course assignments (I need courseId though, and I only have assignment id).
                // Ah, I only have assignment-id in params. 
                // So I definitely need a `getAssignment` endpoint.

                // Use a temporary workaround or fix backend. 
                // FIX BACKEND: Add `getAssignment` to controller.

                // For this step, I will write the code assuming the endpoint exists: `GET /api/assignments/:id`

                const assignResSingle = await axios.get(`${import.meta.env.VITE_API_URL}/assignments/${id}`, config);
                setAssignment(assignResSingle.data);

                // Fetch My Submission
                const subRes = await axios.get(`${import.meta.env.VITE_API_URL}/assignments/${id}/my-submission`, config);
                setSubmission(subRes.data);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                submissionText: textSubmission,
                fileUrl: fileUrl
            };

            await axios.post(`${import.meta.env.VITE_API_URL}/assignments/${id}/submit`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Refresh data
            const subRes = await axios.get(`${import.meta.env.VITE_API_URL}/assignments/${id}/my-submission`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubmission(subRes.data);
            setSubmitting(false);
        } catch (error) {
            console.error("Error submitting assignment:", error);
            alert("Failed to submit assignment");
            setSubmitting(false);
        }
    };

    // Cloudinary Widget
    const handleUpload = () => {
        const myWidget = window.cloudinary.createUploadWidget(
            {
                cloudName: 'dqy3w10ba',
                uploadPreset: 'final-year-project',
                sources: ['local', 'url', 'google_drive'],
                multiple: false,
                resourceType: 'auto',
            },
            (error, result) => {
                if (!error && result && result.event === "success") {
                    setFileUrl(result.info.secure_url);
                }
            }
        );
        myWidget.open();
    };

    if (loading) return <DashboardLayout userType="student" title="Loading...">Loading...</DashboardLayout>;
    if (!assignment) return <DashboardLayout userType="student" title="Error">Assignment not found</DashboardLayout>;

    const isPastDue = new Date(assignment.dueDate) < new Date();

    return (
        <DashboardLayout userType="student" title={assignment.title}>
            <div className="max-w-4xl mx-auto">
                <Button variant="ghost" className="mb-4 pl-0" onClick={() => navigate(-1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back to Course
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-2xl font-bold text-slate-900">{assignment.title}</h1>
                                <Badge variant={isPastDue ? 'danger' : 'neutral'}>
                                    {isPastDue ? 'Closed' : 'Open'}
                                </Badge>
                            </div>

                            <div className="prose prose-slate max-w-none mb-6">
                                <h3 className="font-semibold text-slate-900">Instructions</h3>
                                <p className="whitespace-pre-wrap">{assignment.description}</p>
                            </div>

                            {assignment.fileUrl && (
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FileText className="h-5 w-5 text-blue-500 mr-3" />
                                        <span className="text-sm font-medium text-slate-700">Reference Material</span>
                                    </div>
                                    <a href={assignment.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline font-medium">
                                        Download
                                    </a>
                                </div>
                            )}
                        </Card>

                        {/* Submission Form (if not submitted) */}
                        {!submission && (
                            <Card className="p-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Your Submission</h3>
                                {isPastDue ? (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
                                        <AlertCircle className="h-5 w-5 mr-2" />
                                        <span>The due date for this assignment has passed.</span>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {['text', 'both'].includes(assignment.submissionType) && (
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Text Submission</label>
                                                <textarea
                                                    value={textSubmission}
                                                    onChange={(e) => setTextSubmission(e.target.value)}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none h-32 resize-none"
                                                    placeholder="Type your answer here..."
                                                ></textarea>
                                            </div>
                                        )}

                                        {['file', 'both'].includes(assignment.submissionType) && (
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">File Upload</label>
                                                <div
                                                    onClick={handleUpload}
                                                    className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                                                >
                                                    {fileUrl ? (
                                                        <div className="text-green-600 flex flex-col items-center">
                                                            <CheckCircle className="h-8 w-8 mb-2" />
                                                            <span className="text-sm font-medium">File Selected</span>
                                                            <span className="text-xs text-slate-400 mt-1 break-all">{fileUrl}</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                                            <p className="text-sm text-slate-600">Click to upload your work</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-end border-t border-slate-100 pt-6">
                                            <Button type="submit" disabled={submitting}>
                                                {submitting ? 'Submitting...' : 'Turn In Assignment'}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </Card>
                        )}
                    </div>

                    {/* Right: Status */}
                    <div className="space-y-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Submission Status</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                    <span className="text-slate-500 font-medium">Status</span>
                                    {submission ? (
                                        <Badge variant={submission.status === 'graded' ? 'success' : 'warning'}>
                                            {submission.status === 'graded' ? 'Graded' : 'Submitted'}
                                        </Badge>
                                    ) : (
                                        <Badge variant="neutral">Not Submitted</Badge>
                                    )}
                                </div>

                                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                    <span className="text-slate-500 font-medium">Due Date</span>
                                    <span className="text-slate-900">{new Date(assignment.dueDate).toLocaleDateString()}</span>
                                </div>

                                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                    <span className="text-slate-500 font-medium">Points</span>
                                    <span className="text-slate-900">{submission?.marks || '-'} / {assignment.maxMarks}</span>
                                </div>

                                {submission && (
                                    <div className="pt-2">
                                        <span className="text-slate-500 font-medium block mb-2">Submitted on</span>
                                        <span className="text-slate-900 block text-sm">
                                            {new Date(submission.submittedAt).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {submission && submission.feedback && (
                            <Card className="p-6 bg-blue-50 border-blue-100">
                                <h3 className="text-lg font-bold text-blue-900 mb-3">Feedback</h3>
                                <p className="text-blue-800 text-sm whitespace-pre-wrap">{submission.feedback}</p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AssignmentSubmission;
