const colors = require('tailwindcss/colors')
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  mode: 'jit',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './layouts/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        megrim: ['Megrim', ...defaultTheme.fontFamily.sans],
      },
      backgroundImage: {
      },
      colors: {
        default: '#606060',
      },
      animation: {
        bounce200: 'bounce 1s infinite 200ms',
        bounce400: 'bounce 1s infinite 400ms',
        fadeIn: 'fadeIn 2s linear',
        toBottom: 'toBottom 1s linear',
        toTop: 'toTop 1s linear',
        toRight: 'toRight 1s linear',
        toLeft: 'toLeft 1s linear',
      },
      keyframes: {
        toTop: {
          '0%': { transform: 'translateY(25%)' },
          '100%': { transform: 'translateY(0)' },
        },
        toBottom: {
          '0%': { transform: 'translateY(-25%)' },
          '100%': { transform: 'translateY(0)' },
        },
        toRight: {
          '0%': { transform: 'translateX(-25%)' },
          '100%': { transform: 'translateX(0)' },
        },
        toLeft: {
          '0%': { transform: 'translateX(25%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  variants: {},
  plugins: [],
}
