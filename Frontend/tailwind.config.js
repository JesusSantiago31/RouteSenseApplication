/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#005cc8',
        secondary: '#3498db',
        accent: '#f1c40f',
        background: '#f8fafc',
        border: '#edf2f7',
      },
    },
  },
  plugins: [],
}
