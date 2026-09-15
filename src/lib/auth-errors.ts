/**
 * Traduce el error de Better Auth a un mensaje para el usuario.
 *
 * El matiz importante: sólo un 401 significa "credenciales incorrectas".
 * Colapsar cualquier fallo en ese mensaje esconde los problemas de
 * infraestructura —una base de datos inaccesible acaba pareciendo una
 * contraseña mal escrita— y manda a quien depura en la dirección contraria.
 *
 * El mensaje de credenciales sí se mantiene deliberadamente ambiguo entre
 * "ese email no existe" y "la contraseña no es correcta": distinguirlos le
 * confirma a un atacante qué correos están registrados.
 */
export function authErrorMessage(error: { status?: number; message?: string } | null): string {
  if (!error) return 'No se pudo completar la operación.';

  const status = error.status ?? 0;

  if (status === 401) return 'Email o contraseña incorrectos.';
  if (status === 403) {
    return 'El servidor rechazó la petición por seguridad. Si acabas de cambiar el dominio, revisa BETTER_AUTH_URL.';
  }
  if (status === 422) return 'Ya existe una cuenta con ese email.';
  if (status === 429) return 'Demasiados intentos. Espera un momento y vuelve a probar.';
  if (status >= 500) {
    return 'Error del servidor. No es tu contraseña: revisa los logs del despliegue.';
  }
  return error.message ?? 'No se pudo completar la operación.';
}
