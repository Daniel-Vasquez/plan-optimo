import { nutritionLogsCollection } from '../collections';
import type { DateStr, Macros, Meal, NutritionLog } from '../../../types/models';
import { dayTotals, dayTypeFor, recalcMeal } from '../../nutrition';

/** Repositorio de nutrición. `userId` primero y obligatorio. */

export async function getNutritionDay(userId: string, date: DateStr): Promise<NutritionLog | null> {
  return nutritionLogsCollection().findOne({ userId, date });
}

export async function getNutritionRange(
  userId: string,
  from: DateStr,
  to: DateStr,
): Promise<NutritionLog[]> {
  return nutritionLogsCollection()
    .find({ userId, date: { $gte: from, $lte: to } })
    .sort({ date: 1 })
    .toArray();
}

/**
 * Guarda las comidas del día.
 *
 * Los totales se recalculan aquí desde los items: son la fuente de verdad, y
 * aceptarlos del cliente permitiría guardar un día que no cuadra consigo mismo.
 */
export async function saveNutritionDay(
  userId: string,
  date: DateStr,
  goals: Macros,
  meals: Omit<Meal, 'totals'>[],
  note = '',
): Promise<NutritionLog> {
  const recalculated = meals.map((meal) => recalcMeal(meal));
  const totals = dayTotals(recalculated);
  const now = new Date();

  const result = await nutritionLogsCollection().findOneAndUpdate(
    { userId, date },
    {
      $set: {
        dayType: dayTypeFor(date),
        goals,
        meals: recalculated,
        totals,
        note,
        updatedAt: now,
      },
      $setOnInsert: { userId, date, createdAt: now },
    },
    { upsert: true, returnDocument: 'after' },
  );

  if (!result) throw new Error(`No se pudo guardar la nutrición de ${date}`);
  return result;
}

/** Día anterior con comidas registradas, para poder duplicarlo. */
export async function getPreviousLoggedDay(
  userId: string,
  before: DateStr,
): Promise<NutritionLog | null> {
  return nutritionLogsCollection().findOne(
    { userId, date: { $lt: before }, 'meals.0': { $exists: true } },
    { sort: { date: -1 } },
  );
}
