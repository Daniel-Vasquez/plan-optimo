import { describe, expect, it } from 'vitest';
import {
  detectFatigue,
  formatDuration,
  formatPace,
  paceSecondsPerKm,
  parseDuration,
  riegelProjection,
  targetPaceFor,
  zoneVerdict,
} from '../pace';

describe('paceSecondsPerKm', () => {
  it('calcula el ritmo medio', () => {
    // 10 km en 1:02:00 son 6:12 min/km.
    expect(paceSecondsPerKm(10, 3720)).toBe(372);
  });

  it('devuelve null con datos que no permiten calcularlo', () => {
    expect(paceSecondsPerKm(0, 3600)).toBeNull();
    expect(paceSecondsPerKm(10, 0)).toBeNull();
    expect(paceSecondsPerKm(-5, 3600)).toBeNull();
  });
});

describe('formatPace', () => {
  it('formatea como mm:ss', () => {
    expect(formatPace(372)).toBe('6:12');
    expect(formatPace(345)).toBe('5:45');
    expect(formatPace(600)).toBe('10:00');
  });

  it('muestra un guion si no hay dato', () => {
    expect(formatPace(null)).toBe('—');
    expect(formatPace(undefined)).toBe('—');
  });
});

describe('formatDuration', () => {
  it('omite las horas cuando no las hay', () => {
    expect(formatDuration(1840)).toBe('30:40');
  });

  it('las incluye cuando las hay', () => {
    // Una tirada larga de 14 km pasa de la hora.
    expect(formatDuration(6300)).toBe('1:45:00');
  });

  it('rellena con ceros', () => {
    expect(formatDuration(3605)).toBe('1:00:05');
  });
});

describe('parseDuration', () => {
  it('acepta mm:ss', () => {
    expect(parseDuration('30:40')).toBe(1840);
  });

  it('acepta h:mm:ss, que es lo que necesita una tirada larga', () => {
    expect(parseDuration('1:45:00')).toBe(6300);
  });

  it('rechaza lo que no encaja en vez de guardar un cero silencioso', () => {
    expect(parseDuration('')).toBeNull();
    expect(parseDuration('30')).toBeNull();
    expect(parseDuration('30:40:00:10')).toBeNull();
    expect(parseDuration('abc')).toBeNull();
    expect(parseDuration('0:00')).toBeNull();
  });

  it('rechaza minutos y segundos fuera de rango', () => {
    expect(parseDuration('30:75')).toBeNull();
    expect(parseDuration('1:75:00')).toBeNull();
  });
});

describe('targetPaceFor', () => {
  it('usa el punto medio de la zona', () => {
    // VO₂máx es 5:45-5:55, así que el objetivo son 5:50 = 350 s.
    expect(targetPaceFor('vo2max')).toBe(350);
    expect(targetPaceFor('threshold')).toBe(380);
    expect(targetPaceFor('easy')).toBe(450);
  });

  it('no impone zona en competición ni contrarreloj', () => {
    expect(targetPaceFor('race')).toBeNull();
    expect(targetPaceFor('timetrial')).toBeNull();
  });
});

describe('zoneVerdict', () => {
  it('detecta ir dentro de la zona', () => {
    expect(zoneVerdict('threshold', 380)).toBe('inZone');
  });

  it('detecta ir demasiado rápido', () => {
    // El error que diagnostica rutina.md: correr los rodajes fáciles a ritmo
    // de umbral, "compitiendo cada rodaje".
    expect(zoneVerdict('easy', 378)).toBe('faster');
  });

  it('detecta ir demasiado lento', () => {
    expect(zoneVerdict('vo2max', 400)).toBe('slower');
  });

  it('no juzga las contrarrelojes', () => {
    expect(zoneVerdict('timetrial', 300)).toBe('noZone');
  });

  it('incluye los extremos de la zona', () => {
    expect(zoneVerdict('easy', 435)).toBe('inZone');
    expect(zoneVerdict('easy', 465)).toBe('inZone');
  });
});

describe('riegelProjection', () => {
  it('proyecta de 10K a 5K', () => {
    // 10K en 63:00 proyecta un 5K algo por debajo de la mitad.
    const projected = riegelProjection(10, 3780, 5);
    expect(projected).toBeGreaterThan(1700);
    expect(projected).toBeLessThan(1900);
  });

  it('devuelve la misma marca para la misma distancia', () => {
    expect(riegelProjection(5, 1840, 5)).toBe(1840);
  });

  it('devuelve null con datos inválidos', () => {
    expect(riegelProjection(0, 1840, 5)).toBeNull();
    expect(riegelProjection(5, 0, 5)).toBeNull();
  });
});

describe('detectFatigue', () => {
  const run = (date: string, paceDeltaSeconds: number | null, runType = 'vo2max' as const) => ({
    date,
    runType,
    paceDeltaSeconds,
  });

  it('avisa con dos semanas seguidas por encima del margen', () => {
    // Regla de rutina.md §4D: >5 s/km más lento que el objetivo, dos semanas.
    const sessions = [run('2026-09-08', 8), run('2026-09-15', 9)];
    const result = detectFatigue(sessions);
    expect(result.fatigued).toBe(true);
    expect(result.weeks).toHaveLength(2);
  });

  it('no avisa con una sola semana mala', () => {
    expect(detectFatigue([run('2026-09-08', 12), run('2026-09-15', 2)]).fatigued).toBe(false);
  });

  it('no avisa con dos semanas malas no consecutivas', () => {
    const sessions = [run('2026-09-01', 8), run('2026-09-08', 1), run('2026-09-15', 9)];
    expect(detectFatigue(sessions).fatigued).toBe(false);
  });

  it('ignora los rodajes fáciles: ir lento ahí es lo que se busca', () => {
    const sessions = [run('2026-09-08', 40, 'easy' as never), run('2026-09-15', 40, 'easy' as never)];
    expect(detectFatigue(sessions).fatigued).toBe(false);
  });

  it('promedia las sesiones de una misma semana', () => {
    // 2 y 10 promedian 6, que supera el margen de 5.
    const sessions = [
      run('2026-09-08', 2), run('2026-09-10', 10),
      run('2026-09-15', 7),
    ];
    expect(detectFatigue(sessions).fatigued).toBe(true);
  });

  it('no avisa sin datos', () => {
    expect(detectFatigue([]).fatigued).toBe(false);
  });
});
