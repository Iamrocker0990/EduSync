import React from 'react';
import { Construction, Rocket } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

const ComingSoon = ({ title, message = "We're working hard to bring you this feature. Stay tuned!" }) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in fade-in zoom-in duration-500">
            <div className="bg-primary/10 p-6 rounded-full mb-6">
                <Rocket className="h-16 w-16 text-primary animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{title || 'Updates Coming Soon'}</h2>
            <p className="text-slate-500 dark:text-gray-400 max-w-md mb-8 text-lg">
                {message}
            </p>
            <div className="flex gap-4">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
                <Button onClick={() => navigate('/student')}>
                    Return to Dashboard
                </Button>
            </div>
        </div>
    );
};

export default ComingSoon;
