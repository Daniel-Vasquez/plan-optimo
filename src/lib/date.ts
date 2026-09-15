import type { DateStr } from '../types/models';

/**
 * Fechas de calendario.
 *
 * Regla del proyecto: un día del plan es un `DateStr` (`YYYY-MM-DD`) en la
 * zona horaria DEL USUARIO. Nunca se usa `toISOString()` para esto, porque
 * convierte a UTC antes de formatear y corre el día para cualquiera al este
 * de Greenwich (y a partir de las 18:00 al oeste). Un día de corrimiento
 * falsea la adherencia al plan entera.
 */

/** Formatea un `Date` como `YYYY-MM-DD` usando su día de calendario local. */
export function toDateStr(date: Date): DateStr {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Qué día es "hoy" para el usuario.
 *
 * Importa en el servidor: el proceso puede estar en UTC mientras el usuario
 * vive en America/Mexico_City, y sin esto un entrenamiento de las 20:00 se
 * registraría en el día siguiente. `en-CA` formatea justamente como
 * `YYYY-MM-DD`.
 */
export function todayInTimezone(timezone: string): DateStr {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    // Zona horaria inválida guardada en el perfil: mejor el día del servidor
    // que reventar el renderizado de toda la página.
    return toDateStr(new Date());
  }
}

/** Convierte `YYYY-MM-DD` a `Date` a medianoche local, sin pasar por UTC. */
export function parseDateStr(value: DateStr): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
}

/** Días completos entre dos fechas de calendario. */
export function daysBetween(from: DateStr, to: DateStr): number {
  const ms = parseDateStr(to).getTime() - parseDateStr(from).getTime();
  return Math.floor(ms / 86_400_000);
}

/**
 * Semana del plan (1-indexada), acotada al rango del plan.
 *
 * Antes de la fecha de inicio devuelve 1, y después del final se queda en la
 * última semana: el badge nunca muestra "Sem 0" ni "Sem 19/12".
 */
export function planWeekFor(planStartDate: DateStr, today: DateStr, planWeeks: number): number {
  const week = Math.floor(daysBetween(planStartDate, today) / 7) + 1;
  return Math.max(1, Math.min(planWeeks, week));
}
