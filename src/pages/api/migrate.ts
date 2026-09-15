import type { APIRoute } from 'astro';
import { handle, json, requireUser } from '../../lib/api';
import { getProfile } from '../../lib/db/repos/profiles';
import { addWaterEntry, getWaterDay } from '../../lib/db/repos/water';
import { createRun } from '../../lib/db/repos/running';
import { createNote } from '../../lib/db/repos/notes';
import { paceSecondsPerKm, targetPaceFor } from '../../lib/pace';
import { waterGoalFor } from '../../lib/water';

export const prerender = false;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Importa los datos que quedaron en `localStorage`.
 *
 * La app guardaba todo en el navegador antes de la Tanda 1. Este endpoint
 * recibe ese volcado y lo traduce al modelo actual.
 *
 * Es idempotente en lo que puede serlo: el agua no se duplica si ese día ya
 * tiene registro, y las notas se comparan por fecha y contenido. Las carreras
 * sí podrían duplicarse al reimportar, así que la respuesta dice cuántas se
 * crearon para que quien la invoque no la repita a ciegas.
 */
export const POST: APIRoute = ({ locals, request }) =>
  handle(async () => {
    const user = requireUser(locals);
    const profile = await getProfile(user.id);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const sessions = (body.sessions ?? {}) as Record<string, Record<string, unknown>>;
    const notes = Array.isArray(body.notes) ? body.notes : [];

    const imported = { water: 0, runs: 0, notes: 0, skipped: 0 };

    for (const [date, raw] of Object.entries(sessions)) {
      if (!DATE_RE.test(date) || !raw || typeof raw !== 'object') {
        imported.skipped += 1;
        continue;
      }

      // El agua se guardaba en LITROS con un slider; aquí son mililitros.
      const liters = typeof raw.water === 'number' ? raw.water : Number(raw.water);
      if (Number.isFinite(liters) && liters > 0) {
        const existing = await getWaterDay(user.id, date);
        if (!existing) {
          await addWaterEntry(user.id, date, waterGoalFor(profile, date), {
            ml: Math.round(liters * 1000),
            source: 'custom',
          });
          imported.water += 1;
        } else {
          imported.skipped += 1;
        }
      }

      const running = raw.running as Record<string, unknown> | undefined;
      const distanceKm = running ? Number(running.distance) : NaN;
      const pace = typeof running?.pace === 'string' ? running.pace : '';
      const paceMatch = /^(\d{1,2}):([0-5]\d)$/.exec(pace);

      if (Number.isFinite(distanceKm) && distanceKm > 0 && paceMatch) {
        const paceSeconds = Number(paceMatch[1]) * 60 + Number(paceMatch[2]);
        const durationSeconds = Math.round(paceSeconds * distanceKm);
        const avgPaceSeconds = paceSecondsPerKm(distanceKm, durationSeconds)!;

        // El formato viejo no distinguía tipos de sesión; se importan como
        // rodaje fácil, que es lo que menos supone sobre el dato original.
        const targetPaceSeconds = targetPaceFor('easy');
        await createRun(user.id, {
          date,
          runType: 'easy',
          distanceKm,
          durationSeconds,
          avgPaceSeconds,
          targetPaceSeconds,
          paceDeltaSeconds: targetPaceSeconds === null ? null : avgPaceSeconds - targetPaceSeconds,
          elevationGainM: null,
          avgHeartRate: null,
          maxHeartRate: null,
          intervals: [],
          perceivedEffort: null,
          shoes: null,
          note: typeof raw.note === 'string' ? raw.note.slice(0, 1000) : '',
        });
        imported.runs += 1;
      }
    }

    for (const raw of notes) {
      if (!raw || typeof raw !== 'object') continue;
      const note = raw as Record<string, unknown>;

      const title = typeof note.title === 'string' ? note.title.trim().slice(0, 120) : '';
      const content = typeof note.content === 'string' ? note.content.slice(0, 20_000) : '';
      if (!title && !content) continue;

      await createNote(user.id, {
        date: typeof note.date === 'string' && DATE_RE.test(note.date) ? note.date : '1970-01-01',
        title,
        content,
        tags: Array.isArray(note.tags)
          ? note.tags.filter((t): t is string => typeof t === 'string').slice(0, 10)
          : [],
      });
      imported.notes += 1;
    }

    return json({ imported });
  });
