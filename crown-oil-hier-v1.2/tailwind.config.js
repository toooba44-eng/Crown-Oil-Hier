/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        moss: '#2E4036',
        clay: '#CC5833',
        cream: '#F2F0E9',
        charcoal: '#1A1A1A',
        void: '#0A0A14',
        plasma: '#7B61FF',
        ghost: '#F0EFF4',
      },
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        outfit: ['"Outfit"', 'sans-serif'],
        garamond: ['"Cormorant Garamond"', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        sora: ['"Sora"', 'sans-serif'],
        instrument: ['"Instrument Serif"', 'serif'],
        code: ['"Fira Code"', 'monospace'],
      },
      borderRadius: {
        '2xl': '2rem',
        '3xl': '2.5rem',
        '4xl': '3rem',
        '5xl': '4rem',
      },
      transitionTimingFunction: {
        magnetic: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      boxShadow: {
        plasma: '0 0 40px -8px rgba(123, 97, 255, 0.55)',
        clay: '0 0 40px -10px rgba(204, 88, 51, 0.5)',
      },
    },
  },
  plugins: [],
}
