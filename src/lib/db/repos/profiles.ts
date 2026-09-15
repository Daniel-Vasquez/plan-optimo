import { profilesCollection } from '../collections';
import {
  DEFAULT_BASELINES,
  DEFAULT_GOALS,
  type DateStr,
  type Profile,
} from '../../../types/models';

/**
 * Repositorio de perfiles.
 *
 * Patrón que siguen TODOS los repositorios del proyecto: `userId` es el primer
 * argumento y es obligatorio, y se inyecta en el filtro aquí dentro. No se
 * exporta ninguna función que acepte un filtro crudo desde fuera, de modo que
 * no existe forma de construir una consulta sin aislar por usuario.
 */

export async function getProfile(userId: string): Promise<Profile | null> {
  return profilesCollection().findOne({ userId });
}

/**
 * Crea el perfil del usuario si aún no existe y lo devuelve.
 *
 * Es idempotente a propósito: se invoca en cada petición autenticada que
 * necesite el perfil, y dos peticiones simultáneas del mismo usuario recién
 * registrado no deben crear dos documentos. El índice único sobre `userId`
 * respalda esa garantía a nivel de base de datos.
 */
export async function ensureProfile(
  userId: string,
  seed: { displayName: string; planStartDate: DateStr },
): Promise<Profile> {
  const now = new Date();

  const result = await profilesCollection().findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        displayName: seed.displayName,
        heightCm: null,
        startWeightKg: null,
        displayUnit: 'lb' as const,
        timezone: 'America/Mexico_City',
        planStartDate: seed.planStartDate,
        planWeeks: 12,
        goals: DEFAULT_GOALS,
        baselines: DEFAULT_BASELINES,
        createdAt: now,
        updatedAt: now,
      },
    },
    { upsert: true, returnDocument: 'after' },
  );

  if (!result) {
    throw new Error(`No se pudo crear ni recuperar el perfil de ${userId}`);
  }
  return result;
}

/** Campos del perfil que el usuario puede editar desde /ajustes. */
export type ProfileUpdate = Partial<
  Pick<
    Profile,
    | 'displayName'
    | 'heightCm'
    | 'startWeightKg'
    | 'displayUnit'
    | 'timezone'
    | 'planStartDate'
    | 'planWeeks'
    | 'goals'
    | 'baselines'
  >
>;

export async function updateProfile(
  userId: string,
  changes: ProfileUpdate,
): Promise<Profile | null> {
  return profilesCollection().findOneAndUpdate(
    { userId },
    { $set: { ...changes, updatedAt: new Date() } },
    { returnDocument: 'after' },
  );
}
