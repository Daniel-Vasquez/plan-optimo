import type { APIRoute } from 'astro';
import { handle, json, requireUser } from '../../lib/api';
import type { ProfileUpdate } from '../../lib/db/repos/profiles';
import { ensureProfile, getProfile, updateProfile } from '../../lib/db/repos/profiles';
import type { DateStr } from '../../types/models';

export const prerender = false;

/** Lunes de la semana en curso, en hora local del servidor. Respaldo si no llega fecha. */
function mondayOfThisWeek(): DateStr {
  const d = new Date();
  const dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const GET: APIRoute = ({ locals }) =>
  handle(async () => {
    const user = requireUser(locals);
    const profile = await getProfile(user.id);
    return json({ profile });
  });

/**
 * Crea el perfil si no existe. Lo llama la página de registro justo después
 * del alta para guardar la fecha de inicio del plan y la zona horaria.
 *
 * El `userId` sale de la sesión, nunca del cuerpo de la petición.
 */
export const POST: APIRoute = ({ locals, request }) =>
  handle(async () => {
    const user = requireUser(locals);

    const body = (await request.json().catch(() => ({}))) as {
      planStartDate?: unknown;
      timezone?: unknown;
    };

    const planStartDate =
      typeof body.planStartDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.planStartDate)
        ? body.planStartDate
        : mondayOfThisWeek();

    const profile = await ensureProfile(user.id, {
      displayName: user.name || user.email.split('@')[0]!,
      planStartDate,
    });

    // La zona horaria la detecta el navegador, así que sólo se puede fijar
    // aquí; el valor por defecto del modelo es un respaldo.
    if (typeof body.timezone === 'string' && body.timezone && profile.timezone !== body.timezone) {
      const updated = await updateProfile(user.id, { timezone: body.timezone });
      return json({ profile: updated ?? profile });
    }

    return json({ profile });
  });

/** Número dentro de rango, o `undefined` si no vale (así no se escribe basura). */
function num(value: unknown, min: number, max: number): number | undefined {
  const n = typeof value === 'string' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max) return undefined;
  return n;
}

/** Igual que `num`, pero admite `null` explícito para vaciar un campo opcional. */
function nullableNum(value: unknown, min: number, max: number): number | null | undefined {
  if (value === null) return null;
  return num(value, min, max);
}

function isValidTimezone(value: unknown): value is string {
  if (typeof value !== 'string' || !value) return false;
  try {
    new Intl.DateTimeFormat('en-CA', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/**
 * Actualiza el perfil.
 *
 * Se valida aquí de nuevo todo lo que ya valida el formulario: la comprobación
 * del navegador es comodidad para el usuario, no una garantía. Cualquiera
 * puede llamar a este endpoint directamente.
 *
 * Los campos que no superan la validación se descartan en vez de rechazar la
 * petición entera, salvo los que dejarían el perfil inservible (la zona
 * horaria y la fecha de inicio), que sí devuelven 400.
 */
export const PATCH: APIRoute = ({ locals, request }) =>
  handle(async () => {
    const user = requireUser(locals);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const changes: ProfileUpdate = {};

    if (typeof body.displayName === 'string' && body.displayName.trim()) {
      changes.displayName = body.displayName.trim().slice(0, 80);
    }

    const heightCm = nullableNum(body.heightCm, 100, 250);
    if (heightCm !== undefined) changes.heightCm = heightCm;

    const startWeightKg = nullableNum(body.startWeightKg, 30, 250);
    if (startWeightKg !== undefined) changes.startWeightKg = startWeightKg;

    if (body.displayUnit === 'kg' || body.displayUnit === 'lb') {
      changes.displayUnit = body.displayUnit;
    }

    if (body.timezone !== undefined) {
      if (!isValidTimezone(body.timezone)) {
        return json({ error: 'La zona horaria no es válida.' }, 400);
      }
      changes.timezone = body.timezone;
    }

    if (body.planStartDate !== undefined) {
      if (typeof body.planStartDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.planStartDate)) {
        return json({ error: 'La fecha de inicio no es válida.' }, 400);
      }
      changes.planStartDate = body.planStartDate;
    }

    const planWeeks = num(body.planWeeks, 1, 52);
    if (planWeeks !== undefined) changes.planWeeks = Math.round(planWeeks);

    if (body.goals && typeof body.goals === 'object') {
      const incoming = body.goals as Record<string, unknown>;
      const current = (await getProfile(user.id))?.goals;
      if (current) {
        // Se parte de las metas actuales para que un campo inválido no borre
        // el resto: `goals` se guarda como objeto completo.
        changes.goals = {
          ...current,
          waterMlPerDay: num(incoming.waterMlPerDay, 0, 10000) ?? current.waterMlPerDay,
          proteinG: num(incoming.proteinG, 0, 400) ?? current.proteinG,
          carbsTrainingG: num(incoming.carbsTrainingG, 0, 800) ?? current.carbsTrainingG,
          carbsRestG: num(incoming.carbsRestG, 0, 800) ?? current.carbsRestG,
          fatG: num(incoming.fatG, 0, 300) ?? current.fatG,
          kcalTraining: num(incoming.kcalTraining, 0, 6000) ?? current.kcalTraining,
          kcalRest: num(incoming.kcalRest, 0, 6000) ?? current.kcalRest,
          target5kSeconds: num(incoming.target5kSeconds, 300, 7200) ?? current.target5kSeconds,
        };
      }
    }

    if (Object.keys(changes).length === 0) {
      return json({ error: 'No hay nada válido que actualizar.' }, 400);
    }

    const profile = await updateProfile(user.id, changes);
    if (!profile) return json({ error: 'No se encontró tu perfil.' }, 404);

    return json({ profile });
  });
