/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark mode colors
        dark: {
          100: '#000000', // Pure black for primary text
          200: '#1a1a1a', // Background
          300: '#2d2d2d', // Card background
          400: '#404040', // Border
          500: '#666666', // Secondary text
        },
        // Light mode colors
        light: {
          100: '#ffffff', // Pure white for primary text
          200: '#f5f5f5', // Background
          300: '#e5e5e5', // Card background
          400: '#d4d4d4', // Border
          500: '#a3a3a3', // Secondary text
        },
        accent: {
          DEFAULT: '#3b82f6', // Blue
          light: '#60a5fa',
          dark: '#2563eb',
        },
      },
    },
  },
  plugins: [],
};
