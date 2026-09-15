import type { APIRoute } from 'astro';
import { handle, json, requireUser } from '../../lib/api';
import { createNote, deleteNote, searchNotes, updateNote } from '../../lib/db/repos/notes';
import { getProfile } from '../../lib/db/repos/profiles';
import { todayInTimezone } from '../../lib/date';

export const prerender = false;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Normaliza las etiquetas: minúsculas, sin vacías ni repetidas. */
function parseTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value
        .filter((tag): tag is string => typeof tag === 'string')
        .map((tag) => tag.trim().toLowerCase().slice(0, 30))
        .filter(Boolean),
    ),
  ].slice(0, 10);
}

/** GET /api/notes?q=…&tag=… */
export const GET: APIRoute = ({ locals, url }) =>
  handle(async () => {
    const user = requireUser(locals);
    const notes = await searchNotes(
      user.id,
      url.searchParams.get('q') ?? '',
      url.searchParams.get('tag') ?? undefined,
    );
    return json({ notes });
  });

/** POST /api/notes — crea o actualiza, según venga `id`. */
export const POST: APIRoute = ({ locals, request }) =>
  handle(async () => {
    const user = requireUser(locals);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 120) : '';
    const content = typeof body.content === 'string' ? body.content.slice(0, 20_000) : '';
    if (!title && !content) {
      return json({ error: 'La nota necesita al menos un título o contenido.' }, 400);
    }

    const profile = await getProfile(user.id);
    const date =
      typeof body.date === 'string' && DATE_RE.test(body.date)
        ? body.date
        : todayInTimezone(profile?.timezone ?? 'America/Mexico_City');

    const input = { date, title, content, tags: parseTags(body.tags) };

    if (typeof body.id === 'string' && body.id) {
      const note = await updateNote(user.id, body.id, input);
      if (!note) return json({ error: 'No se encontró esa nota.' }, 404);
      return json({ note });
    }

    return json({ note: await createNote(user.id, input) }, 201);
  });

/** DELETE /api/notes?id=… */
export const DELETE: APIRoute = ({ locals, url }) =>
  handle(async () => {
    const user = requireUser(locals);
    const id = url.searchParams.get('id');
    if (!id) return json({ error: 'Falta el identificador.' }, 400);
    if (!(await deleteNote(user.id, id))) return json({ error: 'No se encontró esa nota.' }, 404);
    return json({ ok: true });
  });
