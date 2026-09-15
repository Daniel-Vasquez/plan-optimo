import { ObjectId } from 'mongodb';
import { runningSessionsCollection } from '../collections';
import type { DateStr, RunningSession } from '../../../types/models';

/**
 * Repositorio de sesiones de carrera.
 *
 * Mismo patrón que el resto: `userId` primero y obligatorio, inyectado en el
 * filtro aquí dentro. Nada acepta un filtro crudo desde fuera.
 *
 * A diferencia de la hidratación, NO hay unicidad por fecha: el martes se
 * corren intervalos por la mañana y el plan admite rodajes sueltos, así que
 * dos sesiones el mismo día es un caso válido.
 */

export type NewRunningSession = Omit<RunningSession, '_id' | 'userId' | 'createdAt' | 'updatedAt'>;

export async function createRun(userId: string, input: NewRunningSession): Promise<RunningSession> {
  const now = new Date();
  const document: RunningSession = { ...input, userId, createdAt: now, updatedAt: now };
  const result = await runningSessionsCollection().insertOne(document);
  return { ...document, _id: result.insertedId };
}

/** Una sesión por id. Devuelve null si no existe O si es de otro usuario. */
export async function getRun(userId: string, id: string): Promise<RunningSession | null> {
  if (!ObjectId.isValid(id)) return null;
  return runningSessionsCollection().findOne({ userId, _id: new ObjectId(id) });
}

export async function deleteRun(userId: string, id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const result = await runningSessionsCollection().deleteOne({ userId, _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

/** Sesiones ordenadas de la más reciente a la más antigua. */
export async function listRuns(userId: string, limit = 100): Promise<RunningSession[]> {
  return runningSessionsCollection()
    .find({ userId })
    .sort({ date: -1, createdAt: -1 })
    .limit(limit)
    .toArray();
}

/** Sesiones de un rango, de la más antigua a la más reciente (orden de gráfica). */
export async function listRunsInRange(
  userId: string,
  from: DateStr,
  to: DateStr,
): Promise<RunningSession[]> {
  return runningSessionsCollection()
    .find({ userId, date: { $gte: from, $lte: to } })
    .sort({ date: 1, createdAt: 1 })
    .toArray();
}
