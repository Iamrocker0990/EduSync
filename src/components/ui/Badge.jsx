import React from 'react';

const Badge = ({ children, variant = 'primary', className = '' }) => {
    const variants = {
        primary: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light',
        success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        warning: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-gray-200 dark:bg-slate-800 dark:text-slate-400',

    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
