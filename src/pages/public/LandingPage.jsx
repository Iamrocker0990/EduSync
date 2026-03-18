import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import courseService from '../../services/courseService';
import { BookOpen, Users, User, CheckCircle, Video, BarChart2, MessageCircle, Shield, ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import HeroOrbit from '../../components/ui/HeroOrbit';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        },
    },
};

const LandingPage = () => {
    const [featuredCourses, setFeaturedCourses] = useState([]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await courseService.getAllApprovedCourses();
                // Take top 4 or random 4
                setFeaturedCourses(data.slice(0, 4));
            } catch (error) {
                console.error("Failed to fetch featured courses", error);
            }
        };
        fetchCourses();
    }, []);
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 selection:bg-primary/10 transition-colors duration-300">

            <Navbar />

            {/* Hero Section */}
            <section id="home" className="relative pt-32 pb-32 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-indigo-50/40 dark:from-primary/10 via-background dark:via-slate-950 to-background dark:to-slate-950">
                {/* Abstract Top-Right Glow */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[600px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>


                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="max-w-2xl"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1, duration: 0.4 }}
                                className="inline-flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full text-secondary-light dark:text-slate-400 text-sm font-medium mb-8 shadow-sm"
                            >

                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                <span>EdTech reimagined for everyone</span>
                            </motion.div>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-secondary dark:text-white leading-[1.1] mb-6 tracking-tight">
                                Learn smarter, <br />

                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">
                                    grow together.
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-secondary-light dark:text-slate-400 mb-10 leading-relaxed max-w-xl">
                                A minimal, powerful platform for interactive courses and live mentoring that puts your learning experience first.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/signup?role=student" className="group">
                                    <Button size="lg" className="w-full sm:w-auto rounded-xl bg-primary hover:bg-primary-hover shadow-sm hover:shadow-md transition-all text-base px-8">
                                        Start Learning
                                    </Button>
                                </Link>
                                <Link to="/signup?role=teacher">
                                    <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-xl border-slate-200 dark:border-slate-800 text-secondary dark:text-white hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all text-base px-8">
                                        Become an Instructor
                                    </Button>
                                </Link>

                            </div>
                        </motion.div>

                        {/* Animated SaaS Atomic Orbit */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            className="relative w-full flex justify-end z-20 hidden lg:flex"
                        >
                            <HeroOrbit />
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-background dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={containerVariants}
                        className="text-center mb-20 md:mb-28"
                    >
                        <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-extrabold text-secondary dark:text-white tracking-tight mb-6">
                            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">succeed</span>
                        </motion.h2>
                        <motion.p variants={itemVariants} className="text-xl text-secondary-light dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            A simpler way to manage your entire education ecosystem without the visual clutter.
                        </motion.p>
                    </motion.div>


                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={containerVariants}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16"
                    >
                        {[
                            { icon: BookOpen, title: 'Smart Dashboard', desc: 'A unified view of your courses, assignments, and learning milestones.' },
                            { icon: Users, title: 'Instructor Hub', desc: 'Powerful tools to create content, manage students, and track results.' },
                            { icon: Video, title: 'Live Mentoring', desc: 'Face-to-face interactive sessions with industry experts in real-time.' },
                            { icon: BarChart2, title: 'Visual Progress', desc: 'Real-time analytics to help you deeply understand your learning journey.' },
                            { icon: MessageCircle, title: 'AI Study Buddy', desc: 'A 24/7 AI tutor readily available to help you solve complex problems.' },
                            { icon: Shield, title: 'Built for Trust', desc: 'Enterprise-grade security ensuring your personal data remains private.' },
                        ].map((feature, index) => (
                            <motion.div key={index} variants={itemVariants}>
                                <div className="group p-8 rounded-3xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-400 ease-out hover:shadow-md hover:-translate-y-1 border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                    <div className="bg-primary/5 dark:bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 dark:group-hover:bg-primary/20 transition-colors">
                                        <feature.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                                    </div>

                                    <h3 className="text-xl font-bold text-secondary dark:text-white mb-3 tracking-tight">{feature.title}</h3>
                                    <p className="text-secondary-light dark:text-slate-400 leading-relaxed line-clamp-2">{feature.desc}</p>

                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Popular Courses Section */}
            <section id="courses" className="py-24 bg-white dark:bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-6">
                        <div className="text-center md:text-left">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-secondary dark:text-white mb-4 tracking-tight">Featured Courses</h2>
                            <p className="text-xl text-secondary-light dark:text-slate-400">Pick from our library of curated high-quality content.</p>
                        </div>

                        <Link to="/courses" className="flex items-center text-primary font-medium hover:text-primary-hover group transition-colors">
                            Explore Catalog <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuredCourses.length > 0 ? (
                            featuredCourses.map((course, index) => (
                                <motion.div
                                    key={course._id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="group bg-white dark:bg-slate-900 rounded-[1.5rem] p-4 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.03] border border-slate-100 dark:border-slate-800 cursor-pointer h-full flex flex-col">
                                        <div className="relative h-48 overflow-hidden rounded-xl mb-6">

                                            <img
                                                src={course.thumbnail || 'https://via.placeholder.com/800x600'}
                                                alt={course.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                            />
                                            <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-secondary dark:text-white shadow-sm uppercase tracking-wider">
                                                {course.level || 'All Levels'}
                                            </div>

                                        </div>
                                        <div className="flex flex-col flex-1 pb-2 px-2">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">{course.category || 'General'}</div>
                                                {course.duration && (
                                                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                        <Clock className="w-3 h-3 mr-1 text-slate-400 dark:text-slate-500" />
                                                        {course.duration}
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-bold text-secondary dark:text-white mb-3 group-hover:text-primary transition-colors leading-snug line-clamp-2">{course.title}</h3>

                                            <div className="mt-auto pt-4 flex items-center text-primary text-sm font-medium group-hover:text-primary-hover transition-colors">
                                                Explore Course <ArrowRight className="ml-1.5 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-4 py-20 text-center">
                                <p className="text-secondary-light dark:text-slate-400 text-lg">No courses available at the moment. Check back soon!</p>
                            </div>

                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="contact" className="py-24 md:py-32 bg-gradient-to-b from-white dark:from-slate-950 to-indigo-50/30 dark:to-slate-900/50 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>


                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-extrabold text-secondary dark:text-white tracking-tight mb-6">
                            Ready to transform your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">learning journey?</span>
                        </h2>
                        <p className="text-xl text-secondary-light dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Join thousands of students and instructors who are already experiencing the future of education with EduSync.
                        </p>

                        <div className="flex justify-center">
                            <Link to="/signup?role=student">
                                <Button size="lg" className="rounded-xl h-14 px-10 text-lg bg-primary hover:bg-primary-hover shadow-md hover:shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 border-none">
                                    Get Started for Free
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
