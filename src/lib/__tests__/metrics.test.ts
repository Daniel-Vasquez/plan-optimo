import { describe, expect, it } from 'vitest';
import {
  completionRate,
  currentStreak,
  longestStreak,
  mondayOf,
  weekCompletion,
  type DayRecord,
} from '../metrics';

const day = (date: string, completed = true): DayRecord => ({ date, completed });

describe('currentStreak', () => {
  it('cuenta días consecutivos terminando hoy', () => {
    const records = [day('2026-09-12'), day('2026-09-13'), day('2026-09-14')];
    expect(currentStreak(records, '2026-09-14')).toBe(3);
  });

  it('no rompe la racha si hoy aún no está registrado', () => {
    // Es la mañana del día 15 y todavía no se ha entrenado. La racha de los
    // tres días previos debe seguir en pie, no caer a 0.
    const records = [day('2026-09-12'), day('2026-09-13'), day('2026-09-14')];
    expect(currentStreak(records, '2026-09-15')).toBe(3);
  });

  it('se rompe con un hueco', () => {
    const records = [day('2026-09-10'), day('2026-09-13'), day('2026-09-14')];
    expect(currentStreak(records, '2026-09-14')).toBe(2);
  });

  it('ignora los días registrados pero no completados', () => {
    const records = [day('2026-09-13', false), day('2026-09-14')];
    expect(currentStreak(records, '2026-09-14')).toBe(1);
  });

  it('devuelve 0 sin datos', () => {
    expect(currentStreak([], '2026-09-14')).toBe(0);
  });
});

describe('longestStreak', () => {
  it('encuentra la racha más larga del historial', () => {
    const records = [
      day('2026-09-01'), day('2026-09-02'), day('2026-09-03'), day('2026-09-04'),
      day('2026-09-10'), day('2026-09-11'),
    ];
    expect(longestStreak(records)).toBe(4);
  });

  it('es 1 con un único día', () => {
    expect(longestStreak([day('2026-09-01')])).toBe(1);
  });

  it('es 0 sin días completados', () => {
    expect(longestStreak([day('2026-09-01', false)])).toBe(0);
  });
});

describe('mondayOf', () => {
  it('devuelve el propio lunes', () => {
    expect(mondayOf('2026-09-14')).toBe('2026-09-14');
  });

  it('el domingo pertenece a la semana que empezó el lunes anterior', () => {
    // El caso que rompe la fórmula ingenua: getDay() da 0 para el domingo, y
    // restar (0 - 1) lo empujaría a la semana siguiente.
    expect(mondayOf('2026-09-20')).toBe('2026-09-14');
  });

  it('funciona a mitad de semana', () => {
    expect(mondayOf('2026-09-17')).toBe('2026-09-14');
  });
});

describe('weekCompletion', () => {
  it('cuenta sólo los días de la semana en curso', () => {
    const records = [
      day('2026-09-13'), // domingo anterior: fuera
      day('2026-09-14'), day('2026-09-15'), day('2026-09-16'),
      day('2026-09-21'), // lunes siguiente: fuera
    ];
    const result = weekCompletion(records, '2026-09-16');
    expect(result.completed).toBe(3);
    expect(result.planned).toBe(6);
    expect(result.pct).toBe(50);
  });

  it('incluye el domingo en su semana', () => {
    const records = [day('2026-09-14'), day('2026-09-20')];
    expect(weekCompletion(records, '2026-09-20').completed).toBe(2);
  });
});

describe('completionRate', () => {
  it('calcula el porcentaje sobre los días registrados', () => {
    const records = [day('2026-09-14'), day('2026-09-15', false), day('2026-09-16')];
    expect(completionRate(records)).toBe(67);
  });

  it('es 0 sin registros', () => {
    expect(completionRate([])).toBe(0);
  });
});
