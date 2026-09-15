import { randomUUID } from 'node:crypto';
import { waterLogsCollection } from '../collections';
import type { DateStr, WaterEntry, WaterLog, WaterSource } from '../../../types/models';

/**
 * Repositorio de hidratación.
 *
 * Mismo patrón que el resto: `userId` es el primer argumento, es obligatorio y
 * se inyecta en el filtro aquí dentro. No se exporta nada que acepte un filtro
 * crudo, así que no hay forma de construir una consulta sin aislar por usuario.
 */

/** Tope por toma. Un vaso son 250 ml; 3 L de un trago es un error de tecleo. */
export const MAX_ENTRY_ML = 3000;

export async function getWaterDay(userId: string, date: DateStr): Promise<WaterLog | null> {
  return waterLogsCollection().findOne({ userId, date });
}

/** Días dentro de un rango cerrado, del más antiguo al más reciente. */
export async function getWaterRange(
  userId: string,
  from: DateStr,
  to: DateStr,
): Promise<WaterLog[]> {
  return waterLogsCollection()
    .find({ userId, date: { $gte: from, $lte: to } })
    .sort({ date: 1 })
    .toArray();
}

export interface AddWaterInput {
  ml: number;
  source: WaterSource;
  strengthSessionId?: string;
  exerciseIndex?: number;
  setIndex?: number;
}

/**
 * Añade una toma al día indicado y devuelve el día actualizado.
 *
 * Es un `upsert`: el documento del día se crea en la primera toma, no al
 * abrir la pantalla, así que no quedan días vacíos ensuciando el histórico.
 *
 * `totalMl` se recalcula aquí en vez de con `$inc` sobre el valor previo:
 * mantiene el total coherente con `entries` aunque una escritura anterior
 * fallara a medias.
 */
export async function addWaterEntry(
  userId: string,
  date: DateStr,
  goalMl: number,
  input: AddWaterInput,
): Promise<WaterLog> {
  const entry: WaterEntry = {
    id: randomUUID(),
    ml: Math.round(input.ml),
    at: new Date(),
    source: input.source,
    ...(input.strengthSessionId ? { strengthSessionId: input.strengthSessionId } : {}),
    ...(input.exerciseIndex !== undefined ? { exerciseIndex: input.exerciseIndex } : {}),
    ...(input.setIndex !== undefined ? { setIndex: input.setIndex } : {}),
  };

  const now = new Date();
  await waterLogsCollection().updateOne(
    { userId, date },
    {
      $push: { entries: entry },
      // La meta se refresca en cada escritura para que refleje el perfil
      // vigente mientras el día sigue abierto.
      $set: { goalMl, updatedAt: now },
      $setOnInsert: { userId, date, createdAt: now },
    },
    { upsert: true },
  );

  return recalculateTotal(userId, date);
}

/** Elimina una toma. Devuelve el día resultante, o null si no existía. */
export async function removeWaterEntry(
  userId: string,
  date: DateStr,
  entryId: string,
): Promise<WaterLog | null> {
  const result = await waterLogsCollection().updateOne(
    { userId, date },
    { $pull: { entries: { id: entryId } }, $set: { updatedAt: new Date() } },
  );

  if (result.matchedCount === 0) return null;
  return recalculateTotal(userId, date);
}

/** Recalcula `totalMl` desde `entries`, que es la fuente de verdad. */
async function recalculateTotal(userId: string, date: DateStr): Promise<WaterLog> {
  const day = await getWaterDay(userId, date);
  if (!day) throw new Error(`No existe el registro de agua de ${date}`);

  const totalMl = day.entries.reduce((sum, e) => sum + e.ml, 0);
  if (totalMl !== day.totalMl) {
    await waterLogsCollection().updateOne({ userId, date }, { $set: { totalMl } });
    day.totalMl = totalMl;
  }
  return day;
}
