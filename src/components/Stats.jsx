import React from 'react';
import { TrendingUp, Users, Award, BookOpen } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '50M+',
    label: 'Students Worldwide',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: BookOpen,
    value: '10K+',
    label: 'Expert Courses',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Award,
    value: '95%',
    label: 'Success Rate',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: TrendingUp,
    value: '4.8★',
    label: 'Average Rating',
    color: 'from-yellow-500 to-orange-500'
  }
];

const Stats: React.FC = () => {
  return (
    <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-gray-100 mb-1">
                  {stat.value}
                </div>
                <div className="text-slate-600 dark:text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Stats;