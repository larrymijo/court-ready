// A finished sport session as saved data (data version 4): the rules for what may be saved, and
// the builder of the record. Pure: ids and times are passed in.
//
// A sport record is an ordinary Workout with `kind: 'sport'` and `exercises: []`, so every number
// worked out from sets (volume, sets per muscle, bests, records, the data summary's sets) stays the
// same with or without sport sessions in history, and an older app can still read the record.
import { sportDef } from '@/data/sports';
import type { PhaseId, SportDef, SportId, Workout } from '@/lib/types';

/** The longest session that can be saved, in minutes (10 hours). */
export const SPORT_MINUTES_MAX = 600;

const MINUTE_MS = 60_000;

/** Whole minutes from one time to another (ms since 1970), rounded; 0 when the times make no sense. */
export function minutesBetween(startMs: number, endMs: number): number {
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) return 0;
  return Math.round((endMs - startMs) / MINUTE_MS);
}

/** Minutes per km, or null unless both the distance and the minutes are above 0. */
export function paceMinPerKm(distanceKm: number | null | undefined, minutes: number | null | undefined): number | null {
  if (typeof distanceKm !== 'number' || typeof minutes !== 'number') return null;
  if (!Number.isFinite(distanceKm) || !Number.isFinite(minutes) || distanceKm <= 0 || minutes <= 0) return null;
  return minutes / distanceKm;
}

/** The pace as text, "5:30 /km" (minutes and seconds per km); null when paceMinPerKm gives none. */
export function paceText(distanceKm: number | null | undefined, minutes: number | null | undefined): string | null {
  const pace = paceMinPerKm(distanceKm, minutes);
  if (pace === null) return null;
  const totalSec = Math.round(pace * 60);
  return `${Math.floor(totalSec / 60)}:${String(totalSec % 60).padStart(2, '0')} /km`;
}

/** What the log sheet asks for. */
export interface SportEntry {
  minutes?: number;
  effort?: number;
  match?: boolean;
  pain?: number | null;
  distanceKm?: number;
  note?: string;
}

export type SportField = 'minutes' | 'effort' | 'pain' | 'distanceKm' | 'match';

const isWhole = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n);

/**
 * The fields that stop an entry from being saved; empty when it may be saved. Minutes: a whole
 * number from 1 to 600. Effort, if given: a whole number from 1 to 10. Pain: 0 to 10, or null.
 * Distance: above 0, and only for a sport that logs it. Match: only for a sport that logs it.
 */
export function sportEntryErrors(entry: SportEntry, def: SportDef): SportField[] {
  const errors: SportField[] = [];
  const { minutes, effort, pain, distanceKm, match } = entry;
  if (!isWhole(minutes) || minutes < 1 || minutes > SPORT_MINUTES_MAX) errors.push('minutes');
  if (effort !== undefined && (!isWhole(effort) || effort < 1 || effort > 10)) errors.push('effort');
  if (
    pain !== undefined &&
    pain !== null &&
    (typeof pain !== 'number' || !Number.isFinite(pain) || pain < 0 || pain > 10)
  ) {
    errors.push('pain');
  }
  if (
    distanceKm !== undefined &&
    (!def.logsDistance || typeof distanceKm !== 'number' || !Number.isFinite(distanceKm) || distanceKm <= 0)
  ) {
    errors.push('distanceKm');
  }
  if (match !== undefined && (!def.logsMatch || typeof match !== 'boolean')) errors.push('match');
  return errors;
}

/** The plan a session belongs to, with the week and phase it was in (as gym workouts get them). */
export interface SportPlanLink {
  planId: string;
  planName: string;
  sessionId?: string;
  week?: number;
  phase?: PhaseId;
}

export interface SportRecordInput extends SportEntry {
  id: string;
  sport: SportId;
  /** Without one (or an empty one), the sport's name. */
  name?: string;
  startedAt: number;
  finishedAt: number;
  warmupDone?: boolean;
  cooldownDone?: boolean;
  loggedLater?: boolean;
  plan?: SportPlanLink;
}

/**
 * The finished sport record, or null when it may not be saved: an unknown sport, times that are
 * not numbers (or end before they start), or an entry that breaks the rules of sportEntryErrors.
 * Optional fields that weren't given are left out, and a blank note is not kept.
 */
export function buildSportRecord(input: SportRecordInput): Workout | null {
  const def = sportDef(input.sport);
  if (!def) return null;
  if (!Number.isFinite(input.startedAt) || !Number.isFinite(input.finishedAt) || input.finishedAt < input.startedAt) {
    return null;
  }
  if (sportEntryErrors(input, def).length > 0) return null;

  const name = typeof input.name === 'string' && input.name.trim() ? input.name.trim() : def.name;
  const plan = input.plan;
  const record: Workout = {
    id: input.id,
    name,
    kind: 'sport',
    sport: def.id,
    ...(plan ? { planId: plan.planId, planName: plan.planName } : {}),
    ...(plan?.sessionId !== undefined ? { sessionId: plan.sessionId } : {}),
    startedAt: input.startedAt,
    finishedAt: input.finishedAt,
    ...(plan?.week !== undefined ? { week: plan.week } : {}),
    ...(plan?.phase !== undefined ? { phase: plan.phase } : {}),
    exercises: [],
    prs: [],
    minutes: input.minutes,
  };
  if (input.effort !== undefined) record.effort = input.effort;
  if (input.match !== undefined) record.match = input.match;
  if (typeof input.pain === 'number') record.pain = input.pain;
  if (input.distanceKm !== undefined) record.distanceKm = input.distanceKm;
  const note = typeof input.note === 'string' ? input.note.trim() : '';
  if (note) record.note = note;
  if (input.warmupDone !== undefined) record.warmupDone = input.warmupDone;
  if (input.cooldownDone !== undefined) record.cooldownDone = input.cooldownDone;
  if (input.loggedLater) record.loggedLater = true;
  return record;
}

/**
 * History with one more record, kept newest first by `startedAt`. The record goes before any
 * record that started at the same time, so for a record newer than all others this is a prepend.
 */
export function insertNewestFirst(workouts: readonly Workout[], record: Workout): Workout[] {
  const at = workouts.findIndex((w) => w.startedAt <= record.startedAt);
  if (at === -1) return [...workouts, record];
  return [...workouts.slice(0, at), record, ...workouts.slice(at)];
}
