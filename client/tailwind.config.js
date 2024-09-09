// client/tailwind.config.js

const konstaConfig = require('konsta/config');

/** @type {import('tailwindcss').Config} */
module.exports = konstaConfig({
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#DE47F0',
        'brand-primary': '#DE47F0',
        'brand-red': '#ff3b30',
        'brand-green': '#4cd964',
        'brand-yellow': '#ffcc00',
        'brand-purple': '#9c27b0',
        'brand-blue': '#2196f3',
      },
    },
  },
  plugins: [],
});