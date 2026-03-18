import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import courseService from '../../services/courseService'; // Import service
import { BookOpen, Users, FileText, Award, BarChart2, MessageCircle, Plus, Upload, MoreVertical, Edit, Trash, Eye } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const TeacherCourses = () => {
    // sidebarItems removed to use default from DashboardLayout
    const navigate = useNavigate();

    const [courses, setCourses] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await courseService.getTeacherCourses();
                // Map backend data to UI format if needed
                const formattedCourses = data.map(course => ({
                    id: course._id,
                    title: course.title,
                    category: course.description?.substring(0, 20) + '...', // Placeholder if category isn't in backend yet
                    students: 0, // Placeholder
                    status: course.status.charAt(0).toUpperCase() + course.status.slice(1), // 'pending' -> 'Pending'
                    lastUpdated: new Date(course.createdAt).toLocaleDateString(),
                    image: course.thumbnail || 'https://via.placeholder.com/150'
                }));
                setCourses(formattedCourses);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const [selectedCourses, setSelectedCourses] = React.useState([]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedCourses(courses.map(c => c.id));
        } else {
            setSelectedCourses([]);
        }
    };

    const handleSelectCourse = (id) => {
        if (selectedCourses.includes(id)) {
            setSelectedCourses(selectedCourses.filter(cId => cId !== id));
        } else {
            setSelectedCourses([...selectedCourses, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedCourses.length} courses? This action cannot be undone.`)) return;

        try {
            // Delete sequentially to avoid overwhelming server or hitting rate limits
            // Alternatively, Promise.all could be used for parallel deletion
            for (const id of selectedCourses) {
                await courseService.deleteCourse(id);
            }
            // Update UI
            setCourses(courses.filter(c => !selectedCourses.includes(c.id)));
            setSelectedCourses([]);
            alert("Courses deleted successfully.");
        } catch (error) {
            console.error("Bulk delete failed", error);
            alert("Failed to delete some courses.");
            // Refresh list to sync state
            window.location.reload();
        }
    };

    return (
        <DashboardLayout userType="teacher" title="My Courses">
            <div className="flex justify-between items-center mb-8">
                <div className="flex space-x-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search courses..."
                            className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all w-64"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">

                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    <select className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <option>All Categories</option>

                        <option>Programming</option>
                        <option>Design</option>
                        <option>Data Science</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    {selectedCourses.length > 0 && (
                        <Button variant="danger" onClick={handleBulkDelete} className="bg-red-500 hover:bg-red-600 text-white">
                            <Trash className="h-4 w-4 mr-2" /> Delete Selected ({selectedCourses.length})
                        </Button>
                    )}
                    <Link to="/teacher/create-course">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" /> Create New Course
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300 w-10">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={courses.length > 0 && selectedCourses.length === courses.length}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                </th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Course Name</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Category</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Students</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Last Updated</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {courses.map((course) => (
                                <tr key={course.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${selectedCourses.includes(course.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                    <td className="px-6 py-4">

                                        <input
                                            type="checkbox"
                                            checked={selectedCourses.includes(course.id)}
                                            onChange={() => handleSelectCourse(course.id)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <img src={course.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                                            <span className="font-medium text-slate-900 dark:text-white">{course.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{course.category}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{course.students}</td>
                                    <td className="px-6 py-4">

                                        <Badge variant={course.status === 'Published' ? 'success' : 'neutral'}>
                                            {course.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">{course.lastUpdated}</td>
                                    <td className="px-6 py-4 text-right">

                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                className="p-1 text-slate-400 hover:text-primary transition-colors"
                                                title="Manage Content"
                                                onClick={() => navigate(`/teacher/course/${course.id}/content`)}
                                            >
                                                <BookOpen className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="p-1 text-slate-400 hover:text-primary transition-colors"
                                                title="Edit"
                                                onClick={() => navigate(`/teacher/edit-course/${course.id}`)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                                title="Delete"
                                                onClick={async () => {
                                                    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
                                                        try {
                                                            await courseService.deleteCourse(course.id);
                                                            setCourses(courses.filter(c => c.id !== course.id));
                                                        } catch (error) {
                                                            console.error("Failed to delete course", error);
                                                            alert("Failed to delete course");
                                                        }
                                                    }
                                                }}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </DashboardLayout>
    );
};

export default TeacherCourses;
