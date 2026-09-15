import type { Db } from 'mongodb';

/**
 * Esquema físico de la base de datos: nombres de colección e índices.
 *
 * Este módulo no importa nada en tiempo de ejecución (el `import type` lo
 * elimina el compilador). Es deliberado: lo carga tanto la app dentro de Vite
 * como `scripts/db-indexes.mjs` en Node puro, donde `import.meta.env` no
 * existe y cualquier dependencia hacia la configuración lo rompería.
 */

/**
 * Nombres de colección en un solo sitio.
 *
 * Las cuatro primeras las gestiona Better Auth: las crea, las indexa y las
 * escribe por su cuenta. Aparecen aquí para poder referirlas y para que no se
 * reutilicen por error.
 */
export const COLLECTIONS = {
  // Gestionadas por Better Auth
  user: 'user',
  account: 'account',
  session: 'session',
  verification: 'verification',
  // Dominio
  profiles: 'profiles',
  waterLogs: 'water_logs',
  runningSessions: 'running_sessions',
  strengthSessions: 'strength_sessions',
  nutritionLogs: 'nutrition_logs',
  foods: 'foods',
  notes: 'notes',
} as const;

/**
 * Crea los índices de las colecciones de dominio.
 *
 * `createIndex` es idempotente: repetir la llamada con la misma especificación
 * no hace nada. Por eso el script se puede ejecutar tantas veces como haga
 * falta, y cada tanda añade aquí los índices de sus colecciones nuevas.
 *
 * Better Auth crea los suyos (`user.email` único, `session.token`, etc.) la
 * primera vez que escribe, así que no se declaran aquí.
 *
 * Regla: `userId` es el prefijo de todo índice de dominio. Aunque un bug
 * lograse construir un filtro sin `userId`, la unicidad sigue siendo por
 * usuario y no puede colisionar entre cuentas.
 */
export async function ensureIndexes(db: Db): Promise<string[]> {
  const created: string[] = [];

  created.push(
    await db
      .collection(COLLECTIONS.profiles)
      .createIndex({ userId: 1 }, { unique: true, name: 'userId_unique' }),
  );

  // Único por usuario y día: es lo que impide que dos peticiones simultáneas
  // creen dos documentos para la misma jornada.
  created.push(
    await db
      .collection(COLLECTIONS.waterLogs)
      .createIndex({ userId: 1, date: -1 }, { unique: true, name: 'userId_date_unique' }),
  );

  // Aquí NO es único por fecha: se puede correr dos veces el mismo día
  // (martes hay intervalos por la mañana y el plan admite rodajes sueltos).
  const runs = db.collection(COLLECTIONS.runningSessions);
  created.push(await runs.createIndex({ userId: 1, date: -1 }, { name: 'userId_date' }));
  // Para las gráficas filtradas por tipo de sesión.
  created.push(
    await runs.createIndex({ userId: 1, runType: 1, date: -1 }, { name: 'userId_runType_date' }),
  );

  // Una sesión de fuerza por día: el plan nunca programa dos, y la unicidad
  // evita duplicados si se guarda dos veces desde pestañas distintas.
  const strength = db.collection(COLLECTIONS.strengthSessions);
  created.push(
    await strength.createIndex({ userId: 1, date: -1 }, { unique: true, name: 'userId_date_unique' }),
  );
  // Para la gráfica de progresión de un ejercicio concreto.
  created.push(
    await strength.createIndex(
      { userId: 1, 'exercises.slug': 1, date: 1 },
      { name: 'userId_exerciseSlug_date' },
    ),
  );

  // Un documento de nutrición por día y usuario.
  created.push(
    await db
      .collection(COLLECTIONS.nutritionLogs)
      .createIndex({ userId: 1, date: -1 }, { unique: true, name: 'userId_date_unique' }),
  );

  const foods = db.collection(COLLECTIONS.foods);
  // El buscador ordena por uso: los alimentos frecuentes primero.
  created.push(await foods.createIndex({ userId: 1, usageCount: -1 }, { name: 'userId_usage' }));
  // Búsqueda por nombre. El índice de texto permite acentos y palabras sueltas.
  created.push(
    await foods.createIndex({ name: 'text' }, { name: 'name_text', default_language: 'spanish' }),
  );

  const notes = db.collection(COLLECTIONS.notes);
  created.push(await notes.createIndex({ userId: 1, date: -1 }, { name: 'userId_date' }));
  // Búsqueda por título y contenido desde la propia bitácora.
  created.push(
    await notes.createIndex(
      { title: 'text', content: 'text' },
      { name: 'note_text', default_language: 'spanish' },
    ),
  );

  return created;
}
