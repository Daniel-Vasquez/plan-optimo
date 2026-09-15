import type { DateStr } from '../types/models';

/**
 * El plan de `rutina.md`, transcrito.
 *
 * Esta es la ÚNICA fuente de verdad del entrenamiento. Antes el plan vivía
 * duplicado en `storage.js` y en `day/index.astro`, y además no coincidía con
 * rutina.md: decía "Sentadilla goblet" y "Hip thrust" donde la rutina real
 * manda búlgara y peso muerto rumano.
 *
 * Los pesos se guardan en KILOS aunque la rutina esté en libras. La conversión
 * es exacta (1 lb = 0.45359237 kg) y se hace aquí una vez: graficar la
 * progresión necesita una unidad continua, y los saltos de 10 lb del material
 * disponible no sirven para eso. La interfaz los muestra en libras.
 */

/** Libras a kilos, redondeado a 2 decimales. */
export function lb(pounds: number): number {
  return Math.round(pounds * 0.45359237 * 100) / 100;
}

/** Qué se hace un día de la semana. 0 = domingo. */
export type DayKind =
  | 'strength'
  | 'running'
  | 'volleyball'
  | 'walk'
  | 'rest';

export interface ExerciseTemplate {
  /** Identificador estable; no cambia aunque se reescriba el nombre. */
  slug: string;
  name: string;
  order: number;
  sets: number;
  repMin: number;
  repMax: number;
  /** RIR objetivo de la semana 1. Los bloques lo ajustan (ver `blockRules`). */
  targetRir: number;
  targetRpe: number;
  restSeconds: number;
  /** Cadencia en notación excéntrico-pausa-concéntrico. */
  tempo: string | null;
  /** Carga de partida por mano, en kg. `null` = peso corporal. */
  startLoadKg: number | null;
  /** `perHand`: la carga es por mancuerna, así que el volumen cuenta doble. */
  loadMode: 'perHand' | 'total' | 'bodyweight';
  /** Las repeticiones son por lado, no por serie. */
  unilateral: boolean;
  /** Ejercicios con la misma letra se encadenan sin descanso. */
  supersetGroup: string | null;
  cue: string;
  muscleGroups: string[];
}

export interface StrengthTemplate {
  templateId: 'A' | 'B' | 'C';
  label: string;
  /** Día de la semana en que toca. 0 = domingo. */
  dayOfWeek: number;
  /** Aviso propio de la sesión, si rutina.md lo da. */
  warning: string | null;
  exercises: ExerciseTemplate[];
}

/** Calentamiento común a las tres sesiones (rutina.md §3). */
export const WARMUP = {
  minutes: '5-7',
  blocks: [
    {
      label: 'Movilidad (2 min)',
      items: [
        'Círculos de cadera',
        'Gato-camello',
        'Rotaciones torácicas en cuadrupedia',
        'Dislocaciones de hombro con toalla',
      ],
    },
    {
      label: 'Activación (2 min)',
      items: [
        'Sesión A y C: 15 flexiones escapulares + 15 face pulls sin peso',
        'Sesión B: 15 puentes de glúteo + 20 elevaciones de talón sin peso',
      ],
    },
    {
      label: 'Series de aproximación (2-3 min)',
      items: [
        '2 series ligeras del primer ejercicio',
        '1 × 10 con mancuerna de 5 kg',
        '1 × 5 con la de 25 lb',
      ],
    },
  ],
} as const;

