/**
 * Saved data (the store on the phone, and backup files) carries a version number. When the shape
 * of that data changes: raise DATA_VERSION and add a step that upgrades the previous version.
 * Steps run in order, so data from any older version ends up current.
 *
 * Rules for a step: keep everything it doesn't understand, cope with both the saved store and a
 * backup file (a backup has no workout in progress), and be safe to run twice.
 */
export const DATA_VERSION = 2;

/** Data as it comes out of storage or a backup file: nothing about its shape is trusted. */
export type SavedData = Record<string, unknown>;

function asObject(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

/** STEPS[n] upgrades data saved at version n to version n + 1. */
const STEPS: Record<number, (data: SavedData) => SavedData> = {
  // Version 2: settings remember when the last backup was exported.
  1: (data) => {
    const settings = asObject(data.settings);
    return { ...data, settings: { ...settings, lastExportAt: settings.lastExportAt ?? null } };
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
