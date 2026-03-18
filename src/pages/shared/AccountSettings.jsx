import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';

const AccountSettings = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const userInfoString = localStorage.getItem('userInfo');
        if (userInfoString) {
            try {
                const user = JSON.parse(userInfoString);
                setName(user.name || '');
                setEmail(user.email || '');
            } catch (err) {
                console.error("Error parsing user info:", err);
            }
        }
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
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name: name.trim() })
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
            const userInfoString = localStorage.getItem('userInfo');
            if (userInfoString) {
                const user = JSON.parse(userInfoString);
                const updatedUser = { ...user, name: data.name };
                localStorage.setItem('userInfo', JSON.stringify(updatedUser));

                // If token was refreshed, valid to update it here
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }

                // Dispatch event to trigger UI updates without reload
                window.dispatchEvent(new Event('userUpdated'));
            }

            setMessage('Profile updated successfully!');
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
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
