import { describe, expect, it } from 'vitest';
import { waistChange, weeklyRateKg, weightChange, weightTrend } from '../body';
import { evaluateAutoregulation } from '../autoregulation';
import type { BodyMetric, RunningSession } from '../../types/models';

const metric = (date: string, weightKg: number | null, waistCm: number | null = null): BodyMetric =>
  ({ date, weightKg, waistCm, note: '' }) as BodyMetric;

describe('weightTrend', () => {
  it('no da tendencia con un solo pesaje', () => {
    // Con un dato, la "media" sería el dato crudo disfrazado de tendencia.
    const points = weightTrend([metric('2026-09-14', 66.3)]);
    expect(points[0]!.trendKg).toBeNull();
    expect(points[0]!.weightKg).toBe(66.3);
  });

  it('promedia la ventana de 7 días', () => {
    const points = weightTrend([
      metric('2026-09-14', 66.0),
      metric('2026-09-15', 67.0),
      metric('2026-09-16', 66.5),
    ]);
    expect(points[2]!.trendKg).toBeCloseTo(66.5, 2);
  });

  it('deja fuera de la ventana los pesajes de más de 7 días atrás', () => {
    const points = weightTrend([
      metric('2026-09-01', 70.0),
      metric('2026-09-14', 66.0),
      metric('2026-09-15', 66.2),
    ]);
    // El de septiembre 1 no entra: sólo promedia 66.0 y 66.2.
    expect(points[2]!.trendKg).toBeCloseTo(66.1, 2);
  });

  it('ignora los días sin peso registrado', () => {
    expect(weightTrend([metric('2026-09-14', null)])).toHaveLength(0);
  });
});

describe('weightChange', () => {
  it('compara tendencias, no pesajes sueltos', () => {
    const points = weightTrend([
      metric('2026-09-14', 67.0), metric('2026-09-15', 67.0),
      metric('2026-09-28', 66.0), metric('2026-09-29', 66.0),
    ]);
    expect(weightChange(points)).toBeCloseTo(-1, 1);
  });

  it('es null sin suficientes datos', () => {
    expect(weightChange(weightTrend([metric('2026-09-14', 66)]))).toBeNull();
  });
});

describe('waistChange', () => {
  it('resta la primera medida de la última', () => {
    expect(waistChange([metric('2026-09-14', null, 84), metric('2026-10-14', null, 81)]))
      .toBeCloseTo(-3, 1);
  });

  it('es null con una sola medida', () => {
    expect(waistChange([metric('2026-09-14', null, 84)])).toBeNull();
  });
});

describe('weeklyRateKg', () => {
  it('normaliza el cambio a kilos por semana', () => {
    const points = weightTrend([
      metric('2026-09-01', 66.0), metric('2026-09-02', 66.0),
      metric('2026-09-15', 67.0), metric('2026-09-16', 67.0),
    ]);
    const rate = weeklyRateKg(points)!;
    expect(rate).toBeGreaterThan(0.3);
    expect(rate).toBeLessThan(0.6);
  });

  it('no extrapola con menos de una semana de datos', () => {
    const points = weightTrend([metric('2026-09-14', 66), metric('2026-09-15', 67)]);
    expect(weeklyRateKg(points)).toBeNull();
  });
});

describe('evaluateAutoregulation', () => {
  const base = { runs: [], strength: [], body: [], sleepHoursToday: null };
  const run = (date: string, distanceKm: number): RunningSession =>
    ({ date, distanceKm, runType: 'long', paceDeltaSeconds: null }) as RunningSession;

  it('avisa el lunes tras una tirada de 13 km o más', () => {
    const advice = evaluateAutoregulation({
      ...base, date: '2026-09-21', runs: [run('2026-09-20', 14)],
    });
    expect(advice.map((a) => a.id)).toContain('long-run-monday');
  });

  it('no avisa si la tirada fue corta', () => {
    const advice = evaluateAutoregulation({
      ...base, date: '2026-09-21', runs: [run('2026-09-20', 10)],
    });
    expect(advice.map((a) => a.id)).not.toContain('long-run-monday');
  });

  it('no avisa un martes aunque la tirada fuera larga', () => {
    const advice = evaluateAutoregulation({
      ...base, date: '2026-09-22', runs: [run('2026-09-20', 14)],
    });
    expect(advice.map((a) => a.id)).not.toContain('long-run-monday');
  });

  it('avisa al dormir menos de 6 horas', () => {
    const advice = evaluateAutoregulation({ ...base, date: '2026-09-14', sleepHoursToday: 5 });
    expect(advice.map((a) => a.id)).toContain('low-sleep');
  });

  it('no avisa durmiendo 7 horas', () => {
    const advice = evaluateAutoregulation({ ...base, date: '2026-09-14', sleepHoursToday: 7 });
    expect(advice.map((a) => a.id)).not.toContain('low-sleep');
  });

  it('recuerda la regla del voleibol los domingos', () => {
    const advice = evaluateAutoregulation({ ...base, date: '2026-09-20' });
    expect(advice.map((a) => a.id)).toContain('volleyball-sunday');
  });

  it('avisa si el peso sube por encima del umbral sin que baje la cintura', () => {
    const body = [
      metric('2026-09-01', 66.0, 84), metric('2026-09-02', 66.0, null),
      metric('2026-09-15', 67.5, 84), metric('2026-09-16', 67.5, null),
    ];
    const advice = evaluateAutoregulation({ ...base, date: '2026-09-16', body });
    expect(advice.map((a) => a.id)).toContain('weight-gain');
  });

  it('no avisa si la cintura está bajando, aunque suba el peso', () => {
    // Ganar músculo perdiendo cintura es exactamente el objetivo del plan.
    const body = [
      metric('2026-09-01', 66.0, 84), metric('2026-09-02', 66.0, null),
      metric('2026-09-15', 67.5, 81), metric('2026-09-16', 67.5, null),
    ];
    const advice = evaluateAutoregulation({ ...base, date: '2026-09-16', body });
    expect(advice.map((a) => a.id)).not.toContain('weight-gain');
  });

  it('no inventa avisos sin datos', () => {
    expect(evaluateAutoregulation({ ...base, date: '2026-09-14' })).toEqual([]);
  });
});
