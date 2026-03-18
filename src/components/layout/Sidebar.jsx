import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const getUserFromStorage = () => {
    const userInfoString = localStorage.getItem('userInfo');
    if (!userInfoString) return null;

    try {
        return JSON.parse(userInfoString);
    } catch {
        localStorage.removeItem('userInfo');
        return null;
    }
};

const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Sidebar = ({ items, userType }) => {
    const [user, setUser] = React.useState(getUserFromStorage());

    React.useEffect(() => {
        const handleUserUpdate = () => {
            setUser(getUserFromStorage());
        };
        window.addEventListener('userUpdated', handleUserUpdate);
        return () => window.removeEventListener('userUpdated', handleUserUpdate);
    }, []);

    const displayName = user?.name || (userType === 'student' ? 'Student' : 'Teacher');
    const initials = getInitials(user?.name) || (userType === 'student' ? 'ST' : 'TC');

    return (
        <aside className="w-64 hidden md:flex flex-col h-[calc(100vh-4rem)] sticky top-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-colors duration-300">

            <div className="p-6 h-full flex flex-col">
                <div
                    className="flex items-center space-x-4 mb-10 p-2 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl ring-1 ring-slate-100 dark:ring-slate-800"
                >

                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate text-sm leading-tight">
                            {displayName}
                        </p>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{userType}</p>
                    </div>

                </div>

                <nav className="space-y-1 flex-1">
                    {items.map((item, index) => (
                        <div
                            key={item.href}
                        >
                            <NavLink
                                to={item.href}
                                end={item.href === `/student` || item.href === `/teacher`}
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25 font-bold'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium'
                                    }`
                                }

                            >
                                <item.icon className="h-5 w-5" />
                                <span className="text-sm">{item.label}</span>
                            </NavLink>
                        </div>
                    ))}
                </nav>


            </div>
        </aside>
    );
};

export default Sidebar;
