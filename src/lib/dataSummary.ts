import { formatDateLong, plural } from '@/lib/format';
import { workoutSetCount } from '@/lib/stats';
import type { BodyEntry, Workout } from '@/lib/types';

export interface DataSummary {
  /** Finished workouts. */
  workouts: number;
  /** Done working sets across them, counted the way the history screens count them. */
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
    sets += workoutSetCount(w);
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
