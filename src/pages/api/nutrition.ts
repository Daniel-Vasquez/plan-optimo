import { randomUUID } from 'node:crypto';
import type { APIRoute } from 'astro';
import { handle, json, requireUser } from '../../lib/api';
import { getProfile } from '../../lib/db/repos/profiles';
import { markFoodUsed } from '../../lib/db/repos/foods';
import {
  getNutritionDay, getNutritionRange, getPreviousLoggedDay, saveNutritionDay,
} from '../../lib/db/repos/nutrition';
import { todayInTimezone } from '../../lib/date';
import { MEAL_SLOTS, dayTypeFor, goalsFor, macrosForGrams } from '../../lib/nutrition';
import type { Macros, Meal, MealSlot } from '../../types/models';

export const prerender = false;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function num(value: unknown, min: number, max: number): number | null {
  const n = typeof value === 'string' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

/**
 * Normaliza las comidas que llegan del cliente.
 *
 * Los macros de cada item se recalculan desde los que envía el cliente por
 * 100 g y los gramos: así el total del día siempre cuadra con sus partes,
 * pase lo que pase con el JSON recibido.
 */
function parseMeals(value: unknown): Omit<Meal, 'totals'>[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((raw): Omit<Meal, 'totals'> | null => {
      if (!raw || typeof raw !== 'object') return null;
      const meal = raw as Record<string, unknown>;
      if (!MEAL_SLOTS.includes(meal.slot as MealSlot)) return null;

      const items = Array.isArray(meal.items) ? meal.items : [];
      return {
        id: typeof meal.id === 'string' ? meal.id : randomUUID(),
        slot: meal.slot as MealSlot,
        items: items
          .map((rawItem) => {
            if (!rawItem || typeof rawItem !== 'object') return null;
            const item = rawItem as Record<string, unknown>;

            const grams = num(item.grams, 0.1, 5000);
            const name = typeof item.name === 'string' ? item.name.trim().slice(0, 80) : '';
            if (grams === null || !name) return null;

            const per100g = (item.per100g ?? {}) as Record<string, unknown>;
            const macros: Macros = {
              kcal: num(per100g.kcal, 0, 900) ?? 0,
              proteinG: num(per100g.proteinG, 0, 100) ?? 0,
              carbsG: num(per100g.carbsG, 0, 100) ?? 0,
              fatG: num(per100g.fatG, 0, 100) ?? 0,
            };

            return {
              id: typeof item.id === 'string' ? item.id : randomUUID(),
              foodId: typeof item.foodId === 'string' ? item.foodId : null,
              name,
              grams,
              per100g: macros,
              macros: macrosForGrams(macros, grams),
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null),
      };
    })
    .filter((meal): meal is Omit<Meal, 'totals'> => meal !== null);
}

/**
 * GET /api/nutrition            → hoy
 * GET /api/nutrition?date=…     → un día
 * GET /api/nutrition?from&to    → un rango, para las gráficas
 */
export const GET: APIRoute = ({ locals, url }) =>
  handle(async () => {
    const user = requireUser(locals);
    const profile = await getProfile(user.id);
    const timezone = profile?.timezone ?? 'America/Mexico_City';

    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    if (from !== null || to !== null) {
      if (!from || !to || !DATE_RE.test(from) || !DATE_RE.test(to)) {
        return json({ error: 'El rango necesita "from" y "to" como YYYY-MM-DD.' }, 400);
      }
      return json({ days: await getNutritionRange(user.id, from, to) });
    }

    const param = url.searchParams.get('date');
    const date = param === null ? todayInTimezone(timezone) : param;
    if (!DATE_RE.test(date)) return json({ error: 'Fecha inválida.' }, 400);

    const day = await getNutritionDay(user.id, date);
    return json({
      day,
      goals: goalsFor(profile, date),
      dayType: dayTypeFor(date),
    });
  });

/** PUT /api/nutrition — guarda las comidas del día. */
export const PUT: APIRoute = ({ locals, request }) =>
  handle(async () => {
    const user = requireUser(locals);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    if (typeof body.date !== 'string' || !DATE_RE.test(body.date)) {
      return json({ error: 'Fecha inválida.' }, 400);
    }

    const profile = await getProfile(user.id);
    const meals = parseMeals(body.meals);

    const day = await saveNutritionDay(
      user.id,
      body.date,
      goalsFor(profile, body.date),
      meals,
      typeof body.note === 'string' ? body.note.trim().slice(0, 1000) : '',
    );

    // Los alimentos usados suben su contador: es lo que ordena el buscador.
    const usedIds = new Set(
      meals.flatMap((meal) => meal.items.map((item) => item.foodId)).filter((id): id is string => !!id),
    );
    await Promise.all([...usedIds].map((id) => markFoodUsed(user.id, id)));

    return json({ day });
  });

/**
 * POST /api/nutrition/duplicate — copia el último día registrado.
 *
 * La dieta es repetitiva; si teclear la cena entera cuesta dos minutos, deja
 * de registrarse. Se llega aquí con `?action=duplicate`.
 */
export const POST: APIRoute = ({ locals, request, url }) =>
  handle(async () => {
    const user = requireUser(locals);
    if (url.searchParams.get('action') !== 'duplicate') {
      return json({ error: 'Acción no soportada.' }, 400);
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    if (typeof body.date !== 'string' || !DATE_RE.test(body.date)) {
      return json({ error: 'Fecha inválida.' }, 400);
    }

    const source = await getPreviousLoggedDay(user.id, body.date);
    if (!source) return json({ error: 'No hay ningún día anterior que copiar.' }, 404);

    const profile = await getProfile(user.id);
    const day = await saveNutritionDay(
      user.id,
      body.date,
      goalsFor(profile, body.date),
      // Identificadores nuevos: los items del día copiado son suyos, y
      // compartirlos haría que borrar en uno afectara al otro.
      source.meals.map((meal) => ({
        id: randomUUID(),
        slot: meal.slot,
        items: meal.items.map((item) => ({ ...item, id: randomUUID() })),
      })),
    );

    return json({ day, copiedFrom: source.date });
  });
