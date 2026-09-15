import type { APIRoute } from 'astro';
import { handle, json, requireUser } from '../../lib/api';
import { createRun, deleteRun, listRuns } from '../../lib/db/repos/running';
import { paceSecondsPerKm, targetPaceFor } from '../../lib/pace';
import type { RunInterval, RunType } from '../../types/models';

export const prerender = false;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const RUN_TYPES: RunType[] = ['vo2max', 'threshold', 'easy', 'long', 'race', 'timetrial'];

/** Número dentro de rango, o `null` si no vale. Evita guardar basura. */
function num(value: unknown, min: number, max: number): number | null {
  const n = typeof value === 'string' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

/** Normaliza los intervalos y recalcula el ritmo de cada repetición. */
function parseIntervals(value: unknown): RunInterval[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((raw, index): RunInterval | null => {
      if (!raw || typeof raw !== 'object') return null;
      const item = raw as Record<string, unknown>;

      const distanceM = num(item.distanceM, 1, 100_000);
      const durationSeconds = num(item.durationSeconds, 1, 36_000);
      if (distanceM === null || durationSeconds === null) return null;

      return {
        index: index + 1,
        distanceM,
        durationSeconds,
        // Se recalcula en el servidor: el cliente lo muestra, pero la fuente
        // de verdad es esta.
        paceSeconds: Math.round(durationSeconds / (distanceM / 1000)),
        recoverySeconds: num(item.recoverySeconds, 0, 3600),
      };
    })
    .filter((interval): interval is RunInterval => interval !== null);
}

/** GET /api/running?limit=… — sesiones recientes. */
export const GET: APIRoute = ({ locals, url }) =>
  handle(async () => {
    const user = requireUser(locals);
    const limit = num(url.searchParams.get('limit'), 1, 500) ?? 100;
    const runs = await listRuns(user.id, Math.round(limit));
    return json({ runs });
  });

/** POST /api/running — registra una carrera. */
export const POST: APIRoute = ({ locals, request }) =>
  handle(async () => {
    const user = requireUser(locals);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    if (typeof body.date !== 'string' || !DATE_RE.test(body.date)) {
      return json({ error: 'La fecha debe tener el formato YYYY-MM-DD.' }, 400);
    }

    if (!RUN_TYPES.includes(body.runType as RunType)) {
      return json({ error: 'El tipo de sesión no es válido.' }, 400);
    }
    const runType = body.runType as RunType;

    const distanceKm = num(body.distanceKm, 0.1, 500);
    if (distanceKm === null) {
      return json({ error: 'La distancia debe estar entre 0.1 y 500 km.' }, 400);
    }

    const durationSeconds = num(body.durationSeconds, 1, 86_400);
    if (durationSeconds === null) {
      return json({ error: 'La duración no es válida.' }, 400);
    }

    const avgPaceSeconds = paceSecondsPerKm(distanceKm, durationSeconds);
    if (avgPaceSeconds === null) {
      return json({ error: 'No se pudo calcular el ritmo con esos datos.' }, 400);
    }

    // El objetivo se congela en el registro: si mañana cambian las zonas, el
    // histórico debe seguir mostrando contra qué se comparó cada sesión.
    const targetPaceSeconds = targetPaceFor(runType);

    const run = await createRun(user.id, {
      date: body.date,
      runType,
      distanceKm,
      durationSeconds,
      avgPaceSeconds,
      targetPaceSeconds,
      paceDeltaSeconds: targetPaceSeconds === null ? null : avgPaceSeconds - targetPaceSeconds,
      elevationGainM: num(body.elevationGainM, 0, 10_000),
      avgHeartRate: num(body.avgHeartRate, 30, 250),
      maxHeartRate: num(body.maxHeartRate, 30, 250),
      intervals: parseIntervals(body.intervals),
      perceivedEffort: num(body.perceivedEffort, 1, 10),
      shoes: typeof body.shoes === 'string' ? body.shoes.trim().slice(0, 60) || null : null,
      note: typeof body.note === 'string' ? body.note.trim().slice(0, 1000) : '',
    });

    return json({ run }, 201);
  });

/** DELETE /api/running?id=… */
export const DELETE: APIRoute = ({ locals, url }) =>
  handle(async () => {
    const user = requireUser(locals);
    const id = url.searchParams.get('id');
    if (!id) return json({ error: 'Falta el identificador de la sesión.' }, 400);

    const deleted = await deleteRun(user.id, id);
    if (!deleted) return json({ error: 'No se encontró esa sesión.' }, 404);

    return json({ ok: true });
  });
