/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        surface: '#1A1A1A',
        accent: {
          orange: '#FF6B00',
          green: '#39FF14',
          gold: '#FFD700',
          silver: '#C0C0C0',
          baseline: '#555555'
        }
      },
      fontFamily: {
        brutalist: ['Space Grotesk', 'IBM Plex Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
