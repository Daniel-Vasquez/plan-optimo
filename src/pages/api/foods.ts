import type { APIRoute } from 'astro';
import { handle, json, requireUser } from '../../lib/api';
import { createFood, searchFoods, toggleFavorite } from '../../lib/db/repos/foods';
import { kcalFromMacros } from '../../lib/nutrition';

export const prerender = false;

function num(value: unknown, min: number, max: number): number | null {
  const n = typeof value === 'string' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

/** GET /api/foods?q=… — buscador del catálogo. */
export const GET: APIRoute = ({ locals, url }) =>
  handle(async () => {
    const user = requireUser(locals);
    const foods = await searchFoods(user.id, url.searchParams.get('q') ?? '');
    return json({ foods });
  });

/** POST /api/foods — alta manual de un alimento. */
export const POST: APIRoute = ({ locals, request }) =>
  handle(async () => {
    const user = requireUser(locals);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : '';
    if (!name) return json({ error: 'El alimento necesita un nombre.' }, 400);

    const proteinG = num(body.proteinG, 0, 100);
    const carbsG = num(body.carbsG, 0, 100);
    const fatG = num(body.fatG, 0, 100);
    if (proteinG === null || carbsG === null || fatG === null) {
      return json({ error: 'Los macros por 100 g deben estar entre 0 y 100.' }, 400);
    }

    // Si no se dan kcal, se calculan con 4/4/9 en vez de guardar un cero que
    // luego haría cuadrar mal todos los totales del día.
    const declared = num(body.kcal, 0, 900);
    const kcal = declared ?? kcalFromMacros({ proteinG, carbsG, fatG });

    const servingGrams = num(body.servingGrams, 1, 2000) ?? 100;

    const food = await createFood(user.id, {
      name,
      brand: typeof body.brand === 'string' ? body.brand.trim().slice(0, 60) || null : null,
      servingGrams,
      per100g: { kcal, proteinG, carbsG, fatG },
    });

    return json({ food }, 201);
  });

/** PATCH /api/foods — marca o desmarca favorito. */
export const PATCH: APIRoute = ({ locals, request }) =>
  handle(async () => {
    const user = requireUser(locals);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    if (typeof body.id !== 'string') return json({ error: 'Falta el identificador.' }, 400);
    await toggleFavorite(user.id, body.id, body.favorite === true);
    return json({ ok: true });
  });
