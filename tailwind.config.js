/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy-blue': '#1f487c',
        'deep-red': '#c42727',
        'forest-green': '#2f8e3c',
      },
    },
  },
  plugins: [],
}
