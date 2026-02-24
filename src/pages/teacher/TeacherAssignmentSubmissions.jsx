import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, FileText, CheckCircle, Clock, Award, XCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';

const TeacherAssignmentSubmissions = () => {
    const { courseId, assignmentId } = useParams();
    const navigate = useNavigate();

    const [assignment, setAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [gradingData, setGradingData] = useState({ marks: '', feedback: '' });
    const [submittingGrade, setSubmittingGrade] = useState(false);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // We'll fetch the assignment details too (re-using the student endpoint, if protected, teacher can access if it allows it OR we just fetch course assignments and find it)
                const assignRes = await axios.get(`${import.meta.env.VITE_API_URL}/assignments/course/${courseId}`, config);
                const currentAssignment = assignRes.data.find(a => a._id === assignmentId);
                setAssignment(currentAssignment || { title: 'Assignment', maxMarks: 100 });

                const subsRes = await axios.get(`${import.meta.env.VITE_API_URL}/assignments/${assignmentId}/submissions`, config);
                setSubmissions(subsRes.data);
            } catch (error) {
                console.error("Error fetching submissions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [courseId, assignmentId, navigate]);

    const handleSelectSubmission = (sub) => {
        setSelectedSubmission(sub);
        setGradingData({
            marks: sub.marks || '',
            feedback: sub.feedback || ''
        });
    };

    const handleGradeSubmission = async (e) => {
        e.preventDefault();
        setSubmittingGrade(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_URL}/assignments/submissions/${selectedSubmission._id}/grade`, gradingData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state
            setSubmissions(prev => prev.map(s => {
                if (s._id === selectedSubmission._id) {
                    return { ...s, marks: gradingData.marks, feedback: gradingData.feedback, status: 'graded' };
                }
                return s;
            }));

            setSelectedSubmission(null);
            alert("Submission graded successfully!");
        } catch (error) {
            console.error("Error grading submission:", error);
            alert("Failed to grade submission.");
        } finally {
            setSubmittingGrade(false);
        }
    };

    return (
        <DashboardLayout userType="teacher" title="Submissions">
            <div className="max-w-6xl mx-auto space-y-6">
                <Button variant="ghost" className="mb-2 pl-0" onClick={() => navigate('/teacher/assignments')}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back to Assignments
                </Button>

                <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{assignment?.title || 'Loading...'}</h1>
                        <p className="text-slate-500 mt-1">Reviewing student submissions</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-slate-500">Total Submissions</p>
                        <p className="text-2xl font-bold text-primary">{submissions.length}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Submissions List */}
                    <div className="lg:col-span-2">
                        <Card className="overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <h3 className="font-semibold text-slate-800">Student List</h3>
                            </div>
                            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                                {loading ? (
                                    <div className="p-8 text-center text-slate-500">Loading submissions...</div>
                                ) : submissions.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500">No submissions yet for this assignment.</div>
                                ) : (
                                    submissions.map(sub => (
                                        <div
                                            key={sub._id}
                                            onClick={() => handleSelectSubmission(sub)}
                                            className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${selectedSubmission?._id === sub._id ? 'bg-blue-50 border-l-4 border-primary' : 'hover:bg-slate-50'}`}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">
                                                    {sub.student?.name?.charAt(0) || 'S'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{sub.student?.name || 'Unknown Student'}</p>
                                                    <p className="text-xs text-slate-500 flex items-center mt-1">
                                                        <Clock className="h-3 w-3 mr-1" /> {new Date(sub.submittedAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <Badge variant={sub.status === 'graded' ? 'success' : 'warning'}>
                                                    {sub.status === 'graded' ? 'Graded' : 'Needs Grading'}
                                                </Badge>
                                                {sub.status === 'graded' && (
                                                    <span className="text-sm font-semibold text-slate-700 mt-2">
                                                        {sub.marks} / {assignment?.maxMarks}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Right: Grading Panel */}
                    <div className="lg:col-span-1">
                        {selectedSubmission ? (
                            <Card className="p-6 sticky top-6">
                                <div className="border-b border-slate-100 pb-4 mb-6">
                                    <h3 className="text-lg font-bold text-slate-900">Evaluate Submission</h3>
                                    <p className="text-sm text-slate-500">Student: {selectedSubmission.student?.name}</p>
                                </div>

                                <div className="space-y-6">
                                    {selectedSubmission.submissionText && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Text Answer</label>
                                            <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 whitespace-pre-wrap border border-slate-200">
                                                {selectedSubmission.submissionText}
                                            </div>
                                        </div>
                                    )}

                                    {selectedSubmission.fileUrl && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Attached File</label>
                                            <a
                                                href={selectedSubmission.fileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center p-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                            >
                                                <FileText className="h-5 w-5 mr-3" />
                                                <span className="font-medium text-sm">Download Submission</span>
                                            </a>
                                        </div>
                                    )}

                                    <form onSubmit={handleGradeSubmission} className="space-y-4 pt-4 border-t border-slate-100">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex justify-between">
                                                <span>Marks Awarded</span>
                                                <span className="text-slate-400">out of {assignment?.maxMarks || 100}</span>
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 85"
                                                value={gradingData.marks}
                                                onChange={(e) => setGradingData({ ...gradingData, marks: e.target.value })}
                                                max={assignment?.maxMarks || 100}
                                                min="0"
                                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Feedback (Optional)</label>
                                            <textarea
                                                placeholder="Great work on..."
                                                value={gradingData.feedback}
                                                onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none h-24 resize-none"
                                            ></textarea>
                                        </div>

                                        <Button type="submit" disabled={submittingGrade} className="w-full">
                                            {submittingGrade ? 'Saving Grade...' : 'Save Grade & Feedback'}
                                        </Button>
                                    </form>
                                </div>
                            </Card>
                        ) : (
                            <Card className="p-8 text-center flex flex-col items-center justify-center h-64 border-dashed border-2 bg-slate-50/50">
                                <Award className="h-12 w-12 text-slate-300 mb-4" />
                                <h3 className="text-lg font-medium text-slate-600">No Submission Selected</h3>
                                <p className="text-sm text-slate-400 mt-1">Select a student from the list to view and grade their work.</p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TeacherAssignmentSubmissions;
