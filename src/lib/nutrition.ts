import type { DateStr, DayType, Macros, Meal, MealItem, MealSlot, Profile } from '../types/models';
import { parseDateStr } from './date';

/**
 * Metas y cuentas de nutrición.
 *
 * La prioridad del módulo es la proteína: `rutina.md §1` la señala como "el
 * ajuste #1", con el diagnóstico de que se comen ~60-70 g cuando hacen falta
 * 125-140. Por eso es la métrica que se muestra en grande.
 */

/** Franjas en el orden en que se comen. */
export const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack', 'pre', 'post'];

export const MEAL_LABELS: Record<MealSlot, string> = {
  breakfast: 'Desayuno',
  lunch: 'Comida',
  dinner: 'Cena',
  snack: 'Snack',
  pre: 'Pre-entreno',
  post: 'Post-entreno',
};

/**
 * ¿Día de entreno o de descanso?
 *
 * `rutina.md §1` fija 2.300-2.400 kcal los días de entreno y 2.000-2.100 "los
 * miércoles y viernes". El miércoles es descanso total y el viernes sólo
 * caminata, así que son esos dos días exactos.
 */
export function dayTypeFor(date: DateStr): DayType {
  const dow = parseDateStr(date).getDay();
  return dow === 3 || dow === 5 ? 'rest' : 'training';
}

const FALLBACK_GOALS = {
  proteinG: 130,
  carbsTrainingG: 330,
  carbsRestG: 250,
  fatG: 62,
  kcalTraining: 2350,
  kcalRest: 2050,
};

/** Metas de macros del día, según sea de entreno o de descanso. */
export function goalsFor(profile: Pick<Profile, 'goals'> | null, date: DateStr): Macros {
  const goals = profile?.goals ?? FALLBACK_GOALS;
  const training = dayTypeFor(date) === 'training';

  return {
    kcal: training ? goals.kcalTraining : goals.kcalRest,
    proteinG: goals.proteinG,
    carbsG: training ? goals.carbsTrainingG : goals.carbsRestG,
    fatG: goals.fatG,
  };
}

export const ZERO_MACROS: Macros = { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 };

/** Escala los macros de 100 g a la cantidad indicada. */
export function macrosForGrams(per100g: Macros, grams: number): Macros {
  const factor = grams / 100;
  return {
    kcal: Math.round(per100g.kcal * factor),
    proteinG: Math.round(per100g.proteinG * factor * 10) / 10,
    carbsG: Math.round(per100g.carbsG * factor * 10) / 10,
    fatG: Math.round(per100g.fatG * factor * 10) / 10,
  };
}

export function sumMacros(items: readonly { macros: Macros }[]): Macros {
  return items.reduce<Macros>(
    (total, item) => ({
      kcal: total.kcal + item.macros.kcal,
      proteinG: Math.round((total.proteinG + item.macros.proteinG) * 10) / 10,
      carbsG: Math.round((total.carbsG + item.macros.carbsG) * 10) / 10,
      fatG: Math.round((total.fatG + item.macros.fatG) * 10) / 10,
    }),
    { ...ZERO_MACROS },
  );
}

/** Totales del día a partir de sus comidas. */
export function dayTotals(meals: readonly Meal[]): Macros {
  return sumMacros(meals.map((meal) => ({ macros: meal.totals })));
}

/** Recalcula los totales de una comida desde sus items. */
export function recalcMeal(meal: Omit<Meal, 'totals'>): Meal {
  return { ...meal, totals: sumMacros(meal.items) };
}

/** Porcentaje cumplido de cada macro. Sin acotar: pasarse también informa. */
export function adherence(totals: Macros, goals: Macros): Record<keyof Macros, number> {
  const pct = (value: number, goal: number) => (goal <= 0 ? 0 : Math.round((value / goal) * 100));
  return {
    kcal: pct(totals.kcal, goals.kcal),
    proteinG: pct(totals.proteinG, goals.proteinG),
    carbsG: pct(totals.carbsG, goals.carbsG),
    fatG: pct(totals.fatG, goals.fatG),
  };
}

/**
 * Kcal calculadas desde los macros.
 *
 * Sirve para detectar incoherencias en un alimento tecleado a mano: si las
 * kcal declaradas se alejan mucho de 4/4/9, algo se escribió mal.
 */
export function kcalFromMacros(macros: Pick<Macros, 'proteinG' | 'carbsG' | 'fatG'>): number {
  return Math.round(macros.proteinG * 4 + macros.carbsG * 4 + macros.fatG * 9);
}

/** Un item listo para guardar, con sus macros ya escalados. */
export function buildItem(
  id: string,
  food: { _id?: unknown; name: string; per100g: Macros },
  grams: number,
): MealItem {
  return {
    id,
    foodId: food._id ? String(food._id) : null,
    name: food.name,
    grams: Math.round(grams * 10) / 10,
    per100g: food.per100g,
    macros: macrosForGrams(food.per100g, grams),
  };
}
