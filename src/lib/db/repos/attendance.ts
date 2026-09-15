import type { AttendanceDay, DateStr, Profile } from '../../../types/models';
import {
  nutritionLogsCollection, runningSessionsCollection,
  strengthSessionsCollection, waterLogsCollection,
} from '../collections';
import { buildAttendanceDay, type DayRecords } from '../../attendance';

/**
 * Asistencia de un rango de días.
 *
 * Cuatro consultas por rango, todas sobre el índice `{userId, date}` de su
 * colección. Se agrupan en memoria, que para un mes son como mucho unas
 * decenas de documentos.
 */
export async function getAttendanceRange(
  userId: string,
  dates: readonly DateStr[],
  today: DateStr,
  profile: Pick<Profile, 'goals' | 'planStartDate' | 'planWeeks'> | null,
): Promise<AttendanceDay[]> {
  if (dates.length === 0) return [];

  const from = dates[0]!;
  const to = dates[dates.length - 1]!;
  const range = { userId, date: { $gte: from, $lte: to } };

  const [strength, running, water, nutrition] = await Promise.all([
    strengthSessionsCollection().find(range).toArray(),
    runningSessionsCollection().find(range).toArray(),
    waterLogsCollection().find(range).toArray(),
    nutritionLogsCollection().find(range).toArray(),
  ]);

  const strengthByDate = new Map(strength.map((s) => [s.date, s]));
  const waterByDate = new Map(water.map((w) => [w.date, w]));
  const nutritionByDate = new Map(nutrition.map((n) => [n.date, n]));

  // Puede haber varias carreras el mismo día (el martes hay intervalos y el
  // plan admite rodajes sueltos), así que aquí sí se agrupa en lista.
  const runningByDate = new Map<DateStr, typeof running>();
  for (const run of running) {
    runningByDate.set(run.date, [...(runningByDate.get(run.date) ?? []), run]);
  }

  return dates.map((date) => {
    const records: DayRecords = {
      strength: strengthByDate.get(date) ?? null,
      running: runningByDate.get(date) ?? [],
      water: waterByDate.get(date) ?? null,
      nutrition: nutritionByDate.get(date) ?? null,
    };
    return buildAttendanceDay(date, today, profile, records);
  });
}
