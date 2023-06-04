const { createGlobPatternsForDependencies } = require('@nx/react/tailwind')
const { join } = require('path')

const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Mona Sans', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        electricIndigo: {
          50: '#f1ecfd',
          100: '#e2d3f8',
          200: '#c5a7f1',
          300: '#a97aeb',
          400: '#8c4ee4',
          500: '#6f22dd',
          600: '#591bb1',
          700: '#431485',
          800: '#2c0e58',
          900: '#16072c',
        },
        pinkLavender: '#F5C0F0',
        lavenderBlue: '#D1C0F9',
        lighterLavenderBlue: '#F1ECFD',
        beauBlue: '#BDDAF9',
      },
      animation: {
        'spin-slow': 'spin 1.5s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('flowbite/plugin'),
    require('@headlessui/tailwindcss'),
  ],
}
