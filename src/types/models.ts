import type { ObjectId } from 'mongodb';

/**
 * Tipos del dominio persistidos en MongoDB.
 *
 * Convenciones transversales (ver planificacion.md §1.4):
 *
 * - Todo documento lleva `userId`, y ese campo es el prefijo de todos sus
 *   índices. Es la última línea de defensa del aislamiento entre usuarios.
 * - Las fechas de calendario son `DateStr` (`YYYY-MM-DD`) en hora LOCAL del
 *   usuario, nunca `Date` en UTC: `toISOString()` corre el día para cualquiera
 *   al este de Greenwich, y eso corrompería la adherencia al plan.
 * - Las marcas de auditoría (`createdAt`, `updatedAt`) sí son `Date` en UTC.
 * - Pesos en kg, distancias en km, duraciones en segundos, volúmenes en ml,
 *   macros en gramos. La unidad de presentación vive en el perfil.
 */

/** Fecha de calendario en hora local del usuario: `YYYY-MM-DD`. */
export type DateStr = string;

/** Campos que comparten todos los documentos de dominio. */
export interface BaseDoc {
  _id?: ObjectId;
  /** `_id` del usuario de Better Auth, siempre como string. */
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Unidad en la que se le muestran los pesos al usuario. */
export type WeightUnit = 'kg' | 'lb';

/** Metas diarias derivadas del plan (ver rutina.md §1). */
export interface ProfileGoals {
  waterMlPerDay: number;
  /** Extra por hora de voleibol, con electrolitos. */
  waterVolleyballExtraMlPerHour: number;
  proteinG: number;
  carbsTrainingG: number;
  carbsRestG: number;
  fatG: number;
  kcalTraining: number;
  kcalRest: number;
  /** Objetivo de 5K en segundos. */
  target5kSeconds: number;
}

/** Marcas de partida contra las que se mide el progreso. */
export interface ProfileBaselines {
  fiveKSeconds: number;
  tenKPaceSeconds: number;
}

/** Perfil físico y metas. Relación 1:1 con el usuario de Better Auth. */
export interface Profile extends BaseDoc {
  displayName: string;
  heightCm: number | null;
  startWeightKg: number | null;
  displayUnit: WeightUnit;
  /** Zona IANA; es la fuente de verdad para saber qué día es "hoy". */
  timezone: string;
  /** Ancla para calcular en qué semana del plan estamos. */
  planStartDate: DateStr;
  planWeeks: number;
  goals: ProfileGoals;
  baselines: ProfileBaselines;
}

/**
 * Valores por defecto del perfil, tomados del diagnóstico de rutina.md.
 * Se siembran al registrarse y el usuario los ajusta en /ajustes.
 */
export const DEFAULT_GOALS: ProfileGoals = {
  waterMlPerDay: 2750,
  waterVolleyballExtraMlPerHour: 750,
  proteinG: 130,
  carbsTrainingG: 330,
  carbsRestG: 250,
  fatG: 62,
  kcalTraining: 2350,
  kcalRest: 2050,
  target5kSeconds: 1725,
};

export const DEFAULT_BASELINES: ProfileBaselines = {
  fiveKSeconds: 1840,
  tenKPaceSeconds: 378,
};
