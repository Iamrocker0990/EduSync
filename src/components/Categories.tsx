import React from 'react';
import { Code, Palette, TrendingUp, BarChart3, Lightbulb, Briefcase } from 'lucide-react';

interface CategoriesProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { name: 'All', icon: Lightbulb, color: 'from-amber-500 to-orange-500' },
  { name: 'Development', icon: Code, color: 'from-blue-500 to-indigo-500' },
  { name: 'Design', icon: Palette, color: 'from-purple-500 to-pink-500' },
  { name: 'Marketing', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
  { name: 'Data Science', icon: BarChart3, color: 'from-red-500 to-rose-500' },
  { name: 'Business', icon: Briefcase, color: 'from-gray-600 to-slate-600' },
];

const Categories: React.FC<CategoriesProps> = ({ selectedCategory, onCategoryChange }) => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
            Explore Top Categories
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Choose from thousands of courses in the most popular categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.name;
            
            return (
              <button
                key={category.name}
                onClick={() => onCategoryChange(category.name)}
                className={`group relative p-6 bg-white rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                  isSelected 
                    ? 'border-blue-300 shadow-lg ring-4 ring-blue-100' 
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
                }`}
              >
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className={`font-semibold text-center transition-colors duration-200 ${
                  isSelected ? 'text-blue-600' : 'text-slate-700 group-hover:text-slate-900'
                }`}>
                  {category.name}
                </h3>
                
                {isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl -z-10"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;