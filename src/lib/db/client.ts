import { MongoClient, type Db } from 'mongodb';
import { serverEnv } from '../env';

/**
 * Cliente de MongoDB compartido por todo el proceso.
 *
 * Se cachea en `globalThis` por dos motivos:
 *
 * 1. En desarrollo, el hot-reload de Vite reevalúa los módulos en cada cambio.
 *    Sin caché, cada recarga abriría un pool de conexiones nuevo y acabaría
 *    agotando el límite de conexiones de Atlas.
 * 2. En producción sobre funciones serverless, un mismo contenedor atiende
 *    varias peticiones. Reutilizar el cliente evita pagar el handshake de
 *    conexión en cada invocación.
 *
 * `new MongoClient()` no conecta: el driver abre la conexión de forma perezosa
 * en la primera operación. Por eso los getters pueden ser síncronos, que es lo
 * que necesita `mongodbAdapter()` al construir la instancia de Better Auth.
 */

const CLIENT_KEY = Symbol.for('trackfit.mongo.client');

type GlobalWithMongo = typeof globalThis & {
  [CLIENT_KEY]?: MongoClient;
};

const globalWithMongo = globalThis as GlobalWithMongo;

export function getMongoClient(): MongoClient {
  let client = globalWithMongo[CLIENT_KEY];
  if (!client) {
    client = new MongoClient(serverEnv.mongoUri, {
      // En serverless conviene un pool pequeño: muchas instancias con pocas
      // conexiones cada una, en vez de pocas acaparando el límite de Atlas.
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 10_000,
    });
    globalWithMongo[CLIENT_KEY] = client;
  }
  return client;
}

export function getDb(): Db {
  return getMongoClient().db(serverEnv.mongoDb);
}
