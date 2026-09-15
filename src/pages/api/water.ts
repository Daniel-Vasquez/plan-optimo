import type { APIRoute } from 'astro';
import { handle, json, requireUser } from '../../lib/api';
import { getProfile } from '../../lib/db/repos/profiles';
import {
  MAX_ENTRY_ML,
  addWaterEntry,
  getWaterDay,
  getWaterRange,
  removeWaterEntry,
} from '../../lib/db/repos/water';
import { todayInTimezone } from '../../lib/date';
import { emptyWaterDay, waterGoalFor } from '../../lib/water';
import type { DateStr, WaterSource } from '../../types/models';

export const prerender = false;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SOURCES: WaterSource[] = ['quick', 'custom', 'during-set'];

/**
 * Resuelve la fecha a usar.
 *
 * Sin parámetro es "hoy" EN LA ZONA DEL USUARIO, no la del servidor: en Vercel
 * el proceso corre en UTC, y un vaso de agua a las 20:00 en México se
 * registraría en el día siguiente.
 */
function resolveDate(param: string | null, timezone: string): DateStr | null {
  if (param === null) return todayInTimezone(timezone);
  return DATE_RE.test(param) ? param : null;
}

/**
 * GET /api/water              → el día de hoy
 * GET /api/water?date=…       → un día concreto
 * GET /api/water?from=…&to=…  → un rango, para el historial
 */
export const GET: APIRoute = ({ locals, url }) =>
  handle(async () => {
    const user = requireUser(locals);
    const profile = await getProfile(user.id);
    const timezone = profile?.timezone ?? 'America/Mexico_City';

    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    if (from !== null || to !== null) {
      if (!from || !to || !DATE_RE.test(from) || !DATE_RE.test(to)) {
        return json({ error: 'El rango necesita "from" y "to" como YYYY-MM-DD.' }, 400);
      }
      if (from > to) return json({ error: '"from" no puede ser posterior a "to".' }, 400);

      const days = await getWaterRange(user.id, from, to);
      return json({ days, today: todayInTimezone(timezone) });
    }

    const date = resolveDate(url.searchParams.get('date'), timezone);
    if (!date) return json({ error: 'La fecha debe tener el formato YYYY-MM-DD.' }, 400);

    const goalMl = waterGoalFor(profile, date);
    const day = await getWaterDay(user.id, date);

    // Si aún no hay documento se devuelve un día vacío, no un 404: para la
    // pantalla "hoy sin beber nada" es un estado normal, no un error.
    return json({ day: day ?? emptyWaterDay(date, goalMl), goalMl });
  });

/** POST /api/water — añade una toma. */
export const POST: APIRoute = ({ locals, request }) =>
  handle(async () => {
    const user = requireUser(locals);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const ml = typeof body.ml === 'number' ? body.ml : Number(body.ml);
    if (!Number.isFinite(ml) || ml <= 0 || ml > MAX_ENTRY_ML) {
      return json({ error: `La cantidad debe estar entre 1 y ${MAX_ENTRY_ML} ml.` }, 400);
    }

    const profile = await getProfile(user.id);
    const timezone = profile?.timezone ?? 'America/Mexico_City';
    const date = resolveDate(typeof body.date === 'string' ? body.date : null, timezone);
    if (!date) return json({ error: 'La fecha debe tener el formato YYYY-MM-DD.' }, 400);

    const source = SOURCES.includes(body.source as WaterSource)
      ? (body.source as WaterSource)
      : 'custom';

    const day = await addWaterEntry(user.id, date, waterGoalFor(profile, date), {
      ml,
      source,
      ...(typeof body.strengthSessionId === 'string'
        ? { strengthSessionId: body.strengthSessionId }
        : {}),
      ...(typeof body.exerciseIndex === 'number' ? { exerciseIndex: body.exerciseIndex } : {}),
      ...(typeof body.setIndex === 'number' ? { setIndex: body.setIndex } : {}),
    });

    return json({ day });
  });

/** DELETE /api/water?date=…&id=… — elimina una toma. */
export const DELETE: APIRoute = ({ locals, url }) =>
  handle(async () => {
    const user = requireUser(locals);
    const profile = await getProfile(user.id);
    const timezone = profile?.timezone ?? 'America/Mexico_City';

    const date = resolveDate(url.searchParams.get('date'), timezone);
    if (!date) return json({ error: 'La fecha debe tener el formato YYYY-MM-DD.' }, 400);

    const id = url.searchParams.get('id');
    if (!id) return json({ error: 'Falta el identificador de la toma.' }, 400);

    const day = await removeWaterEntry(user.id, date, id);
    if (!day) return json({ error: 'No hay registro de agua para ese día.' }, 404);

    return json({ day });
  });
