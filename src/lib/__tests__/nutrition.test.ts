import { describe, expect, it } from 'vitest';
import {
  adherence, buildItem, dayTotals, dayTypeFor, goalsFor, kcalFromMacros,
  macrosForGrams, recalcMeal, sumMacros,
} from '../nutrition';
import { DEFAULT_GOALS, type Macros, type Profile } from '../../types/models';
import { FOODS_SEED } from '../../data/foods-seed';

const profile = { goals: DEFAULT_GOALS } as Pick<Profile, 'goals'>;

describe('dayTypeFor', () => {
  it('marca miércoles y viernes como días de descanso', () => {
    // rutina.md §1: "2.000-2.100 miércoles y viernes".
    expect(dayTypeFor('2026-09-16')).toBe('rest'); // miércoles
    expect(dayTypeFor('2026-09-18')).toBe('rest'); // viernes
  });

  it('el resto son días de entreno', () => {
    expect(['2026-09-14', '2026-09-15', '2026-09-17', '2026-09-19', '2026-09-20'].map(dayTypeFor))
      .toEqual(['training', 'training', 'training', 'training', 'training']);
  });
});

describe('goalsFor', () => {
  it('usa las metas altas en día de entreno', () => {
    const goals = goalsFor(profile, '2026-09-14');
    expect(goals.kcal).toBe(DEFAULT_GOALS.kcalTraining);
    expect(goals.carbsG).toBe(DEFAULT_GOALS.carbsTrainingG);
  });

  it('baja kcal y carbohidratos en día de descanso', () => {
    const goals = goalsFor(profile, '2026-09-16');
    expect(goals.kcal).toBe(DEFAULT_GOALS.kcalRest);
    expect(goals.carbsG).toBe(DEFAULT_GOALS.carbsRestG);
  });

  it('mantiene la proteína igual los dos días: es el ajuste #1 del plan', () => {
    expect(goalsFor(profile, '2026-09-14').proteinG).toBe(goalsFor(profile, '2026-09-16').proteinG);
  });

  it('funciona sin perfil', () => {
    expect(goalsFor(null, '2026-09-14').proteinG).toBe(130);
  });
});

describe('macrosForGrams', () => {
  const chicken = FOODS_SEED.find((f) => f.name.startsWith('Pechuga'))!;

  it('escala desde 100 g', () => {
    // 180 g de pechuga cruda: la ración que pide rutina.md.
    const macros = macrosForGrams(chicken.per100g, 180);
    expect(macros.proteinG).toBeCloseTo(55.8, 1);
    expect(macros.kcal).toBe(297);
  });

  it('devuelve ceros con 0 g', () => {
    expect(macrosForGrams(chicken.per100g, 0)).toEqual({ kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 });
  });
});

describe('sumMacros', () => {
  it('suma sin acumular error de coma flotante', () => {
    const item = (proteinG: number): { macros: Macros } => ({
      macros: { kcal: 0, proteinG, carbsG: 0, fatG: 0 },
    });
    expect(sumMacros([item(10.1), item(20.2), item(30.3)]).proteinG).toBe(60.6);
  });

  it('es cero sin items', () => {
    expect(sumMacros([])).toEqual({ kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 });
  });
});

describe('recalcMeal y dayTotals', () => {
  const egg = FOODS_SEED.find((f) => f.name === 'Huevo entero')!;

  it('recalcula los totales de una comida', () => {
    const meal = recalcMeal({
      id: 'm1', slot: 'breakfast',
      items: [buildItem('i1', egg, 150), buildItem('i2', egg, 50)],
    });
    // 200 g de huevo son ~25.2 g de proteína.
    expect(meal.totals.proteinG).toBeCloseTo(25.2, 1);
  });

  it('suma las comidas del día', () => {
    const meal = recalcMeal({ id: 'm1', slot: 'breakfast', items: [buildItem('i1', egg, 100)] });
    expect(dayTotals([meal, meal]).proteinG).toBeCloseTo(25.2, 1);
  });
});

describe('adherence', () => {
  const goals: Macros = { kcal: 2350, proteinG: 130, carbsG: 330, fatG: 62 };

  it('calcula el porcentaje de cada macro', () => {
    const result = adherence({ kcal: 1175, proteinG: 65, carbsG: 165, fatG: 31 }, goals);
    expect(result).toEqual({ kcal: 50, proteinG: 50, carbsG: 50, fatG: 50 });
  });

  it('NO acota al 100%: pasarse también es información', () => {
    // Comer 200 g de proteína cuando la meta son 130 debe verse, no ocultarse.
    expect(adherence({ ...goals, proteinG: 260 }, goals).proteinG).toBe(200);
  });

  it('no divide por cero', () => {
    expect(adherence({ kcal: 100, proteinG: 0, carbsG: 0, fatG: 0 }, { ...goals, kcal: 0 }).kcal).toBe(0);
  });
});

describe('kcalFromMacros', () => {
  it('aplica 4/4/9', () => {
    expect(kcalFromMacros({ proteinG: 30, carbsG: 40, fatG: 10 })).toBe(370);
  });

  it('detecta un alimento tecleado con kcal incoherentes', () => {
    const chicken = FOODS_SEED.find((f) => f.name.startsWith('Pechuga'))!.per100g;
    // Las kcal declaradas deben quedar cerca de las calculadas.
    expect(Math.abs(kcalFromMacros(chicken) - chicken.kcal)).toBeLessThan(20);
  });
});

describe('catálogo semilla', () => {
  it('las kcal de cada alimento son coherentes con sus macros', () => {
    // Un error de tecleo aquí se propagaría a todos los registros del usuario.
    for (const food of FOODS_SEED) {
      const calculated = kcalFromMacros(food.per100g);
      const drift = Math.abs(calculated - food.per100g.kcal);
      expect(drift, `${food.name}: declara ${food.per100g.kcal} kcal, los macros dan ${calculated}`)
        .toBeLessThanOrEqual(Math.max(15, food.per100g.kcal * 0.12));
    }
  });

  it('incluye las fuentes de proteína que recomienda rutina.md', () => {
    const names = FOODS_SEED.map((f) => f.name.toLowerCase());
    for (const needed of ['yogurt griego', 'requesón', 'atún', 'whey', 'pechuga']) {
      expect(names.some((n) => n.includes(needed)), `falta ${needed}`).toBe(true);
    }
  });

  it('no tiene nombres duplicados', () => {
    const names = FOODS_SEED.map((f) => f.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
