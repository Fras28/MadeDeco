/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Madedeco — cálida, elegante, natural
        brand: {
          50:  '#FAF7F3',
          100: '#F2EBE0',
          200: '#E4D5BF',
          300: '#D0B897',
          400: '#B89670',
          500: '#9E7E5C', // oro cálido — acento principal
          600: '#8B6F47',
          700: '#6E5234',
          800: '#4A3320',
          900: '#2C1E0F',
          950: '#1C1208',
        },
        cream: {
          50: '#FAFAF8',
          100: '#F5F0EA',
          200: '#EDE5D8',
          300: '#E0D3C0',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl':  '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'stamp-in': 'stampIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'fade-in':  'fadeIn 0.3s ease-in-out',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        stampIn: {
          '0%':   { transform: 'scale(0) rotate(-15deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(0deg)',   opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(158,126,92,0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(158,126,92,0)' },
        },
      },
    },
  },
  plugins: [],
}
