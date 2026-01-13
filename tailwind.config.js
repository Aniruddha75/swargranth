/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // We can add custom colors here later
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // We should add Inter font later
      }
    },
  },
  plugins: [],
}
