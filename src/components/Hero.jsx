import React from 'react';
import { Play, Star, Users, Award } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-blue-700 border border-blue-200/50">
                <Star className="w-4 h-4 mr-2 fill-current" />
                Trusted by 50M+ learners worldwide
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 dark:text-gray-100 leading-tight">
                Learn Without
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Limits
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 dark:text-gray-300 leading-relaxed max-w-lg">
                Discover thousands of courses from expert instructors. Build skills that matter in today's world with our AI-powered learning platform.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <span className="relative flex items-center">
                  Start Learning Today
                  <Play className="ml-2 h-5 w-5 fill-current" />
                </span>
              </button>
              
              <button className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-gray-200 font-semibold rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 transition-all duration-200 shadow-sm hover:shadow-lg">
                Browse Courses
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mb-3 mx-auto">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-gray-100">50M+</div>
                <div className="text-sm text-slate-600 dark:text-gray-300">Students</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mb-3 mx-auto">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-gray-100">10K+</div>
                <div className="text-sm text-slate-600 dark:text-gray-300">Courses</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl mb-3 mx-auto">
                  <Star className="h-6 w-6 text-white fill-current" />
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-gray-100">4.8</div>
                <div className="text-sm text-slate-600 dark:text-gray-300">Average Rating</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative z-10 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-700">
              <img
                src="https://images.pexels.com/photos/5427674/pexels-photo-5427674.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Students learning online"
                className="w-full h-80 object-cover rounded-xl"
              />
              
              {/* Floating Cards */}
              <div className="absolute -top-4 -left-4 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-lg animate-bounce delay-300">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Play className="h-4 w-4 text-white fill-current" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-gray-100">Course Progress</div>
                    <div className="text-xs text-slate-600 dark:text-gray-300">85% Complete</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-lg animate-bounce delay-700">
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white"></div>
                    <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-white"></div>
                    <div className="w-6 h-6 bg-pink-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-gray-100">12K+ Students</div>
                    <div className="text-xs text-slate-600 dark:text-gray-300">Enrolled</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background Elements */}
            <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-ping"></div>
            <div className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-ping delay-500"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;