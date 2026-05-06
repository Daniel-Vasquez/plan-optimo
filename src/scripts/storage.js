const SESSIONS_KEY = 'trackfit_sessions';
const NOTES_KEY = 'trackfit_notes';
const CONFIG_KEY = 'trackfit_config';

const SESSION_PLAN = {
  1: { type: 'fuerza', label: 'Fuerza AM', exercises: ['Sentadilla goblet', 'P. muerto rumano', 'Zancadas', 'Hip thrust', 'Plancha frontal/lateral'] },
  2: { type: 'cardio', label: 'Carrera AM', running: 'Intervalos 400m × 6–8 a 4:45–5:00 min/km' },
  2.5: { type: 'fuerza', label: 'Fuerza PM', exercises: ['Press banca', 'Remo unilateral', 'Fondos', 'Curl bíceps'] },
  3: { type: 'descanso', label: 'Descanso activo', notes: 'Movilidad, caminata opcional' },
  4: { type: 'fuerza', label: 'Fuerza', exercises: ['Sentadilla sumo', 'Ext. cadera', 'Step-up', 'Abdominal bicicleta'] },
  5: { type: 'cardio', label: 'Carrera AM', running: 'Tempo/Fartlek 3–4 km a 5:20–5:35 min/km' },
  5.5: { type: 'fuerza', label: 'Fuerza PM', exercises: ['Press militar', 'Elev. laterales', 'Remo mentón', 'Ext. tríceps'] },
  6: { type: 'voleibol', label: 'Voleibol', notes: '8am–12pm' },
  0: { type: 'cardio', label: 'Carrera larga', running: 'Carrera larga 10–15 km a 6:30–6:50 min/km' },
};

// dayOfWeek: 0=Sunday, 1=Monday, ..., 6=Saturday
const DAY_SESSION_MAP = {
  1: { type: 'fuerza', label: 'Fuerza', exercises: ['Sentadilla goblet', 'P. muerto rumano', 'Zancadas', 'Hip thrust', 'Plancha frontal/lateral'] },
  2: { type: 'mixto', label: 'Carrera + Fuerza', morning: 'Intervalos 400m × 6–8 a 4:45–5:00 min/km', exercises: ['Press banca', 'Remo unilateral', 'Fondos', 'Curl bíceps'] },
  3: { type: 'descanso', label: 'Descanso activo', notes: 'Movilidad, caminata opcional' },
  4: { type: 'fuerza', label: 'Fuerza', exercises: ['Sentadilla sumo', 'Ext. cadera', 'Step-up', 'Abdominal bicicleta'] },
  5: { type: 'mixto', label: 'Carrera + Fuerza', morning: 'Tempo/Fartlek 3–4 km a 5:20–5:35 min/km', exercises: ['Press militar', 'Elev. laterales', 'Remo mentón', 'Ext. tríceps'] },
  6: { type: 'voleibol', label: 'Voleibol', notes: '8am–12pm' },
  0: { type: 'cardio', label: 'Carrera larga', running: 'Carrera larga 10–15 km a 6:30–6:50 min/km' },
};

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getSession(date) {
  try {
    const all = getAllSessions();
    return all[date] || null;
  } catch { return null; }
}

export function saveSession(date, data) {
  try {
    const all = getAllSessions();
    all[date] = { ...all[date], ...data };
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(all));
  } catch (e) { console.error('saveSession error', e); }
}

export function getAllSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function getSessionsInRange(start, end) {
  try {
    const all = getAllSessions();
    const startD = parseDate(start);
    const endD = parseDate(end);
    return Object.entries(all)
      .filter(([date]) => {
        const d = parseDate(date);
        return d >= startD && d <= endD;
      })
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, session]) => ({ date, ...session }));
  } catch { return []; }
}

export function getNotes() {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    const notes = raw ? JSON.parse(raw) : [];
    return notes.sort((a, b) => b.date.localeCompare(a.date));
  } catch { return []; }
}

