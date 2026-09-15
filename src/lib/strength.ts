import type {
  AssignedWork, DateStr, StrengthExercise, StrengthSession, StrengthSet,
} from '../types/models';
import { BLOCK_RULES, STRENGTH_TEMPLATES, WEEK_PATTERN, type ExerciseTemplate } from '../data/plan';
import { daysBetween, parseDateStr } from './date';

/**
 * Lógica de entrenamiento de fuerza.
 *
 * Funciones puras: no tocan Mongo ni el DOM. Implementan la doble progresión,
 * los bloques de 4 semanas y la Escalera de Densificación de `rutina.md §4`.
 */

/** Semana del bloque de 4 (1-4). La cuarta es de descarga. */
export function blockWeekFor(planWeek: number): number {
  return ((Math.max(1, planWeek) - 1) % BLOCK_RULES.weeksPerBlock) + 1;
}

export function isDeloadWeek(planWeek: number): boolean {
  return blockWeekFor(planWeek) === BLOCK_RULES.deloadBlockWeek;
}

export function blockLabel(planWeek: number): string {
  return BLOCK_RULES.labels[blockWeekFor(planWeek) - 1]!;
}

/** RIR objetivo de la semana, según el bloque. */
export function rirForWeek(planWeek: number): number {
  return BLOCK_RULES.rirByBlockWeek[blockWeekFor(planWeek) - 1]!;
}

/** Plantilla de fuerza que toca una fecha, o null si ese día no hay. */
export function templateForDate(date: DateStr) {
  const day = WEEK_PATTERN[parseDateStr(date).getDay()];
  if (!day?.templateId) return null;
  return STRENGTH_TEMPLATES.find((t) => t.templateId === day.templateId) ?? null;
}

/** Qué toca un día, sea fuerza o no. */
export function dayPlanFor(date: DateStr) {
  return WEEK_PATTERN[parseDateStr(date).getDay()]!;
}

/**
 * Traduce la plantilla a lo asignado de una semana concreta.
 *
 * En semana de descarga las series se reducen a la mitad (mínimo 1) y el RIR
 * sube a 4, con el MISMO peso. Es lo que prescribe rutina.md §4C.
 */
export function assignedFor(exercise: ExerciseTemplate, planWeek: number): AssignedWork {
  const deload = isDeloadWeek(planWeek);
  return {
    sets: deload
      ? Math.max(1, Math.round(exercise.sets * BLOCK_RULES.deloadSetMultiplier))
      : exercise.sets,
    repMin: exercise.repMin,
    repMax: exercise.repMax,
    targetRir: rirForWeek(planWeek),
    restSeconds: exercise.restSeconds,
    tempo: exercise.tempo,
    loadKg: exercise.startLoadKg,
    loadMode: exercise.loadMode,
    unilateral: exercise.unilateral,
  };
}

/**
 * 1RM estimado con la fórmula de Epley.
 *
 * Sirve para graficar progresión cuando el peso no puede subir: con el mismo
 * peso y más reps, el e1RM sube y la línea refleja la mejora real.
 */
export function epley1rm(loadKg: number, reps: number): number | null {
  if (!(loadKg > 0) || !(reps > 0)) return null;
  // Con 1 repetición la fórmula degenera; el 1RM es el propio peso.
  if (reps === 1) return Math.round(loadKg * 100) / 100;
  return Math.round(loadKg * (1 + reps / 30) * 100) / 100;
}

/**
 * Carga movida por una serie.
 *
 * Con mancuernas en ambas manos el peso total es el doble del rotulado, y en
 * los unilaterales las reps se hacen por lado: ambas cosas doblan el volumen
 * real, y no tenerlo en cuenta subestimaría el trabajo a la mitad.
 */
export function setVolumeKg(set: StrengthSet, assigned: AssignedWork): number {
  if (!set.completed || !set.reps) return 0;
  const load = set.loadKg ?? assigned.loadKg ?? 0;
  if (load <= 0) return 0;

  const handsMultiplier = assigned.loadMode === 'perHand' ? 2 : 1;
  const sideMultiplier = assigned.unilateral ? 2 : 1;
  return Math.round(set.reps * load * handsMultiplier * sideMultiplier * 100) / 100;
}

