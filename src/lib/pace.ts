import type { RunType, RunningSession } from '../types/models';

/**
 * Ritmos, zonas y conversiones de carrera.
 *
 * Las zonas salen de `rutina.md §2`, calculadas desde la marca de partida de
 * 5K en 30:40. El diagnóstico de ese documento es que casi todo el volumen
 * está en "tierra de nadie": demasiado rápido para recuperar, demasiado lento
 * para mejorar. Por eso el módulo compara siempre contra la zona objetivo del
 * tipo de sesión en vez de limitarse a mostrar el ritmo.
 */

/** Segundos por kilómetro que delimitan una zona. */
export interface PaceZone {
  minSeconds: number;
  maxSeconds: number;
}

export const PACE_ZONES: Record<RunType, PaceZone | null> = {
  // Fácil y tirada larga: 7:15-7:45. Sí, más lento de lo que se corre hoy;
  // es intencional según rutina.md.
  easy: { minSeconds: 435, maxSeconds: 465 },
  long: { minSeconds: 435, maxSeconds: 465 },
  // Umbral: 6:15-6:25, "cómodamente duro".
  threshold: { minSeconds: 375, maxSeconds: 385 },
  // VO₂máx: 5:45-5:55.
  vo2max: { minSeconds: 345, maxSeconds: 355 },
  // En competición y contrarreloj se va a tope: no hay zona que respetar.
  race: null,
  timetrial: null,
};

export const RUN_TYPE_LABELS: Record<RunType, string> = {
  vo2max: 'VO₂máx',
  threshold: 'Umbral',
  easy: 'Fácil',
  long: 'Tirada larga',
  race: 'Competición',
  timetrial: 'Contrarreloj',
};

/** Objetivo de una zona: su punto medio, que es contra lo que se compara. */
export function targetPaceFor(runType: RunType): number | null {
  const zone = PACE_ZONES[runType];
  if (!zone) return null;
  return Math.round((zone.minSeconds + zone.maxSeconds) / 2);
}

/** Segundos por kilómetro. Devuelve null si los datos no permiten calcularlo. */
export function paceSecondsPerKm(distanceKm: number, durationSeconds: number): number | null {
  if (!(distanceKm > 0) || !(durationSeconds > 0)) return null;
  return Math.round(durationSeconds / distanceKm);
}

/** `mm:ss` a partir de segundos. Para ritmos, que nunca llegan a una hora. */
export function formatPace(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) return '—';
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** `h:mm:ss` o `mm:ss` según haga falta. Para duraciones de sesión. */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) return '—';
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Interpreta una duración escrita a mano.
 *
 * Admite `mm:ss` y `h:mm:ss` porque una tirada larga pasa de la hora y
 * obligar a escribir `0:75:00` sería absurdo. Devuelve null si no encaja, para
 * poder avisar en vez de guardar un cero silencioso.
 */
export function parseDuration(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(':');
  if (parts.length < 2 || parts.length > 3) return null;
  if (!parts.every((part) => /^\d{1,3}$/.test(part))) return null;

  const numbers = parts.map(Number);
  const [h, m, s] = parts.length === 3 ? numbers : [0, ...numbers];
  if (m! > 59 || s! > 59) return null;

  const total = h! * 3600 + m! * 60 + s!;
  return total > 0 ? total : null;
}

/** Dónde cae un ritmo respecto a su zona objetivo. */
export type ZoneVerdict = 'faster' | 'inZone' | 'slower' | 'noZone';

export function zoneVerdict(runType: RunType, paceSeconds: number): ZoneVerdict {
  const zone = PACE_ZONES[runType];
  if (!zone) return 'noZone';
  // Menos segundos por km es más rápido.
  if (paceSeconds < zone.minSeconds) return 'faster';
  if (paceSeconds > zone.maxSeconds) return 'slower';
  return 'inZone';
}

/**
 * Proyecta una marca a otra distancia con la fórmula de Riegel.
 *
 * El exponente 1,06 es el habitual para corredores aficionados. Sirve para
 * estimar el 5K desde una sesión de otra distancia sin tener que hacer la
 * contrarreloj.
 */
export function riegelProjection(
  knownDistanceKm: number,
  knownSeconds: number,
  targetDistanceKm: number,
): number | null {
  if (!(knownDistanceKm > 0) || !(knownSeconds > 0) || !(targetDistanceKm > 0)) return null;
  return Math.round(knownSeconds * (targetDistanceKm / knownDistanceKm) ** 1.06);
}

/**
 * ¿Hay fatiga acumulada?
 *
 * Regla de `rutina.md §4D`: si los intervalos salen más de 5 s/km por encima
 * del objetivo durante dos semanas seguidas, hay que bajar el volumen de
 * pierna. Se mira sólo VO₂máx y umbral: en los rodajes fáciles ir "lento" es
 * precisamente lo que se busca.
 */
export const FATIGUE_DELTA_SECONDS = 5;

export function detectFatigue(
  sessions: readonly Pick<RunningSession, 'date' | 'runType' | 'paceDeltaSeconds'>[],
): { fatigued: boolean; weeks: string[] } {
  const quality = sessions.filter(
    (s) =>
      (s.runType === 'vo2max' || s.runType === 'threshold') &&
      s.paceDeltaSeconds !== null &&
      s.paceDeltaSeconds !== undefined,
  );

  // Se agrupa por semana ISO aproximada usando el lunes de cada fecha.
  const byWeek = new Map<string, number[]>();
  for (const session of quality) {
    const monday = mondayKey(session.date);
    const list = byWeek.get(monday) ?? [];
    list.push(session.paceDeltaSeconds!);
    byWeek.set(monday, list);
  }

  const slowWeeks = [...byWeek.entries()]
    .filter(([, deltas]) => average(deltas) > FATIGUE_DELTA_SECONDS)
    .map(([week]) => week)
    .sort();

  // Dos semanas consecutivas: sus lunes distan exactamente 7 días.
  for (let i = 1; i < slowWeeks.length; i++) {
    const previous = new Date(`${slowWeeks[i - 1]}T00:00:00`);
    const current = new Date(`${slowWeeks[i]}T00:00:00`);
    const days = Math.round((current.getTime() - previous.getTime()) / 86_400_000);
    if (days === 7) return { fatigued: true, weeks: [slowWeeks[i - 1]!, slowWeeks[i]!] };
  }

  return { fatigued: false, weeks: [] };
}

function average(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function mondayKey(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  const dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
