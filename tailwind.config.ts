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
        sidebar: {
          bg: '#0f0f12',
          hover: '#1c1c22',
          active: '#252530',
          border: '#2a2a35',
          text: '#8e8e9d',
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
        'card': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
        'button': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'pink': '0 4px 14px rgba(232, 67, 122, 0.25)',
        'pink-lg': '0 8px 24px rgba(232, 67, 122, 0.3)',
      },
      backgroundImage: {
        'gradient-pink': 'linear-gradient(135deg, #e8437a 0%, #f472a4 100%)',
        'gradient-pink-dark': 'linear-gradient(135deg, #d63a6e 0%, #e8437a 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, #0f0f12 0%, #141418 100%)',
      },
      borderRadius: {
        'DEFAULT': '8px',
      },
    },
  },
  plugins: [],
};

export default config;
