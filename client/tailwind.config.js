/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#176B3A',
          dark: '#11522C',
          light: '#1F8C4C',
        },
        leaf: {
          DEFAULT: '#2E8B57',
          light: '#3EB070',
          dark: '#246D44',
        },
        mint: {
          DEFAULT: '#E6F4E8',
          light: '#F2FAF3',
          dark: '#C8E6CE',
        },
        cream: {
          DEFAULT: '#FFF9EC',
          light: '#FFFCF5',
          dark: '#F5E6CC',
        },
        harvest: {
          DEFAULT: '#F5C451',
          light: '#FAD882',
          dark: '#D9A426',
        },
        earth: {
          DEFAULT: '#8A6040',
          light: '#A87954',
          dark: '#67472D',
        },
        soil: {
          red: '#B85338',
          black: '#3A3837',
          sandy: '#D4B282',
          clay: '#9E5D3E',
          loamy: '#5A4632',
        },
        dark: {
          text: '#20352A',
          muted: '#546E60',
          light: '#7B9385',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '"Noto Sans"', '"Noto Sans Kannada"', '"Noto Sans Tamil"', '"Noto Sans Telugu"', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(23, 107, 58, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 25px -3px rgba(23, 107, 58, 0.14), 0 4px 10px -2px rgba(0, 0, 0, 0.05)',
        'nav': '0 -4px 20px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
