/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          150: '#EBEDF0',
          250: '#D1D5DB',
          350: '#A3A8B0',
          450: '#78818E',
          550: '#5A6270',
          650: '#414752',
          750: '#2D3340',
          850: '#1E2432',
          901: '#111827',
          950: '#0B0F19',
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}