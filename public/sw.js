/**
 * Service worker de TrackFit.
 *
 * Cachea ÚNICAMENTE los recursos estáticos con huella en el nombre
 * (`/_astro/...`) y los iconos. Todo lo demás va siempre a la red.
 *
 * Esa restricción es deliberada y es lo importante de este archivo. Las
 * páginas se renderizan en el servidor con los datos de quien ha iniciado
 * sesión: cachearlas significaría que, en un dispositivo compartido, la
 * siguiente persona podría ver la página de la anterior. Y cachear respuestas
 * de `/api` mostraría cifras viejas como si fueran de hoy, que en una app de
 * seguimiento es peor que no mostrar nada.
 *
 * Lo que se gana: las recargas no vuelven a descargar el CSS y el JS. Lo que
 * NO se gana, y conviene no prometer: uso sin conexión.
 */

const CACHE = 'trackfit-static-v1';

/** Sólo estos recursos son inmutables y seguros de cachear. */
function isCacheable(url) {
  return (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/_astro/') ||
      url.pathname.startsWith('/icon-') ||
      url.pathname === '/manifest.json' ||
      url.pathname === '/avatar-batman.svg')
  );
}

self.addEventListener('install', (event) => {
  // Entra en servicio sin esperar a que se cierren las pestañas viejas.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Limpia versiones anteriores del caché al desplegar.
      const names = await caches.keys();
      await Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!isCacheable(url)) return; // A la red, sin tocar el caché.

  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) return cached;

      const response = await fetch(request);
      // Sólo se guardan las respuestas correctas y del propio origen.
      if (response.ok && response.type === 'basic') {
        const cache = await caches.open(CACHE);
        cache.put(request, response.clone());
      }
      return response;
    })(),
  );
});
