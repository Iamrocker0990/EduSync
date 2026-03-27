import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Clock, CheckCircle, AlertCircle, ChevronLeft } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const TakeQuiz = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({}); // { questionId: selectedOptionIndex }
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/quiz/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setQuiz(res.data);
                setTimeLeft(res.data.timeLimit * 60); // Convert mins to seconds
                setLoading(false);
            } catch (error) {
                console.error("Error fetching quiz:", error);
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id]);

    useEffect(() => {
        if (!loading && !submitted && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit(); // Auto submit
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [loading, submitted, timeLeft]);

    const handleOptionSelect = (questionId, optionIndex) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const formattedAnswers = Object.entries(answers).map(([qId, opt]) => ({
                questionId: qId,
                selectedOption: opt.toString() // Backend expects string usually, check controller
            }));

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/quiz/${id}/submit`,
                { answers: formattedAnswers },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Auto-complete course lesson progress if router state was provided
            if (location.state?.courseId && location.state?.lessonId) {
                try {
                    await axios.post(
                        `${import.meta.env.VITE_API_URL}/student/courses/${location.state.courseId}/lessons/${location.state.lessonId}/complete`,
                        {},
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                } catch (progressErr) {
                    console.error("Progress update failed silently:", progressErr);
                }
            }

            setResult(res.data);
            setSubmitted(true);
            window.scrollTo(0, 0);
        } catch (error) {
            console.error("Error submitting quiz:", error);
            alert("Failed to submit quiz");
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading) return <DashboardLayout userType="student" title="Loading Quiz...">Loading...</DashboardLayout>;
    if (!quiz) return <DashboardLayout userType="student" title="Error">Quiz not found</DashboardLayout>;

    return (
        <DashboardLayout userType="student" title={quiz.title}>
            <div className="max-w-3xl mx-auto">
                <Button variant="ghost" className="mb-4 pl-0" onClick={() => navigate(-1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back to Course
                </Button>

                {submitted ? (
                    <Card className="p-8 text-center">
                        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                            <CheckCircle className="h-10 w-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Quiz Submitted!</h2>
                        <p className="text-slate-600 dark:text-gray-300 mb-6">You have successfully completed this quiz.</p>

                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 max-w-sm mx-auto mb-8 border border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-slate-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-2">You Scored</p>
                            <div className="text-4xl font-bold text-slate-900 dark:text-white">
                                {result.score} <span className="text-xl text-slate-400 font-normal">Marks / {result.totalMarks} Total</span>
                            </div>
                        </div>

                        <Button onClick={() => navigate(-1)}>Return to Course</Button>
                    </Card>
                ) : (
                    <>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 mb-6 flex justify-between items-center sticky top-20 z-10 shadow-sm">
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{quiz.title}</h1>
                                <p className="text-slate-500 dark:text-gray-400 text-sm">Total Questions: {quiz.questions.length}</p>
                            </div>
                            <div className={`flex items-center space-x-2 font-mono text-lg font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-slate-700 dark:text-gray-200'}`}>
                                <Clock className="h-5 w-5" />
                                <span>{formatTime(timeLeft)}</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {quiz.questions.map((q, index) => (
                                <Card key={q._id} className="p-6">
                                    <div className="flex gap-4">
                                        <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-500 dark:text-gray-400 shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">{q.question}</h3>
                                            <div className="space-y-3">
                                                {[q.option1, q.option2, q.option3, q.option4].map((opt, optIndex) => (
                                                    <div
                                                        key={optIndex}
                                                        onClick={() => handleOptionSelect(q._id, optIndex + 1)}
                                                        className={`p-4 rounded-lg border cursor-pointer transition-all flex items-center ${answers[q._id] === optIndex + 1
                                                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800'
                                                            }`}
                                                    >
                                                        <div className={`h-5 w-5 rounded-full border mr-3 flex items-center justify-center ${answers[q._id] === optIndex + 1
                                                            ? 'border-primary'
                                                            : 'border-slate-300'
                                                            }`}>
                                                            {answers[q._id] === optIndex + 1 && (
                                                                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                                                            )}
                                                        </div>
                                                        <span className="text-slate-700 dark:text-gray-200">{opt}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button size="lg" onClick={handleSubmit}>
                                Submit Quiz
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default TakeQuiz;
