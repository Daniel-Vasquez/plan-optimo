import type {
  AttendanceDay, AttendanceStatus, DateStr, NutritionLog, Profile,
  RunningSession, StrengthSession, WaterLog,
} from '../types/models';
import { WEEK_PATTERN } from '../data/plan';
import { planWeekFor } from './date';
import { isDeloadWeek } from './strength';
import { waterGoalFor } from './water';
import { goalsFor } from './nutrition';

/**
 * Asistencia al plan: qué tocaba cada día y qué se hizo.
 *
 * Se calcula LEYENDO los registros de los demás módulos, no desde una
 * colección `attendance` mantenida aparte.
 *
 * La planificación original preveía esa colección denormalizada, actualizada
 * por upsert desde los cuatro caminos de escritura (fuerza, carrera, agua y
 * nutrición). Se descartó: mantenerla sincronizada desde cuatro sitios es
 * cuatro oportunidades de que se desincronice y muestre una adherencia falsa,
 * y lo que ahorra es pasar de cuatro consultas por rango a una. Con índices
 * `{userId, date}` en las cuatro colecciones y un mes por pantalla, esa
 * diferencia no se nota; la de tener datos que mienten, sí.
 */

export interface DayRecords {
  strength: StrengthSession | null;
  running: RunningSession[];
  water: WaterLog | null;
  nutrition: NutritionLog | null;
}

/**
 * Decide el estado del día.
 *
 * Un día se considera completado cuando se hizo lo que el plan pedía: la
 * sesión de fuerza si tocaba, la carrera si tocaba. El agua y la proteína se
 * muestran como indicadores aparte y NO tumban el día: son metas diarias, no
 * la sesión de entrenamiento.
 */
function resolveStatus(
  date: DateStr,
  today: DateStr,
  plannedKind: string,
  records: DayRecords,
): AttendanceStatus {
  if (plannedKind === 'rest') return 'rest';
  if (date > today) return 'future';

  const strengthDone = (records.strength?.sessionCompletionPct ?? 0) > 0;
  const ranToday = records.running.length > 0;

  switch (plannedKind) {
    case 'strength': {
      // Martes y jueves piden carrera por la mañana y fuerza por la noche.
      const alsoRuns = date !== '' && WEEK_PATTERN[new Date(`${date}T00:00:00`).getDay()]?.label.includes('+');
      if (!alsoRuns) return strengthDone ? 'completed' : 'missed';
      if (strengthDone && ranToday) return 'completed';
      return strengthDone || ranToday ? 'partial' : 'missed';
    }
    case 'running':
      return ranToday ? 'completed' : 'missed';
    case 'volleyball':
    case 'walk':
      // No hay forma de registrarlos todavía; si hubo algún registro ese día
      // se da por hecho, y si no se deja como pendiente sin marcarlo fallado.
      return strengthDone || ranToday ? 'completed' : 'future';
    default:
      return 'missed';
  }
}

/** Construye el resumen de un día. */
export function buildAttendanceDay(
  date: DateStr,
  today: DateStr,
  profile: Pick<Profile, 'goals' | 'planStartDate' | 'planWeeks'> | null,
  records: DayRecords,
): AttendanceDay {
  const plan = WEEK_PATTERN[new Date(`${date}T00:00:00`).getDay()]!;
  const planWeek = profile ? planWeekFor(profile.planStartDate, date, profile.planWeeks) : 1;

  const waterGoal = waterGoalFor(profile, date);
  const nutritionGoals = goalsFor(profile, date);

  const totalRunKm = records.running.reduce((sum, run) => sum + run.distanceKm, 0);

  return {
    date,
    planWeek,
    isDeload: isDeloadWeek(planWeek),
    plannedKind: plan.kind,
    plannedLabel: plan.label,
    status: resolveStatus(date, today, plan.kind, records),
    strength: records.strength
      ? {
          completionPct: records.strength.sessionCompletionPct,
          volumeKg: Math.round(records.strength.sessionVolumeKg),
          templateId: records.strength.templateId,
        }
      : null,
    running: records.running.length
      ? { distanceKm: Math.round(totalRunKm * 10) / 10, runType: records.running[0]!.runType }
      : null,
    water: records.water
      ? {
          totalMl: records.water.totalMl,
          goalMl: records.water.goalMl || waterGoal,
          met: records.water.totalMl >= (records.water.goalMl || waterGoal),
        }
      : null,
    nutrition: records.nutrition
      ? {
          proteinG: records.nutrition.totals.proteinG,
          goalProteinG: records.nutrition.goals.proteinG || nutritionGoals.proteinG,
          met: records.nutrition.totals.proteinG >= (records.nutrition.goals.proteinG || nutritionGoals.proteinG),
        }
      : null,
  };
}

/** Días de un mes, de 1 a 28-31. */
export function daysOfMonth(year: number, month: number): DateStr[] {
  const days: DateStr[] = [];
  // `month` es 1-12; el día 0 del mes siguiente es el último de este.
  const total = new Date(year, month, 0).getDate();
  for (let day = 1; day <= total; day++) {
    days.push(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  }
  return days;
}

/** Adherencia del conjunto: cuántos días exigibles se cumplieron. */
export function adherenceOf(days: readonly AttendanceDay[]): {
  completed: number;
  partial: number;
  missed: number;
  required: number;
  pct: number;
} {
  // Los días de descanso y los futuros no cuentan: no hay nada que cumplir.
  const required = days.filter((d) => d.status !== 'rest' && d.status !== 'future');
  const completed = required.filter((d) => d.status === 'completed').length;
  const partial = required.filter((d) => d.status === 'partial').length;

  return {
    completed,
    partial,
    missed: required.filter((d) => d.status === 'missed').length,
    required: required.length,
    // Un día parcial cuenta como medio: hacer la carrera y saltarse la fuerza
    // no es cumplir, pero tampoco es no haber aparecido.
    pct: required.length === 0 ? 0 : Math.round(((completed + partial * 0.5) / required.length) * 100),
  };
}

/** Racha de días completados hacia atrás desde hoy. */
export function attendanceStreak(days: readonly AttendanceDay[], today: DateStr): number {
  const byDate = new Map(days.map((d) => [d.date, d]));
  const cursor = new Date(`${today}T00:00:00`);

  const key = () => {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, '0');
    const d = String(cursor.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Si hoy aún no está hecho no se rompe la racha: puede estar por entrenar.
  if (byDate.get(today)?.status !== 'completed') cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  for (let i = 0; i < 366; i++) {
    const day = byDate.get(key());
    if (!day) break;
    // Los descansos no suman pero tampoco cortan: el plan los prescribe.
    if (day.status === 'rest') {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    if (day.status !== 'completed') break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
