/**
 * Lectura y validación de las variables de entorno del servidor.
 *
 * Se consultan dos fuentes porque cada entorno las expone de forma distinta:
 *
 * - `process.env` es lo que existe en producción (Vercel) y en los scripts que
 *   se lanzan con `node --env-file=.env`.
 * - `import.meta.env` es donde Vite deja el `.env` durante `astro dev`; Vite
 *   NO lo copia a `process.env`, así que en desarrollo la primera fuente está
 *   vacía para todo lo que no lleve prefijo PUBLIC_.
 *
 * El acceso a `import.meta.env` es estático a propósito (`.MONGODB_URI`, no
 * `[nombre]`): Vite sólo sustituye la forma estática al compilar.
 *
 * Ninguna de estas variables lleva prefijo PUBLIC_, y es deliberado: todas son
 * secretos o configuración de servidor, y el prefijo las enviaría al navegador.
 */

/** `import.meta.env` no existe fuera de Vite; en un script de Node es undefined. */
const viteEnv: Record<string, string | undefined> =
  typeof import.meta.env === 'undefined' ? {} : (import.meta.env as never);

function read(fromProcess: string | undefined, fromVite: string | undefined) {
  const value = fromProcess ?? fromVite;
  return value === undefined || value.trim() === '' ? undefined : value.trim();
}

const raw = {
  MONGODB_URI: read(process.env.MONGODB_URI, viteEnv.MONGODB_URI),
  MONGODB_DB: read(process.env.MONGODB_DB, viteEnv.MONGODB_DB),
  BETTER_AUTH_SECRET: read(process.env.BETTER_AUTH_SECRET, viteEnv.BETTER_AUTH_SECRET),
  BETTER_AUTH_URL: read(process.env.BETTER_AUTH_URL, viteEnv.BETTER_AUTH_URL),
};

const missing = Object.entries(raw)
  .filter(([, value]) => value === undefined)
  .map(([key]) => key);

if (missing.length > 0) {
  throw new Error(
    `Faltan variables de entorno: ${missing.join(', ')}.\n` +
      'En local: copia .env.example a .env y rellénalo (cp .env.example .env).\n' +
      'En Vercel: Project → Settings → Environment Variables.',
  );
}

if (raw.BETTER_AUTH_SECRET!.length < 32) {
  throw new Error(
    'BETTER_AUTH_SECRET debe tener al menos 32 caracteres. Genera uno con: openssl rand -base64 32',
  );
}

/**
 * Dominios que Vercel inyecta por su cuenta en cada despliegue; no hay que
 * declararlos en el panel. `VERCEL_URL` es la URL única de ESTE despliegue
 * (cada preview tiene la suya) y `VERCEL_PROJECT_PRODUCTION_URL` la de
 * producción. Sirven para autorizar el origen sin mantener una lista a mano.
 */
const vercelOrigins = [process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
  .filter((host): host is string => typeof host === 'string' && host.length > 0)
  .map((host) => (host.startsWith('http') ? host : `https://${host}`));

export const serverEnv = {
  mongoUri: raw.MONGODB_URI!,
  mongoDb: raw.MONGODB_DB!,
  authSecret: raw.BETTER_AUTH_SECRET!,
  /** Sin barra final: Better Auth compone las rutas concatenando. */
  authUrl: raw.BETTER_AUTH_URL!.replace(/\/+$/, ''),
  /** Orígenes extra aportados por Vercel; vacío fuera de Vercel. */
  vercelOrigins,
} as const;
