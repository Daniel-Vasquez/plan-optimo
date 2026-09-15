import { describe, expect, it } from 'vitest';
import {
  fiveKProjection,
  runRecords,
  volumeByType,
  weekKey,
  weeklyVolume,
  zoneAdherence,
} from '../run-stats';
import type { RunningSession, RunType } from '../../types/models';

function run(
  date: string,
  distanceKm: number,
  durationSeconds: number,
  runType: RunType = 'easy',
): RunningSession {
  return {
    date,
    runType,
    distanceKm,
    durationSeconds,
    avgPaceSeconds: Math.round(durationSeconds / distanceKm),
    targetPaceSeconds: null,
    paceDeltaSeconds: null,
    elevationGainM: null,
    avgHeartRate: null,
    maxHeartRate: null,
    intervals: [],
    perceivedEffort: null,
    shoes: null,
    note: '',
    userId: 'u1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('weekKey', () => {
  it('agrupa por el lunes de la semana', () => {
    expect(weekKey('2026-09-16')).toBe('2026-09-14');
  });

  it('mete el domingo en la semana que empezó el lunes anterior', () => {
    expect(weekKey('2026-09-20')).toBe('2026-09-14');
  });
});

describe('weeklyVolume', () => {
  it('suma distancia y tiempo por semana', () => {
    const weeks = weeklyVolume([
      run('2026-09-14', 10, 4500),
      run('2026-09-16', 5, 2100),
      run('2026-09-21', 12, 5400),
    ]);
    expect(weeks).toHaveLength(2);
    expect(weeks[0]!.week).toBe('2026-09-14');
    expect(weeks[0]!.distanceKm).toBe(15);
    expect(weeks[0]!.sessions).toBe(2);
    expect(weeks[1]!.distanceKm).toBe(12);
  });

  it('ordena de la más antigua a la más reciente', () => {
    const weeks = weeklyVolume([run('2026-09-21', 5, 2000), run('2026-09-14', 5, 2000)]);
    expect(weeks.map((w) => w.week)).toEqual(['2026-09-14', '2026-09-21']);
  });

  it('devuelve lista vacía sin sesiones', () => {
    expect(weeklyVolume([])).toEqual([]);
  });
});

describe('volumeByType', () => {
  it('reparte el volumen en porcentajes', () => {
    const result = volumeByType([
      run('2026-09-14', 30, 13500, 'easy'),
      run('2026-09-15', 10, 3800, 'threshold'),
    ]);
    expect(result.find((r) => r.runType === 'easy')!.pct).toBe(75);
    expect(result.find((r) => r.runType === 'threshold')!.pct).toBe(25);
  });

  it('ordena por intensidad creciente', () => {
    const result = volumeByType([
      run('2026-09-15', 5, 1750, 'vo2max'),
      run('2026-09-14', 10, 4500, 'easy'),
    ]);
    expect(result.map((r) => r.runType)).toEqual(['easy', 'vo2max']);
  });

  it('devuelve vacío si no hay distancia', () => {
    expect(volumeByType([])).toEqual([]);
  });
});

describe('zoneAdherence', () => {
  it('detecta los rodajes fáciles corridos demasiado rápido', () => {
    // El problema que diagnostica rutina.md: 6:18/km en un rodaje fácil, cuya
    // zona es 7:15-7:45.
    const result = zoneAdherence([run('2026-09-14', 10, 3780, 'easy')]);
    expect(result.faster).toBe(1);
    expect(result.inZone).toBe(0);
  });

  it('cuenta los que van en zona', () => {
    // 10 km a 7:30/km = 4500 s, dentro de 7:15-7:45.
    expect(zoneAdherence([run('2026-09-14', 10, 4500, 'easy')]).inZone).toBe(1);
  });

  it('ignora las contrarrelojes, que no tienen zona', () => {
    const result = zoneAdherence([run('2026-09-14', 5, 1700, 'timetrial')]);
    expect(result.faster + result.inZone + result.slower).toBe(0);
  });
});

describe('runRecords', () => {
  it('encuentra los récords', () => {
    const records = runRecords([
      run('2026-09-14', 10, 4500, 'easy'),
      run('2026-09-16', 5, 1700, 'timetrial'),
      run('2026-09-20', 14, 6300, 'long'),
    ]);
    expect(records.longestKm).toBe(14);
    expect(records.best5kSeconds).toBe(1700);
    expect(records.bestPaceSeconds).toBe(340);
    expect(records.totalKm).toBe(29);
  });

  it('admite un margen en el 5K: pocos miden exacto', () => {
    expect(runRecords([run('2026-09-16', 5.1, 1750, 'timetrial')]).best5kSeconds).toBe(1750);
    expect(runRecords([run('2026-09-16', 7, 2500, 'timetrial')]).best5kSeconds).toBeNull();
  });

  it('devuelve nulos sin sesiones', () => {
    const records = runRecords([]);
    expect(records.bestPaceSeconds).toBeNull();
    expect(records.totalKm).toBe(0);
  });
});

describe('fiveKProjection', () => {
  it('toma la contrarreloj de 5K tal cual, sin proyectar', () => {
    const points = fiveKProjection([run('2026-09-16', 5, 1800, 'timetrial')]);
    expect(points[0]!.seconds).toBe(1800);
    expect(points[0]!.measured).toBe(true);
  });

  it('proyecta desde otras distancias', () => {
    const points = fiveKProjection([run('2026-09-16', 10, 3780, 'threshold')]);
    expect(points[0]!.measured).toBe(false);
    expect(points[0]!.seconds).toBeGreaterThan(1700);
    expect(points[0]!.seconds).toBeLessThan(1900);
  });

  it('excluye los rodajes fáciles: no dicen nada del potencial', () => {
    expect(fiveKProjection([run('2026-09-14', 10, 4500, 'easy')])).toHaveLength(0);
  });

  it('excluye también las tiradas largas, que van a ritmo suave por diseño', () => {
    // Sin esto, una tirada de 12 km a 7:30/km proyecta un 5K de 35:35 y hunde
    // la línea con una marca que no mide el potencial.
    expect(fiveKProjection([run('2026-09-20', 12, 5400, 'long')])).toHaveLength(0);
  });

  it('ordena por fecha', () => {
    const points = fiveKProjection([
      run('2026-09-20', 5, 1800, 'timetrial'),
      run('2026-09-14', 5, 1850, 'timetrial'),
    ]);
    expect(points.map((p) => p.date)).toEqual(['2026-09-14', '2026-09-20']);
  });
});
