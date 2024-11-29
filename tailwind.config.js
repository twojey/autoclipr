/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Couleur primaire : Bleu électrique
        primary: {
          50: '#E6F3FF',
          100: '#CCE7FF',
          200: '#99CEFF',
          300: '#66B5FF',
          400: '#339CFF',
          500: '#0083FF', // Couleur principale
          600: '#0069CC',
          700: '#004F99',
          800: '#003566',
          900: '#001A33',
        },
        // Couleur secondaire : Violet
        accent: {
          50: '#F3E6FF',
          100: '#E7CCFF',
          200: '#CF99FF',
          300: '#B766FF',
          400: '#9F33FF',
          500: '#8700FF', // Couleur secondaire
          600: '#6C00CC',
          700: '#510099',
          800: '#360066',
          900: '#1B0033',
        },
        // Couleurs de fond et de texte - Theme clair
        light: {
          background: {
            primary: '#FFFFFF',
            secondary: '#F8FAFC',
            tertiary: '#F1F5F9',
            elevated: '#FFFFFF',
          },
          shadow: {
            primary: '#E2E8F0',
            secondary: '#CBD5E1',
          },
          text: {
            primary: '#1E293B',
            secondary: '#475569',
            tertiary: '#64748B',
          },
        },
        // Couleurs de fond et de texte - Theme sombre
        dark: {
          background: {
            primary: '#0F172A',
            secondary: '#1E293B',
            tertiary: '#334155',
            elevated: '#1E293B',
          },
          shadow: {
            primary: '#0F172A',
            secondary: '#020617',
          },
          text: {
            primary: '#F8FAFC',
            secondary: '#E2E8F0',
            tertiary: '#CBD5E1',
          },
        },
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
        display: ['Clash Display', 'sans-serif'],
      },
      fontSize: {
        'display-1': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-2': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'heading-1': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'heading-2': ['2rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading-3': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-large': ['1.125rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'body': ['1rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'body-small': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      boxShadow: {
        'neumorph': '20px 20px 60px #d1d9e6, -20px -20px 60px #ffffff',
        'neumorph-dark': '20px 20px 60px #0f172a, -20px -20px 60px #1e293b',
        'neumorph-inset': 'inset 2px 2px 5px #b8b9be, inset -3px -3px 7px #ffffff',
        'neumorph-inset-dark': 'inset 2px 2px 5px #0f172a, inset -3px -3px 7px #1e293b',
        'glow': '0 0 15px rgba(0, 131, 255, 0.5)',
        'glow-accent': '0 0 15px rgba(135, 0, 255, 0.5)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.12)',
        'hard': '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.16)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 131, 255, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 131, 255, 0.8)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
