import { strengthSessionsCollection } from '../collections';
import type { DateStr, StrengthExercise, StrengthSession } from '../../../types/models';
import { STRENGTH_TEMPLATES } from '../../../data/plan';
import { assignedFor, emptySet, summarizeExercise, summarizeSession, templateForDate } from '../../strength';

/**
 * Repositorio de sesiones de fuerza.
 *
 * `userId` primero y obligatorio, inyectado aquí dentro. Nada acepta un filtro
 * crudo desde fuera.
 */

export async function getStrengthSession(
  userId: string,
  date: DateStr,
): Promise<StrengthSession | null> {
  return strengthSessionsCollection().findOne({ userId, date });
}

export async function listStrengthSessions(
  userId: string,
  limit = 200,
): Promise<StrengthSession[]> {
  return strengthSessionsCollection()
    .find({ userId })
    .sort({ date: -1 })
    .limit(limit)
    .toArray();
}

/**
 * Construye la sesión del día desde la plantilla, sin guardarla.
 *
 * Se devuelve en memoria a propósito: abrir la pantalla no debe crear un
 * documento. Sólo al registrar la primera serie se escribe, de modo que no
 * quedan sesiones vacías ensuciando el historial ni la adherencia.
 */
export function buildSessionFromTemplate(
  date: DateStr,
  planWeek: number,
  blockWeek: number,
  isDeload: boolean,
): Omit<StrengthSession, '_id' | 'userId' | 'createdAt' | 'updatedAt'> | null {
  const template = templateForDate(date);
  if (!template) return null;

  const exercises: StrengthExercise[] = template.exercises.map((exercise) => {
    const assigned = assignedFor(exercise, planWeek);
    return summarizeExercise({
      slug: exercise.slug,
      name: exercise.name,
      order: exercise.order,
      supersetGroup: exercise.supersetGroup,
      assigned,
      densificationStep: 1,
      sets: Array.from({ length: assigned.sets }, (_, i) => emptySet(i + 1, assigned)),
    });
  });

  return {
    date,
    templateId: template.templateId,
    label: template.label,
    planWeek,
    blockWeek,
    isDeload,
    status: 'planned',
    exercises,
    ...summarizeSession(exercises),
    durationSeconds: null,
    rpeGlobal: null,
    sleepHours: null,
    note: '',
  };
}

/**
 * Guarda la sesión del día, creándola si no existía.
 *
 * Los derivados se recalculan aquí y no se aceptan del cliente: el cliente los
 * muestra, pero la fuente de verdad es el servidor.
 */
export async function saveStrengthSession(
  userId: string,
  session: Omit<StrengthSession, '_id' | 'userId' | 'createdAt' | 'updatedAt'>,
): Promise<StrengthSession> {
  const exercises = session.exercises.map((exercise) => summarizeExercise(exercise));
  const totals = summarizeSession(exercises);
  const now = new Date();

  const result = await strengthSessionsCollection().findOneAndUpdate(
    { userId, date: session.date },
    {
      $set: { ...session, exercises, ...totals, updatedAt: now },
      $setOnInsert: { userId, createdAt: now },
    },
    { upsert: true, returnDocument: 'after' },
  );

  if (!result) throw new Error(`No se pudo guardar la sesión de ${session.date}`);
  return result;
}

/** Slugs a grupos musculares, para el reparto de volumen. */
export const MUSCLE_BY_SLUG: Record<string, string[]> = Object.fromEntries(
  STRENGTH_TEMPLATES.flatMap((template) =>
    template.exercises.map((exercise) => [exercise.slug, exercise.muscleGroups]),
  ),
);

/** Catálogo plano de ejercicios del plan, para las fichas por ejercicio. */
export const EXERCISE_CATALOG = STRENGTH_TEMPLATES.flatMap((template) =>
  template.exercises.map((exercise) => ({ ...exercise, templateId: template.templateId, sessionLabel: template.label })),
);
