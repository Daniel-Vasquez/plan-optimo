import { bodyMetricsCollection } from '../collections';
import type { BodyMetric, DateStr } from '../../../types/models';

/** Repositorio de métricas corporales. `userId` primero y obligatorio. */

export async function listBodyMetrics(userId: string, limit = 400): Promise<BodyMetric[]> {
  return bodyMetricsCollection().find({ userId }).sort({ date: -1 }).limit(limit).toArray();
}

export async function getBodyMetric(userId: string, date: DateStr): Promise<BodyMetric | null> {
  return bodyMetricsCollection().findOne({ userId, date });
}

/**
 * Guarda la medición de un día. Es un upsert: pesarse dos veces la misma
 * mañana debe corregir el dato, no crear un registro nuevo.
 */
export async function saveBodyMetric(
  userId: string,
  date: DateStr,
  input: { weightKg: number | null; waistCm: number | null; note: string },
): Promise<BodyMetric> {
  const now = new Date();
  const result = await bodyMetricsCollection().findOneAndUpdate(
    { userId, date },
    { $set: { ...input, updatedAt: now }, $setOnInsert: { userId, date, createdAt: now } },
    { upsert: true, returnDocument: 'after' },
  );
  if (!result) throw new Error(`No se pudo guardar la medición de ${date}`);
  return result;
}

export async function deleteBodyMetric(userId: string, date: DateStr): Promise<boolean> {
  const result = await bodyMetricsCollection().deleteOne({ userId, date });
  return result.deletedCount === 1;
}
