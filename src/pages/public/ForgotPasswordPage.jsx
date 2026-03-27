import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, ArrowLeft, Mail, Lock, KeyRound, ShieldCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP + New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (!email) return setError('Please enter your email address.');

        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to send OTP');

            setStep(2);
            setMessage('OTP sent! Check your server console for the code.');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!otp) return setError('Please enter the OTP.');
        if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
        if (newPassword !== confirmPassword) return setError('Passwords do not match.');

        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to reset password');

            alert('Password reset successfully! Please log in with your new password.');
            navigate('/login');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-800 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/" className="flex items-center justify-center space-x-3 mb-8 group">
                    <div className="bg-primary/10 p-2.5 rounded-2xl group-hover:rotate-12 transition-transform duration-300">
                        <GraduationCap className="h-8 w-8 text-primary" />
                    </div>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">EduSync</span>
                </Link>

                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                        <KeyRound className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                        Reset Password
                    </h2>
                    <p className="mt-3 text-slate-500 dark:text-gray-400 font-medium">
                        {step === 1
                            ? "Enter your email to receive a verification code"
                            : "Enter the OTP and your new password"
                        }
                    </p>
                </div>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
                <Card className="py-10 px-6 sm:px-12 border-none shadow-2xl shadow-slate-200/50">

                    {message && (
                        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 font-medium text-sm text-center">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Enter Email */}
                    {step === 1 && (
                        <form onSubmit={handleSendOtp} className="space-y-5">
                            <Input
                                label="Email Address"
                                type="email"
                                required
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12"
                            />

                            <Button
                                type="submit"
                                className="w-full h-14 text-lg shadow-lg shadow-primary/20 group"
                                isLoading={isLoading}
                            >
                                Send Verification Code
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </form>
                    )}

                    {/* Step 2: OTP + New Password */}
                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-600 dark:text-gray-300 text-center">
                                Sending OTP to <strong>{email}</strong>
                                <button
                                    type="button"
                                    onClick={() => { setStep(1); setMessage(''); setOtp(''); }}
                                    className="ml-2 text-primary font-semibold hover:underline"
                                >
                                    Change
                                </button>
                            </div>

                            <Input
                                label="Enter OTP"
                                type="text"
                                required
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="h-12 tracking-widest text-center font-mono text-lg"
                            />

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <Input
                                    label="New Password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
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

                            <Button
                                type="submit"
                                className="w-full h-14 text-lg shadow-lg shadow-primary/20 group"
                                isLoading={isLoading}
                            >
                                <ShieldCheck className="mr-2 h-5 w-5" />
                                Reset Password
                            </Button>
                        </form>
                    )}

                    <div className="mt-8 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to Sign In
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