export function saveNote(note) {
  try {
    const notes = getNotes();
    if (!note.id) {
      note.id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
      note.date = note.date || new Date().toISOString().slice(0, 10);
      notes.unshift(note);
    } else {
      const idx = notes.findIndex(n => n.id === note.id);
      if (idx >= 0) notes[idx] = note;
      else notes.unshift(note);
    }
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (e) { console.error('saveNote error', e); }
}

export function deleteNote(id) {
  try {
    const notes = getNotes().filter(n => n.id !== id);
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (e) { console.error('deleteNote error', e); }
}

export function searchNotes(query, tag) {
  try {
    let notes = getNotes();
    if (query) {
      const q = query.toLowerCase();
      notes = notes.filter(n =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.content || '').toLowerCase().includes(q)
      );
    }
    if (tag) {
      notes = notes.filter(n => n.tags && n.tags.includes(tag));
    }
    return notes;
  } catch { return []; }
}

export function getConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveConfig(config) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) { console.error('saveConfig error', e); }
}

export function getCurrentWeek() {
  try {
    const config = getConfig();
    if (!config || !config.startDate) return 1;
    const start = parseDate(config.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    const diffMs = today - start;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const week = Math.floor(diffDays / 7) + 1;
    return Math.max(1, Math.min(16, week));
  } catch { return 1; }
}

export function getSessionTypeForDate(date) {
  try {
    const d = parseDate(date);
    const dow = d.getDay();
    return DAY_SESSION_MAP[dow] || { type: 'descanso', label: 'Descanso' };
  } catch { return { type: 'descanso', label: 'Descanso' }; }
}

export function getPlanForDate(date) {
  try {
    const d = parseDate(date);
    const dow = d.getDay();
    return DAY_SESSION_MAP[dow] || { type: 'descanso', label: 'Descanso' };
  } catch { return { type: 'descanso', label: 'Descanso' }; }
}

export function getStreak() {
  try {
    const all = getAllSessions();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    let cursor = new Date(today);
    for (let i = 0; i < 365; i++) {
      const dateStr = cursor.toISOString().slice(0, 10);
      const session = all[dateStr];
      if (session && session.completed) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  } catch { return 0; }
}

export function getWeekCompletion() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monday = new Date(today);
    const dow = today.getDay();
    const diff = dow === 0 ? 6 : dow - 1;
    monday.setDate(today.getDate() - diff);
    const all = getAllSessions();
    let completed = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      if (all[dateStr] && all[dateStr].completed) completed++;
    }
    return { completed, total: 5 };
  } catch { return { completed: 0, total: 5 }; }
}

export function getBestPace() {
  try {
    const all = getAllSessions();
    let best = null;
    for (const session of Object.values(all)) {
      if (session.running && session.running.pace) {
        const pace = session.running.pace;
        if (!best) { best = pace; continue; }
        const [bm, bs] = best.split(':').map(Number);
        const [pm, ps] = pace.split(':').map(Number);
        if (pm * 60 + ps < bm * 60 + bs) best = pace;
      }
    }
    return best;
  } catch { return null; }
}

export function getTotalDistance() {
  try {
    const all = getAllSessions();
    return Object.values(all).reduce((sum, s) => {
      return sum + (s.running && s.running.distance ? Number(s.running.distance) : 0);
    }, 0);
  } catch { return 0; }
}

export function getAvgWater(days = 7) {
  try {
    const history = getWaterHistory(days);
    if (!history.length) return 0;
    const sum = history.reduce((s, h) => s + (h.water || 0), 0);
    return Math.round((sum / history.length) * 10) / 10;
  } catch { return 0; }
}

export function getRunSessions(limit = 12) {
  try {
    const all = getAllSessions();
    return Object.entries(all)
      .filter(([, s]) => s.running && s.running.pace)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-limit)
      .map(([date, s]) => ({ date, ...s }));
  } catch { return []; }
}

export function getWaterHistory(days = 14) {
  try {
    const all = getAllSessions();
    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      result.push({ date: dateStr, water: all[dateStr]?.water || 0 });
    }
    return result;
  } catch { return []; }
}

export function getMaxStreak() {
  try {
    const all = getAllSessions();
    const dates = Object.keys(all).filter(d => all[d].completed).sort();
    if (!dates.length) return 0;
    let max = 1, cur = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = parseDate(dates[i - 1]);
      const curr = parseDate(dates[i]);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      if (diff === 1) { cur++; if (cur > max) max = cur; }
      else cur = 1;
    }
    return max;
  } catch { return 0; }
}

export function getCompletionRate() {
  try {
    const all = getAllSessions();
    const entries = Object.values(all);
    if (!entries.length) return 0;
    const completed = entries.filter(s => s.completed).length;
    return Math.round((completed / entries.length) * 100);
  } catch { return 0; }
}
