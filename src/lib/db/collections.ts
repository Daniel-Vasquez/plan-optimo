import type { Collection } from 'mongodb';
import { getDb } from './client';
import { COLLECTIONS } from './schema';
import type {
  Food, NutritionLog, Profile, RunningSession, StrengthSession, WaterLog,
} from '../../types/models';

/**
 * Accesos tipados a las colecciones. Los nombres y los índices viven en
 * `schema.ts`, que es el módulo que también consume el script de índices.
 */
export { COLLECTIONS };

export function profilesCollection(): Collection<Profile> {
  return getDb().collection<Profile>(COLLECTIONS.profiles);
}

export function waterLogsCollection(): Collection<WaterLog> {
  return getDb().collection<WaterLog>(COLLECTIONS.waterLogs);
}

export function runningSessionsCollection(): Collection<RunningSession> {
  return getDb().collection<RunningSession>(COLLECTIONS.runningSessions);
}

export function strengthSessionsCollection(): Collection<StrengthSession> {
  return getDb().collection<StrengthSession>(COLLECTIONS.strengthSessions);
}

export function nutritionLogsCollection(): Collection<NutritionLog> {
  return getDb().collection<NutritionLog>(COLLECTIONS.nutritionLogs);
}

export function foodsCollection(): Collection<Food> {
  return getDb().collection<Food>(COLLECTIONS.foods);
}
