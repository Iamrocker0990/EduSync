import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import AddQuestion from './AddQuestion';
import { Save } from 'lucide-react';

const QuizForm = ({ currentQuiz, setCurrentQuiz, handleAddQuestion, handleSaveQuiz }) => {
    return (
        <div className="space-y-8 animate-in slide-in-from-right fade-in duration-300">
            <Card className="p-8 border-t-4 border-t-primary">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b pb-2">Quiz Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-200 mb-1.5">Quiz Title *</label>
                        <input
                            type="text"
                            placeholder="e.g. Weekly Assessment 1"
                            value={currentQuiz.title}
                            onChange={(e) => setCurrentQuiz({ ...currentQuiz, title: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 text-slate-700 dark:text-gray-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-200 mb-1.5">Time Limit (Minutes)</label>
                        <input
                            type="number"
                            value={currentQuiz.timeLimit}
                            onChange={(e) => setCurrentQuiz({ ...currentQuiz, timeLimit: parseInt(e.target.value) })}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 text-slate-700 dark:text-gray-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-200 mb-1.5">Total Marks</label>
                        <input
                            type="number"
                            value={currentQuiz.totalMarks}
                            onChange={(e) => setCurrentQuiz({ ...currentQuiz, totalMarks: parseInt(e.target.value) })}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 text-slate-700 dark:text-gray-200"
                        />
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <AddQuestion onAddQuestion={handleAddQuestion} />
                </div>

                <div className="space-y-6">
                    <Card className="p-6 sticky top-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 dark:text-white">Summary</h3>
                            <Badge>{currentQuiz.questions.length} Questions</Badge>
                        </div>

                        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto pr-2">
                            {currentQuiz.questions.map((q, idx) => (
                                <div key={idx} className="text-sm p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-800 truncate">
                                    <span className="font-bold mr-2">{idx + 1}.</span> {q.question}
                                </div>
                            ))}
                            {currentQuiz.questions.length === 0 && (
                                <p className="text-sm text-slate-400 italic">No questions added yet.</p>
                            )}
                        </div>

                        <Button
                            onClick={handleSaveQuiz}
                            className="w-full"
                            disabled={currentQuiz.questions.length === 0}
                        >
                            <Save className="h-4 w-4 mr-2" /> Save & Publish
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default QuizForm;
