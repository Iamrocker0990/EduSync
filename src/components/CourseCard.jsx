import React from 'react';
import { Star, Clock, Users, Award } from 'lucide-react';

const CourseCard = ({ course }) => {
  const discountPercentage = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:border-slate-700 transform hover:-translate-y-2">
      
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
        />

        {course.badge && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-semibold rounded-full shadow-lg">
              {course.badge}
            </span>
          </div>
        )}

        {discountPercentage > 0 && (
          <div className="absolute top-4 right-4">
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
              -{discountPercentage}%
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button className="px-6 py-3 bg-white dark:bg-slate-900 text-slate-800 dark:text-gray-100 font-semibold rounded-xl transform scale-90 group-hover:scale-100 transition-transform duration-200">
            View Course
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-3">
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {course.category}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-800 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {course.title}
        </h3>

        <p className="text-slate-600 dark:text-gray-300 mb-4">by {course.instructor}</p>

        {/* Rating */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(course.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-slate-700 dark:text-gray-200">
            {course.rating}
          </span>
          <span className="text-sm text-slate-500 dark:text-gray-400">
            ({course.reviews.toLocaleString()})
          </span>
        </div>

        {/* Course Info */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-slate-600 dark:text-gray-300">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {course.duration}
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {course.students.toLocaleString()}
          </div>
          <div className="flex items-center">
            <Award className="h-4 w-4 mr-1" />
            {course.level}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-slate-800 dark:text-gray-100">
              ₹{course.price}
            </span>
            {course.originalPrice && (
              <span className="text-lg text-slate-500 dark:text-gray-400 line-through">
                ₹{course.originalPrice}
              </span>
            )}
          </div>

          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200">
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
