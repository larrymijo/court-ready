// The pure parts of the sport session screen: the clock, the step labels and the header texts.
// The clock is never counted: the elapsed time is always worked out from the two timestamps the
// store saved, so a locked phone or a reloaded web app shows the right time.
import { isISODate, parseISODate } from '@/lib/dates';
import type { ActiveSport, SportDef } from '@/lib/types';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Milliseconds played: from `playStartedAt` to `now`; 0 before the start, without one or for times that make no sense. */
export function playElapsedMs(playStartedAt: number | undefined, now: number): number {
  if (typeof playStartedAt !== 'number' || !Number.isFinite(playStartedAt) || !Number.isFinite(now)) return 0;
  return Math.max(0, now - playStartedAt);
}

/** The four steps of a session, in order. */
const STAGES: ActiveSport['stage'][] = ['warmup', 'playing', 'log', 'cooldown'];

/** 0 to 3: where a stage sits in the session's four steps. */
export function sportStageIndex(stage: ActiveSport['stage']): number {
  return STAGES.indexOf(stage);
}

/** The labels over the step bar: "RUN" instead of "PLAY" for a sport that logs distance. */
export function sportStepLabels(def: Pick<SportDef, 'logsDistance'> | undefined): string[] {
  return ['WARM-UP', def?.logsDistance ? 'RUN' : 'PLAY', 'LOG', 'COOL-DOWN'];
}

/** Local time of day as "08:15" (24 hours, two digits each). */
export function clockHHMM(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** "Tuesday 10 Nov". */
export function sportDayLabel(ts: number): string {
  const d = new Date(ts);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** The line under the session's name: "Court-Ready · Tuesday 10 Nov", or just the day without a plan. */
export function sportSubtitle(planName: string | undefined, ts: number): string {
  const day = sportDayLabel(ts);
  return planName ? `${planName} · ${day}` : day;
}

/** "From the clock · 18:32 to 19:34", or null before the session has both times. */
export function clockRangeText(startedAt: number | undefined, endedAt: number | undefined): string | null {
  if (typeof startedAt !== 'number' || typeof endedAt !== 'number') return null;
  return `From the clock · ${clockHHMM(startedAt)} to ${clockHHMM(endedAt)}`;
}

/** A date (YYYY-MM-DD) and a start time (HH:MM) as ms since 1970 in local time; null when either is not a real one. */
export function startTimeMs(dateISO: string, time: string): number | null {
  if (!isISODate(dateISO)) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!m) return null;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  if (hours > 23 || minutes > 59) return null;
  const d = parseISODate(dateISO);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes).getTime();
}
