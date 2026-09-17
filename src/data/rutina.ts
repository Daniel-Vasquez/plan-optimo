/**
 * Las partes narrativas de `rutina.md` que no vivían ya en `plan.ts`.
 *
 * `plan.ts` tiene lo que la app EJECUTA: sesiones, ejercicios, bloques y la
 * Escalera de Densificación. Aquí está lo que la app MUESTRA: el diagnóstico
 * de nutrición, el porqué del cronograma, los ritmos objetivo y las reglas de
 * progresión.
 *
 * La separación importa: si algo de esto se usara para calcular, debería estar
 * en `plan.ts` o en el módulo correspondiente, no aquí. Este archivo es sólo
 * el contenido de la página `/rutina`.
 */

export const PERFIL = {
  descripcion: 'Hombre, 31 años · 1.65 m · 66.3 kg · Home office (9:00-18:00)',
  objetivos: [
    'Masa muscular y fuerza',
    'Reducción de grasa',
    'Bajar marca en 5K',
  ],
  marcas: '5K en 6:08 min/km (≈30:40) · 10K en 6:18 min/km · 17-20 km semanales',
  limitante:
    'Tu limitante real no es el equipo, es la proteína (≈60-70 g/día actuales) y el sueño (6-7 h). Si arreglas esos dos, el resto del plan rinde el triple.',
} as const;

/** §1 — Diagnóstico de nutrición e hidratación. */
export interface AjusteNutricional {
  punto: string;
  actual: string;
  ajuste: string;
  /** El documento marca la proteína como el ajuste prioritario. */
  prioritario: boolean;
}

export const DIAGNOSTICO_NUTRICION: AjusteNutricional[] = [
  {
    punto: 'Proteína',
    actual: '~60-70 g (≈1.0 g/kg)',
    ajuste: '125-140 g/día (≈2.0 g/kg). Es el ajuste #1.',
    prioritario: true,
  },
  {
    punto: 'Carbohidratos',
    actual: 'Solo arroz en la comida',
    ajuste: '4-6 g/kg (270-400 g) en días de carrera o fuerza. Sin esto no vas a bajar el 5K.',
    prioritario: false,
  },
  {
    punto: 'Grasa',
    actual: 'Adecuada (aguacate, huevo)',
    ajuste: 'Mantener 55-70 g/día.',
    prioritario: false,
  },
  {
    punto: 'Calorías',
    actual: 'Probablemente bajas',
    ajuste:
      'Mantenimiento estimado ~2,400-2,500 kcal. Recomposición: 2,300-2,400 los días de entreno y 2,000-2,100 miércoles y viernes.',
    prioritario: false,
  },
  {
    punto: 'Agua',
    actual: '1.5-2 L',
    ajuste: '2.5-3 L base. Sábado de voleibol: +750 ml/hora con electrolitos.',
    prioritario: false,
  },
  {
    punto: 'Sueño',
    actual: '6-7 h',
    ajuste:
      '7.5-8 h. Con 6 h, la síntesis proteica y la recuperación del entrenamiento concurrente se caen notablemente.',
    prioritario: true,
  },
];

/** §1 — Cómo llegar a 130 g de proteína sin cambiar la estructura de comidas. */
export const PLAN_PROTEINA = [
  {
    comida: 'Desayuno',
    ajuste:
      'Sube a 3 huevos + claras, y suma yogurt griego natural o requesón en lugar de la gelatina (o además).',
    proteina: '~35 g',
  },
  {
    comida: 'Comida',
    ajuste:
      'Pechuga de 180-200 g en crudo (no 120 g) y sube el arroz a 1.5 tazas cocidas los días de entreno.',
    proteina: '~50 g',
  },
  {
    comida: 'Cena',
    ajuste:
      'Aquí está tu mayor hueco: sándwich de huevo + café + galletas ≈ 15 g. Cámbialo por huevo + atún o pollo sobrante + avena o un segundo pan, o un batido de proteína.',
    proteina: '~35 g',
  },
  {
    comida: 'Post-entreno (noche)',
    ajuste: 'Batido de whey + plátano, o yogurt griego con fruta.',
    proteina: '~25 g',
  },
];

