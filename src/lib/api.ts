import type { User } from 'better-auth/types';

/**
 * Utilidades para los endpoints de `/api`.
 *
 * Tercera capa de aislamiento (planificacion.md §1.5): todo endpoint privado
 * arranca con `requireUser(locals)`, que devuelve el usuario ya resuelto por
 * el middleware. El `userId` sale siempre de ahí, nunca de la petición.
 */

/** Se lanza cuando no hay sesión; el endpoint la convierte en respuesta HTTP. */
export class UnauthorizedError extends Error {
  constructor() {
    super('No autenticado');
    this.name = 'UnauthorizedError';
  }
}

export function requireUser(locals: App.Locals): User {
  if (!locals.user) throw new UnauthorizedError();
  return locals.user;
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/**
 * Envuelve el cuerpo de un endpoint para traducir los errores a respuestas.
 *
 * Los mensajes de error internos no se devuelven al cliente: se registran en
 * el servidor y fuera va un 500 genérico.
 */
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return json({ error: error.message }, 401);
    }
    console.error('[api]', error);
    return json({ error: 'Error interno del servidor' }, 500);
  }
}
