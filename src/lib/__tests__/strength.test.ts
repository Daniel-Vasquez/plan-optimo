import { describe, expect, it } from 'vitest';
import {
  assignedFor, blockLabel, blockWeekFor, emptySet, epley1rm, exerciseProgress,
  isDeloadWeek, isLoadMaxed, rirForWeek, setVolumeKg, summarizeExercise,
  summarizeSession, templateForDate, volumeByMuscle,
} from '../strength';
import { STRENGTH_TEMPLATES, lb } from '../../data/plan';
import type { AssignedWork, StrengthExercise, StrengthSet } from '../../types/models';

const assigned: AssignedWork = {
  sets: 4, repMin: 8, repMax: 10, targetRir: 2, restSeconds: 90,
  tempo: '3-1-1', loadKg: lb(35), loadMode: 'perHand', unilateral: false,
};

const set = (index: number, reps: number | null, rir: number | null = 2, completed = true): StrengthSet => ({
  index, reps, loadKg: lb(35), rir, completed, restTakenSeconds: null,
});

describe('bloques de 4 semanas', () => {
  it('recorre el bloque y vuelve a empezar', () => {
    expect([1, 2, 3, 4, 5, 8, 9].map(blockWeekFor)).toEqual([1, 2, 3, 4, 1, 4, 1]);
  });

  it('marca como descarga la cuarta semana de cada bloque', () => {
    expect([1, 2, 3, 4, 8, 12].map(isDeloadWeek)).toEqual([false, false, false, true, true, true]);
  });

  it('usa las etiquetas de rutina.md', () => {
    expect([1, 2, 3, 4].map(blockLabel)).toEqual([
      'Introducción', 'Acumulación', 'Intensificación', 'Descarga',
    ]);
  });

  it('sube el RIR en la descarga', () => {
    expect([1, 2, 3, 4].map(rirForWeek)).toEqual([3, 2, 1, 4]);
  });
});

describe('assignedFor', () => {
  const press = STRENGTH_TEMPLATES[0]!.exercises[0]!;

  it('mantiene las series en semana normal', () => {
    expect(assignedFor(press, 2).sets).toBe(4);
  });

  it('parte las series por la mitad en la descarga, con el mismo peso', () => {
    const deload = assignedFor(press, 4);
    expect(deload.sets).toBe(2);
    expect(deload.targetRir).toBe(4);
    expect(deload.loadKg).toBe(press.startLoadKg);
  });

  it('nunca baja de una serie', () => {
    const tiny = { ...press, sets: 1 };
    expect(assignedFor(tiny, 4).sets).toBe(1);
  });
});

describe('templateForDate', () => {
  it('asigna las sesiones a sus días', () => {
    // 2026-09-14 es lunes.
    expect(templateForDate('2026-09-14')?.templateId).toBe('A');
    expect(templateForDate('2026-09-15')?.templateId).toBe('B');
    expect(templateForDate('2026-09-17')?.templateId).toBe('C');
  });

  it('no hay fuerza el miércoles ni el fin de semana', () => {
    expect(templateForDate('2026-09-16')).toBeNull();
    expect(templateForDate('2026-09-19')).toBeNull();
    expect(templateForDate('2026-09-20')).toBeNull();
  });
});

describe('epley1rm', () => {
  it('estima el 1RM', () => {
    expect(epley1rm(100, 10)).toBeCloseTo(133.33, 1);
  });

  it('con una repetición devuelve el propio peso', () => {
    expect(epley1rm(100, 1)).toBe(100);
  });

  it('sube al subir las reps con el mismo peso', () => {
    // Es lo que permite graficar progresión cuando el peso no puede subir.
    expect(epley1rm(15.88, 10)!).toBeGreaterThan(epley1rm(15.88, 8)!);
  });

  it('devuelve null sin datos válidos', () => {
    expect(epley1rm(0, 10)).toBeNull();
    expect(epley1rm(100, 0)).toBeNull();
  });
});

describe('setVolumeKg', () => {
  it('cuenta las dos mancuernas en los ejercicios a dos manos', () => {
    // 10 reps × 15.88 kg × 2 manos = 317.6 kg.
    expect(setVolumeKg(set(1, 10), assigned)).toBeCloseTo(317.6, 1);
  });

  it('cuenta los dos lados en los unilaterales', () => {
    const unilateral: AssignedWork = { ...assigned, loadMode: 'total', unilateral: true };
    // 10 reps × 15.88 kg × 1 mano × 2 lados = 317.6 kg.
    expect(setVolumeKg(set(1, 10), unilateral)).toBeCloseTo(317.6, 1);
  });

  it('no cuenta las series sin completar', () => {
    expect(setVolumeKg(set(1, 10, 2, false), assigned)).toBe(0);
  });

  it('es cero en peso corporal', () => {
    const bodyweight: AssignedWork = { ...assigned, loadKg: null, loadMode: 'bodyweight' };
    expect(setVolumeKg({ ...set(1, 10), loadKg: null }, bodyweight)).toBe(0);
  });
});

