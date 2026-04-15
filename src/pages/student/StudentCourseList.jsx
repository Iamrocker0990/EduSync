import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, Clock, BookOpen, Filter } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import courseService from '../../services/courseService';

const StudentCourseList = () => {
    const [courses, setCourses] = useState([]);
    const [myEnrollments, setMyEnrollments] = useState([]); // To check if already enrolled
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [priceFilter, setPriceFilter] = useState('All');
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null); // Course ID being processed

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coursesData, enrollmentsData] = await Promise.all([
                    courseService.getAllApprovedCourses(),
                    courseService.getMyEnrollments()
                ]);
                setCourses(coursesData);
                // Create a Set of enrolled course IDs for O(1) lookup
                setMyEnrollments(new Set(enrollmentsData.filter(e => e.course).map(e => e.course._id)));
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError("Failed to load course catalog.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleEnroll = async (courseId) => {
        if (!window.confirm("Are you sure you want to enroll in this course?")) return;

        setProcessingId(courseId);
        try {
            await courseService.enrollInCourse(courseId);
            alert("Successfully enrolled!");
            setMyEnrollments(prev => new Set(prev).add(courseId));
        } catch (err) {
            console.error("Enrollment failed:", err);
            alert(err.response?.data?.message || "Enrollment failed. Please try again.");
        } finally {
            setProcessingId(null);
        }
    };

    const uniqueCategories = ['All', ...new Set(courses.map(c => c.category).filter(Boolean))];

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || course.category === categoryFilter;
        const matchesPrice = priceFilter === 'All' ||
            (priceFilter === 'Free' && (!course.price || course.price === 0)) ||
            (priceFilter === 'Paid' && course.price > 0);

        return matchesSearch && matchesCategory && matchesPrice;
    });

    return (
        <DashboardLayout userType="student" title="Browse Courses">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">

                {/* Search */}
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary outline-none transition-all"
                    />

                </div>

                {/* Filters */}
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary outline-none cursor-pointer"
                    >
                        {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>


                    <select
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary outline-none cursor-pointer"
                    >
                        <option value="All">All Prices</option>
                        <option value="Free">Free</option>
                        <option value="Paid">Paid</option>
                    </select>

                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>

            ) : error ? (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">{error}</div>

            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.length > 0 ? (
                        filteredCourses.map((course) => {
                            const isEnrolled = myEnrollments.has(course._id);
                            return (
                                <Card key={course._id} className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
                                    <div className="h-48 overflow-hidden relative bg-slate-200">
                                        {course.thumbnail ? (
                                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-400">
                                                <BookOpen className="h-12 w-12" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <Badge variant="primary">{course.category}</Badge>
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2" title={course.title}>{course.title}</h3>
                                        <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 text-sm">{course.description}</p>

                                        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mt-auto mb-4">
                                            <div className="flex items-center">
                                                <User className="h-4 w-4 mr-1" />
                                                <span className="truncate max-w-[100px]">{course.instructor?.name || 'Instructor'}</span>
                                            </div>
                                            {course.duration && (
                                                <div className="flex items-center text-xs text-slate-500 dark:text-gray-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                    <Clock className="w-3 h-3 mr-1 text-slate-400" />
                                                    {course.duration}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 gap-2">
                                            <span className="text-lg font-bold text-slate-900 dark:text-white">
                                                {course.price > 0 ? `₹${course.price}` : <span className="text-green-600 dark:text-green-400">Free</span>}
                                            </span>

                                            {isEnrolled ? (
                                                <Button size="sm" variant="success" disabled>
                                                    Enrolled
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleEnroll(course._id)}
                                                    disabled={processingId === course._id}
                                                >
                                                    {processingId === course._id ? 'Enrolling...' : 'Apply Now'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-16 text-center">
                            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                <Search className="h-8 w-8 text-slate-400 dark:text-slate-500 dark:text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No courses found</h3>
                            <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filters.</p>
                        </div>

                    )}
                </div>
            )}
        </DashboardLayout>
    );
};

export default StudentCourseList;
