/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'light-background-primary': '#ffffff',
        'light-background-elevated': '#ffffff',
        'light-background-tertiary': '#e5e7eb',
        'light-text-primary': '#1f2937',
        'dark-background-primary': '#1f2937',
        'dark-background-elevated': '#374151',
        'dark-background-tertiary': '#4b5563',
        'dark-text-primary': '#f3f4f6',
        'primary-500': '#3b82f6',
        'accent-500': '#8b5cf6',
      },
    },
  },
  plugins: [],
}
