import { MongoClient, type Db } from 'mongodb';
import { serverEnv } from '../env';

/**
 * Cliente de MongoDB para entorno serverless.
 *
 * Se cachea en `globalThis` porque un mismo contenedor de Vercel atiende
 * varias peticiones, y en desarrollo el hot-reload reevalúa los módulos: sin
 * caché se abriría un pool nuevo cada vez hasta agotar el límite de Atlas.
 *
 * Pero cachear a secas tiene una trampa que costó un despliegue entero:
 * cuando una operación falla de forma dura —Atlas rechazando la IP, por
 * ejemplo— el driver CIERRA la topología. El objeto cliente sigue en caché,
 * así que todas las peticiones siguientes de ese contenedor fallan con
 * `MongoTopologyClosedError: Topology is closed`, que además oculta el error
 * original. El contenedor queda envenenado hasta que Vercel lo recicla.
 *
 * Por eso aquí se comprueba el estado antes de reutilizar y se reconstruye el
 * cliente si quedó inservible. Y por eso `getDb()`/`getMongoClient()` devuelven
 * proxies: Better Auth recibe la referencia UNA vez, al construirse, así que si
 * se limitaran a devolver el objeto del momento seguiría usando el cliente
 * muerto para siempre. El proxy resuelve al cliente vivo en cada acceso.
 */

const STATE_KEY = Symbol.for('trackfit.mongo.state');

type GlobalWithMongo = typeof globalThis & { [STATE_KEY]?: MongoClient };
const globalWithMongo = globalThis as GlobalWithMongo;

function createClient(): MongoClient {
  return new MongoClient(serverEnv.mongoUri, {
    // Pool pequeño: en serverless hay muchas instancias, y entre todas no
    // deben agotar el límite de conexiones de Atlas.
    maxPoolSize: 10,
    minPoolSize: 0,
    // Vercel congela el contenedor entre invocaciones. Un socket que lleva
    // mucho ocioso está muerto del otro lado aunque aquí parezca vivo;
    // descartarlo pronto evita reutilizarlo.
    maxIdleTimeMS: 60_000,
    serverSelectionTimeoutMS: 10_000,
  });
}

/**
 * ¿El cliente quedó inservible?
 *
 * El driver no expone esto en su API pública, así que hay que mirar dentro, y
 * hay dos estados distintos que comprobar:
 *
 * - `s.hasBeenClosed`: alguien llamó a `close()`. El propio driver documenta
 *   que no hay forma de revertirlo, así que el cliente es basura para siempre.
 *   Reutilizarlo da `MongoNotConnectedError`.
 * - topología cerrada o destruida: un fallo duro la tumbó. Reutilizarlo da
 *   `MongoTopologyClosedError`.
 *
 * Si aún no hay topología es que no ha conectado, y eso es normal:
 * `new MongoClient()` no conecta, el driver lo hace en la primera operación.
 */
function isUnusable(client: MongoClient): boolean {
  const internals = client as unknown as {
    s?: { hasBeenClosed?: boolean };
    topology?: { isDestroyed?: () => boolean; isClosed?: () => boolean };
  };

  if (internals.s?.hasBeenClosed) return true;

  const topology = internals.topology;
  if (!topology) return false;
  return Boolean(topology.isClosed?.() || topology.isDestroyed?.());
}

/** Cliente vivo, reconstruido si el anterior murió. */
function liveClient(): MongoClient {
  const cached = globalWithMongo[STATE_KEY];
  if (cached && !isUnusable(cached)) return cached;

  if (cached) {
    console.warn('[mongo] la topología estaba cerrada; se reconstruye el cliente');
  }
  const client = createClient();
  globalWithMongo[STATE_KEY] = client;
  return client;
}

/** Envuelve un objeto para que cada acceso se resuelva contra la instancia viva. */
function liveProxy<T extends object>(resolve: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop, receiver) {
      const current = resolve();
      const value = Reflect.get(current as object, prop, receiver);
      return typeof value === 'function' ? value.bind(current) : value;
    },
    has(_target, prop) {
      return Reflect.has(resolve() as object, prop);
    },
    getPrototypeOf() {
      return Reflect.getPrototypeOf(resolve() as object);
    },
  });
}

/**
 * Cliente de Mongo. Es un proxy: quien lo guarde (Better Auth lo hace) seguirá
 * apuntando al cliente vivo aunque haya habido que reconstruirlo.
 */
export const mongoClient: MongoClient = liveProxy(liveClient);

export function getMongoClient(): MongoClient {
  return mongoClient;
}

export function getDb(): Db {
  return liveProxy(() => liveClient().db(serverEnv.mongoDb));
}
