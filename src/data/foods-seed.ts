import type { Macros } from '../types/models';

/**
 * Catálogo inicial de alimentos.
 *
 * Son los que aparecen en la dieta real de `rutina.md §1`, más los que el
 * propio documento recomienda añadir para llegar a los 130 g de proteína
 * (yogurt griego, requesón, atún, whey). Se siembran al registrarse para que
 * la primera comida no haya que teclearla entera.
 *
 * Se descartó conectar una base externa tipo Open Food Facts: la dieta aquí es
 * repetitiva, así que un catálogo propio de veinte alimentos cubre casi todo y
 * evita latencia y resultados ruidosos en cada búsqueda.
 *
 * Macros por 100 g de porción comestible. Las carnes van en CRUDO, que es como
 * las pesa rutina.md ("pechuga de 180-200 g en crudo").
 */
export interface FoodSeed {
  name: string;
  servingGrams: number;
  per100g: Macros;
  favorite: boolean;
}

export const FOODS_SEED: FoodSeed[] = [
  // ── Proteína ────────────────────────────────────────────────────────────
  { name: 'Huevo entero', servingGrams: 50, favorite: true, per100g: { kcal: 143, proteinG: 12.6, carbsG: 0.7, fatG: 9.5 } },
  { name: 'Clara de huevo', servingGrams: 33, favorite: true, per100g: { kcal: 52, proteinG: 10.9, carbsG: 0.7, fatG: 0.2 } },
  { name: 'Pechuga de pollo (crudo)', servingGrams: 180, favorite: true, per100g: { kcal: 165, proteinG: 31, carbsG: 0, fatG: 3.6 } },
  { name: 'Atún en agua (escurrido)', servingGrams: 100, favorite: true, per100g: { kcal: 116, proteinG: 26, carbsG: 0, fatG: 1 } },
  { name: 'Yogurt griego natural', servingGrams: 170, favorite: true, per100g: { kcal: 59, proteinG: 10, carbsG: 3.6, fatG: 0.4 } },
  { name: 'Requesón', servingGrams: 100, favorite: true, per100g: { kcal: 98, proteinG: 11, carbsG: 3.4, fatG: 4.3 } },
  { name: 'Proteína whey (polvo)', servingGrams: 30, favorite: true, per100g: { kcal: 380, proteinG: 80, carbsG: 7, fatG: 4 } },
  { name: 'Carne de res magra (cruda)', servingGrams: 150, favorite: false, per100g: { kcal: 187, proteinG: 26, carbsG: 0, fatG: 9 } },
  { name: 'Salmón (crudo)', servingGrams: 150, favorite: false, per100g: { kcal: 208, proteinG: 20, carbsG: 0, fatG: 13 } },
  { name: 'Leche entera', servingGrams: 250, favorite: false, per100g: { kcal: 61, proteinG: 3.2, carbsG: 4.8, fatG: 3.3 } },

  // ── Carbohidratos ───────────────────────────────────────────────────────
  { name: 'Arroz blanco (cocido)', servingGrams: 160, favorite: true, per100g: { kcal: 130, proteinG: 2.7, carbsG: 28, fatG: 0.3 } },
  { name: 'Avena (en hojuelas)', servingGrams: 60, favorite: true, per100g: { kcal: 389, proteinG: 16.9, carbsG: 66, fatG: 6.9 } },
  { name: 'Pan integral', servingGrams: 30, favorite: true, per100g: { kcal: 247, proteinG: 13, carbsG: 41, fatG: 3.4 } },
  { name: 'Tortilla de maíz', servingGrams: 30, favorite: false, per100g: { kcal: 218, proteinG: 5.7, carbsG: 44, fatG: 2.9 } },
  { name: 'Plátano', servingGrams: 120, favorite: true, per100g: { kcal: 89, proteinG: 1.1, carbsG: 23, fatG: 0.3 } },
  { name: 'Frijoles cocidos', servingGrams: 130, favorite: false, per100g: { kcal: 127, proteinG: 8.7, carbsG: 23, fatG: 0.5 } },
  { name: 'Papa cocida', servingGrams: 150, favorite: false, per100g: { kcal: 87, proteinG: 2, carbsG: 20, fatG: 0.1 } },
  { name: 'Dátil', servingGrams: 24, favorite: false, per100g: { kcal: 282, proteinG: 2.5, carbsG: 75, fatG: 0.4 } },

  // ── Grasas ──────────────────────────────────────────────────────────────
  { name: 'Aguacate', servingGrams: 100, favorite: true, per100g: { kcal: 160, proteinG: 2, carbsG: 8.5, fatG: 14.7 } },
  { name: 'Aceite de oliva', servingGrams: 10, favorite: false, per100g: { kcal: 884, proteinG: 0, carbsG: 0, fatG: 100 } },
  { name: 'Cacahuate natural', servingGrams: 30, favorite: false, per100g: { kcal: 567, proteinG: 26, carbsG: 16, fatG: 49 } },

  // ── Otros que aparecen en la dieta actual ───────────────────────────────
  { name: 'Gelatina', servingGrams: 100, favorite: false, per100g: { kcal: 62, proteinG: 1.2, carbsG: 14, fatG: 0 } },
  { name: 'Galletas María', servingGrams: 25, favorite: false, per100g: { kcal: 436, proteinG: 7, carbsG: 76, fatG: 12 } },
  { name: 'Café solo', servingGrams: 240, favorite: false, per100g: { kcal: 1, proteinG: 0.1, carbsG: 0, fatG: 0 } },
];
