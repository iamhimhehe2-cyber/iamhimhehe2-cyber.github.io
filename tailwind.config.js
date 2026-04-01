/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        boardLight: '#f0d9b5',
        boardDark: '#b58863',
      }
    },
  },
  plugins: [],
}
