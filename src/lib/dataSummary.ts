import { formatDateLong, plural } from '@/lib/format';
import { workoutSetCount } from '@/lib/stats';
import type { BodyEntry, Workout } from '@/lib/types';

type SavedSet = Workout['exercises'][number]['sets'][number];

/**
 * What the summary counts as a set: ticked, a normal set (not a warm-up), with reps. This is the
 * rule the history cards use today, written out here on purpose. The owner compares this number
 * before and after app updates, so it must not move when the stats code changes: don't swap it for
 * a helper from stats.ts.
 */
function countsAsSet(s: SavedSet): boolean {
  return s.done && s.type === 'normal' && s.reps != null && s.reps > 0;
}

export interface DataSummary {
  /** Finished workouts. */
  workouts: number;
  /** Ticked normal sets with reps across them; warm-ups don't count. The rule is fixed in countsAsSet. */
  sets: number;
  /** Body entries that have a weight (an entry can hold only a waist). */
  weighIns: number;
  /** Start time of the most recent finished workout; null if there is none. */
  lastWorkoutAt: number | null;
}

/** Numbers to compare before and after an update, a backup import or a move. Depends only on saved data. */
export function summarizeData(workouts: readonly Workout[], body: readonly BodyEntry[]): DataSummary {
  let count = 0;
  let sets = 0;
  let last: number | null = null;
  for (const w of workouts) {
    if (!w.finishedAt) continue;
    count += 1;
    sets += w.exercises.reduce((n, ex) => n + ex.sets.filter(countsAsSet).length, 0);
    if (last == null || w.startedAt > last) last = w.startedAt;
  }
  return {
    workouts: count,
    sets,
    weighIns: body.filter((b) => b.weight != null).length,
    lastWorkoutAt: last,
  };
}

/** The lines shown in Settings → Your data: `142 workouts · 2,318 sets · 37 weigh-ins`, `Last workout: 9 Nov 2026`. */
export function summaryLines(s: DataSummary): string[] {
  if (s.workouts === 0) {
    return [s.weighIns > 0 ? `No workouts yet · ${plural(s.weighIns, 'weigh-in')}` : 'No workouts yet'];
  }
  const lines = [
    `${plural(s.workouts, 'workout')} · ${plural(s.sets, 'set').replace(/^\d+/, (n) => Number(n).toLocaleString('en-US'))} · ${plural(s.weighIns, 'weigh-in')}`,
  ];
  if (s.lastWorkoutAt != null) lines.push(`Last workout: ${formatDateLong(s.lastWorkoutAt).replace(/^\w{3} /, '')}`);
  return lines;
}
