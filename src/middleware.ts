import { defineMiddleware } from 'astro:middleware';
import { auth } from './lib/auth';

/**
 * Resuelve la sesión una sola vez por petición y protege las rutas privadas.
 *
 * Es la primera de las cuatro capas de aislamiento descritas en
 * planificacion.md §1.5. Deja el usuario en `Astro.locals`, que es la ÚNICA
 * fuente admitida de `userId` en todo el proyecto: nunca se lee del body ni
 * de la query string, porque eso permitiría pedir los datos de otra cuenta
 * simplemente cambiando un parámetro.
 */

/** Rutas accesibles sin sesión. Lista blanca explícita: lo no listado es privado. */
const PUBLIC_PATHS = new Set(['/login', '/registro']);

/**
 * Prefijos públicos. Better Auth necesita atender sin sesión, y /api/health
 * tiene que responder precisamente cuando la autenticación no funciona.
 */
const PUBLIC_PREFIXES = ['/api/auth/', '/api/health'];

function isPublic(pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (PUBLIC_PATHS.has(path)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** Assets y ficheros internos de Astro: no pasan por la comprobación de sesión. */
function isAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_') ||
    pathname.startsWith('/@') ||
    pathname.startsWith('/node_modules/') ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (isAsset(pathname)) return next();

  const result = await auth.api.getSession({ headers: context.request.headers });
  context.locals.user = result?.user ?? null;
  context.locals.session = result?.session ?? null;

  if (context.locals.user || isPublic(pathname)) {
    // Si ya hay sesión, login y registro no tienen nada que ofrecer.
    if (context.locals.user && isPublic(pathname) && !pathname.startsWith('/api/')) {
      return context.redirect('/');
    }
    return next();
  }

  // Las rutas de API contestan 401: una redirección a HTML rompería al
  // cliente que espera JSON.
  if (pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  // Se conserva el destino para volver a él después de entrar.
  const redirectTo = pathname + context.url.search;
  return context.redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
});
