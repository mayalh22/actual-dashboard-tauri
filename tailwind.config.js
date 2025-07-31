/** @type {import('tailwindcss').Config} */
const COLORS = {
  primary: '#274f8b',
  secondary: '#e9b0c8',
  accent: '#d76a4c',
  success: '#25533f',
  danger: '#6e1e3a',
  info: '#a4bde0',
  warning: '#fadd8b',
  tertiary: '#74b72e',
  quad: 'rgba(255, 175, 89, 1)'
};

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: COLORS,
    },
  },
  plugins: [],
}
