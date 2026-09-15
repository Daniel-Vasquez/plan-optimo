import type { DateStr, RunType, RunningSession } from '../types/models';
import { PACE_ZONES, riegelProjection, zoneVerdict } from './pace';

/**
 * Agregaciones para las gráficas de running.
 *
 * Funciones puras sobre una lista de sesiones: no tocan Mongo ni el DOM, así
 * que se pueden probar. Las gráficas sólo pintan lo que sale de aquí.
 */

/** Orden fijo de los tipos, de menor a mayor intensidad. */
export const RUN_TYPE_ORDER: RunType[] = ['easy', 'long', 'threshold', 'vo2max', 'timetrial'];

/**
 * Paleta categórica de los tipos de sesión.
 *
 * Validada con el script del método de visualización contra las dos
 * superficies del tema (oscuro #161920 y claro #ffffff): banda de luminosidad,
 * chroma, separación para daltonismo y contraste. El ORDEN importa: es el que
 * hace que los pares adyacentes se distingan, así que no se reordena ni se
 * cicla para una sexta serie.
 */
export const RUN_TYPE_COLORS: Record<RunType, string> = {
  easy: '#3b82f6',
  long: '#059669',
  threshold: '#ea580c',
  vo2max: '#8b5cf6',
  timetrial: '#ec4899',
  // Competición comparte color con contrarreloj: ambas son "a tope" y juntas
  // son un puñado de sesiones en 12 semanas.
  race: '#ec4899',
};

/** Lunes de la semana de una fecha. El plan empieza en lunes. */
export function weekKey(date: DateStr): DateStr {
  const d = new Date(`${date}T00:00:00`);
  const dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface WeeklyVolume {
  week: DateStr;
  distanceKm: number;
  durationSeconds: number;
  sessions: number;
}

/** Volumen por semana, de la más antigua a la más reciente. */
export function weeklyVolume(sessions: readonly RunningSession[]): WeeklyVolume[] {
  const byWeek = new Map<DateStr, WeeklyVolume>();

  for (const session of sessions) {
    const week = weekKey(session.date);
    const entry = byWeek.get(week) ?? {
      week,
      distanceKm: 0,
      durationSeconds: 0,
      sessions: 0,
    };
    entry.distanceKm += session.distanceKm;
    entry.durationSeconds += session.durationSeconds;
    entry.sessions += 1;
    byWeek.set(week, entry);
  }

  return [...byWeek.values()]
    .map((entry) => ({ ...entry, distanceKm: Math.round(entry.distanceKm * 10) / 10 }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

/**
 * Reparto del volumen por zona de intensidad.
 *
 * Responde a la pregunta que plantea `rutina.md`: ¿qué porcentaje del volumen
 * es realmente fácil? El diagnóstico dice que casi todo está en "tierra de
 * nadie", y esto lo hace visible.
 */
export function volumeByType(
  sessions: readonly RunningSession[],
): { runType: RunType; distanceKm: number; pct: number }[] {
  const total = sessions.reduce((sum, s) => sum + s.distanceKm, 0);
  if (total === 0) return [];

  const byType = new Map<RunType, number>();
  for (const session of sessions) {
    byType.set(session.runType, (byType.get(session.runType) ?? 0) + session.distanceKm);
  }

  return [...byType.entries()]
    .map(([runType, distanceKm]) => ({
      runType,
      distanceKm: Math.round(distanceKm * 10) / 10,
      pct: Math.round((distanceKm / total) * 100),
    }))
    .sort(
      (a, b) => RUN_TYPE_ORDER.indexOf(a.runType) - RUN_TYPE_ORDER.indexOf(b.runType),
    );
}

/**
 * Cuánto del volumen cae dentro de su zona objetivo.
 *
 * Un porcentaje bajo de "en zona" con muchas sesiones fáciles corridas
 * demasiado rápido es exactamente el problema que describe rutina.md.
 */
export function zoneAdherence(sessions: readonly RunningSession[]): {
  faster: number;
  inZone: number;
  slower: number;
} {
  const counts = { faster: 0, inZone: 0, slower: 0 };
  for (const session of sessions) {
    const verdict = zoneVerdict(session.runType, session.avgPaceSeconds);
    if (verdict !== 'noZone') counts[verdict] += 1;
  }
  return counts;
}

export interface RunRecords {
  bestPaceSeconds: number | null;
  longestKm: number | null;
  best5kSeconds: number | null;
  biggestWeekKm: number | null;
  totalKm: number;
  totalSeconds: number;
}

/** Récords personales. Un 5K "real" admite un margen: pocos miden exacto. */
export function runRecords(sessions: readonly RunningSession[]): RunRecords {
  if (sessions.length === 0) {
    return {
      bestPaceSeconds: null,
      longestKm: null,
      best5kSeconds: null,
      biggestWeekKm: null,
      totalKm: 0,
      totalSeconds: 0,
    };
  }

  const near5k = sessions.filter((s) => s.distanceKm >= 4.8 && s.distanceKm <= 5.3);
  const weeks = weeklyVolume(sessions);

  return {
    bestPaceSeconds: Math.min(...sessions.map((s) => s.avgPaceSeconds)),
    longestKm: Math.max(...sessions.map((s) => s.distanceKm)),
    best5kSeconds: near5k.length ? Math.min(...near5k.map((s) => s.durationSeconds)) : null,
    biggestWeekKm: weeks.length ? Math.max(...weeks.map((w) => w.distanceKm)) : null,
    totalKm: Math.round(sessions.reduce((sum, s) => sum + s.distanceKm, 0) * 10) / 10,
    totalSeconds: sessions.reduce((sum, s) => sum + s.durationSeconds, 0),
  };
}

/**
 * Serie de 5K estimados a lo largo del tiempo.
 *
 * Las contrarrelojes cuentan tal cual; el resto se proyecta con Riegel. Así la
 * línea no espera a las semanas 6 y 12 para mostrar si se está mejorando.
 */
export function fiveKProjection(
  sessions: readonly RunningSession[],
): { date: DateStr; seconds: number; measured: boolean }[] {
  return sessions
    // Se excluyen los rodajes fáciles y las tiradas largas: se corren a ritmo
    // suave POR DISEÑO, así que proyectar un 5K desde ellos no mide el
    // potencial, sólo ensucia la línea con marcas artificialmente malas.
    .filter((s) => s.distanceKm >= 3 && s.runType !== 'easy' && s.runType !== 'long')
    .map((session) => {
      const measured = session.runType === 'timetrial' || session.runType === 'race';
      const seconds =
        measured && Math.abs(session.distanceKm - 5) < 0.3
          ? session.durationSeconds
          : riegelProjection(session.distanceKm, session.durationSeconds, 5);
      return seconds === null ? null : { date: session.date, seconds, measured };
    })
    .filter((point): point is { date: DateStr; seconds: number; measured: boolean } => point !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Rango objetivo de volumen semanal, de rutina.md: 17-20 km. */
export const WEEKLY_VOLUME_TARGET = { minKm: 17, maxKm: 20 };

export { PACE_ZONES };
