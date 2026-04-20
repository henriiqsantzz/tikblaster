import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          DEFAULT: '#ec4899',
        },
        dark: {
          50: '#3d2a35',
          100: '#2d1f28',
          200: '#231a21',
          300: '#1a1118',
          400: '#140d12',
          500: '#0f0a0d',
          600: '#0a0709',
          700: '#070506',
          800: '#030304',
          900: '#000000',
          DEFAULT: '#140d12',
        },
        wine: {
          50: '#4a2040',
          100: '#3d1a35',
          200: '#30142a',
          300: '#260f22',
          400: '#1c0b19',
          500: '#150813',
          600: '#44162e',
          700: '#6b1d45',
          800: '#8b2358',
          900: '#a3296a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'sidebar-gradient': 'linear-gradient(180deg, #2d1226 0%, #1a0a14 40%, #0f0a0d 100%)',
        'card-gradient': 'linear-gradient(135deg, #1a1118 0%, #140d12 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
