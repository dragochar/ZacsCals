/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  extend: {
    // Define custom CSS classes for fade-in and fade-out animations
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      fadeOut: {
        '0%': { opacity: '1' },
        '100%': { opacity: '0' },
      },
    },
    animation: {
      'fade-in': 'fadeIn 0.5s ease-in',
      'fade-out': 'fadeOut 0.5s ease-out',
    },
  },
}

