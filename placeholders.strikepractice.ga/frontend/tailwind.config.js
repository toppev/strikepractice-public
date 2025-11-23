/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#121212',
          800: '#1e1e1e',
          700: '#2c2c2c',
          600: '#3a3a3a',
        },
        primary: {
          DEFAULT: '#3f51b5', // Keep a reference but we'll mostly use custom "gamer" colors
          main: '#00e5ff', // Cyan accent
          hover: '#00b8cc'
        },
        secondary: {
          main: '#ff0055', // Pink/Red accent
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'], // Modern clean font
      }
    },
  },
  plugins: [],
}