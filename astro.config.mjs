import { defineConfig } from 'astro/config';
import alpinejs from '@astrojs/alpinejs';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  // A partir de la Tanda 1 la app deja de ser estática: las páginas se
  // renderizan en el servidor para poder resolver la sesión y consultar
  // MongoDB con los datos ya filtrados por usuario.
  output: 'server',
  adapter: vercel(),
  integrations: [
    alpinejs({ entrypoint: '/src/entrypoint' }),
  ],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      // El driver de Mongo y Better Auth son código de servidor: que Vite no
      // intente pre-empaquetarlos para el navegador.
      exclude: ['mongodb', 'better-auth'],
    },
  },
});
