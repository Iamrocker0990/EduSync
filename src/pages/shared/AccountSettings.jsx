import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Briefcase, GraduationCap, Link as LinkIcon, Award } from 'lucide-react';

const AccountSettings = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Teacher qualification fields
    const [experienceYears, setExperienceYears] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [portfolioLink, setPortfolioLink] = useState('');
    const [certifications, setCertifications] = useState('');

    useEffect(() => {
        const userInfoString = localStorage.getItem('userInfo');
        if (userInfoString) {
            try {
                const user = JSON.parse(userInfoString);
                setName(user.name || '');
                setEmail(user.email || '');
                setRole(user.role || '');
            } catch (err) {
                console.error("Error parsing user info:", err);
            }
        }

        // Fetch full profile from API (includes teacher fields)
        const fetchProfile = async () => {
            try {
                const userInfoString = localStorage.getItem('userInfo');
                if (!userInfoString) return;
                const { token } = JSON.parse(userInfoString);

                const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setExperienceYears(data.experienceYears || '');
                    setSpecialization(data.specialization || '');
                    setPortfolioLink(data.portfolioLink || '');
                    setCertifications(data.certifications || '');
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (name.trim().length < 3) {
            setError('Username must be at least 3 characters long.');
            return;
        }

        try {
            setIsLoading(true);
            const userInfoString = localStorage.getItem('userInfo');
            if (!userInfoString) return;
            const { token } = JSON.parse(userInfoString);

            const body = { name: name.trim() };

            // Include teacher fields if teacher
            if (role === 'teacher') {
                body.experienceYears = experienceYears;
                body.specialization = specialization;
                body.portfolioLink = portfolioLink;
                body.certifications = certifications;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            let data;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await response.json();
            } else {
                const text = await response.text();
                throw new Error(text || 'Server returned an invalid response');
            }

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            // Update local storage
            const currentUser = JSON.parse(localStorage.getItem('userInfo'));
            const updatedUser = { ...currentUser, name: data.name };
            if (data.token) updatedUser.token = data.token;
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            if (data.token) localStorage.setItem('token', data.token);

            window.dispatchEvent(new Event('userUpdated'));
            setMessage('Profile updated successfully!');
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-6">
            {/* Profile Settings Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Profile Settings</h2>

                {message && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 font-medium">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                            placeholder="Enter your username"
                            disabled={isLoading}
                        />

                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Email <span className="text-slate-400 font-normal">(Cannot be changed)</span>
                        </label>
                        <input
                            type="email"
                            value={email}
                            disabled
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium"
                        />
                    </div>

                    {/* Teacher Qualifications Section */}
                    {role === 'teacher' && (
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                    <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Teacher Qualifications</h3>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                                This information will be automatically linked to every course you create.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-slate-400" /> Years of Experience</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={experienceYears}
                                        onChange={(e) => setExperienceYears(e.target.value)}
                                        min="0"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                                        placeholder="e.g. 5"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        <span className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-slate-400" /> Specialization</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={specialization}
                                        onChange={(e) => setSpecialization(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                                        placeholder="e.g. Full Stack Development"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        <span className="flex items-center gap-1.5"><LinkIcon className="h-3.5 w-3.5 text-slate-400" /> Portfolio Link</span>
                                    </label>
                                    <input
                                        type="url"
                                        value={portfolioLink}
                                        onChange={(e) => setPortfolioLink(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                                        placeholder="https://yourportfolio.com"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        <span className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-slate-400" /> Certifications</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={certifications}
                                        onChange={(e) => setCertifications(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                                        placeholder="e.g. AWS Certified, Google Cloud Professional"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex items-center gap-4">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className={`px-8 py-3 rounded-xl shadow-lg shadow-primary/20 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccountSettings;
