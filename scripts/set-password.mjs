/**
 * Cambia la contraseña de una cuenta directamente en la base de datos.
 *
 * Ejecutar con:  npm run db:set-password -- tu@email.com
 *
 * Existe porque la app no tiene proveedor de correo configurado, así que no
 * hay flujo de "he olvidado mi contraseña". Es una herramienta de operación,
 * no una funcionalidad de la app: pide la contraseña por stdin sin eco para
 * que no acabe en el historial del shell.
 *
 * Usa la misma función de hash que Better Auth (scrypt con sal aleatoria,
 * formato `sal:hash`), así que el registro resultante es indistinguible de
 * uno creado desde la interfaz.
 */
import { createInterface } from 'node:readline';
import { Writable } from 'node:stream';
import { MongoClient } from 'mongodb';
import { hashPassword } from '@better-auth/utils/password';

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error('Uso: npm run db:set-password -- tu@email.com');
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;
if (!uri || !dbName) {
  console.error('Faltan MONGODB_URI o MONGODB_DB (el script ya carga el .env).');
  process.exit(1);
}

/** Lee una línea de stdin sin que se vea lo tecleado. */
function askHidden(question) {
  return new Promise((resolve) => {
    let muted = false;
    const mutedOut = new Writable({
      write(chunk, _encoding, callback) {
        if (!muted) process.stdout.write(chunk);
        callback();
      },
    });
    const rl = createInterface({ input: process.stdin, output: mutedOut, terminal: true });
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
    muted = true;
  });
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });

try {
  await client.connect();
  const db = client.db(dbName);

  const user = await db.collection('user').findOne({ email });
  if (!user) {
    const all = await db.collection('user').find({}, { projection: { email: 1 } }).toArray();
    console.error('No hay ninguna cuenta con el email "' + email + '" en la base "' + dbName + '".');
    console.error('Cuentas existentes:', all.map((u) => u.email).join(', ') || '(ninguna)');
    process.exit(1);
  }

  const password = await askHidden('Nueva contrasena para ' + email + ': ');
  if (password.length < 8) {
    console.error('La contrasena debe tener al menos 8 caracteres.');
    process.exit(1);
  }

  const hash = await hashPassword(password);
  const result = await db.collection('account').updateOne(
    { userId: user._id, providerId: 'credential' },
    { $set: { password: hash, updatedAt: new Date() } },
  );

  if (result.matchedCount === 0) {
    console.error('La cuenta no tiene credenciales de email/contrasena asociadas.');
    process.exit(1);
  }

  // Cambiar la contrasena debe expulsar a quien estuviera dentro con la anterior.
  const sessions = await db
    .collection('session')
    .deleteMany({ userId: { $in: [user._id, String(user._id)] } });

  console.log('Contrasena actualizada para ' + email + '.');
  console.log('Sesiones cerradas: ' + sessions.deletedCount + '.');
} catch (error) {
  console.error('Fallo:', error.message);
  process.exitCode = 1;
} finally {
  await client.close();
}
