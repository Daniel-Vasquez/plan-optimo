import type { AssignedWork, WeightUnit } from '../types/models';

/**
 * Conversión de unidades de peso.
 *
 * Internamente todo son kilos: graficar progresión necesita una unidad
 * continua. La rutina está en libras y así se muestran, pero los saltos de
 * 10 lb del material no sirven para medir.
 */

const LB_PER_KG = 2.2046226218;

export function kgToLb(kg: number): number {
  return kg * LB_PER_KG;
}

export function lbToKg(pounds: number): number {
  return pounds / LB_PER_KG;
}

/** Peso en la unidad del usuario. `withUnit` añade el sufijo. */
export function formatLoad(kg: number, unit: WeightUnit, withUnit = true): string {
  const value = unit === 'lb' ? kgToLb(kg) : kg;
  // Las libras se redondean a enteros: las mancuernas vienen en 25 y 35, no
  // en 34,9, y mostrar decimales sugiere una precisión que no existe.
  const rounded = unit === 'lb' ? Math.round(value) : Math.round(value * 10) / 10;
  return withUnit ? `${rounded} ${unit}` : String(rounded);
}

/** Convierte lo que teclea el usuario a kilos. */
export function parseLoad(value: number, unit: WeightUnit): number {
  return unit === 'lb' ? Math.round(lbToKg(value) * 100) / 100 : value;
}

/** Rango de repeticiones, con la marca de "por lado" si es unilateral. */
export function repRange(assigned: Pick<AssignedWork, 'repMin' | 'repMax' | 'unilateral'>): string {
  const range = `${assigned.repMin}-${assigned.repMax}`;
  return assigned.unilateral ? `${range} / lado` : range;
}
