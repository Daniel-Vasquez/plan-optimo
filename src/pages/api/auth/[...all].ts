import type { APIRoute } from 'astro';
import { auth } from '../../../lib/auth';

/**
 * Punto de entrada de Better Auth: registro, login, logout, sesión y demás
 * cuelgan de `/api/auth/*` y los atiende íntegramente la librería.
 */
export const ALL: APIRoute = ({ request }) => auth.handler(request);

export const prerender = false;
