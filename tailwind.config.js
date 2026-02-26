/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1', // Indigo-500
          hover: '#4f46e5',   // Indigo-600
          light: '#818cf8',   // Indigo-400
        },
        secondary: {
          DEFAULT: '#111827', // Gray-900 (Text Primary)
          hover: '#1f2937',   // Gray-800
          light: '#6b7280',   // Gray-500 (Text Secondary)
        },
        background: '#FAFAFB', // Soft Neutral Background
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
