import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Shield, Clock, Check, X, Building } from 'lucide-react';
import api from '../../services/api';

const SuperAdminDashboard = () => {
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInstitutions();
    }, []);

    const fetchInstitutions = async () => {
        try {
            const { data } = await api.get('/superadmin/institutions');
            setInstitutions(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Failed to load institutions");
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`/superadmin/institution/${id}/${status}`);
            setInstitutions(prev => prev.map(inst =>
                inst._id === id ? { ...inst, approvalStatus: status } : inst
            ));
        } catch (err) {
            console.error(err);
            alert(`Failed to ${status} institution`);
        }
    };

    if (loading) return (
        <DashboardLayout userType="superadmin" title="Super Admin Dashboard">
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        </DashboardLayout>
    );

    const pendingInstitutions = institutions.filter(i => i.approvalStatus === 'pending');
    const approvedInstitutions = institutions.filter(i => i.approvalStatus === 'approved');

    return (
        <DashboardLayout userType="superadmin" title="Super Admin Dashboard" sidebarItems={[{ icon: Shield, label: 'Dashboard', href: '/superadmin' }]}>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Institution Management</h2>
                <p className="text-slate-500">Approve or reject institution applications.</p>
            </div>

            {error && <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>}

            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-medium text-slate-900">Pending Approvals</h3>
                </div>
                {pendingInstitutions.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">No pending applications.</div>
                ) : (
                    <ul className="divide-y divide-slate-200">
                        {pendingInstitutions.map(inst => (
                            <li key={inst._id} className="p-6 hover:bg-slate-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Building className="h-10 w-10 text-slate-400 mr-4" />
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-900">{inst.name}</h4>
                                            <p className="text-sm text-slate-500">{inst.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusUpdate(inst._id, 'approve')}>
                                            <Check className="h-4 w-4 mr-1" /> Approve
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleStatusUpdate(inst._id, 'reject')}>
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
                    <h3 className="text-lg font-medium text-slate-900">Approved Institutions</h3>
                </div>
                {approvedInstitutions.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">No approved institutions yet.</div>
                ) : (
                    <ul className="divide-y divide-slate-200">
                        {approvedInstitutions.map(inst => (
                            <li key={inst._id} className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Building className="h-10 w-10 text-primary mr-4" />
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-900">{inst.name}</h4>
                                            <p className="text-sm text-slate-500">{inst.email}</p>
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

export default SuperAdminDashboard;
