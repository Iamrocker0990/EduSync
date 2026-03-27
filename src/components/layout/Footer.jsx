import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center space-x-2 mb-4">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <GraduationCap className="h-6 w-6 text-primary" />
                            </div>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">EduSync</span>
                        </Link>
                        <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed">
                            Empowering learners and educators with a seamless, interactive platform for modern education.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-slate-500 dark:text-gray-400">
                            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                            <li><Link to="/courses" className="hover:text-primary transition-colors">Courses</Link></li>
                            <li><Link to="/features" className="hover:text-primary transition-colors">Features</Link></li>
                            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Support</h3>
                        <ul className="space-y-2 text-sm text-slate-500 dark:text-gray-400">
                            <li><Link to="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
                            <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Contact Us</h3>
                        <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-gray-400 mb-4">
                            <Mail className="h-4 w-4" />
                            <span>support@edusync.com</span>
                        </div>
                        <div className="flex space-x-4">
                            <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></a>
                            <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
                            <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></a>
                            <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Linkedin className="h-5 w-5" /></a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-8 text-center text-sm text-slate-400">
                    <p>&copy; {new Date().getFullYear()} EduSync. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
