import { randomUUID } from 'node:crypto';
import { foodsCollection } from '../collections';
import { FOODS_SEED } from '../../../data/foods-seed';
import type { Food, Macros } from '../../../types/models';

/**
 * Catálogo de alimentos del usuario.
 *
 * `userId` primero y obligatorio, como en el resto de repositorios.
 */

/**
 * Siembra el catálogo si está vacío.
 *
 * Es perezoso a propósito: hacerlo al registrarse retrasaría el alta, y además
 * dejaría sin catálogo a las cuentas creadas antes de esta tanda. Se invoca al
 * pedir la lista, que es el primer momento en que hace falta.
 */
export async function ensureSeeded(userId: string): Promise<void> {
  const collection = foodsCollection();
  if ((await collection.countDocuments({ userId }, { limit: 1 })) > 0) return;

  const now = new Date();
  await collection.insertMany(
    FOODS_SEED.map((seed) => ({
      userId,
      name: seed.name,
      brand: null,
      servingGrams: seed.servingGrams,
      per100g: seed.per100g,
      favorite: seed.favorite,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    })),
    // Sin orden: si dos peticiones simultáneas siembran a la vez, que una
    // colisión no aborte el resto de inserciones.
    { ordered: false },
  ).catch(() => undefined);
}

/**
 * Busca alimentos.
 *
 * Sin término devuelve los más usados y los favoritos primero: es lo que se
 * necesita el 90% de las veces, porque la dieta es repetitiva.
 */
export async function searchFoods(userId: string, query: string, limit = 30): Promise<Food[]> {
  await ensureSeeded(userId);
  const collection = foodsCollection();

  const term = query.trim();
  if (!term) {
    return collection
      .find({ userId })
      .sort({ usageCount: -1, favorite: -1, name: 1 })
      .limit(limit)
      .toArray();
  }

  // Coincidencia por prefijo o subcadena, sin distinguir mayúsculas ni
  // caracteres especiales del propio término.
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return collection
    .find({ userId, name: { $regex: escaped, $options: 'i' } })
    .sort({ usageCount: -1, name: 1 })
    .limit(limit)
    .toArray();
}

export async function getFood(userId: string, id: string): Promise<Food | null> {
  const { ObjectId } = await import('mongodb');
  if (!ObjectId.isValid(id)) return null;
  return foodsCollection().findOne({ userId, _id: new ObjectId(id) });
}

export interface NewFood {
  name: string;
  brand: string | null;
  servingGrams: number;
  per100g: Macros;
}

export async function createFood(userId: string, input: NewFood): Promise<Food> {
  const now = new Date();
  const document: Food = {
    ...input,
    userId,
    favorite: false,
    usageCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  const result = await foodsCollection().insertOne(document);
  return { ...document, _id: result.insertedId };
}

/** Sube el contador de uso; es lo que ordena el buscador. */
export async function markFoodUsed(userId: string, id: string): Promise<void> {
  const { ObjectId } = await import('mongodb');
  if (!ObjectId.isValid(id)) return;
  await foodsCollection().updateOne(
    { userId, _id: new ObjectId(id) },
    { $inc: { usageCount: 1 }, $set: { updatedAt: new Date() } },
  );
}

export async function toggleFavorite(userId: string, id: string, favorite: boolean): Promise<void> {
  const { ObjectId } = await import('mongodb');
  if (!ObjectId.isValid(id)) return;
  await foodsCollection().updateOne(
    { userId, _id: new ObjectId(id) },
    { $set: { favorite, updatedAt: new Date() } },
  );
}

export { randomUUID };
