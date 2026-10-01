/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#EBF5FF',
          DEFAULT: '#3B82F6', // Blue-500
          dark: '#1E3A8A',    // Blue-900
        },
        accent: {
          DEFAULT: '#10B981', // Emerald-500
          dark: '#059669',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}
