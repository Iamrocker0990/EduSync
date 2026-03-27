import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, Mail, Lock, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const LoginPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [role, setRole] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [institutionId, setInstitutionId] = useState('');
    const [institutionsList, setInstitutionsList] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (role === 'teacher' && institutionsList.length === 0) {
            fetch(`${import.meta.env.VITE_API_URL}/auth/public/institutions`)
                .then(res => res.json())
                .then(data => setInstitutionsList(data))
                .catch(err => console.error("Failed to load institutions", err));
        }
    }, [role]);

    useEffect(() => {
        // Redirect if already logged in
        const userInfo = localStorage.getItem('userInfo');
        const token = localStorage.getItem('token');
        if (userInfo && token) {
            const user = JSON.parse(userInfo);
            if (user.role === 'student') navigate('/student');
            else if (user.role === 'teacher') navigate('/teacher');
            else if (user.role === 'institution') navigate('/institution');
            else if (user.role === 'superadmin' || user.role === 'admin') navigate('/superadmin');
        }

        const roleParam = searchParams.get('role');
        if (roleParam === 'teacher') {
            setRole('teacher');
        } else if (roleParam === 'institution') {
            setRole('institution');
        } else if (roleParam === 'student') {
            setRole('student');
        }
    }, [searchParams, navigate]);

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
                    role,
                    institutionId: role === 'teacher' ? institutionId : undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Invalid email or password');
            }

            // Save user data and token to localStorage
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);

            // Redirect based on role
            // Use the role from the backend response to ensure consistency
            if (data.role === 'student') {
                navigate('/student');
            } else if (data.role === 'institution') {
                navigate('/institution');
            } else {
                navigate('/teacher');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <GraduationCap className="h-8 w-8 text-primary" />
                    </div>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">EduSync</span>
                </Link>

                <h2 className="mt-6 text-center text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                    Welcome back
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                    Sign in to your account to continue
                </p>

            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="flex rounded-md bg-slate-100 dark:bg-slate-800 p-1 mb-6">
                        <button
                            type="button"
                            onClick={() => setRole('student')}
                            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${role === 'student'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white dark:hover:text-slate-300'
                                }`}
                        >

                            Student
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('teacher')}
                            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${role === 'teacher'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white dark:hover:text-slate-300'
                                }`}
                        >

                            Teacher
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('institution')}
                            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${role === 'institution'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-white dark:hover:text-slate-300'
                                }`}
                        >

                            Institution
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <Input
                            label="Email address"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />

                        {role === 'teacher' && (
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Institution <span className="text-red-500">*</span>
                                </label>

                                <select
                                    required
                                    value={institutionId}
                                    onChange={(e) => setInstitutionId(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                >

                                    <option value="">Select an institution</option>
                                    {institutionsList.map(inst => (
                                        <option key={inst._id} value={inst._id}>{inst.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <Input
                                label="Password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                            <div className="flex items-center justify-end mt-1">
                                <div className="text-sm">
                                    <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-hover">
                                        Forgot your password?
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full flex justify-center"
                            isLoading={isLoading}
                        >
                            Sign in as {role.charAt(0).toUpperCase() + role.slice(1)} <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">
                                    Don't have an account?
                                </span>
                            </div>
                        </div>


                        <div className="mt-6">
                            <Link to={`/signup?role=${role}`}>
                                <Button variant="outline" className="w-full">
                                    Create new account
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="mt-6 text-center">
                        <Link to="/admin/login" className="text-xs text-slate-400 hover:text-slate-600 dark:text-gray-300 transition-colors">
                            Admin Access
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;