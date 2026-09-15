import { afterEach, describe, expect, it, vi } from 'vitest';
import { daysBetween, parseDateStr, planWeekFor, toDateStr, todayInTimezone } from '../date';

afterEach(() => {
  vi.useRealTimers();
});

describe('toDateStr', () => {
  it('usa el día de calendario local, no el UTC', () => {
    // 20:00 del 14 de septiembre en hora de Ciudad de México son las 02:00 del
    // día 15 en UTC. `toISOString()` diría 2026-09-15 y correría el registro
    // al día siguiente; este es exactamente el bug que la función evita.
    const date = new Date(2026, 8, 14, 20, 0, 0);
    expect(toDateStr(date)).toBe('2026-09-14');
  });

  it('rellena mes y día con ceros', () => {
    expect(toDateStr(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('todayInTimezone', () => {
  it('resuelve el día según la zona del usuario, no la del servidor', () => {
    // Instante fijo: 03:30 UTC del 15 de septiembre. En México aún es día 14.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-15T03:30:00Z'));

    expect(todayInTimezone('UTC')).toBe('2026-09-15');
    expect(todayInTimezone('America/Mexico_City')).toBe('2026-09-14');
    expect(todayInTimezone('Asia/Tokyo')).toBe('2026-09-15');
  });

  it('cae al día del servidor si la zona es inválida, en vez de reventar', () => {
    expect(todayInTimezone('No/Existe')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('parseDateStr', () => {
  it('construye la fecha a medianoche local', () => {
    const d = parseDateStr('2026-09-14');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(8);
    expect(d.getDate()).toBe(14);
    expect(d.getHours()).toBe(0);
  });
});

describe('daysBetween', () => {
  it('cuenta días completos', () => {
    expect(daysBetween('2026-09-14', '2026-09-21')).toBe(7);
    expect(daysBetween('2026-09-14', '2026-09-14')).toBe(0);
    expect(daysBetween('2026-09-21', '2026-09-14')).toBe(-7);
  });

  it('atraviesa el cambio de horario sin perder un día', () => {
    // En México el horario de verano terminaba a finales de octubre; aunque ya
    // no aplique, el cálculo debe seguir siendo exacto en cualquier salto.
    expect(daysBetween('2026-10-25', '2026-11-01')).toBe(7);
  });

  it('atraviesa el cambio de año', () => {
    expect(daysBetween('2026-12-28', '2027-01-04')).toBe(7);
  });
});

describe('planWeekFor', () => {
  it('empieza en la semana 1 el día de inicio', () => {
    expect(planWeekFor('2026-09-14', '2026-09-14', 12)).toBe(1);
  });

  it('cambia de semana a los 7 días, no a los 6', () => {
    expect(planWeekFor('2026-09-14', '2026-09-20', 12)).toBe(1);
    expect(planWeekFor('2026-09-14', '2026-09-21', 12)).toBe(2);
  });

  it('no baja de 1 aunque la fecha sea anterior al inicio', () => {
    expect(planWeekFor('2026-09-14', '2026-08-01', 12)).toBe(1);
  });

  it('no pasa del total de semanas del plan', () => {
    expect(planWeekFor('2026-09-14', '2027-09-14', 12)).toBe(12);
  });
});
