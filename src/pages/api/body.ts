import type { APIRoute } from 'astro';
import { handle, json, requireUser } from '../../lib/api';
import { getProfile } from '../../lib/db/repos/profiles';
import { deleteBodyMetric, listBodyMetrics, saveBodyMetric } from '../../lib/db/repos/body';
import { todayInTimezone } from '../../lib/date';

export const prerender = false;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function num(value: unknown, min: number, max: number): number | null {
  if (value === null || value === '') return null;
  const n = typeof value === 'string' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

export const GET: APIRoute = ({ locals }) =>
  handle(async () => {
    const user = requireUser(locals);
    return json({ metrics: await listBodyMetrics(user.id) });
  });

/** PUT /api/body — guarda la medición de un día. */
export const PUT: APIRoute = ({ locals, request }) =>
  handle(async () => {
    const user = requireUser(locals);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const profile = await getProfile(user.id);
    const date =
      typeof body.date === 'string' && DATE_RE.test(body.date)
        ? body.date
        : todayInTimezone(profile?.timezone ?? 'America/Mexico_City');

    const weightKg = num(body.weightKg, 30, 250);
    const waistCm = num(body.waistCm, 40, 200);

    // Un registro sin ninguna de las dos medidas no aporta nada.
    if (weightKg === null && waistCm === null) {
      return json({ error: 'Escribe al menos el peso o el perímetro de cintura.' }, 400);
    }

    const metric = await saveBodyMetric(user.id, date, {
      weightKg,
      waistCm,
      note: typeof body.note === 'string' ? body.note.trim().slice(0, 500) : '',
    });

    return json({ metric });
  });

export const DELETE: APIRoute = ({ locals, url }) =>
  handle(async () => {
    const user = requireUser(locals);
    const date = url.searchParams.get('date');
    if (!date || !DATE_RE.test(date)) return json({ error: 'Fecha inválida.' }, 400);
    if (!(await deleteBodyMetric(user.id, date))) {
      return json({ error: 'No hay medición ese día.' }, 404);
    }
    return json({ ok: true });
  });
