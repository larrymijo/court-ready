const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 22 → "22", 22.5 → "22.5", 22.25 → "22.25". */
export function formatKg(n: number): string {
  return String(Math.round(n * 100) / 100);
}

export function formatVolume(kg: number): string {
  if (kg >= 10000) return `${(kg / 1000).toFixed(1)} t`;
  return `${Math.round(kg).toLocaleString('en-US')} kg`;
}

/** Seconds → "1:05". */
export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}

/** Milliseconds → "1h 05m" or "42 min". */
export function formatDuration(ms: number): string {
  const totalMin = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} min`;
  return `${h}h ${m < 10 ? '0' : ''}${m}m`;
}

/** Elapsed ms → "12:05" or "1:02:05". */
export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h > 0 && m < 10 ? `0${m}` : String(m);
  const ss = s < 10 ? `0${s}` : String(s);
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatDateLong(ts: number): string {
  const d = new Date(ts);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatShortDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatMonth(ts: number): string {
  const d = new Date(ts);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  const m = d.getMinutes();
  return `${d.getHours()}:${m < 10 ? '0' : ''}${m}`;
}

/** "1 set", "3 sets". */
export function plural(n: number, word: string, pluralWord = `${word}s`): string {
  return `${n} ${n === 1 ? word : pluralWord}`;
}

/** Signed kg change with a real minus sign: "−0.9 kg", "+0.4 kg". */
export function formatChange(kg: number): string {
  const r = Math.round(kg * 10) / 10;
  if (r === 0) return '0 kg';
  return `${r < 0 ? '−' : '+'}${formatKg(Math.abs(r))} kg`;
}

interface SetFormatInfo {
  tracking: 'weight_reps' | 'reps';
  equipment: string;
}

/**
 * One set as text. Full: "22 kg × 10", "BW × 7", "+2.5 kg × 7", "12 reps".
 * Compact (tables): "22 × 10", "BW × 7", "+2.5 × 7", "× 12".
 */
export function formatSet(ex: SetFormatInfo, weight: number | null, reps: number | null, compact = false): string {
  const r = reps ?? 0;
  if (ex.tracking === 'reps') return compact ? `× ${r}` : `${r} reps`;
  const w = weight ?? 0;
  if (ex.equipment === 'bodyweight') {
    if (w <= 0) return `BW × ${r}`;
    return compact ? `+${formatKg(w)} × ${r}` : `+${formatKg(w)} kg × ${r}`;
  }
  return compact ? `${formatKg(w)} × ${r}` : `${formatKg(w)} kg × ${r}`;
}

/** Row labels for a set table: warm-ups are "W", working sets count 1, 2, 3… */
export function setLabels(sets: readonly { type: 'normal' | 'warmup' }[]): string[] {
  let n = 0;
  return sets.map((s) => (s.type === 'warmup' ? 'W' : String(++n)));
}

/** Parses user input like "22,5" or "22.5"; empty → null. */
export function parseNumber(text: string): number | null {
  const t = text.replace(',', '.').trim();
  if (t === '' || t === '.' || t === '-') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}
