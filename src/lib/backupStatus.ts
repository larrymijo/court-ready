import { daysBetween, isoFromTimestamp } from '@/lib/dates';
import type { Workout } from '@/lib/types';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Training that has gone this long without being in a backup triggers the reminder. */
export const BACKUP_REMINDER_DAYS = 14;

export interface BackupStatus {
  /** Finished workouts that no backup holds yet. */
  unsaved: number;
  /** Whether to nudge for a backup: the oldest unsaved workout is two weeks old or more. */
  remind: boolean;
}

/**
 * How exposed the training log is. Everything lives on the phone only, so workouts finished after
 * the last export are lost if the app's data is cleared.
 */
export function backupStatus(
  workouts: readonly Pick<Workout, 'startedAt' | 'finishedAt'>[],
  lastExportAt: number | null,
  now: number,
): BackupStatus {
  const since = lastExportAt ?? 0;
  const unsaved = workouts.map((w) => w.finishedAt ?? w.startedAt).filter((t) => t > since);
  if (unsaved.length === 0) return { unsaved: 0, remind: false };
  const oldest = Math.min(...unsaved);
  return { unsaved: unsaved.length, remind: now - oldest >= BACKUP_REMINDER_DAYS * DAY_MS };
}

/** Calendar distance in words: "today", "yesterday", "12 days ago". */
export function daysAgoText(then: number, now: number): string {
  const days = daysBetween(isoFromTimestamp(then), isoFromTimestamp(now));
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}