describe('summarizeExercise', () => {
  const base = {
    slug: 'press-banca-mancuernas', name: 'Press banca', order: 1,
    supersetGroup: null, assigned, densificationStep: 1,
  };

  it('compara contra el extremo BAJO del rango', () => {
    // 4×8 asignadas = 32 reps. Hacer 8,8,8,8 es cumplir al 100%, no al 80%.
    const result = summarizeExercise({ ...base, sets: [set(1, 8), set(2, 8), set(3, 8), set(4, 8)] });
    expect(result.assignedReps).toBe(32);
    expect(result.totalReps).toBe(32);
    expect(result.completionPct).toBe(100);
  });

  it('refleja una sesión incompleta', () => {
    const result = summarizeExercise({ ...base, sets: [set(1, 8), set(2, 8), set(3, 7, 0), set(4, null, null, false)] });
    expect(result.totalReps).toBe(23);
    expect(result.completionPct).toBe(72);
  });

  it('guarda el mejor e1RM de la sesión', () => {
    const result = summarizeExercise({ ...base, sets: [set(1, 8), set(2, 10)] });
    expect(result.bestSetE1rmKg).toBeCloseTo(epley1rm(lb(35), 10)!, 2);
  });
});

describe('summarizeSession', () => {
  it('agrega volumen y cumplimiento de todos los ejercicios', () => {
    const base = { slug: 'x', name: 'X', order: 1, supersetGroup: null, assigned, densificationStep: 1 };
    const a = summarizeExercise({ ...base, sets: [set(1, 8), set(2, 8), set(3, 8), set(4, 8)] });
    const b = summarizeExercise({ ...base, slug: 'y', sets: [set(1, 4), set(2, 4), set(3, 4), set(4, 4)] });
    const result = summarizeSession([a, b]);
    expect(result.sessionCompletionPct).toBe(75);
    expect(result.sessionVolumeKg).toBeCloseTo(a.volumeKg + b.volumeKg, 1);
  });
});

describe('isLoadMaxed', () => {
  const build = (sets: StrengthSet[]): StrengthExercise =>
    summarizeExercise({
      slug: 'x', name: 'X', order: 1, supersetGroup: null, assigned, densificationStep: 1, sets,
    });

  it('detecta el peso maxeado: todas las series al tope con el RIR objetivo', () => {
    expect(isLoadMaxed(build([set(1, 10), set(2, 10), set(3, 10), set(4, 10)]))).toBe(true);
  });

  it('no lo da por maxeado si una serie se queda corta', () => {
    expect(isLoadMaxed(build([set(1, 10), set(2, 10), set(3, 10), set(4, 9)]))).toBe(false);
  });

  it('no lo da por maxeado si se llegó por debajo del RIR objetivo', () => {
    // Llegar a 10 reps con RIR 0 es fallo técnico, no peso dominado.
    expect(isLoadMaxed(build([set(1, 10, 0), set(2, 10, 0), set(3, 10, 0), set(4, 10, 0)]))).toBe(false);
  });

  it('no lo da por maxeado si faltan series', () => {
    expect(isLoadMaxed(build([set(1, 10), set(2, 10)]))).toBe(false);
  });
});

describe('emptySet', () => {
  it('arranca con el peso asignado ya puesto', () => {
    expect(emptySet(1, assigned).loadKg).toBe(assigned.loadKg);
    expect(emptySet(1, assigned).completed).toBe(false);
  });
});

describe('volumeByMuscle', () => {
  it('reparte el volumen entre los grupos implicados, sin duplicarlo', () => {
    const exercise = summarizeExercise({
      slug: 'press-banca-mancuernas', name: 'Press', order: 1,
      supersetGroup: null, assigned, densificationStep: 1, sets: [set(1, 10)],
    });
    const session = { exercises: [exercise] } as never;
    const result = volumeByMuscle([session], { 'press-banca-mancuernas': ['pecho', 'tríceps'] });
    const total = result.reduce((sum, r) => sum + r.volumeKg, 0);
    expect(total).toBeCloseTo(exercise.volumeKg, 0);
    expect(result).toHaveLength(2);
  });
});

describe('exerciseProgress', () => {
  it('extrae la serie temporal de un ejercicio', () => {
    const make = (date: string, reps: number) => ({
      date,
      exercises: [summarizeExercise({
        slug: 'press-banca-mancuernas', name: 'Press', order: 1,
        supersetGroup: null, assigned, densificationStep: 1,
        sets: [set(1, reps), set(2, reps)],
      })],
    }) as never;

    const points = exerciseProgress([make('2026-09-21', 10), make('2026-09-14', 8)], 'press-banca-mancuernas');
    expect(points.map((p) => p.date)).toEqual(['2026-09-14', '2026-09-21']);
    expect(points[1]!.totalReps).toBe(20);
  });

  it('omite los ejercicios sin reps registradas', () => {
    const empty = {
      date: '2026-09-14',
      exercises: [summarizeExercise({
        slug: 'press-banca-mancuernas', name: 'Press', order: 1,
        supersetGroup: null, assigned, densificationStep: 1, sets: [],
      })],
    } as never;
    expect(exerciseProgress([empty], 'press-banca-mancuernas')).toHaveLength(0);
  });
});
