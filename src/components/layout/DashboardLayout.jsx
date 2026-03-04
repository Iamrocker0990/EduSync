import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Bell, Search, LogOut, Settings } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import { studentSidebarItems, teacherSidebarItems, adminSidebarItems, superadminSidebarItems, institutionSidebarItems } from '../../config/sidebarConfig';

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

const DashboardLayout = ({ children, sidebarItems, userType, title }) => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [user, setUser] = useState(getUserFromStorage());

    useEffect(() => {
        const handleUserUpdate = () => {
            setUser(getUserFromStorage());
        };
        window.addEventListener('userUpdated', handleUserUpdate);
        return () => window.removeEventListener('userUpdated', handleUserUpdate);
    }, []);

    let defaultDisplayName = 'User';
    let defaultInitials = 'US';

    if (userType === 'student') {
        defaultDisplayName = 'Student';
        defaultInitials = 'ST';
    } else if (userType === 'teacher') {
        defaultDisplayName = 'Teacher';
        defaultInitials = 'TC';
    } else if (userType === 'admin') {
        defaultDisplayName = 'Admin';
        defaultInitials = 'AD';
    } else if (userType === 'superadmin') {
        defaultDisplayName = 'Super Admin';
        defaultInitials = 'SA';
    } else if (userType === 'institution') {
        defaultDisplayName = 'Institution';
        defaultInitials = 'IN';
    }

    const displayName = user?.name || defaultDisplayName;
    const initials = getInitials(user?.name) || defaultInitials;

    let defaultSidebarItems;
    if (userType === 'student') {
        defaultSidebarItems = studentSidebarItems;
    } else if (userType === 'admin') {
        defaultSidebarItems = adminSidebarItems;
    } else if (userType === 'superadmin') {
        defaultSidebarItems = superadminSidebarItems;
    } else if (userType === 'institution') {
        defaultSidebarItems = institutionSidebarItems;
    } else {
        defaultSidebarItems = teacherSidebarItems;
    }

    const items = sidebarItems || defaultSidebarItems;

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        navigate('/login');
    };

    /* Close dropdown when clicking outside */
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50/50">
            <header
                className="bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 sticky top-0 z-40"
            >
                <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <Link to="/" className="flex items-center space-x-2 group">
                            <div className="bg-primary/10 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                                <GraduationCap className="h-6 w-6 text-primary" />
                            </div>
                            <span className="text-xl font-bold text-slate-900">
                                EduSync
                            </span>
                        </Link>
                        <div className="hidden md:flex items-center space-x-4 pl-8 h-6">
                            <h1 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                                {title}
                            </h1>
                        </div>
                    </div>

                    <div className="flex-1 max-w-md mx-8 hidden md:block">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder={`Search anything...`}
                                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-slate-50/50 focus:bg-white"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button className="relative p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                        </button>

                        {/* Avatar Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setOpen(!open)}
                                className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                            >
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-primary/20">
                                    {initials}
                                </div>
                                <div className="hidden lg:flex flex-col items-start text-left">
                                    <span className="text-sm font-bold text-slate-900 leading-none mb-1">
                                        {displayName.split(' ')[0]}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                        {user?.role || userType}
                                    </span>
                                </div>
                            </button>

                            <AnimatePresence>
                                {open && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden"
                                    >
                                        <div className="px-4 py-3 border-b border-slate-50 mb-1 bg-slate-50/50">
                                            <p className="text-sm font-bold text-slate-900 truncate">
                                                {displayName}
                                            </p>
                                            <p className="text-xs font-medium text-slate-500 truncate">
                                                {user?.email}
                                            </p>
                                        </div>

                                        <Link
                                            to={`/${userType}/settings`}
                                            className="flex items-center px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-primary/5 hover:text-primary transition-colors"
                                        >
                                            <Settings className="h-4 w-4 mr-3 opacity-70" />
                                            Account Settings
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4 mr-3 opacity-70" />
                                            Sign Out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </header>

            <div className="w-full px-4 sm:px-6 lg:px-8 flex">
                <Sidebar items={items} userType={userType} />
                <main className="flex-1 py-8 md:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
