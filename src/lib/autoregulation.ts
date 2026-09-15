import type { BodyMetric, DateStr, RunningSession, StrengthSession } from '../types/models';
import { parseDateStr, toDateStr } from './date';
import { detectFatigue } from './pace';
import { GAIN_THRESHOLD_KG_PER_WEEK, waistChange, weeklyRateKg, weightTrend } from './body';

/**
 * Reglas de autorregulación de `rutina.md §4D` y §4E.
 *
 * El documento las llama obligatorias, pero hasta ahora había que recordarlas
 * de memoria y aplicarlas a ojo. Aquí se evalúan contra los datos registrados y
 * se muestran el día en que tocan, que es cuando sirven de algo.
 */

export type AdviceSeverity = 'info' | 'warning';

export interface Advice {
  id: string;
  severity: AdviceSeverity;
  title: string;
  detail: string;
  /** Sección de rutina.md de la que sale, para poder contrastarla. */
  source: string;
}

export interface AutoregulationInput {
  date: DateStr;
  runs: readonly RunningSession[];
  strength: readonly StrengthSession[];
  body: readonly BodyMetric[];
  sleepHoursToday: number | null;
}

/** Kilómetros a partir de los cuales la tirada larga pasa factura al lunes. */
const LONG_RUN_THRESHOLD_KM = 13;

export function evaluateAutoregulation(input: AutoregulationInput): Advice[] {
  const advice: Advice[] = [];
  const dow = parseDateStr(input.date).getDay();

  // ── El lunes después de una tirada larga de 13 km o más ───────────────
  if (dow === 1) {
    const yesterday = toDateStr(new Date(parseDateStr(input.date).getTime() - 86_400_000));
    const sundayKm = input.runs
      .filter((run) => run.date === yesterday)
      .reduce((sum, run) => sum + run.distanceKm, 0);

    if (sundayKm >= LONG_RUN_THRESHOLD_KM) {
      advice.push({
        id: 'long-run-monday',
        severity: 'warning',
        title: `Ayer corriste ${Math.round(sundayKm * 10) / 10} km`,
        detail:
          'Quita una serie del primer ejercicio de hoy. Con una tirada de 13 km o más encima, la sesión completa acumula más fatiga de la que se recupera.',
        source: 'rutina.md §4D',
      });
    }
  }

  // ── El domingo después del voleibol ───────────────────────────────────
  if (dow === 0) {
    advice.push({
      id: 'volleyball-sunday',
      severity: 'info',
      title: 'Ayer hubo voleibol',
      detail:
        'Si la sesión fue especialmente intensa, baja la tirada a 9-10 km a ritmo fácil. No lo negocies: son 4 horas de saltos las que llevas encima.',
      source: 'rutina.md §4D',
    });
  }

  // ── Dormir menos de 6 horas ───────────────────────────────────────────
  if (input.sleepHoursToday !== null && input.sleepHoursToday > 0 && input.sleepHoursToday < 6) {
    advice.push({
      id: 'low-sleep',
      severity: 'warning',
      title: `Has dormido ${input.sleepHoursToday} h`,
      detail:
        'Convierte la sesión de hoy en una versión RIR 4 y no subas peso. Entrenar duro con 5 horas de sueño genera daño sin adaptación.',
      source: 'rutina.md §4D',
    });
  }

  // ── Series lentas dos semanas seguidas ────────────────────────────────
  const fatigue = detectFatigue(input.runs);
  if (fatigue.fatigued) {
    advice.push({
      id: 'accumulated-fatigue',
      severity: 'warning',
      title: 'Fatiga acumulada en las series',
      detail:
        'Tus intervalos llevan dos semanas saliendo más de 5 s/km por encima del objetivo. Baja la pierna a 2 series por ejercicio durante dos semanas.',
      source: 'rutina.md §4D',
    });
  }

  // ── Peso subiendo sin que baje la cintura ─────────────────────────────
  const trend = weightTrend(input.body);
  const rate = weeklyRateKg(trend);
  const waist = waistChange(input.body);

  if (rate !== null && rate > GAIN_THRESHOLD_KG_PER_WEEK && (waist === null || waist >= 0)) {
    advice.push({
      id: 'weight-gain',
      severity: 'warning',
      title: `El peso sube ${rate} kg por semana`,
      detail:
        'La cintura no está bajando y el peso sube por encima de 0,4 kg semanales. Recorta unas 150 kcal diarias.',
      source: 'rutina.md §4E',
    });
  }

  return advice;
}
