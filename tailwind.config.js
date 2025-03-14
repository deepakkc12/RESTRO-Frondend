/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Add this line - very important!
  theme: {
    extend: {
      colors: {
        // Main Brand Colors
        primary: {
          50: '#EEF5FF',
          100: '#D5E6FF',
          200: '#A8CCFF',
          300: '#7AAFFF',
          400: '#4D91FF',
          500: '#0259DC',  // Main Primary
          600: '#0247B0',  // Darker Primary
          700: '#013584',
          800: '#012458',
          900: '#00132C',
          light: 'var(--primary-light)',
          dark: 'var(--primary-dark)',
        },

        
        // Secondary Colors
        secondary: {
          50: '#EEEEFF',
          100: '#E0E1FF',
          200: '#C1C4FF',
          400: '#5661C7',
          500: '#303A93',  // Main Secondary
          600: '#252D74',  // Darker Secondary
          700: '#1B2156',
          800: '#101438',
          900: '#080A1C',
        },

        // Accent Colors
        accent: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#EC830B',  // Main Accent
          600: '#C76A09',  // Darker Accent
          700: '#A35207',
          800: '#7C3D05',
          900: '#542904',
        },

        // Neutral Colors
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',  // Main Neutral
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },

        // Supporting Colors
        success: {
          50: '#ECFDF5',
          500: '#10B981',  // Main Success
          600: '#059669',
        },
        
        warning: {
          50: '#FFFBEB',
          500: '#F59E0B',  // Main Warning
          600: '#D97706',
        },
        
        error: {
          50: '#FEF2F2',
          500: '#EF4444',  // Main Error
          600: '#DC2626',
        },

        // Background Colors
        background: {
          light: 'var(--background-light)',
          dark: 'var(--background-dark)',
          subtle: '#F8FAFC',
          muted: '#F1F5F9',
        },
      },
    
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        openSans: ['Open Sans', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
      },

    },
  },
  plugins: [],
}