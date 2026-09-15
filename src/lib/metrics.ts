import type { DateStr } from '../types/models';
import { daysBetween, parseDateStr, toDateStr } from './date';

/**
 * Métricas de adherencia al plan.
 *
 * Son funciones puras sobre una lista de días: no saben de MongoDB ni de
 * `localStorage`. La lógica viene de `src/scripts/storage.js`, donde estaba
 * pegada al almacenamiento y no se podía probar. Separarla permite usarlas
 * tanto con la proyección de asistencia (Tanda 7) como con los datos que
 * queden en el navegador mientras dure la migración.
 */

/** Un día del plan, mirado sólo desde la perspectiva de "¿se hizo?". */
export interface DayRecord {
  date: DateStr;
  completed: boolean;
}

function completedDatesDesc(records: readonly DayRecord[]): DateStr[] {
  return records
    .filter((r) => r.completed)
    .map((r) => r.date)
    .sort((a, b) => b.localeCompare(a));
}

/**
 * Días consecutivos completados hasta hoy.
 *
 * Si hoy todavía no está registrado, la racha se cuenta desde ayer. Sin eso,
 * una racha de 20 días aparecería como 0 cada mañana hasta entrenar, que es
 * justo cuando desmotiva.
 */
export function currentStreak(records: readonly DayRecord[], today: DateStr): number {
  const completed = new Set(completedDatesDesc(records));
  if (completed.size === 0) return 0;

  const cursor = parseDateStr(today);
  if (!completed.has(today)) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  // El tope evita recorrer indefinidamente si llegan datos corruptos.
  for (let i = 0; i < 366; i++) {
    if (!completed.has(toDateStr(cursor))) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Racha más larga registrada, en cualquier momento del historial. */
export function longestStreak(records: readonly DayRecord[]): number {
  const dates = completedDatesDesc(records).reverse();
  if (dates.length === 0) return 0;

  let longest = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    run = daysBetween(dates[i - 1]!, dates[i]!) === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }
  return longest;
}

/** Lunes de la semana a la que pertenece una fecha. El plan empieza en lunes. */
export function mondayOf(date: DateStr): DateStr {
  const d = parseDateStr(date);
  const dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  return toDateStr(d);
}

/**
 * Sesiones completadas esta semana frente a las planificadas.
 *
 * `planned` es cuántas sesiones tiene la semana según el plan; en rutina.md
 * son 6 (todos los días menos el miércoles, que es descanso total).
 */
export function weekCompletion(
  records: readonly DayRecord[],
  today: DateStr,
  planned = 6,
): { completed: number; planned: number; pct: number } {
  const monday = mondayOf(today);
  const completed = records.filter(
    (r) => r.completed && daysBetween(monday, r.date) >= 0 && daysBetween(monday, r.date) < 7,
  ).length;

  return {
    completed,
    planned,
    pct: planned === 0 ? 0 : Math.round((completed / planned) * 100),
  };
}

/** Porcentaje de días registrados que se completaron. */
export function completionRate(records: readonly DayRecord[]): number {
  if (records.length === 0) return 0;
  const done = records.filter((r) => r.completed).length;
  return Math.round((done / records.length) * 100);
}
