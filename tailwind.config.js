/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hockey-blue': '#0047AB',
        'hockey-red': '#D22730',
      },
    },
  },
  plugins: [],
}
