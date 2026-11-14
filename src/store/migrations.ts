/**
 * Saved data (the store on the phone, and backup files) carries a version number. When the shape
 * of that data changes: raise DATA_VERSION and add a step that upgrades the previous version.
 * Steps run in order, so data from any older version ends up current.
 *
 * Rules for a step: keep everything it doesn't understand, cope with both the saved store and a
 * backup file (a backup has no workout in progress), and be safe to run twice. A step must never
 * throw, whatever the data looks like: what it can't read, it leaves alone.
 *
 * A step that copies template data in (the example plans) gets today's templates, not the ones
 * from when the step was written. Later steps run over its output, so they must tolerate templates
 * that already have a newer shape.
 */
import { examplePlans } from '@/data/plan-templates';

export const DATA_VERSION = 3;

/** Data as it comes out of storage or a backup file: nothing about its shape is trusted. */
export type SavedData = Record<string, unknown>;

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function asObject(value: unknown): Record<string, unknown> {
  return isObject(value) ? value : {};
}

/** Version 3: a workout started from a Court-Ready routine links to that workout of the Court-Ready plan. */
function linkToCourtReady(workout: unknown): unknown {
  if (!isObject(workout)) return workout;
  if (typeof workout.routineId !== 'string' || workout.planId !== undefined) return workout;
  return { ...workout, planId: 'court-ready', planName: 'Court-Ready', sessionId: workout.routineId };
}

/** STEPS[n] upgrades data saved at version n to version n + 1. */
const STEPS: Record<number, (data: SavedData) => SavedData> = {
  // Version 2: settings remember when the last backup was exported.
  1: (data) => {
    const settings = asObject(data.settings);
    return { ...data, settings: { ...settings, lastExportAt: settings.lastExportAt ?? null } };
  },

  // Version 3: plans are saved data. The three examples are saved, Court-Ready is the active plan
  // and keeps the 12-week start date, and workouts from its routines link to it. settings.programStart
  // and routineId stay for one more release, so a rolled-back app still finds them.
  2: (data) => {
    const out: SavedData = { ...data };
    if (!Array.isArray(data.plans)) out.plans = examplePlans();
    if (typeof data.activePlanId !== 'string') out.activePlanId = 'court-ready';
    if (!isObject(data.planState)) {
      const programStart = asObject(data.settings).programStart;
      out.planState = typeof programStart === 'string' ? { 'court-ready': { start: programStart } } : {};
    }
    if (Array.isArray(data.workouts)) out.workouts = data.workouts.map(linkToCourtReady);
    // A backup file has no workout in progress: don't add the key.
    if ('active' in data) out.active = linkToCourtReady(data.active);
    return out;
  },
};

/** True when the data was saved by a newer version of the app than this one. */
export function isNewerData(version: number): boolean {
  return version > DATA_VERSION;
}

/**
 * Upgrades saved data to DATA_VERSION. Data from a newer app is returned untouched: it can't be
 * downgraded, and dropping it would lose workouts.
 */
export function migrate(data: unknown, fromVersion: number): SavedData {
  let out: SavedData = asObject(data);
  const start = Number.isInteger(fromVersion) && fromVersion >= 1 ? fromVersion : 1;
  for (let version = start; version < DATA_VERSION; version++) {
    const step = STEPS[version];
    if (step) out = step(out);
  }
  return out;
}
