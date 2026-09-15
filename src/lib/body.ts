import type { BodyMetric, DateStr } from '../types/models';
import { daysBetween } from './date';

/**
 * Seguimiento corporal.
 *
 * `rutina.md §4E` pide "peso promedio de 3-4 pesajes matutinos", no el peso de
 * un día suelto: el peso diario oscila un kilo largo por agua, sal y glucógeno,
 * y leerlo crudo hace creer que se engorda o adelgaza cada 48 horas. Por eso
 * la tendencia se calcula con media móvil.
 */

/** Ventana de la media móvil, en días. */
export const TREND_WINDOW_DAYS = 7;

export interface TrendPoint {
  date: DateStr;
  /** Valor medido ese día, si lo hubo. */
  weightKg: number | null;
  /** Media móvil de los últimos 7 días; null si no hay suficientes datos. */
  trendKg: number | null;
}

/**
 * Serie de peso con su media móvil.
 *
 * La media exige al menos dos pesajes en la ventana: con uno solo la "media"
 * sería el propio dato crudo disfrazado de tendencia.
 */
export function weightTrend(metrics: readonly BodyMetric[]): TrendPoint[] {
  const weighed = metrics
    .filter((m) => m.weightKg !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  return weighed.map((metric, index) => {
    const window = weighed
      .slice(0, index + 1)
      .filter((other) => daysBetween(other.date, metric.date) < TREND_WINDOW_DAYS);

    const values = window.map((w) => w.weightKg!);
    return {
      date: metric.date,
      weightKg: metric.weightKg,
      trendKg:
        values.length >= 2
          ? Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 100) / 100
          : null,
    };
  });
}

/**
 * Cambio de peso entre la primera y la última tendencia disponibles.
 *
 * Se comparan tendencias y no pesajes sueltos: comparar dos días concretos
 * mide sobre todo cuánta agua se retenía cada uno.
 */
export function weightChange(points: readonly TrendPoint[]): number | null {
  const withTrend = points.filter((p) => p.trendKg !== null);
  if (withTrend.length < 2) return null;
  const first = withTrend[0]!.trendKg!;
  const last = withTrend[withTrend.length - 1]!.trendKg!;
  return Math.round((last - first) * 100) / 100;
}

/** Cambio de cintura entre la primera y la última medida. */
export function waistChange(metrics: readonly BodyMetric[]): number | null {
  const measured = metrics
    .filter((m) => m.waistCm !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (measured.length < 2) return null;
  return Math.round((measured[measured.length - 1]!.waistCm! - measured[0]!.waistCm!) * 10) / 10;
}

/**
 * Ritmo semanal de cambio de peso.
 *
 * `rutina.md §4E` marca el umbral: si la cintura no baja y el peso sube más de
 * 0,4 kg por semana, hay que recortar unas 150 kcal. Esto da la cifra que se
 * compara contra ese umbral.
 */
export function weeklyRateKg(points: readonly TrendPoint[]): number | null {
  const withTrend = points.filter((p) => p.trendKg !== null);
  if (withTrend.length < 2) return null;

  const first = withTrend[0]!;
  const last = withTrend[withTrend.length - 1]!;
  const days = daysBetween(first.date, last.date);
  if (days < 7) return null;

  return Math.round(((last.trendKg! - first.trendKg!) / (days / 7)) * 100) / 100;
}

/** Umbral de rutina.md §4E para recortar calorías. */
export const GAIN_THRESHOLD_KG_PER_WEEK = 0.4;
