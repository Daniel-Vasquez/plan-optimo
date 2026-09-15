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

/** De dónde salió una toma de agua. */
export type WaterSource =
  /** Botón rápido de la pantalla de hidratación. */
  | 'quick'
  /** Cantidad escrita a mano. */
  | 'custom'
  /** Registrada durante el descanso entre series, en la pantalla de fuerza. */
  | 'during-set';

/** Una toma concreta, con su hora. */
export interface WaterEntry {
  id: string;
  ml: number;
  at: Date;
  source: WaterSource;
  /** Sólo en `during-set`: deja trazada la serie exacta. */
  strengthSessionId?: string;
  exerciseIndex?: number;
  setIndex?: number;
}

/**
 * Hidratación de un día.
 *
 * Un documento por día y usuario, no uno por toma: el número de tomas diarias
 * es pequeño y así el calendario y el inicio se resuelven con una sola
 * consulta por rango.
 */
export interface WaterLog extends BaseDoc {
  date: DateStr;
  /**
   * Meta de ESE día, guardada al escribir. Es una instantánea a propósito: si
   * mañana subes la meta en tu perfil, el histórico debe seguir mostrando
   * contra qué se comparó cada día.
   */
  goalMl: number;
  /** Suma de `entries`, desnormalizada para no recalcularla en cada lectura. */
  totalMl: number;
  entries: WaterEntry[];
}

/**
 * Tipo de sesión de carrera.
 *
 * Los cuatro primeros son los del cronograma de `rutina.md §2`; `race` y
 * `timetrial` cubren las contrarrelojes de 5K de las semanas 6 y 12.
 */
export type RunType = 'vo2max' | 'threshold' | 'easy' | 'long' | 'race' | 'timetrial';

/** Una repetición dentro de una sesión de series. */
export interface RunInterval {
  index: number;
  distanceM: number;
  durationSeconds: number;
  /** Derivado: segundos por kilómetro de esta repetición. */
  paceSeconds: number;
  recoverySeconds: number | null;
}

/** Una carrera registrada. */
export interface RunningSession extends BaseDoc {
  date: DateStr;
  runType: RunType;
  distanceKm: number;
  durationSeconds: number;
  /** Derivado de distancia y duración; se persiste para poder ordenar y graficar. */
  avgPaceSeconds: number;
  /** Ritmo objetivo de la zona del tipo de sesión, en el momento del registro. */
  targetPaceSeconds: number | null;
  /** Realizado menos objetivo. Positivo = más lento. Alimenta la alerta de fatiga. */
  paceDeltaSeconds: number | null;
  elevationGainM: number | null;
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  intervals: RunInterval[];
  /** RPE de 1 a 10. */
  perceivedEffort: number | null;
  shoes: string | null;
  note: string;
}
