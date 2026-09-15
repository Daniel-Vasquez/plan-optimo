/**
 * Crea los índices de las colecciones de dominio.
 *
 * Ejecutar con:  npm run db:indexes
 *
 * Lee el entorno con `node --env-file=.env`, no a través de `src/lib/env.ts`:
 * ese módulo depende de `import.meta.env`, que sólo existe dentro de Vite.
 *
 * Es idempotente: `createIndex` con la misma especificación no hace nada, así
 * que se puede lanzar tantas veces como haga falta y tras cada tanda.
 */
import { MongoClient } from 'mongodb';
import { ensureIndexes } from '../src/lib/db/schema.ts';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri || !dbName) {
  console.error(
    'Faltan MONGODB_URI o MONGODB_DB.\n' +
      'Este script se lanza con: npm run db:indexes (que ya carga el .env).',
  );
  process.exit(1);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15_000 });

try {
  await client.connect();
  const db = client.db(dbName);
  const created = await ensureIndexes(db);
  console.log(`Índices asegurados en "${dbName}":`);
  for (const name of created) console.log(`  · ${name}`);
  console.log('\nLas colecciones de Better Auth (user, account, session,');
  console.log('verification) se indexan solas al primer uso.');
} catch (error) {
  console.error('Fallo creando índices:', error.message);
  process.exitCode = 1;
} finally {
  await client.close();
}
