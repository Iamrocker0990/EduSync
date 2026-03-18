import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PlayCircle, CheckCircle, Download, BookOpen, Video, Award, BarChart2, MessageCircle, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import CertificateTemplate from '../../components/certificate/CertificateTemplate';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [showCertificate, setShowCertificate] = useState(false);
    const certificateRef = useRef(null);
    const [currentLesson, setCurrentLesson] = useState({ moduleIndex: 0, lessonIndex: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [userName, setUserName] = useState('');
    const [customThemeColor, setCustomThemeColor] = useState('');

    // sidebarItems removed to use default from DashboardLayout

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userInfoString = localStorage.getItem('userInfo');
                if (!userInfoString) {
                    navigate('/login');
                    return;
                }
                const parsedInfo = JSON.parse(userInfoString);
                const { token, role } = parsedInfo;
                setUserName(parsedInfo.name || parsedInfo.username || 'Student');
                if (role !== 'student' && role !== 'admin') {
                    navigate('/teacher');
                    return;
                }

                const courseRes = await axios.get(`${import.meta.env.VITE_API_URL}/courses/${id}`);
                setCourse(courseRes.data);

                // pick first lesson if exists
                const firstModule = courseRes.data.modules?.[0];
                if (firstModule && firstModule.lessons?.length > 0) {
                    setCurrentLesson({ moduleIndex: 0, lessonIndex: 0 });
                }

                const progressRes = await axios.get(
                    `${import.meta.env.VITE_API_URL}/student/courses/${id}/progress`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setProgress(progressRes.data.progress || 0);
                setCompletedLessons(progressRes.data.completedLessons || []);

                // Fetch Assignments
                const assignRes = await axios.get(`${import.meta.env.VITE_API_URL}/assignments/course/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAssignments(assignRes.data);

                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load course');
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleMarkCompleted = async () => {
        if (!course) return;
        const module = course.modules?.[currentLesson.moduleIndex];
        const lesson = module?.lessons?.[currentLesson.lessonIndex];
        if (!lesson?._id) return;

        try {
            const userInfoString = localStorage.getItem('userInfo');
            if (!userInfoString) {
                navigate('/login');
                return;
            }
            const { token } = JSON.parse(userInfoString);

            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/student/courses/${course._id}/lessons/${lesson._id}/complete`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCompletedLessons(res.data.completedLessons || []);
            setProgress(res.data.progress || 0);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDownloadCertificate = async () => {
        if (!certificateRef.current) return;

        try {
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2,
                logging: false,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`${(course?.title || 'course').replace(/\s+/g, '_')}_Certificate.pdf`);
            setShowCertificate(false);
        } catch (err) {
            console.error('Error generating certificate:', err);
        }
    };

    if (loading) {
        return (
            <DashboardLayout userType="student" title="Loading course">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>

            </DashboardLayout>
        );
    }

    if (error || !course) {
        return (
            <DashboardLayout userType="student" title="Course">
                <div className="p-6 text-red-600 dark:text-red-400">{error || 'Course not found'}</div>

            </DashboardLayout>
        );
    }

    const module = course.modules?.[currentLesson.moduleIndex];
    const lesson = module?.lessons?.[currentLesson.lessonIndex];
    const isCompleted = lesson?._id && completedLessons.some((id) => id === lesson._id || id?._id === lesson._id);

    return (
        <DashboardLayout userType="student" title={course.title}>
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content */}
                <div className="flex-1">
                    {/* Video Player */}
                    <div className="bg-slate-900 rounded-xl overflow-hidden aspect-video mb-6 relative">
                        {lesson?.type === 'quiz' ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-800 dark:bg-slate-900 p-6 text-center">
                                <BookOpen className="h-16 w-16 opacity-70 mb-4" />
                                <h3 className="text-2xl font-bold mb-2 text-white">{lesson.title}</h3>
                                <p className="text-slate-300 dark:text-slate-400 mb-6">This lesson is a quiz component. Click below to begin the assessment.</p>

                                <Button onClick={() => navigate(`/student/quiz/${lesson.content}`, { state: { courseId: course._id, lessonId: lesson._id } })}>
                                    Start Quiz
                                </Button>
                            </div>
                        ) : lesson?.content ? (
                            <video
                                key={lesson._id}
                                className="w-full h-full"
                                controls
                                src={lesson.content}
                                onError={(e) => console.error("Video Error:", e.target.error, lesson.content)}
                                onEnded={handleMarkCompleted}
                            >
                                <p className="text-white p-4">
                                    Your browser cannot play this video.
                                    <a href={lesson.content} target="_blank" rel="noreferrer" className="text-blue-400 underline ml-1">Download it</a> instead.
                                </p>
                            </video>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                <PlayCircle className="h-16 w-16 opacity-70 mb-2" />
                            </div>
                        )}
                        {lesson?.type !== 'quiz' && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pointer-events-none">
                                <h2 className="text-white text-xl font-bold">{lesson?.title || 'Select a lesson'}</h2>
                                <p className="text-slate-300 text-sm">
                                    {module?.title || ''} • {lesson?.duration || ''}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Course Info */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{course.title}</h1>
                                <p className="text-slate-500 dark:text-slate-400">Instructor: <span className="font-medium text-slate-700 dark:text-slate-300">{course.instructor?.name || 'Instructor'}</span></p>
                            </div>

                            {progress === 100 && (
                                <Button onClick={() => setShowCertificate(true)}>
                                    <Award className="h-4 w-4 mr-2" />
                                    Get Certificate
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{progress}% Complete</span>

                            {lesson && isCompleted && (
                                <Badge variant="success" className="flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Completed
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6 border-b border-slate-200 dark:border-slate-800">

                        <div className="flex space-x-8 overflow-x-auto">
                            {['Overview', 'Assignments', 'Discussion'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab.toLowerCase())}
                                    className={`pb-4 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab.toLowerCase()
                                        ? 'text-primary'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                        }`}

                                >
                                    {tab}
                                    {activeTab === tab.toLowerCase() && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[200px]">
                        {activeTab === 'overview' && (
                            <div className="space-y-8 text-slate-700 dark:text-slate-300">

                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About this Course</h3>
                                    <p className="whitespace-pre-wrap leading-relaxed">{course.description}</p>
                                </div>


                                {/* Learning Outcomes */}
                                {course.learningOutcomes?.length > 0 && (
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                        <h3 className="text-lg font-bold text-slate-900 mb-4">What you'll learn</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {course.learningOutcomes.map((outcome, i) => (
                                                <div key={i} className="flex items-start">
                                                    <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 shrink-0 mt-0.5" />
                                                    <span className="text-slate-700 dark:text-slate-300 text-sm">{outcome}</span>
                                                </div>
                                            ))}

                                        </div>
                                    </div>
                                )}

                                {/* Instructor Info */}
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Meet your Instructor</h3>
                                    <div className="flex items-start gap-4">
                                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl shrink-0">
                                            {course.instructor?.name?.charAt(0) || 'I'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">{course.instructor?.name}</h4>
                                            <p className="text-primary font-medium mb-2">{course.specialization || 'Instructor'}</p>
                                            <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400 mb-2">
                                                <span className="flex items-center"><Award className="h-4 w-4 mr-1" /> {course.experienceYears || 0}+ Years Exp</span>
                                                {course.portfolioLink && (
                                                    <a href={course.portfolioLink} target="_blank" rel="noreferrer" className="flex items-center hover:text-primary dark:hover:text-primary-light">
                                                        <BookOpen className="h-4 w-4 mr-1" /> Portfolio
                                                    </a>
                                                )}
                                            </div>
                                            {course.certifications && (
                                                <p className="text-sm text-slate-500 dark:text-slate-400"><span className="font-medium text-slate-700 dark:text-slate-300">Certifications:</span> {course.certifications}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}

                        {activeTab === 'assignments' && (
                            <div className="space-y-4">
                                {assignments.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">No assignments available.</div>
                                ) : (

                                    assignments.map(assign => (
                                        <div key={assign._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex justify-between items-start hover:border-primary dark:hover:border-primary-light transition-colors">
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{assign.title}</h4>
                                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">Due: {new Date(assign.dueDate).toLocaleDateString()}</p>
                                                <div className="flex gap-2">
                                                    <Badge variant="neutral">{assign.maxMarks} Marks</Badge>
                                                </div>
                                            </div>

                                            <Button size="sm" onClick={() => navigate(`/student/assignment/${assign._id}`)}>
                                                View Assignment
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'discussion' && (
                            <div className="text-sm text-slate-500">Discussion coming soon.</div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="lg:w-80 space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Course Content</h3>

                        <div className="space-y-4">
                            {course.modules?.map((m, mIndex) => (
                                <div key={mIndex} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                                    <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{m.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{m.lessons.length} Lessons</p>
                                        </div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {m.lessons.filter((l) => completedLessons.some((id) => id === l._id || id?._id === l._id)).length}/{m.lessons.length} completed
                                        </span>
                                    </div>
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {m.lessons.map((l, lIndex) => {
                                            const lessonDone = completedLessons.some((id) => id === l._id || id?._id === l._id);
                                            const isCurrent = currentLesson.moduleIndex === mIndex && currentLesson.lessonIndex === lIndex;
                                            return (
                                                <button
                                                    key={l._id || lIndex}
                                                    className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-primary/5 transition-colors text-left ${isCurrent ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                                    onClick={() => {
                                                        if (l.type === 'quiz') {
                                                            navigate(`/student/quiz/${l.content}`, { state: { courseId: course._id, lessonId: l._id } });
                                                        } else {
                                                            setCurrentLesson({ moduleIndex: mIndex, lessonIndex: lIndex });
                                                        }
                                                    }}
                                                >
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${lessonDone ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                                        {lessonDone ? <CheckCircle className="h-4 w-4" /> : (l.type === 'quiz' ? <BookOpen className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`text-sm font-medium ${isCurrent ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{l.title}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{l.duration || ''}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Certificate Modal */}
            {showCertificate && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-5xl w-full relative my-8">
                        <button
                            onClick={() => setShowCertificate(false)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 z-20"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Your Certificate</h3>
                                <p className="text-sm text-slate-500">Issued to <span className="font-semibold text-slate-700">{userName}</span></p>
                            </div>
                            <div className="flex items-center gap-3 pr-8 bg-slate-50 p-2 px-4 rounded-xl border border-slate-200">
                                <label className="text-sm font-medium text-slate-700">Customize Color Theme:</label>
                                <input
                                    type="color"
                                    value={customThemeColor || course.certificateSettings?.themeColor || '#3b82f6'}
                                    onChange={(e) => setCustomThemeColor(e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                    title="Choose your certificate color"
                                />
                            </div>
                        </div>

                        <div className="p-8 flex justify-center bg-slate-50 overflow-x-auto min-h-[400px]">
                            <div ref={certificateRef} className="shadow-lg transform scale-90 md:scale-100 origin-top">
                                <CertificateTemplate
                                    studentName={userName}
                                    courseName={course.title}
                                    instructorName={course.instructor?.name || 'Instructor'}
                                    date={new Date().toLocaleDateString()}
                                    settings={{
                                        ...course.certificateSettings,
                                        themeColor: customThemeColor || course.certificateSettings?.themeColor
                                    }}
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-white rounded-b-2xl border-t border-slate-100 flex justify-end">
                            <Button onClick={handleDownloadCertificate}>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF Certificate
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default CourseDetail;