export const STRENGTH_TEMPLATES: StrengthTemplate[] = [
  {
    templateId: 'A',
    label: 'Pecho + Espalda',
    dayOfWeek: 1,
    warning: null,
    exercises: [
      {
        slug: 'press-banca-mancuernas',
        name: 'Press banca con mancuernas',
        order: 1,
        sets: 4,
        repMin: 8,
        repMax: 10,
        targetRir: 2,
        targetRpe: 8,
        restSeconds: 90,
        tempo: '3-1-1',
        startLoadKg: lb(35),
        loadMode: 'perHand',
        unilateral: false,
        supersetGroup: null,
        cue: '3" bajando, 1" de pausa a 2 cm del pecho, subida explosiva.',
        muscleGroups: ['pecho', 'tríceps', 'hombro'],
      },
      {
        slug: 'remo-unilateral-mancuerna',
        name: 'Remo unilateral con mancuerna',
        order: 2,
        sets: 4,
        repMin: 10,
        repMax: 12,
        targetRir: 2,
        targetRpe: 8,
        restSeconds: 75,
        tempo: null,
        startLoadKg: lb(35),
        loadMode: 'total',
        unilateral: true,
        supersetGroup: null,
        cue: 'Rodilla en el banco. Pausa de 1" arriba, 3" de bajada, estirar el dorsal al final.',
        muscleGroups: ['espalda', 'bíceps'],
      },
      {
        slug: 'flexiones-deficit',
        name: 'Flexiones con déficit sobre mancuernas',
        order: 3,
        sets: 3,
        repMin: 10,
        repMax: 15,
        targetRir: 1,
        targetRpe: 9,
        restSeconds: 60,
        tempo: '4-1-1',
        startLoadKg: null,
        loadMode: 'bodyweight',
        unilateral: false,
        supersetGroup: null,
        cue: 'Manos sobre las mancuernas de 35 lb para bajar más. Pies en el banco si sobran reps.',
        muscleGroups: ['pecho', 'tríceps'],
      },
      {
        slug: 'pullover-mancuerna',
        name: 'Pullover con mancuerna',
        order: 4,
        sets: 3,
        repMin: 12,
        repMax: 15,
        targetRir: 2,
        targetRpe: 8,
        restSeconds: 60,
        tempo: null,
        startLoadKg: lb(35),
        loadMode: 'total',
        unilateral: false,
        supersetGroup: null,
        cue: 'Cruzado en el banco. Estiramiento máximo atrás, caderas bajas. Va por rango, no por peso.',
        muscleGroups: ['espalda', 'pecho'],
      },
    ],
  },
  {
    templateId: 'B',
    label: 'Pierna',
    dayOfWeek: 2,
    warning:
      'Nunca al fallo, nunca RIR 0: hay voleibol en 4 días y umbral en 36 horas.',
    exercises: [
      {
        slug: 'sentadilla-bulgara',
        name: 'Sentadilla búlgara',
        order: 1,
        sets: 3,
        repMin: 8,
        repMax: 10,
        targetRir: 3,
        targetRpe: 7,
        restSeconds: 90,
        tempo: '3-1-1',
        startLoadKg: lb(25),
        loadMode: 'perHand',
        unilateral: true,
        supersetGroup: null,
        cue: 'Torso ligeramente inclinado: más glúteo, menos rodilla. Polainas de 2 kg opcionales.',
        muscleGroups: ['cuádriceps', 'glúteo'],
      },
      {
        slug: 'peso-muerto-rumano',
        name: 'Peso muerto rumano con mancuernas',
        order: 2,
        sets: 3,
        repMin: 10,
        repMax: 12,
        targetRir: 3,
        targetRpe: 7,
        restSeconds: 90,
        tempo: '4-0-1',
        startLoadKg: lb(35),
        loadMode: 'perHand',
        unilateral: false,
        supersetGroup: null,
        cue: 'Baja sólo hasta donde mantengas la espalda neutra. El estímulo está en el excéntrico lento, no en el peso.',
        muscleGroups: ['isquiotibiales', 'glúteo', 'espalda baja'],
      },
      {
        slug: 'elevacion-talon-unilateral',
        name: 'Elevación de talón unilateral en escalón',
        order: 3,
        sets: 4,
        repMin: 12,
        repMax: 15,
        targetRir: 1,
        targetRpe: 9,
        restSeconds: 45,
        tempo: null,
        startLoadKg: lb(35),
        loadMode: 'total',
        unilateral: true,
        supersetGroup: null,
        cue: 'Rango completo: 2" de estiramiento abajo, 1" de pausa arriba. Es el ejercicio que más impacta tu economía de carrera.',
        muscleGroups: ['gemelo', 'sóleo'],
      },
    ],
  },
  {
    templateId: 'C',
    label: 'Hombro + Brazo',
    dayOfWeek: 4,
    warning: null,
    exercises: [
      {
        slug: 'press-militar-sentado',
        name: 'Press militar sentado con mancuernas',
        order: 1,
        sets: 4,
        repMin: 8,
        repMax: 10,
        targetRir: 2,
        targetRpe: 8,
        restSeconds: 90,
        tempo: '3-0-1',
        startLoadKg: lb(25),
        loadMode: 'perHand',
        unilateral: false,
        supersetGroup: null,
        cue: 'Espalda apoyada en el banco recto.',
        muscleGroups: ['hombro', 'tríceps'],
      },
      {
        slug: 'elevaciones-laterales',
        name: 'Elevaciones laterales',
        order: 2,
        sets: 3,
        repMin: 15,
        repMax: 20,
        targetRir: 1,
        targetRpe: 9,
        restSeconds: 45,
        tempo: null,
        startLoadKg: 5,
        loadMode: 'perHand',
        unilateral: false,
        supersetGroup: null,
        cue: 'Pausa de 1" arriba + 3" de bajada. De 5 kg hacia 15 lb. Serie extra al fallo técnico si sobra tiempo.',
        muscleGroups: ['hombro'],
      },
      {
        slug: 'curl-martillo',
        name: 'Curl martillo o inclinado',
        order: 3,
        sets: 3,
        repMin: 10,
        repMax: 12,
        targetRir: 1,
        targetRpe: 9,
        restSeconds: 0,
        tempo: null,
        startLoadKg: lb(25),
        loadMode: 'perHand',
        unilateral: false,
        supersetGroup: '3',
        cue: 'Superserie con la extensión de tríceps: sin descanso entre ambos.',
        muscleGroups: ['bíceps'],
      },
      {
        slug: 'extension-triceps-sobre-cabeza',
        name: 'Extensión de tríceps sobre la cabeza',
        order: 4,
        sets: 3,
        repMin: 10,
        repMax: 12,
        targetRir: 1,
        targetRpe: 9,
        restSeconds: 75,
        tempo: null,
        startLoadKg: lb(35),
        loadMode: 'total',
        unilateral: false,
        supersetGroup: '3',
        cue: 'A dos manos. Codos fijos, estiramiento completo atrás. Alternativa: fondos en banco con polaina de 5 kg.',
        muscleGroups: ['tríceps'],
      },
    ],
  },
];

