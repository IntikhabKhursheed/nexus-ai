/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'nexus-bg': '#080c18',
        'nexus-surface': 'rgba(255,255,255,0.04)',
        'nexus-border': 'rgba(255,255,255,0.08)',
        'nexus-purple': '#6b3fe6',
        'nexus-teal': '#14b8a6',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
