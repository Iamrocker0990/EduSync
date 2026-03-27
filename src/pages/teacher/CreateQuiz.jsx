import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import QuizModule from '../../components/quiz/QuizModule';

const CreateQuiz = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    return (
        <DashboardLayout role="teacher">
            <div className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:text-gray-200 mb-4 flex items-center"
                >
                    &larr; Back
                </button>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Quiz for Course</h1>
                <p className="text-slate-500 dark:text-gray-400">Add a new quiz to your course curriculum.</p>
            </div>

            <QuizModule userType="teacher" courseId={courseId} />
        </DashboardLayout>
    );
};

export default CreateQuiz;
