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
          50: '#e6f5f5',
          100: '#b3e0e0',
          200: '#80cbcb',
          300: '#4db6b6',
          400: '#218B8E',
          500: '#218B8E',
          600: '#1a6f72',
          700: '#145356',
          800: '#0d383a',
          900: '#071c1e',
        },
        secondary: {
          50: '#e6e9ec',
          100: '#b3bcc7',
          200: '#8090a2',
          300: '#4d637d',
          400: '#1a3658',
          500: '#031C43',
          600: '#021636',
          700: '#021128',
          800: '#010b1b',
          900: '#01060d',
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

