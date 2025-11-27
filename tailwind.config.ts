import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6faf5',
          100: '#b3f0e0',
          200: '#80e6cb',
          300: '#4ddcb6',
          400: '#1ad2a1',
          500: '#07C59A',
          600: '#069e7b',
          700: '#04775c',
          800: '#03503d',
          900: '#01291e',
        },
        secondary: {
          50: '#e8eaec',
          100: '#b8bdc4',
          200: '#88919c',
          300: '#586474',
          400: '#28374c',
          500: '#113240',
          600: '#0e2833',
          700: '#0a1e26',
          800: '#071419',
          900: '#030a0d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config

