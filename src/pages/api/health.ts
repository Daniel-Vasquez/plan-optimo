import type { APIRoute } from 'astro';
import { getMongoClient } from '../../lib/db/client';
import { serverEnv } from '../../lib/env';

export const prerender = false;

/**
 * Comprobación de salud. Pública a propósito: sirve justo cuando no se puede
 * iniciar sesión, que es cuando exigir sesión la haría inútil.
 *
 * La respuesta no incluye el mensaje de error, sólo su tipo: los errores del
 * driver de Mongo suelen llevar dentro el host y a veces el usuario de la
 * cadena de conexión. El detalle completo va al log del servidor
 * (Vercel → Logs → Runtime).
 */
export const GET: APIRoute = async () => {
  const started = Date.now();

  try {
    await getMongoClient().db(serverEnv.mongoDb).command({ ping: 1 });
    return new Response(
      JSON.stringify({ ok: true, database: 'conectada', ms: Date.now() - started }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  } catch (error) {
    console.error('[health] fallo conectando a MongoDB:', error);
    return new Response(
      JSON.stringify({
        ok: false,
        database: 'inaccesible',
        tipo: error instanceof Error ? error.name : 'Error',
        ms: Date.now() - started,
        pista:
          'Lo más habitual es que Atlas no permita la IP. Network Access debe incluir 0.0.0.0/0: Vercel despliega desde IPs dinámicas.',
      }),
      { status: 503, headers: { 'content-type': 'application/json' } },
    );
  }
};
