// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
 darkMode: 'class',
 // tailwind.config.js
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}", // This line is crucial
],
  theme: {
    extend: {},
  },
  plugins: [],
}