import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e6fff9',
          100: '#b3ffe8',
          200: '#80ffd7',
          300: '#4dffc6',
          400: '#1affb5',
          500: '#00e6a0',
          600: '#00cc8e',
          700: '#00b37c',
          800: '#009969',
          900: '#008057',
          DEFAULT: '#00e6a0',
        },
        dark: {
          50: '#2a2d35',
          100: '#1e2128',
          200: '#181b21',
          300: '#13161b',
          400: '#0e1015',
          500: '#0a0c10',
          600: '#07080b',
          700: '#050607',
          800: '#030304',
          900: '#000000',
          DEFAULT: '#0e1015',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
