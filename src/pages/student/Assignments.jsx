import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const Assignments = () => {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/assignments/student`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAssignments(response.data);
            } catch (error) {
                console.error("Error fetching student assignments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, [navigate]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pending': return <Badge variant="warning">Pending</Badge>;
            case 'Submitted': return <Badge variant="primary">Submitted</Badge>;
            case 'Graded': return <Badge variant="success">Graded</Badge>;
            case 'Overdue': return <Badge variant="danger">Overdue</Badge>;
            default: return <Badge variant="neutral">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout userType="student" title="Assignments">
            <div className="space-y-6">
                {/* Assignments List */}
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Assignment Title</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300 hidden md:table-cell">Course</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Due Date</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Status</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Score</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                            <div className="flex justify-center items-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : assignments.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                            No assignments found for your enrolled courses.
                                        </td>
                                    </tr>
                                ) : (
                                    assignments.map((assignment) => (
                                        <tr key={assignment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-slate-900 dark:text-white">{assignment.title}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 md:hidden">{assignment.course}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 hidden md:table-cell">{assignment.course}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                <div className="flex items-center">
                                                    <Clock className="h-3 w-3 mr-1.5 text-slate-400 dark:text-slate-500 dark:text-gray-400" />
                                                    {new Date(assignment.dueDate).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{getStatusBadge(assignment.status)}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                                                {assignment.score || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Button size="sm" variant={assignment.status === 'Pending' ? 'primary' : 'outline'} onClick={() => navigate(`/student/assignment/${assignment.id}`)}>
                                                    {assignment.status === 'Pending' ? 'Submit' : 'View'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default Assignments;