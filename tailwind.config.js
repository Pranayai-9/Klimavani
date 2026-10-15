/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#fdfcf9',
          100: '#fbf9f4',
          200: '#f4f0e6',
          300: '#ebe5d8',
          400: '#ded5c2',
        },
        forest: {
          50: '#f2f7f4',
          100: '#e1ede6',
          200: '#c5dcce',
          300: '#9bc2ad',
          400: '#6ea388',
          500: '#4c866b',
          600: '#386a53',
          700: '#2b5443',
          800: '#1e3f32',
          900: '#143126',
          950: '#0b1d16',
        },
        charcoal: {
          800: '#28312d',
          900: '#19201d',
          950: '#101513',
        },
        sage: {
          100: '#ebf1ee',
          200: '#d5e2dc',
          500: '#738d81',
          600: '#5c7469',
        },
        crimson: {
          600: '#b91c1c',
          700: '#991b1b',
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Playfair Display', 'Merriweather', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(16, 21, 19, 0.05), 0 1px 2px 0 rgba(16, 21, 19, 0.03)',
        'editorial': '0 4px 16px -2px rgba(20, 49, 38, 0.07)',
      }
    },
  },
  plugins: [],
}
