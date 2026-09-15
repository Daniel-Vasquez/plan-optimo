import type { APIRoute } from 'astro';
import { requireUser } from '../../lib/api';
import {
  bodyMetricsCollection, foodsCollection, notesCollection, nutritionLogsCollection,
  profilesCollection, runningSessionsCollection, strengthSessionsCollection, waterLogsCollection,
} from '../../lib/db/collections';

export const prerender = false;

/**
 * Exporta todos los datos del usuario como un único JSON.
 *
 * Existe porque los datos son suyos y debe poder llevárselos. Se filtra por
 * `userId` colección a colección, como el resto del proyecto: no hay un
 * "exportar todo" que pueda arrastrar documentos ajenos por descuido.
 */
export const GET: APIRoute = async ({ locals }) => {
  let user;
  try {
    user = requireUser(locals);
  } catch {
    return new Response(JSON.stringify({ error: 'No autenticado' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const filter = { userId: user.id };
  const [profile, water, running, strength, nutrition, foods, notes, body] = await Promise.all([
    profilesCollection().findOne(filter),
    waterLogsCollection().find(filter).sort({ date: 1 }).toArray(),
    runningSessionsCollection().find(filter).sort({ date: 1 }).toArray(),
    strengthSessionsCollection().find(filter).sort({ date: 1 }).toArray(),
    nutritionLogsCollection().find(filter).sort({ date: 1 }).toArray(),
    foodsCollection().find(filter).sort({ name: 1 }).toArray(),
    notesCollection().find(filter).sort({ date: 1 }).toArray(),
    bodyMetricsCollection().find(filter).sort({ date: 1 }).toArray(),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
    account: { email: user.email, name: user.name },
    profile,
    waterLogs: water,
    runningSessions: running,
    strengthSessions: strength,
    nutritionLogs: nutrition,
    foods,
    notes,
    bodyMetrics: body,
  };

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="trackfit-${stamp}.json"`,
    },
  });
};
