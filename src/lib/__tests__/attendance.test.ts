import { describe, expect, it } from 'vitest';
import { adherenceOf, attendanceStreak, buildAttendanceDay, daysOfMonth } from '../attendance';
import type { AttendanceDay, Profile } from '../../types/models';
import { DEFAULT_GOALS } from '../../types/models';

const profile = {
  goals: DEFAULT_GOALS,
  planStartDate: '2026-09-14',
  planWeeks: 12,
} as Pick<Profile, 'goals' | 'planStartDate' | 'planWeeks'>;

const empty = { strength: null, running: [], water: null, nutrition: null };

const strengthDone = {
  ...empty,
  strength: { sessionCompletionPct: 95, sessionVolumeKg: 2400, templateId: 'A' } as never,
};
const ran = { ...empty, running: [{ distanceKm: 8, runType: 'vo2max' }] as never };

describe('buildAttendanceDay', () => {
  it('marca el miércoles como descanso aunque no haya nada registrado', () => {
    const day = buildAttendanceDay('2026-09-16', '2026-09-20', profile, empty);
    expect(day.plannedKind).toBe('rest');
    expect(day.status).toBe('rest');
  });

  it('el lunes se completa sólo con la fuerza', () => {
    expect(buildAttendanceDay('2026-09-14', '2026-09-20', profile, strengthDone).status)
      .toBe('completed');
  });

  it('el lunes sin fuerza queda como no registrado', () => {
    expect(buildAttendanceDay('2026-09-14', '2026-09-20', profile, empty).status).toBe('missed');
  });

  it('el martes pide carrera Y fuerza: sólo una es parcial', () => {
    // Martes: VO₂máx por la mañana y pierna por la noche.
    expect(buildAttendanceDay('2026-09-15', '2026-09-20', profile, ran).status).toBe('partial');
    expect(buildAttendanceDay('2026-09-15', '2026-09-20', profile, strengthDone).status).toBe('partial');
  });

  it('el martes con ambas se completa', () => {
    const both = { ...empty, ...strengthDone, running: ran.running };
    expect(buildAttendanceDay('2026-09-15', '2026-09-20', profile, both).status).toBe('completed');
  });

  it('un día futuro no se marca como fallado', () => {
    expect(buildAttendanceDay('2026-09-21', '2026-09-20', profile, empty).status).toBe('future');
  });

  it('el domingo se completa con la tirada larga', () => {
    expect(buildAttendanceDay('2026-09-20', '2026-09-20', profile, ran).status).toBe('completed');
  });

  it('calcula la semana del plan y detecta la descarga', () => {
    expect(buildAttendanceDay('2026-09-14', '2026-10-10', profile, empty).planWeek).toBe(1);
    const deload = buildAttendanceDay('2026-10-05', '2026-10-10', profile, empty);
    expect(deload.planWeek).toBe(4);
    expect(deload.isDeload).toBe(true);
  });

  it('el agua y la proteína informan pero no deciden el estado del día', () => {
    // Son metas diarias, no la sesión de entrenamiento: quedarse corto de
    // agua no convierte un lunes entrenado en un día fallado.
    const withWater = {
      ...strengthDone,
      water: { totalMl: 500, goalMl: 2750, date: '2026-09-14' } as never,
    };
    const day = buildAttendanceDay('2026-09-14', '2026-09-20', profile, withWater);
    expect(day.status).toBe('completed');
    expect(day.water!.met).toBe(false);
  });
});

describe('daysOfMonth', () => {
  it('devuelve los días del mes', () => {
    expect(daysOfMonth(2026, 9)).toHaveLength(30);
    expect(daysOfMonth(2026, 10)).toHaveLength(31);
    expect(daysOfMonth(2026, 2)).toHaveLength(28);
  });

  it('acierta con los bisiestos', () => {
    expect(daysOfMonth(2028, 2)).toHaveLength(29);
  });

  it('formatea con ceros a la izquierda', () => {
    expect(daysOfMonth(2026, 1)[0]).toBe('2026-01-01');
  });
});

describe('adherenceOf', () => {
  const day = (status: string): AttendanceDay => ({ status } as AttendanceDay);

  it('excluye descansos y días futuros del denominador', () => {
    // No hay nada que cumplir un miércoles ni un día que no ha llegado.
    const result = adherenceOf([day('completed'), day('rest'), day('future'), day('missed')]);
    expect(result.required).toBe(2);
    expect(result.pct).toBe(50);
  });

  it('cuenta un día parcial como medio', () => {
    expect(adherenceOf([day('completed'), day('partial')]).pct).toBe(75);
  });

  it('es 0 si no hay días exigibles', () => {
    expect(adherenceOf([day('rest'), day('future')]).pct).toBe(0);
  });
});

describe('attendanceStreak', () => {
  const day = (date: string, status: string): AttendanceDay => ({ date, status } as AttendanceDay);

  it('cuenta días completados consecutivos', () => {
    const days = [day('2026-09-14', 'completed'), day('2026-09-15', 'completed')];
    expect(attendanceStreak(days, '2026-09-15')).toBe(2);
  });

  it('los descansos no suman pero tampoco cortan', () => {
    // El miércoles es descanso prescrito: saltárselo no es fallar.
    const days = [
      day('2026-09-14', 'completed'),
      day('2026-09-15', 'completed'),
      day('2026-09-16', 'rest'),
      day('2026-09-17', 'completed'),
    ];
    expect(attendanceStreak(days, '2026-09-17')).toBe(3);
  });

  it('no rompe la racha si hoy aún está pendiente', () => {
    const days = [day('2026-09-14', 'completed'), day('2026-09-15', 'future')];
    expect(attendanceStreak(days, '2026-09-15')).toBe(1);
  });

  it('se corta con un día fallado', () => {
    const days = [
      day('2026-09-13', 'completed'),
      day('2026-09-14', 'missed'),
      day('2026-09-15', 'completed'),
    ];
    expect(attendanceStreak(days, '2026-09-15')).toBe(1);
  });
});
