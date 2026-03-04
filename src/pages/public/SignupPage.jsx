import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, ArrowRight, User, BookOpen, Lock, Building } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const SignupPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [role, setRole] = useState('student');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [institutionId, setInstitutionId] = useState('');
    const [institutionsList, setInstitutionsList] = useState([]);

    useEffect(() => {
        if (role === 'teacher' && institutionsList.length === 0) {
            fetch(`${import.meta.env.VITE_API_URL}/auth/public/institutions`)
                .then(res => res.json())
                .then(data => setInstitutionsList(data))
                .catch(err => console.error("Failed to load institutions", err));
        }
    }, [role]);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const { role } = JSON.parse(userInfo);
            navigate(role === 'student' ? '/student' : '/teacher');
        }

        const roleParam = searchParams.get('role');
        if (roleParam === 'teacher') {
            setRole('teacher');
        } else {
            setRole('student');
        }
    }, [searchParams, navigate]);

    const handleSendOtp = async () => {
        setError('');
        if (!email) {
            return setError('Please enter an email address');
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send OTP');
            }

            setShowOtp(true);
            alert('OTP sent to your email (Check server console for now)');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (!showOtp || !otp) {
            return setError('Please verify your email with OTP');
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role,
                    otp,
                    institutionId: role === 'teacher' ? institutionId : undefined
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            // Save user data and token to localStorage
            localStorage.setItem('userInfo', JSON.stringify(data));

            // Redirect based on role or approval status
            if (data.approvalStatus === 'pending') {
                alert(data.message);
                navigate('/login');
            } else if (data.role === 'student') {
                navigate('/student');
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
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/" className="flex items-center justify-center space-x-3 mb-8 group">
                    <div className="bg-primary/10 p-2.5 rounded-2xl group-hover:rotate-12 transition-transform duration-300">
                        <GraduationCap className="h-8 w-8 text-primary" />
                    </div>
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">EduSync</span>
                </Link>
                <h2 className="text-center text-3xl font-extrabold text-slate-900">
                    Create Account
                </h2>
                <p className="mt-3 text-center text-slate-500 font-medium">
                    Start your learning journey today
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
                <Card className="py-10 px-6 sm:px-12 border-none shadow-2xl shadow-slate-200/50">
                    <div className="flex gap-4 mb-8">
                        {[
                            { id: 'student', icon: User, label: 'Student' },
                            { id: 'teacher', icon: BookOpen, label: 'Teacher' },
                            { id: 'institution', icon: Building, label: 'Institution' },
                        ].map((r) => (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => setRole(r.id)}
                                className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${role === r.id
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                                    }`}
                            >
                                <r.icon className="h-6 w-6 mb-2" />
                                <span className="font-bold text-xs uppercase tracking-widest">{r.label}</span>
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div
                            className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium"
                        >
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <Input
                            label="Full Name / Inst. Name"
                            type="text"
                            required
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-12"
                        />

                        {role === 'teacher' && (
                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-slate-700">
                                    Institution <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={institutionId}
                                    onChange={(e) => setInstitutionId(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                >
                                    <option value="">Select an institution</option>
                                    {institutionsList.map(inst => (
                                        <option key={inst._id} value={inst._id}>{inst.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex items-end gap-2">
                            <div className="flex-1">
                                <Input
                                    label="Email Address"
                                    type="email"
                                    required
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12"
                                    disabled={showOtp}
                                />
                            </div>
                            {!showOtp && (
                                <Button
                                    type="button"
                                    onClick={handleSendOtp}
                                    isLoading={isLoading && !showOtp}
                                    className="h-12 w-32 mb-[2px]" // Align with input
                                >
                                    Send OTP
                                </Button>
                            )}
                        </div>

                        {showOtp && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <Input
                                    label="Enter OTP"
                                    type="text"
                                    required
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="h-12 tracking-widest text-center font-mono text-lg"
                                />
                                <p className="text-xs text-slate-500 mt-1 text-center">
                                    Check your server console for the code
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Input
                                label="Password"
                                type="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12"
                            />

                            <Input
                                label="Confirm"
                                type="password"
                                required
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="h-12"
                            />
                        </div>

                        {showOtp && (
                            <Button
                                type="submit"
                                className="w-full h-14 text-lg shadow-lg shadow-primary/20 group mt-4"
                                isLoading={isLoading}
                            >
                                Create {role.charAt(0).toUpperCase() + role.slice(1)} Account
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        )}
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            Already have an account?{' '}
                            <Link to={`/login?role=${role}`} className="text-primary font-bold hover:underline">
                                Sign in instead
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SignupPage;