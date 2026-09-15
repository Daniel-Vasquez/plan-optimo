import type { DateStr, Profile, WaterLog } from '../types/models';
import { parseDateStr } from './date';

/**
 * Metas de hidratación.
 *
 * `rutina.md §1` fija una base de 2,5-3 L y añade "+750 ml/hora con
 * electrolitos" el sábado de voleibol. Son 4 horas de juego, así que ese día
 * la meta casi se dobla: mostrar la meta base el sábado haría creer que se ha
 * cumplido cuando en realidad se va muy corto, justo en la sesión más larga
 * de la semana y la que peor se alimenta.
 */

/** Horas de voleibol del sábado, según el cronograma semanal de rutina.md. */
const VOLLEYBALL_HOURS = 4;

/** Día de la semana con voleibol (6 = sábado, con domingo = 0). */
const VOLLEYBALL_DOW = 6;

export function isVolleyballDay(date: DateStr): boolean {
  return parseDateStr(date).getDay() === VOLLEYBALL_DOW;
}

/** Metas que usa el módulo cuando el perfil todavía no existe. */
const FALLBACK = { waterMlPerDay: 2750, waterVolleyballExtraMlPerHour: 750 };

/** Meta de agua de un día concreto, ya con el extra de voleibol si aplica. */
export function waterGoalFor(
  profile: Pick<Profile, 'goals'> | null,
  date: DateStr,
): number {
  const base = profile?.goals.waterMlPerDay ?? FALLBACK.waterMlPerDay;
  if (!isVolleyballDay(date)) return base;

  const extraPerHour =
    profile?.goals.waterVolleyballExtraMlPerHour ?? FALLBACK.waterVolleyballExtraMlPerHour;
  return base + extraPerHour * VOLLEYBALL_HOURS;
}

/** Porcentaje cumplido, acotado a 100 para que la barra no se desborde. */
export function waterPct(totalMl: number, goalMl: number): number {
  if (goalMl <= 0) return 0;
  return Math.min(100, Math.round((totalMl / goalMl) * 100));
}

/** Formatea mililitros como litros con un decimal: 2250 -> "2,25 L" es ruido. */
export function formatLiters(ml: number): string {
  return `${(ml / 1000).toFixed(1)} L`;
}

/** Un día vacío, para poder pintar la pantalla antes de que exista documento. */
export function emptyWaterDay(date: DateStr, goalMl: number): Pick<WaterLog, 'date' | 'goalMl' | 'totalMl' | 'entries'> {
  return { date, goalMl, totalMl: 0, entries: [] };
}

/**
 * Días consecutivos, hacia atrás desde hoy, en los que se alcanzó la meta.
 *
 * Hoy sólo cuenta si ya se cumplió: a media mañana nadie ha bebido 2,7 L, y
 * poner la racha a 0 cada amanecer no refleja nada útil.
 */
export function waterStreak(
  days: readonly Pick<WaterLog, 'date' | 'totalMl' | 'goalMl'>[],
  today: DateStr,
): number {
  const met = new Map(days.map((d) => [d.date, d.totalMl >= d.goalMl]));

  const cursor = parseDateStr(today);
  if (!met.get(today)) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  for (let i = 0; i < 366; i++) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, '0');
    const d = String(cursor.getDate()).padStart(2, '0');
    if (!met.get(`${y}-${m}-${d}`)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Media diaria de los días recibidos, redondeada a ml. */
export function waterAverage(days: readonly Pick<WaterLog, 'totalMl'>[]): number {
  if (days.length === 0) return 0;
  return Math.round(days.reduce((sum, d) => sum + d.totalMl, 0) / days.length);
}
