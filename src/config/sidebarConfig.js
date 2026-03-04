import { BookOpen, Video, FileText, BarChart2, Award, MessageCircle, Settings, LayoutDashboard, PlusCircle, Upload, Users, FileBarChart, Search, Shield } from 'lucide-react';

export const studentSidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/student' },
    { icon: Search, label: 'Browse Courses', href: '/student/catalog' }, // New Link
    { icon: BookOpen, label: 'My Learning', href: '/student/learn' },   // Updated Link
    { icon: FileText, label: 'Assignments', href: '/student/assignments' },
    { icon: Video, label: 'Live Classes', href: '/student/live-classes' },
    { icon: BarChart2, label: 'Progress', href: '/student/progress' },
    { icon: MessageCircle, label: 'Messages', href: '/student/messages' },
    { icon: Settings, label: 'Settings', href: '/student/settings' },
];

export const teacherSidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/teacher' },
    { icon: BookOpen, label: 'My Courses', href: '/teacher/courses' },
    { icon: PlusCircle, label: 'Create Course', href: '/teacher/create-course' },
    { icon: FileText, label: 'Assignments', href: '/teacher/assignments' },
    { icon: Award, label: 'Quizzes', href: '/teacher/quizzes' },
    { icon: Users, label: 'Students', href: '/teacher/students' },
    { icon: FileBarChart, label: 'Reports', href: '/teacher/reports' },
    { icon: MessageCircle, label: 'Messages', href: '/teacher/messages' },
];

export const adminSidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
];

export const superadminSidebarItems = [
    { icon: Shield, label: 'Dashboard', href: '/superadmin' },
];

export const institutionSidebarItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/institution' },
    { icon: Users, label: 'Manage Teachers', href: '/institution/teachers' },
    { icon: BookOpen, label: 'Pending Courses', href: '/institution/courses' },
];