/** Core opcional del viernes. No cuenta contra los límites de volumen. */
export const FRIDAY_CORE = {
  label: 'Core antirrotación (opcional, 10 min)',
  note: 'Tras la caminata. Es lo que transfiere a carrera y a voleibol.',
  exercises: [
    { name: 'Plancha frontal', prescription: '3 × 40"' },
    { name: 'Dead bug', prescription: '3 × 10 / lado' },
    { name: 'Bird dog', prescription: '3 × 10 / lado' },
    { name: 'Paseo del granjero unilateral', prescription: '3 × 30 m con 35 lb' },
  ],
} as const;

/** Qué toca cada día de la semana (rutina.md §2). 0 = domingo. */
export const WEEK_PATTERN: Record<
  number,
  { kind: DayKind; label: string; detail: string; templateId?: 'A' | 'B' | 'C' }
> = {
  1: { kind: 'strength', label: 'Fuerza A', detail: 'Pecho + Espalda · 55-60 min', templateId: 'A' },
  2: { kind: 'strength', label: 'VO₂máx + Fuerza B', detail: 'Intervalos por la mañana · Pierna por la noche', templateId: 'B' },
  3: { kind: 'rest', label: 'Descanso total', detail: 'Supercompensación. Descansa de verdad.' },
  4: { kind: 'strength', label: 'Umbral + Fuerza C', detail: 'Tempo por la mañana · Hombro y brazo por la noche', templateId: 'C' },
  5: { kind: 'walk', label: 'Caminata 20 min', detail: 'Recuperación activa · core opcional 10 min' },
  6: { kind: 'volleyball', label: 'Voleibol', detail: '8:00-12:00 · pliometría y aeróbico intermitente' },
  0: { kind: 'running', label: 'Tirada larga', detail: '10-14 km a ritmo fácil' },
};

/**
 * Reglas de los bloques de 4 semanas (rutina.md §4C).
 *
 * La cuarta semana es de descarga: RIR 4 y la mitad de las series, con el
 * mismo peso. Las descargas de fuerza y carrera van sincronizadas; descargar
 * una mientras la otra sigue al máximo es el error clásico del entrenamiento
 * concurrente.
 */
export const BLOCK_RULES = {
  weeksPerBlock: 4,
  /** RIR objetivo por semana del bloque. */
  rirByBlockWeek: [3, 2, 1, 4],
  labels: ['Introducción', 'Acumulación', 'Intensificación', 'Descarga'],
  deloadBlockWeek: 4,
  deloadSetMultiplier: 0.5,
  deloadRunVolumeCut: 0.3,
} as const;

/**
 * La Escalera de Densificación (rutina.md §4B).
 *
 * Existe porque el salto de 25 a 35 lb es de +4,5 kg por mano —demasiado
 * grande para progresar linealmente— y por encima de 35 lb no hay material.
 * Son los peldaños intermedios, y el orden importa: no se saltan.
 */
export const DENSIFICATION_LADDER = [
  { step: 1, method: 'Más reps', how: 'Sube dentro del rango prescrito.' },
  { step: 2, method: 'Par mixto', how: 'Una mancuerna de 25 lb y otra de 35 lb, alternando el lado cada serie. Sólo en unilaterales y press.' },
  { step: 3, method: 'Polainas como lastre', how: '25 lb en mano + polaina de 2 kg en muñeca o cintura ≈ 30 lb efectivos.' },
  { step: 4, method: 'Tempo excéntrico', how: 'De 3" a 4" o 5" de bajada. Un excéntrico de 5" con 35 lb estimula como uno de 2" con bastante más peso.' },
  { step: 5, method: 'Pausas en el punto débil', how: '2-3" de pausa en el estiramiento: abajo en press, en búlgara y en el peso muerto rumano.' },
  { step: 6, method: '1½ reps', how: 'Rep completa + media rep en el rango bajo cuenta como una. Brutal en búlgara y elevaciones laterales.' },
  { step: 7, method: 'Densidad', how: 'Mismo trabajo con descansos de 90" → 75" → 60".' },
  { step: 8, method: 'Unilateralizar', how: 'De bilateral a unilateral: el peso por lado se mantiene pero la exigencia se duplica.' },
  { step: 9, method: 'Series clúster', how: '12 reps como 4+4+4 con 15" de pausa, con un peso que sólo daría para 8.' },
  { step: 10, method: 'Serie extra', how: 'Último recurso: +1 serie, respetando el techo de 4 ejercicios.' },
] as const;

/** Fecha de referencia del plan, sobrescrita por la del perfil. */
export const DEFAULT_PLAN_START: DateStr = '2026-09-14';
