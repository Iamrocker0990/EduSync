import React, { useState, useEffect } from 'react';
import Quiz from './Quiz';
import { Plus, List } from 'lucide-react';
import QuizList from './QuizList';
import QuizForm from './QuizForm';
import Button from '../ui/Button';

const QuizModule = ({ userType = 'student', courseId = null, initialView = 'list' }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState({ title: '', questions: [], timeLimit: 30, totalMarks: 100 });
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [view, setView] = useState(initialView); // 'list', 'add', 'quiz'

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = courseId
        ? `${import.meta.env.VITE_API_URL}/quiz/course/${courseId}`
        : `${import.meta.env.VITE_API_URL}/quiz/mine`;

      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      setQuizzes(data);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

  const handleAddQuestion = (question) => {
    setCurrentQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, question],
    }));
  };

  const handleSaveQuiz = async () => {
    if (!currentQuiz.title || currentQuiz.questions.length === 0) {
      alert("Please provide a title and at least one question");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...currentQuiz, courseId }),
      });
      if (response.ok) {
        alert("Quiz saved successfully!");
        setCurrentQuiz({ title: '', questions: [], timeLimit: 30, totalMarks: 100 });
        setView('list');
        fetchQuizzes();
      } else {
        const err = await response.json();
        alert(`Error: ${err.message}`);
      }
    } catch (error) {
      console.error("Error saving quiz:", error);
    }
  };

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setView('quiz');
  };

  return (
    <div className="space-y-6">
      {/* Header / Nav */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quiz Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Create and manage quizzes for your students.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${view === 'list' ? 'bg-white dark:bg-slate-700 text-primary dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >

            <div className="flex items-center"><List className="h-4 w-4 mr-2" /> All Quizzes</div>
          </button>
          {userType === 'teacher' && (
            <button
              onClick={() => setView('add')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${view === 'add' ? 'bg-white dark:bg-slate-700 text-primary dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <div className="flex items-center"><Plus className="h-4 w-4 mr-2" /> Create Quiz</div>
            </button>
          )}

        </div>
      </div>

      <main>
        {view === 'list' && (
          <QuizList
            quizzes={quizzes}
            userType={userType}
            startQuiz={startQuiz}
            setView={setView}
          />
        )}

        {view === 'add' && (
          <QuizForm
            currentQuiz={currentQuiz}
            setCurrentQuiz={setCurrentQuiz}
            handleAddQuestion={handleAddQuestion}
            handleSaveQuiz={handleSaveQuiz}
          />
        )}

        {view === 'quiz' && activeQuiz && (
          <div className="animate-in zoom-in duration-300">
            <Button variant="ghost" onClick={() => setView('list')} className="mb-4">Back to List</Button>
            <Quiz quiz={activeQuiz} onRestart={() => setView('list')} />
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizModule;
