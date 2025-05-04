/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0F7FF',
          100: '#E0EFFF',
          200: '#C0DFFF',
          300: '#90C7FF',
          400: '#60AFFF',
          500: '#4A90E2', // Primary color
          600: '#3A73B4',
          700: '#2A5687',
          800: '#1A395A',
          900: '#0A1C2D',
        },
        secondary: {
          50: '#F0FAF5',
          100: '#E0F5EB',
          200: '#C0EBD7',
          300: '#90DCB8',
          400: '#60CD99',
          500: '#50B83C', // Secondary color
          600: '#40932F',
          700: '#306E23',
          800: '#204918',
          900: '#10250C',
        },
        accent: {
          50: '#F7F0FF',
          100: '#EFE0FF',
          200: '#DFC0FF',
          300: '#C790FF',
          400: '#AF60FF',
          500: '#9B51E0', // Accent color
          600: '#7B41B4',
          700: '#5B3087',
          800: '#3B205A',
          900: '#1B102D',
        },
        success: {
          500: '#22C55E',
        },
        warning: {
          500: '#F59E0B',
        },
        error: {
          500: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '0.5': '4px',
        '1': '8px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
        '7': '56px',
        '8': '64px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
      },
    },
  },
  plugins: [],
};