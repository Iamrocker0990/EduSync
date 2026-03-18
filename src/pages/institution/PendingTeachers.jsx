import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Users } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import api from '../../services/api';

const PendingTeachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const { data } = await api.get('/institution/teachers');
            setTeachers(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Failed to load teachers");
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`/institution/teacher/${id}/${status}`);
            setTeachers(prev => prev.map(t =>
                t._id === id ? { ...t, approvalStatus: status } : t
            ));
        } catch (err) {
            console.error(err);
            alert(`Failed to ${status} teacher`);
        }
    };

    if (loading) return (
        <DashboardLayout userType="institution" title="Manage Teachers">
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        </DashboardLayout>
    );

    const pendingTeachers = teachers.filter(t => t.approvalStatus === 'pending');
    const approvedTeachers = teachers.filter(t => t.approvalStatus === 'approved');

    return (
        <DashboardLayout userType="institution" title="Manage Teachers" sidebarItems={[{ icon: Users, label: 'Dashboard', href: '/institution' }, { icon: Shield, label: 'Manage Teachers', href: '/institution/teachers' }]}>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Teacher Management</h2>
                <p className="text-slate-500">Approve or reject teacher applications for your institution.</p>
            </div>

            {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}

            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-medium text-slate-900">Pending Approvals</h3>
                </div>
                {pendingTeachers.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">No pending teacher applications.</div>
                ) : (
                    <ul className="divide-y divide-slate-200">
                        {pendingTeachers.map(teacher => (
                            <li key={teacher._id} className="p-6 hover:bg-slate-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 min-w-[40px] rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-4">
                                            {teacher.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-900">{teacher.name}</h4>
                                            <p className="text-sm text-slate-500">{teacher.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusUpdate(teacher._id, 'approved')}>
                                            <Check className="h-4 w-4 mr-1" /> Approve
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleStatusUpdate(teacher._id, 'rejected')}>
                                            <X className="h-4 w-4 mr-1" /> Reject
                                        </Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="bg-white rounded-lg shadow mt-8">
                <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-medium text-slate-900">Approved Teachers</h3>
                </div>
                {approvedTeachers.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">No approved teachers yet.</div>
                ) : (
                    <ul className="divide-y divide-slate-200">
                        {approvedTeachers.map(teacher => (
                            <li key={teacher._id} className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 min-w-[40px] rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-4">
                                            {teacher.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-900">{teacher.name}</h4>
                                            <p className="text-sm text-slate-500">{teacher.email}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </DashboardLayout>
    );
};

export default PendingTeachers;
