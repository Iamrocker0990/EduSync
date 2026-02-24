import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const AdminLogin = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Redirect if already logged in as admin
        const userInfo = localStorage.getItem('userInfo');
        const token = localStorage.getItem('token');
        if (userInfo && token) {
            try {
                const user = JSON.parse(userInfo);
                if (user.role === 'admin') navigate('/admin');
            } catch (e) {
                // Invalid data, ignore
            }
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    role: 'admin' // Enforce admin role
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            if (data.role !== 'admin') {
                throw new Error('Unauthorized access. Admin privileges required.');
            }

            // Save user data and token to localStorage
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);

            // Redirect to Admin Dashboard
            navigate('/admin');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-600/20 p-3 rounded-xl">
                        <Shield className="h-10 w-10 text-blue-500" />
                    </div>
                </div>
                <h2 className="text-center text-3xl font-bold text-white">
                    Admin Portal
                </h2>
                <p className="mt-2 text-center text-sm text-slate-400">
                    Restricted access for authorized personnel only
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Card className="py-8 px-4 shadow-xl bg-slate-800 border-slate-700 sm:rounded-xl sm:px-10">
                    {error && (
                        <div className="mb-6 p-4 bg-red-900/30 border border-red-800/50 text-red-400 rounded-lg text-sm flex items-start">
                            <AlertCircle className="h-5 w-5 mr-2 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-slate-600"
                                placeholder="admin@edusync.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-slate-600"
                                    placeholder="••••••••"
                                />
                                <Lock className="absolute right-3 top-3.5 h-5 w-5 text-slate-500" />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full flex justify-center bg-blue-600 hover:bg-blue-700 text-white border-none py-3"
                            isLoading={isLoading}
                        >
                            Access Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </form>
                </Card>

                <p className="mt-6 text-center text-xs text-slate-500">
                    Secure Admin Authentication System v1.0
                </p>
                <div className="mt-4 text-center">
                    <Link to="/login" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                        ← Back to Standard Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
