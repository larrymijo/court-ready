// Words for sport sessions in History, on a session's own page, and in the Library. Pure: no
// screens, no store. Every optional field of a sport record may be missing, and an id this app
// doesn't know still reads under the record's own name.
import { sportDef } from '@/data/sports';
import { formatDateLong, formatKg, formatTime, plural } from '@/lib/format';
import { recordKind } from '@/lib/plans';
import { paceText } from '@/lib/sportSession';
import { workoutsInWeek } from '@/lib/stats';
import type { Checklist, SportDef, Workout } from '@/lib/types';

const isNum = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);

/** The record's own name; for a blank one the sport's name; for an unknown sport "Sport session". */
export function sportRecordName(w: Pick<Workout, 'name' | 'sport'>): string {
  const own = typeof w.name === 'string' ? w.name.trim() : '';
  if (own) return own;
  return (w.sport ? sportDef(w.sport)?.name : undefined) ?? 'Sport session';
}

/** "Match" or "Practice"; null when the record doesn't say (a run, or an older record). */
export function matchTag(w: Pick<Workout, 'match'>): 'Match' | 'Practice' | null {
  if (w.match === true) return 'Match';
  if (w.match === false) return 'Practice';
  return null;
}

/** "62 min"; null without minutes above 0. */
export function minutesText(w: Pick<Workout, 'minutes'>): string | null {
  return isNum(w.minutes) && w.minutes > 0 ? `${Math.round(w.minutes)} min` : null;
}

/** "8.2 km"; null without a distance above 0. */
export function distanceText(w: Pick<Workout, 'distanceKm'>): string | null {
  return isNum(w.distanceKm) && w.distanceKm > 0 ? `${formatKg(w.distanceKm)} km` : null;
}

/** The numbers of a session in the order a row shows them: "62 min", "effort 7", "8.2 km", "5:07 /km". */
export function sportFigures(w: Pick<Workout, 'minutes' | 'effort' | 'distanceKm'>): string[] {
  const out: string[] = [];
  const minutes = minutesText(w);
  if (minutes) out.push(minutes);
  if (isNum(w.effort)) out.push(`effort ${w.effort}`);
  const distance = distanceText(w);
  if (distance) {
    out.push(distance);
    const pace = paceText(w.distanceKm, w.minutes);
    if (pace) out.push(pace);
  }
  return out;
}

/** One line: "Match · 62 min · effort 7", "42 min · effort 6 · 8.2 km · 5:07 /km". Empty for a bare record. */
export function sportSummary(w: Pick<Workout, 'match' | 'minutes' | 'effort' | 'distanceKm'>): string {
  const tag = matchTag(w);
  return [...(tag ? [tag] : []), ...sportFigures(w)].join(' · ');
}

/** "Tue 10 Nov 2026 · 18:32 to 19:34". A session logged later shows its start only: it was not timed. */
export function sportWhenText(w: Pick<Workout, 'startedAt' | 'finishedAt' | 'loggedLater'>): string {
  const start = `${formatDateLong(w.startedAt)} · ${formatTime(w.startedAt)}`;
  if (w.loggedLater || !isNum(w.finishedAt) || w.finishedAt <= w.startedAt) return start;
  return `${start} to ${formatTime(w.finishedAt)}`;
}

/** "Court-Ready · Week 4", "Court-Ready", "Week 4" or "". */
export function sportPlanText(w: Pick<Workout, 'planName' | 'week'>): string {
  const parts: string[] = [];
  if (typeof w.planName === 'string' && w.planName.trim()) parts.push(w.planName.trim());
  if (isNum(w.week) && w.week > 0) parts.push(`Week ${w.week}`);
  return parts.join(' · ');
}

/** A figure on a session's page: `caption` is its unit. `danger` is for pain 4 or more. */
export interface SportStat {
  key: 'time' | 'distance' | 'pace' | 'effort' | 'pain';
  label: string;
  value: string;
  caption: string;
  danger?: boolean;
}

/** The figures of a session's page, only those it has: time, distance, pace, effort, pain. */
export function sportStats(w: Pick<Workout, 'minutes' | 'effort' | 'distanceKm' | 'pain'>): SportStat[] {
  const out: SportStat[] = [];
  if (isNum(w.minutes) && w.minutes > 0) {
    out.push({ key: 'time', label: 'Time', value: String(Math.round(w.minutes)), caption: 'min' });
  }
  if (isNum(w.distanceKm) && w.distanceKm > 0) {
    out.push({ key: 'distance', label: 'Distance', value: formatKg(w.distanceKm), caption: 'km' });
    const pace = paceText(w.distanceKm, w.minutes);
    if (pace) out.push({ key: 'pace', label: 'Pace', value: pace.replace(/ \/km$/, ''), caption: 'min per km' });
  }
  if (isNum(w.effort)) out.push({ key: 'effort', label: 'Effort', value: String(w.effort), caption: 'of 10' });
  if (isNum(w.pain)) {
    out.push({ key: 'pain', label: 'Pain', value: String(w.pain), caption: 'of 10', danger: w.pain >= 4 });
  }
  return out;
}

/** What a warm-up or cool-down mark says: "Done", "Skipped", or null when the record doesn't say. */
export function prepMark(done: boolean | undefined): 'Done' | 'Skipped' | null {
  if (done === true) return 'Done';
  if (done === false) return 'Skipped';
  return null;
}

/** What a session of a sport asks for, from the plan (section 7). */
export function sportLogsText(def: Pick<SportDef, 'logsDistance' | 'logsMatch'>): string {
  if (def.logsDistance) return 'Distance, time (pace worked out for you), effort 1–10, pain 0–10 if any, notes';
  if (def.logsMatch) return 'Time, effort 1–10, match or practice, pain 0–10 if any, notes';
  return 'Time, effort 1–10, pain 0–10 if any, notes';
}

/** "5 steps · 8 min". */
export function checklistMeta(c: Pick<Checklist, 'steps' | 'minutes'>): string {
  return `${plural(c.steps.length, 'step')} · ${c.minutes} min`;
}

/** "Warm-up" or "Cool-down". */
export function checklistKindLabel(c: Pick<Checklist, 'kind'>): string {
  return c.kind === 'warmup' ? 'Warm-up' : 'Cool-down';
}

/** Finished gym and sport sessions of the week starting on `mondayISO`. */
export function weekKindCounts(workouts: Workout[], mondayISO: string): { gym: number; sport: number } {
  let sport = 0;
  const week = workoutsInWeek(workouts, mondayISO);
  for (const w of week) if (recordKind(w) === 'sport') sport += 1;
  return { gym: week.length - sport, sport };
}
