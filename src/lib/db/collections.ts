import type { Collection } from 'mongodb';
import { getDb } from './client';
import { COLLECTIONS } from './schema';
import type { Profile } from '../../types/models';

/**
 * Accesos tipados a las colecciones. Los nombres y los índices viven en
 * `schema.ts`, que es el módulo que también consume el script de índices.
 */
export { COLLECTIONS };

export function profilesCollection(): Collection<Profile> {
  return getDb().collection<Profile>(COLLECTIONS.profiles);
}
