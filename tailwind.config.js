/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pull: '#3B82F6',
        push: '#F97316',
        legs: '#22C55E',
        rest: '#6B7280',
      },
    },
  },
  plugins: [],
}
