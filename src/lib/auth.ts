import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { getDb, getMongoClient } from './db/client';
import { serverEnv } from './env';

/**
 * Configuración de Better Auth.
 *
 * Autenticación simple de email + contraseña: sin OAuth y sin magic links.
 * Las colecciones `user`, `account`, `session` y `verification` las crea y
 * gestiona la propia librería; el perfil físico vive aparte, en `profiles`.
 *
 * Se le pasa el `client` además de la `db` para que el adaptador pueda usar
 * transacciones. Atlas es un replica set, así que las soporta; en un Mongo
 * standalone habría que añadir `transaction: false`.
 */

const AUTH_KEY = Symbol.for('trackfit.auth');

type GlobalWithAuth = typeof globalThis & {
  [AUTH_KEY]?: ReturnType<typeof createAuth>;
};

function createAuth() {
  return betterAuth({
    appName: 'TrackFit',
    baseURL: serverEnv.authUrl,
    secret: serverEnv.authSecret,

    database: mongodbAdapter(getDb(), { client: getMongoClient() }),

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      // Tras registrarse, la sesión queda abierta: evita pedir la contraseña
      // dos veces seguidas para entrar.
      autoSignIn: true,
      // Sin proveedor de correo configurado, no tiene sentido exigir
      // verificación: dejaría al usuario fuera sin forma de entrar.
      requireEmailVerification: false,
    },

    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 días
      updateAge: 60 * 60 * 24, // refresca la expiración como mucho 1 vez/día
      cookieCache: {
        // Guarda la sesión firmada en la cookie durante 5 minutos. Sin esto,
        // cada petición (incluidas las de navegación) golpearía Mongo sólo
        // para resolver quién eres.
        enabled: true,
        maxAge: 5 * 60,
      },
    },

    advanced: {
      cookiePrefix: 'trackfit',
    },

    // Orígenes autorizados a iniciar el flujo de autenticación.
    trustedOrigins: Array.from(new Set([serverEnv.authUrl, serverEnv.appUrl])),
  });
}

/**
 * Igual que el cliente de Mongo: se cachea en `globalThis` para que el
 * hot-reload de desarrollo no construya una instancia nueva por recarga.
 */
const globalWithAuth = globalThis as GlobalWithAuth;

export const auth: ReturnType<typeof createAuth> =
  globalWithAuth[AUTH_KEY] ?? (globalWithAuth[AUTH_KEY] = createAuth());