/** §1 — Timing de la alimentación alrededor de las sesiones. */
export const TIMING = [
  {
    cuando: 'Martes y jueves por la mañana',
    que: 'Intervalos en ayunas',
    detalle:
      'Si corres en ayunas, mete 1 plátano o 1 dátil con agua 20 minutos antes. Series de calidad en ayunas son series lentas.',
  },
  {
    cuando: 'Domingo',
    que: 'Tirada larga',
    detalle:
      'Carga carbohidratos el sábado por la noche. Si la tirada pasa de 75 minutos, lleva fruta o gel para los 45-50 min.',
  },
  {
    cuando: 'Sábado',
    que: 'Voleibol (4 h)',
    detalle:
      'Desayuno real con carbohidratos y agua con electrolitos durante. Es tu sesión más larga de la semana y probablemente la que peor alimentas.',
  },
];

/** §2 — Por qué la pierna va el martes por la noche. */
export const RAZON_PIERNA_MARTES = {
  titulo: 'Por qué la pierna va el martes por la noche',
  razones: [
    {
      caso: 'Lunes noche → martes mañana',
      problema: 'Sólo 11 h de separación. Arruinaría tu sesión de velocidad.',
    },
    {
      caso: 'Jueves noche → sábado 8 AM',
      problema: '36 h antes de 4 horas de saltos. Receta para rodillas irritadas.',
    },
    {
      caso: 'Martes noche → miércoles descanso → jueves umbral',
      problema:
        '36 h con un día completo sin estímulo en medio, y el jueves es la sesión de carrera menos exigente a nivel neuromuscular. Esta es la única ventana limpia de tu semana.',
      esLaElegida: true,
    },
  ],
  cierre:
    'Además concentra la carga: el martes es tu día duro y el miércoles descansas de verdad. Eso es exactamente lo que pide el entrenamiento concurrente.',
} as const;

/** §2 — Ritmos objetivo, calculados desde el 5K de 30:40. */
export const RITMOS_OBJETIVO = [
  {
    sesion: 'Fácil / Tirada larga',
    ritmo: '7:15-7:45',
    detalle: 'Sí, más lento de lo que corres hoy. Es intencional.',
  },
  {
    sesion: 'Umbral (jueves)',
    ritmo: '6:15-6:25',
    detalle: 'Debe sentirse "cómodamente duro".',
  },
  {
    sesion: 'VO₂máx (martes)',
    ritmo: '5:45-5:55',
    detalle: '400 m en 2:18-2:22 · 800 m en 4:38-4:45',
  },
  {
    sesion: 'Velocidad pura',
    ritmo: '5:20-5:30',
    detalle: '200 m en 1:04-1:06',
  },
];

export const CORRECCION_RITMOS =
  'Corres tu 10K a 6:18/km, que es prácticamente tu ritmo de umbral. Estás compitiendo cada rodaje: casi todo tu volumen está en "tierra de nadie", demasiado rápido para recuperar y demasiado lento para mejorar. Bajar el ritmo de la tirada larga a 7:15-7:45 es probablemente el cambio que más te va a bajar el 5K.';

/** §2 — Progresión mensual de las sesiones de carrera. */
export const PROGRESION_CARRERA = [
  {
    semanas: '1-2',
    vo2max: '6 × 400 m @ 2:20 / rec. 90"',
    umbral: '3 × 1 km @ 6:20 / rec. 90"',
    domingo: '10-11 km @ 7:30',
  },
  {
    semanas: '3-4',
    vo2max: '8 × 400 m @ 2:18 / rec. 90"',
    umbral: '4 × 1 km @ 6:20 / rec. 90"',
    domingo: '11-12 km @ 7:30',
  },
  {
    semanas: '5-6',
    vo2max: '5 × 800 m @ 4:42 / rec. 2\'',
    umbral: '20 min continuos @ 6:25',
    domingo: '12-13 km @ 7:20',
  },
  {
    semanas: '7-8',
    vo2max: '6 × 800 m @ 4:38 / rec. 2\'',
    umbral: '2 × 12 min @ 6:20 / rec. 2\'',
    domingo: '13-14 km @ 7:20',
  },
];

