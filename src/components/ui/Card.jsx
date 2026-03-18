import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', onClick }) => {
    return (
        <motion.div
            className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow duration-200 ${className}`}
            onClick={onClick}
        >

            {children}
        </motion.div>
    );
};

export default Card;
