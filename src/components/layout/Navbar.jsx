import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import ThemeToggle from '../ThemeToggle';


const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isScrolled, setIsScrolled] = React.useState(false);
    const location = useLocation();

    const [userInfo, setUserInfo] = React.useState(() => {
        const userInfoString = localStorage.getItem('userInfo');
        return userInfoString ? JSON.parse(userInfoString) : null;
    });

    React.useEffect(() => {
        const handleUserUpdate = () => {
            const userInfoString = localStorage.getItem('userInfo');
            setUserInfo(userInfoString ? JSON.parse(userInfoString) : null);
        };
        window.addEventListener('userUpdated', handleUserUpdate);
        return () => window.removeEventListener('userUpdated', handleUserUpdate);
    }, []);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Hide navbar on dashboard pages
    if (location.pathname.startsWith('/student') || location.pathname.startsWith('/teacher') || location.pathname.startsWith('/institution') || location.pathname.startsWith('/superadmin') || location.pathname.startsWith('/admin')) {
        return null;
    }

    const getDashboardLink = (role) => {
        if (role === 'admin' || role === 'superadmin') return '/superadmin';
        if (role === 'institution') return '/institution';
        if (role === 'student') return '/student';
        return '/teacher';
    };

    const scrollToSection = (e, targetId) => {
        e.preventDefault();

        // If we are not on the home page, we should navigate to home first, then scroll. 
        // For simplicity now, let's just assume we are on home or use basic behavior
        if (location.pathname !== '/') {
            window.location.href = `/#${targetId}`;
            return;
        }

        if (targetId === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setIsMenuOpen(false);
    };

    return (
        <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ease-in-out ${isScrolled ? 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm py-2' : 'bg-transparent border-transparent py-4'
            }`}>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" onClick={(e) => scrollToSection(e, 'home')} className="flex items-center space-x-3 group cursor-pointer">
                            <div className="bg-primary/10 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                                <GraduationCap className="h-6 w-6 text-primary" />
                            </div>
                            <span className="text-xl font-bold text-secondary dark:text-white tracking-tight">EduSync</span>
                        </Link>

                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-10">
                        <div className="flex items-center space-x-8">
                            {['Features', 'Courses', 'Contact'].map((item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    onClick={(e) => scrollToSection(e, item.toLowerCase())}
                                    className="text-sm font-medium text-secondary-light dark:text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                >

                                    {item}
                                </a>
                            ))}
                        </div>

                        <div className="flex items-center space-x-4 border-l border-slate-200 dark:border-slate-800 pl-8">
                            {userInfo ? (
                                <>
                                    <Link to={getDashboardLink(userInfo.role)}>
                                        <Button size="md" className="rounded-xl shadow-sm hover:shadow-md">Dashboard</Button>
                                    </Link>
                                    <div className="flex items-center">
                                        <ThemeToggle />
                                    </div>
                                </>
                            ) : (

                                <>
                                    <Link to="/login">
                                        <button className="text-sm font-medium text-secondary dark:text-white hover:text-primary transition-colors px-4">Log In</button>
                                    </Link>

                                    <Link to="/signup">
                                        <Button size="md" className="rounded-xl shadow-sm hover:shadow-md">Join Free</Button>
                                    </Link>
                                    <div className="flex items-center">
                                        <ThemeToggle />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>


                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-secondary-light dark:text-slate-400 hover:text-primary bg-slate-50 dark:bg-slate-800 rounded-xl transition-all"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-hidden shadow-lg absolute w-full"
                    >
                        <div className="flex flex-col space-y-4 px-6 py-8">
                            {['Features', 'Courses', 'Contact'].map((item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    onClick={(e) => scrollToSection(e, item.toLowerCase())}
                                    className="text-lg font-medium text-secondary dark:text-white hover:text-primary transition-colors"
                                >
                                    {item}
                                </a>
                            ))}

                            <div className="flex flex-col space-y-3 pt-6 border-t border-slate-100">
                                {userInfo ? (
                                    <>
                                        <Link to={getDashboardLink(userInfo.role)} onClick={() => setIsMenuOpen(false)}>
                                            <Button className="w-full h-12 text-md rounded-xl">Dashboard</Button>
                                        </Link>
                                        <div className="flex justify-center pt-2">
                                            <ThemeToggle />
                                        </div>
                                    </>
                                ) : (

                                    <>
                                        <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                            <Button variant="secondary" className="w-full h-12 text-md rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800 dark:text-white">Log In</Button>
                                        </Link>

                                        <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                                            <Button className="w-full h-12 text-md rounded-xl">Join Free</Button>
                                        </Link>
                                        <div className="flex justify-center pt-2">
                                            <ThemeToggle />
                                        </div>
                                    </>
                                )}
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
