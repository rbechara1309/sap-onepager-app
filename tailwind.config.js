/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sap: {
          blue: '#0070F2',
          dark: '#003362',
          gold: '#F0AB00',
          light: '#E8F1FF',
        }
      }
    },
  },
  plugins: [],
}
