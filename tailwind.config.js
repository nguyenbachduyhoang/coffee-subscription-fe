/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        espresso: {
          DEFAULT: '#4B2E2B',
          50: '#F8F5F4',
          100: '#F1EAE8',
          200: '#E4D5D1',
          300: '#D7C0BA',
          400: '#C3ABA3',
          500: '#AF968C',
          600: '#9B8175',
          700: '#876C5E',
          800: '#735747',
          900: '#4B2E2B',
        },
        latte: {
          DEFAULT: '#F5E9DD',
          50: '#FEFCFA',
          100: '#FDF9F5',
          200: '#FAF3EB',
          300: '#F7EDE1',
          400: '#F6EBE0',
          500: '#F5E9DD',
          600: '#E8D5C4',
          700: '#DBC1AB',
          800: '#CEAD92',
          900: '#C19979',
        },
        beige: {
          DEFAULT: '#DCC1A1',
          50: '#FAF7F2',
          100: '#F5EFE5',
          200: '#EBDFCB',
          300: '#E1CFB1',
          400: '#DCC1A1',
          500: '#D4B091',
          600: '#CC9F81',
          700: '#C48E71',
          800: '#BC7D61',
          900: '#B46C51',
        }
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': {
            transform: 'translateY(0)',
          },
          '40%': {
            transform: 'translateY(-5px)',
          },
          '60%': {
            transform: 'translateY(-3px)',
          },
        },
      },
    },
  },
  plugins: [],
};