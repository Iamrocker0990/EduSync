import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { PlusCircle, HelpCircle, CheckCircle } from 'lucide-react';

const AddQuestion = ({ onAddQuestion }) => {
  const [questionData, setQuestionData] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    ans: 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuestionData({
      ...questionData,
      [name]: name === 'ans' ? parseInt(value) : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!questionData.question || !questionData.option1 || !questionData.option2 || !questionData.option3 || !questionData.option4) {
      alert("Please fill all fields");
      return;
    }
    onAddQuestion(questionData);
    setQuestionData({
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      ans: 1,
    });
  };

  return (
    <Card className="p-8 border-l-4 border-l-blue-500">
      <div className="flex items-center mb-6">
        <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mr-3">
          <HelpCircle className="h-5 w-5" />
        </div>
        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Add New Question</h4>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="label">Question Text</label>
          <input
            type="text"
            name="question"
            placeholder="e.g. What is the capital of France?"
            value={questionData.question}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((num) => (
            <div key={num}>
              <label className="label text-xs uppercase tracking-wide text-slate-500 dark:text-gray-400 mb-1">Option {num}</label>
              <div className="relative">
                <div className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full border flex items-center justify-center text-xs font-bold ${questionData.ans === num ? 'border-primary text-primary bg-primary/10' : 'border-slate-300 text-slate-400'}`}>
                  {num}
                </div>
                <input
                  type="text"
                  name={`option${num}`}
                  placeholder={`Option ${num} text`}
                  value={questionData[`option${num}`]}
                  onChange={handleChange}
                  className={`input-field pl-10 ${questionData.ans === num ? 'border-primary bg-primary/5' : ''}`}
                  required
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="label">Correct Answer</label>
          <div className="flex space-x-4">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                onClick={() => setQuestionData(prev => ({ ...prev, ans: num }))}
                className={`flex-1 p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-center ${questionData.ans === num
                    ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200 transform scale-105'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-gray-300 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800'
                  }`}
              >
                {questionData.ans === num && <CheckCircle className="h-4 w-4 mr-2" />}
                <span className="font-bold">Option {num}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button type="submit" className="bg-primary text-white hover:bg-primary/90">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Question
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AddQuestion;
