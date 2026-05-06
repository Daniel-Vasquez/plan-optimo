/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        base:     '#0d0f14',
        surface:  '#161920',
        surface2: '#1e2230',
        border:   'rgba(255,255,255,0.07)',
        border2:  'rgba(255,255,255,0.13)',
        yellow:   '#e8ff47',
        blue:     '#47c2ff',
        orange:   '#ff6b35',
        primary:  '#f0f2f8',
        muted:    '#8890a8',
        muted2:   '#5a6278',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