export const NOTA_CARRERA =
  'Todas con 10 min de trote suave de calentamiento y 5 min de enfriamiento. Sobre los 18 km del domingo: para objetivo 5K no aportan; 14 km es el techo útil y te deja mucho más fresco para el martes.';

/** §4A — La regla base de progresión. */
export const DOBLE_PROGRESION = {
  pasos: [
    'Empiezas en el extremo bajo del rango con un peso que te deje en el RIR objetivo.',
    'Cada semana sumas 1-2 repeticiones por serie, manteniendo el mismo peso.',
    'Cuando completas TODAS las series en el extremo alto del rango con el RIR objetivo, subes al siguiente peso y vuelves al extremo bajo.',
  ],
  ejemplo: {
    titulo: 'Press banca 4 × 8-10 con 35 lb',
    series: ['S1: 8,8,8,7', 'S2: 9,9,8,8', 'S3: 10,10,9,9', 'S4: descarga', 'S5: 10,10,10,10'],
    cierre:
      'Peso maxeado. Como no tienes mancuerna más pesada, pasas a la Escalera de Densificación.',
  },
} as const;

/** §4D — Reglas de autorregulación. El documento las llama obligatorias. */
export const REGLAS_AUTORREGULACION = [
  {
    condicion: 'Si el domingo corriste ≥13 km',
    accion: 'El lunes quita 1 serie del ejercicio 1.',
  },
  {
    condicion: 'Si el sábado el voleibol fue especialmente intenso',
    accion: 'El domingo baja a 9-10 km a ritmo fácil. No negocies.',
  },
  {
    condicion: 'Si los intervalos del martes salen >5" por km más lentos durante 2 semanas seguidas',
    accion: 'Estás acumulando fatiga. Baja la pierna a 2 series por ejercicio durante 2 semanas.',
  },
  {
    condicion: 'Si duermes <6 h',
    accion:
      'Convierte la sesión de fuerza de esa noche en una versión RIR 4, sin subir peso. Entrenar duro con 5 h de sueño genera daño sin adaptación.',
  },
  {
    condicion: 'Dolor articular agudo (rodilla, tendón de Aquiles, tibia)',
    accion:
      'Detén el asfalto, no "lo corras". Con tu volumen y el voleibol, la periostitis tibial es el riesgo #1.',
  },
];

/** §4E — Cómo se mide que el plan funciona. */
export const METRICAS_SEGUIMIENTO = [
  {
    metrica: 'Peso corporal',
    frecuencia: '3-4 mañanas por semana, promedio semanal',
    esperado: '−1.5 a −3 kg de grasa, peso casi estable',
  },
  {
    metrica: 'Perímetro de cintura',
    frecuencia: 'Domingos, en ayunas',
    esperado: '−3 a −5 cm',
  },
  {
    metrica: 'Reps totales por ejercicio',
    frecuencia: 'Cada sesión (bitácora)',
    esperado: '+30-50% de volumen total',
  },
  {
    metrica: 'Contrarreloj 5K',
    frecuencia: 'Semanas 6 y 12',
    esperado: '28:30 - 29:15 realista',
    destacada: true,
  },
  {
    metrica: 'Fotos',
    frecuencia: 'Cada 4 semanas, misma luz',
    esperado: 'Cambio visible hacia la semana 8',
  },
];

export const AJUSTE_CALORICO =
  'Si en 3 semanas la cintura no baja y el peso sube más de 0.4 kg por semana, recorta ~150 kcal.';

export const NOTA_CIERRE =
  'Tienes tres objetivos que compiten entre sí, y el orden en que los pusiste es el correcto. La estructura de este plan asume fuerza como prioridad y 5K como beneficiario del trabajo de gemelo, la mejora de economía de carrera y la pliometría del voleibol. Si en algún momento quieres priorizar una marca de 5K por encima de todo, habría que invertir esa lógica y reducir la pierna a mantenimiento.';
