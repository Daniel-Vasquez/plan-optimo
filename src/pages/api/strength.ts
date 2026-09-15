import type { APIRoute } from 'astro';
import { handle, json, requireUser } from '../../lib/api';
import { getProfile } from '../../lib/db/repos/profiles';
import { buildSessionFromTemplate, getStrengthSession, saveStrengthSession } from '../../lib/db/repos/strength';
import { planWeekFor, todayInTimezone } from '../../lib/date';
import { blockWeekFor, isDeloadWeek, summarizeExercise } from '../../lib/strength';
import type { StrengthSet, StrengthStatus } from '../../types/models';

export const prerender = false;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const STATUSES: StrengthStatus[] = ['planned', 'in_progress', 'completed', 'skipped'];

function num(value: unknown, min: number, max: number): number | null {
  const n = typeof value === 'string' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

/** GET /api/strength?date=… — la sesión del día, de la base o de la plantilla. */
export const GET: APIRoute = ({ locals, url }) =>
  handle(async () => {
    const user = requireUser(locals);
    const profile = await getProfile(user.id);
    const timezone = profile?.timezone ?? 'America/Mexico_City';

    const param = url.searchParams.get('date');
    const date = param === null ? todayInTimezone(timezone) : param;
    if (!DATE_RE.test(date)) {
      return json({ error: 'La fecha debe tener el formato YYYY-MM-DD.' }, 400);
    }

    const planWeek = profile
      ? planWeekFor(profile.planStartDate, date, profile.planWeeks)
      : 1;

    const stored = await getStrengthSession(user.id, date);
    const session =
      stored ?? buildSessionFromTemplate(date, planWeek, blockWeekFor(planWeek), isDeloadWeek(planWeek));

    return json({ session, planWeek, isDeload: isDeloadWeek(planWeek) });
  });

/**
 * PUT /api/strength — guarda la sesión del día.
 *
 * Se acepta la sesión completa y no un parche por serie: la pantalla autoguarda
 * con debounce, y enviar el estado entero evita que dos guardados solapados
 * dejen el documento a medias.
 */
export const PUT: APIRoute = ({ locals, request }) =>
  handle(async () => {
    const user = requireUser(locals);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    if (typeof body.date !== 'string' || !DATE_RE.test(body.date)) {
      return json({ error: 'La fecha debe tener el formato YYYY-MM-DD.' }, 400);
    }

    const profile = await getProfile(user.id);
    const planWeek = profile
      ? planWeekFor(profile.planStartDate, body.date, profile.planWeeks)
      : 1;

    // La plantilla manda: lo asignado se reconstruye en el servidor en vez de
    // aceptarlo del cliente, que si no podría rebajarse las series propias.
    const base = buildSessionFromTemplate(
      body.date,
      planWeek,
      blockWeekFor(planWeek),
      isDeloadWeek(planWeek),
    );
    if (!base) return json({ error: 'Ese día no toca sesión de fuerza.' }, 400);

    const incoming = Array.isArray(body.exercises) ? body.exercises : [];

    const exercises = base.exercises.map((template) => {
      const sent = incoming.find(
        (item): item is Record<string, unknown> =>
          !!item && typeof item === 'object' && (item as Record<string, unknown>).slug === template.slug,
      );
      if (!sent) return template;

      const sentSets = Array.isArray(sent.sets) ? sent.sets : [];
      const sets: StrengthSet[] = template.sets.map((emptyRow, index) => {
        const raw = sentSets[index] as Record<string, unknown> | undefined;
        if (!raw) return emptyRow;
        const reps = num(raw.reps, 0, 200);
        return {
          index: index + 1,
          reps,
          loadKg: num(raw.loadKg, 0, 500) ?? emptyRow.loadKg,
          rir: num(raw.rir, 0, 10),
          completed: raw.completed === true && reps !== null && reps > 0,
          restTakenSeconds: num(raw.restTakenSeconds, 0, 3600),
        };
      });

      return summarizeExercise({
        ...template,
        densificationStep: num(sent.densificationStep, 1, 10) ?? template.densificationStep,
        sets,
      });
    });

    const status = STATUSES.includes(body.status as StrengthStatus)
      ? (body.status as StrengthStatus)
      : 'in_progress';

    const session = await saveStrengthSession(user.id, {
      ...base,
      exercises,
      status,
      durationSeconds: num(body.durationSeconds, 0, 36_000),
      rpeGlobal: num(body.rpeGlobal, 1, 10),
      sleepHours: num(body.sleepHours, 0, 24),
      note: typeof body.note === 'string' ? body.note.trim().slice(0, 1000) : '',
    });

    return json({ session });
  });