/** Recalcula los derivados de un ejercicio desde sus series. */
export function summarizeExercise(
  exercise: Omit<
    StrengthExercise,
    'totalReps' | 'assignedReps' | 'volumeKg' | 'completionPct' | 'bestSetE1rmKg' | 'loadMaxed'
  >,
): StrengthExercise {
  const done = exercise.sets.filter((set) => set.completed && set.reps);

  const totalReps = done.reduce((sum, set) => sum + (set.reps ?? 0), 0);
  // Se compara contra el extremo BAJO del rango: es lo que el plan pide
  // cumplir, y usar el alto marcaría como incompleta una sesión correcta.
  const assignedReps = exercise.assigned.sets * exercise.assigned.repMin;
  const volumeKg = done.reduce((sum, set) => sum + setVolumeKg(set, exercise.assigned), 0);

  const e1rms = done
    .map((set) => epley1rm(set.loadKg ?? exercise.assigned.loadKg ?? 0, set.reps ?? 0))
    .filter((value): value is number => value !== null);

  const summarized: StrengthExercise = {
    ...exercise,
    totalReps,
    assignedReps,
    volumeKg: Math.round(volumeKg * 100) / 100,
    completionPct: assignedReps === 0 ? 0 : Math.round((totalReps / assignedReps) * 100),
    bestSetE1rmKg: e1rms.length ? Math.max(...e1rms) : null,
    loadMaxed: false,
  };

  return { ...summarized, loadMaxed: isLoadMaxed(summarized) };
}

/** Recalcula los derivados de una sesión entera. */
export function summarizeSession(exercises: StrengthExercise[]): {
  sessionVolumeKg: number;
  sessionCompletionPct: number;
} {
  const volume = exercises.reduce((sum, e) => sum + e.volumeKg, 0);
  const totalReps = exercises.reduce((sum, e) => sum + e.totalReps, 0);
  const assignedReps = exercises.reduce((sum, e) => sum + e.assignedReps, 0);

  return {
    sessionVolumeKg: Math.round(volume * 100) / 100,
    sessionCompletionPct: assignedReps === 0 ? 0 : Math.round((totalReps / assignedReps) * 100),
  };
}

/**
 * ¿Toca subir de peldaño?
 *
 * Doble progresión (rutina.md §4A): cuando TODAS las series llegan al extremo
 * alto del rango con el RIR objetivo, el peso está maxeado. Como por encima de
 * 35 lb no hay material, en vez de subir peso se sube un peldaño de la
 * Escalera de Densificación.
 */
export function isLoadMaxed(exercise: StrengthExercise): boolean {
  const done = exercise.sets.filter((set) => set.completed);
  if (done.length < exercise.assigned.sets) return false;

  return done.every(
    (set) =>
      (set.reps ?? 0) >= exercise.assigned.repMax &&
      (set.rir === null || set.rir >= exercise.assigned.targetRir),
  );
}

/** Serie vacía, lista para rellenar. */
export function emptySet(index: number, assigned: AssignedWork): StrengthSet {
  return {
    index,
    reps: null,
    loadKg: assigned.loadKg,
    rir: null,
    completed: false,
    restTakenSeconds: null,
  };
}

/** Progresión de un ejercicio a lo largo de las sesiones, para graficar. */
export function exerciseProgress(
  sessions: readonly StrengthSession[],
  slug: string,
): { date: DateStr; totalReps: number; volumeKg: number; e1rmKg: number | null; loadKg: number | null }[] {
  return sessions
    .map((session) => {
      const exercise = session.exercises.find((e) => e.slug === slug);
      if (!exercise || exercise.totalReps === 0) return null;
      return {
        date: session.date,
        totalReps: exercise.totalReps,
        volumeKg: exercise.volumeKg,
        e1rmKg: exercise.bestSetE1rmKg,
        loadKg: exercise.sets.find((s) => s.completed)?.loadKg ?? exercise.assigned.loadKg,
      };
    })
    .filter((point): point is NonNullable<typeof point> => point !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Volumen por grupo muscular, para la gráfica de reparto. */
export function volumeByMuscle(
  sessions: readonly StrengthSession[],
  muscleBySlug: Record<string, string[]>,
): { muscle: string; volumeKg: number }[] {
  const totals = new Map<string, number>();

  for (const session of sessions) {
    for (const exercise of session.exercises) {
      const muscles = muscleBySlug[exercise.slug] ?? [];
      if (muscles.length === 0) continue;
      // El volumen se reparte entre los grupos implicados en vez de contarse
      // entero en cada uno: si no, la suma superaría el volumen real.
      const share = exercise.volumeKg / muscles.length;
      for (const muscle of muscles) {
        totals.set(muscle, (totals.get(muscle) ?? 0) + share);
      }
    }
  }

  return [...totals.entries()]
    .map(([muscle, volumeKg]) => ({ muscle, volumeKg: Math.round(volumeKg) }))
    .sort((a, b) => b.volumeKg - a.volumeKg);
}

export { daysBetween };
