import { createAuthClient } from 'better-auth/client';

/**
 * Cliente de Better Auth para el navegador (`signIn`, `signUp`, `signOut`).
 *
 * Sin `baseURL` apunta al mismo origen desde el que se sirvió la página, que
 * es lo correcto tanto en local como en Vercel, incluidos los despliegues de
 * preview con dominio generado.
 */
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
