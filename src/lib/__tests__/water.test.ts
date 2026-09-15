import { describe, expect, it } from 'vitest';
import {
  formatLiters,
  isVolleyballDay,
  waterAverage,
  waterGoalFor,
  waterPct,
  waterStreak,
} from '../water';
import { DEFAULT_GOALS, type Profile } from '../../types/models';

const profile = { goals: DEFAULT_GOALS } as Pick<Profile, 'goals'>;

describe('isVolleyballDay', () => {
  it('reconoce el sábado', () => {
    expect(isVolleyballDay('2026-09-19')).toBe(true); // sábado
    expect(isVolleyballDay('2026-09-18')).toBe(false); // viernes
    expect(isVolleyballDay('2026-09-20')).toBe(false); // domingo
  });
});

describe('waterGoalFor', () => {
  it('usa la meta base entre semana', () => {
    expect(waterGoalFor(profile, '2026-09-14')).toBe(2750);
  });

  it('suma el extra de las 4 horas de voleibol el sábado', () => {
    // 2750 base + 750 ml/hora x 4 horas = 5750, según rutina.md §1.
    expect(waterGoalFor(profile, '2026-09-19')).toBe(5750);
  });

  it('funciona sin perfil, con los valores de respaldo', () => {
    expect(waterGoalFor(null, '2026-09-14')).toBe(2750);
    expect(waterGoalFor(null, '2026-09-19')).toBe(5750);
  });

  it('respeta una meta personalizada', () => {
    const custom = {
      goals: { ...DEFAULT_GOALS, waterMlPerDay: 3000, waterVolleyballExtraMlPerHour: 500 },
    } as Pick<Profile, 'goals'>;
    expect(waterGoalFor(custom, '2026-09-14')).toBe(3000);
    expect(waterGoalFor(custom, '2026-09-19')).toBe(5000);
  });
});

describe('waterPct', () => {
  it('calcula el porcentaje', () => {
    expect(waterPct(1375, 2750)).toBe(50);
  });

  it('se acota a 100 para que la barra no se desborde', () => {
    expect(waterPct(5000, 2750)).toBe(100);
  });

  it('no divide por cero', () => {
    expect(waterPct(500, 0)).toBe(0);
  });
});

describe('formatLiters', () => {
  it('muestra litros con un decimal', () => {
    expect(formatLiters(2250)).toBe('2.3 L');
    expect(formatLiters(0)).toBe('0.0 L');
  });
});

describe('waterStreak', () => {
  const day = (date: string, totalMl: number, goalMl = 2750) => ({ date, totalMl, goalMl });

  it('cuenta días consecutivos cumpliendo la meta', () => {
    const days = [day('2026-09-12', 2800), day('2026-09-13', 3000), day('2026-09-14', 2750)];
    expect(waterStreak(days, '2026-09-14')).toBe(3);
  });

  it('no rompe la racha si hoy aún va corto', () => {
    // Son las 10 de la mañana y todavía no se llega a la meta: la racha de
    // los días anteriores sigue en pie.
    const days = [day('2026-09-12', 2800), day('2026-09-13', 3000), day('2026-09-14', 500)];
    expect(waterStreak(days, '2026-09-14')).toBe(2);
  });

  it('se rompe con un día por debajo de la meta', () => {
    const days = [day('2026-09-12', 2800), day('2026-09-13', 1000), day('2026-09-14', 2800)];
    expect(waterStreak(days, '2026-09-14')).toBe(1);
  });

  it('cuenta el día justo en la meta como cumplido', () => {
    expect(waterStreak([day('2026-09-14', 2750)], '2026-09-14')).toBe(1);
  });

  it('usa la meta de cada día, no una fija', () => {
    // El sábado tiene meta de 5750: 3000 ml no la cumplen aunque superen la
    // meta de un día normal.
    const days = [day('2026-09-18', 2800), day('2026-09-19', 3000, 5750)];
    expect(waterStreak(days, '2026-09-19')).toBe(1);
  });

  it('es 0 sin datos', () => {
    expect(waterStreak([], '2026-09-14')).toBe(0);
  });
});

describe('waterAverage', () => {
  it('promedia los días recibidos', () => {
    expect(waterAverage([{ totalMl: 2000 }, { totalMl: 3000 }])).toBe(2500);
  });

  it('es 0 sin días', () => {
    expect(waterAverage([])).toBe(0);
  });
});
