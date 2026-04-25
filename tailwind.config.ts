import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#fef1f6',
          100: '#fde6ef',
          200: '#fccee0',
          300: '#faa7c7',
          400: '#f472a4',
          500: '#e8437a',
          600: '#d63a6e',
          700: '#b42d59',
          800: '#962849',
          900: '#7d2540',
          DEFAULT: '#e8437a',
        },
        wine: {
          800: '#3d0c1c',
          900: '#2d0815',
          950: '#1f0610',
        },
        sidebar: {
          bg: '#2d0815',
          hover: '#3d0c1c',
          active: '#e8437a',
          border: '#4a1025',
          text: '#c49aaa',
          'text-active': '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.06)',
        'button': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'pink': '0 4px 14px rgba(232, 67, 122, 0.2)',
      },
      backgroundImage: {
        'gradient-sidebar': 'linear-gradient(180deg, #3d0c1c 0%, #2d0815 50%, #1f0610 100%)',
        'gradient-pink': 'linear-gradient(135deg, #e8437a 0%, #f472a4 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
