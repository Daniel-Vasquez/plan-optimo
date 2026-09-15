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

  return created;
}
