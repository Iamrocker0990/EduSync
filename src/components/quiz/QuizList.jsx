import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { HelpCircle, PlayCircle, List, Plus } from 'lucide-react';

const QuizList = ({ quizzes, userType, startQuiz, setView }) => {
    if (quizzes.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 dark:text-gray-400 mx-auto mb-4">
                    <HelpCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">No quizzes yet</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">Get started by creating your first quiz.</p>
                <Button onClick={() => setView('add')}>Create Quiz</Button>

            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
                <Card key={quiz._id} className="hover:border-primary transition-colors cursor-pointer group">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{quiz.title}</h3>
                            <Badge variant="neutral">{quiz.questions.length} Qs</Badge>
                        </div>
                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-6 space-x-4">
                            <span>{quiz.timeLimit} mins</span>
                            <span>•</span>

                            <span>{quiz.totalMarks || 100} Marks</span>
                        </div>

                        {userType === 'student' ? (
                            <Button
                                className="w-full"
                                onClick={() => window.location.href = `/student/quiz/${quiz._id}`}
                            >
                                <PlayCircle className="h-4 w-4 mr-2" /> Take Quiz
                            </Button>
                        ) : (
                            <Button className="w-full" variant="outline" onClick={() => startQuiz(quiz)}>
                                <PlayCircle className="h-4 w-4 mr-2" /> Preview Quiz
                            </Button>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default QuizList;
