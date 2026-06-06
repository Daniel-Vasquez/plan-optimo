/** Resolves a color token to a CSS variable, supporting Tailwind's opacity modifiers (e.g. bg-base/50). */
function withOpacity(variable) {
  return ({ opacityValue }) =>
    opacityValue === undefined
      ? `rgb(var(${variable}))`
      : `rgb(var(${variable}) / ${opacityValue})`;
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        base:     withOpacity('--color-base'),
        surface:  withOpacity('--color-surface'),
        surface2: withOpacity('--color-surface2'),
        border:   'var(--color-border)',
        border2:  'var(--color-border2)',
        yellow:   withOpacity('--color-yellow'),
        blue:     withOpacity('--color-blue'),
        orange:   withOpacity('--color-orange'),
        primary:  withOpacity('--color-primary'),
        muted:    withOpacity('--color-muted'),
        muted2:   withOpacity('--color-muted2'),
        ink:      withOpacity('--color-ink'),
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
