import type { APIRoute } from 'astro';
import { handle, json, requireUser } from '../../lib/api';
import { ensureProfile, getProfile, updateProfile } from '../../lib/db/repos/profiles';
import type { DateStr } from '../../types/models';

export const prerender = false;

/** Lunes de la semana en curso, en hora local del servidor. Respaldo si no llega fecha. */
function mondayOfThisWeek(): DateStr {
  const d = new Date();
  const dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const GET: APIRoute = ({ locals }) =>
  handle(async () => {
    const user = requireUser(locals);
    const profile = await getProfile(user.id);
    return json({ profile });
  });

/**
 * Crea el perfil si no existe. Lo llama la página de registro justo después
 * del alta para guardar la fecha de inicio del plan y la zona horaria.
 *
 * El `userId` sale de la sesión, nunca del cuerpo de la petición.
 */
export const POST: APIRoute = ({ locals, request }) =>
  handle(async () => {
    const user = requireUser(locals);

    const body = (await request.json().catch(() => ({}))) as {
      planStartDate?: unknown;
      timezone?: unknown;
    };

    const planStartDate =
      typeof body.planStartDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.planStartDate)
        ? body.planStartDate
        : mondayOfThisWeek();

    const profile = await ensureProfile(user.id, {
      displayName: user.name || user.email.split('@')[0]!,
      planStartDate,
    });

    // La zona horaria la detecta el navegador, así que sólo se puede fijar
    // aquí; el valor por defecto del modelo es un respaldo.
    if (typeof body.timezone === 'string' && body.timezone && profile.timezone !== body.timezone) {
      const updated = await updateProfile(user.id, { timezone: body.timezone });
      return json({ profile: updated ?? profile });
    }

    return json({ profile });
  });
