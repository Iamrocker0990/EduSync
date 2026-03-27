import React from 'react';
import { ArrowRight, PlayCircle, CheckCircle } from 'lucide-react';

const FeaturedSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-700"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full text-sm font-medium text-blue-300">
                <PlayCircle className="w-4 h-4 mr-2" />
                Featured Learning Path
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                Master Full-Stack
                <span className="block text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                  Development
                </span>
              </h2>
              
              <p className="text-xl text-slate-300 leading-relaxed">
                Complete learning path from beginner to expert. Build real-world projects and land your dream job in tech.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {[
                'Frontend Development (React, Vue, Angular)',
                'Backend Development (Node.js, Python, Java)',
                'Database Design & Management',
                'DevOps & Cloud Deployment'
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                  <span className="text-slate-300">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <span className="flex items-center">
                  Start Learning Path
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </button>
              
              <button className="px-8 py-4 bg-white dark:bg-slate-900/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white dark:bg-slate-900/20 transition-all duration-200">
                View Preview
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="https://images.pexels.com/photos/3861943/pexels-photo-3861943.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Developer workspace"
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              />
              
              {/* Floating Progress Card */}
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl animate-bounce delay-300">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-gray-100">Course Completed</div>
                    <div className="text-xs text-slate-600 dark:text-gray-300">React Fundamentals</div>
                    <div className="w-32 h-2 bg-slate-200 rounded-full mt-2">
                      <div className="w-full h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background Decoration */}
            <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;