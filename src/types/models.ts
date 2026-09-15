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

/** Estado de una sesión de fuerza. */
export type StrengthStatus = 'planned' | 'in_progress' | 'completed' | 'skipped';

/** Una serie ejecutada. */
export interface StrengthSet {
  index: number;
  reps: number | null;
  loadKg: number | null;
  rir: number | null;
  completed: boolean;
  /** Descanso realmente tomado; alimenta el peldaño de densidad. */
  restTakenSeconds: number | null;
}

/** Instantánea de lo prescrito ese día, copiada de la plantilla. */
export interface AssignedWork {
  sets: number;
  repMin: number;
  repMax: number;
  targetRir: number;
  restSeconds: number;
  tempo: string | null;
  loadKg: number | null;
  loadMode: 'perHand' | 'total' | 'bodyweight';
  unilateral: boolean;
}

/** Un ejercicio dentro de una sesión ejecutada. */
export interface StrengthExercise {
  slug: string;
  name: string;
  order: number;
  supersetGroup: string | null;
  /**
   * Lo asignado se congela aquí. Si mañana cambia la plantilla, las sesiones
   * históricas siguen mostrando contra qué se comparó cada día.
   */
  assigned: AssignedWork;
  /** Peldaño de la Escalera de Densificación (1-10). */
  densificationStep: number;
  sets: StrengthSet[];
  /** Derivados, calculados al guardar. */
  totalReps: number;
  assignedReps: number;
  volumeKg: number;
  completionPct: number;
  bestSetE1rmKg: number | null;
  /**
   * Doble progresión cumplida: todas las series al tope del rango con el RIR
   * objetivo. Como por encima de 35 lb no hay material, en vez de subir peso
   * toca subir un peldaño de la Escalera de Densificación.
   */
  loadMaxed: boolean;
}

/** Una sesión de fuerza. */
export interface StrengthSession extends BaseDoc {
  date: DateStr;
  templateId: 'A' | 'B' | 'C';
  label: string;
  planWeek: number;
  blockWeek: number;
  isDeload: boolean;
  status: StrengthStatus;
  exercises: StrengthExercise[];
  sessionVolumeKg: number;
  sessionCompletionPct: number;
  durationSeconds: number | null;
  rpeGlobal: number | null;
  /** Alimenta la regla de autorregulación de <6 h de sueño. */
  sleepHours: number | null;
  note: string;
}

/** Franja de comida. Coincide con la estructura real de la dieta en rutina.md §1. */
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre' | 'post';

/** Día de entreno o de descanso: determina la meta de kcal y carbohidratos. */
export type DayType = 'training' | 'rest';

/** Macros de una cantidad concreta. */
export interface Macros {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

/** Un alimento del catálogo, con sus macros por 100 g. */
export interface Food extends BaseDoc {
  name: string;
  brand: string | null;
  /** Ración habitual en gramos, para no teclearla cada vez. */
  servingGrams: number;
  per100g: Macros;
  favorite: boolean;
  /** Cuántas veces se ha usado; ordena el buscador. */
  usageCount: number;
}

/** Un alimento dentro de una comida, con la cantidad de ese día. */
export interface MealItem {
  id: string;
  /** Referencia al catálogo. `null` si se escribió a mano y no se guardó. */
  foodId: string | null;
  name: string;
  grams: number;
  /**
   * Macros por 100 g, copiados del catálogo al registrar. Se guardan aquí para
   * que el registro histórico no dependa de que el alimento siga existiendo ni
   * de que nadie haya corregido sus valores después.
   */
  per100g: Macros;
  /** Macros ya calculados para ESTA cantidad. */
  macros: Macros;
}

export interface Meal {
  id: string;
  slot: MealSlot;
  items: MealItem[];
  /** Suma de los items; desnormalizado para no recalcularlo al leer. */
  totals: Macros;
}

/** La alimentación de un día. Un documento por día y usuario. */
export interface NutritionLog extends BaseDoc {
  date: DateStr;
  dayType: DayType;
  /** Instantánea de las metas de ese día, como en hidratación. */
  goals: Macros;
  meals: Meal[];
  totals: Macros;
  note: string;
}

/** Una nota libre de la bitácora. */
export interface Note extends BaseDoc {
  /** Día al que se refiere, no cuándo se escribió. */
  date: DateStr;
  title: string;
  content: string;
  tags: string[];
}

/** Estado de un día en el calendario de asistencia. */
export type AttendanceStatus = 'completed' | 'partial' | 'missed' | 'rest' | 'future';

/** Resumen de un día, calculado a partir de los registros de ese día. */
export interface AttendanceDay {
  date: DateStr;
  planWeek: number;
  isDeload: boolean;
  /** Qué tocaba: fuerza, carrera, voleibol, caminata o descanso. */
  plannedKind: string;
  plannedLabel: string;
  status: AttendanceStatus;
  /** Sesión de fuerza del día, si la hubo. */
  strength: { completionPct: number; volumeKg: number; templateId: string } | null;
  running: { distanceKm: number; runType: string } | null;
  water: { totalMl: number; goalMl: number; met: boolean } | null;
  nutrition: { proteinG: number; goalProteinG: number; met: boolean } | null;
}
