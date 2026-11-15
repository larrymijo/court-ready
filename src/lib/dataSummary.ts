import { parseISODate } from '@/lib/dates';
import { formatDate, formatDateLong, plural } from '@/lib/format';
import { planPosition } from '@/lib/plans';
import type { BodyEntry, Plan, PlanState, Workout } from '@/lib/types';

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

/**
 * One more line for Settings → Your data, about sport: `of which 4 sport sessions`, counted among
 * the finished workouts of summaryLines; empty when there are none. Kept apart from summaryLines,
 * whose two lines must read the same before and after an update (sport records count as workouts
 * there, in this app and in the one before it).
 */
export function sportSummaryLine(data: { workouts: readonly Workout[] }): string {
  const count = data.workouts.filter((w) => w.finishedAt && w.kind === 'sport').length;
  return count === 0 ? '' : `of which ${plural(count, 'sport session')}`;
}

/**
 * One more line for Settings → Your data, about plans: `3 plans · Court-Ready, week 5`, or, before
 * the active plan's first week, `3 plans · Definition, starts Mon 16 Nov`. Kept apart from
 * summaryLines, whose two lines must read the same before and after an update.
 */
export function planSummaryLine(
  data: { plans: readonly Plan[]; activePlanId: string; planState: Readonly<Record<string, PlanState>> },
  todayISO: string,
): string {
  const count = plural(data.plans.length, 'plan');
  const plan = data.plans.find((p) => p.id === data.activePlanId);
  if (!plan) return count;
  const state = data.planState[plan.id];
  if (!state || typeof state.start !== 'string') return `${count} · ${plan.name}, not started`;
  const pos = planPosition(plan, state, todayISO);
  if (!pos.started) return `${count} · ${plan.name}, starts ${formatDate(parseISODate(state.start).getTime())}`;
  return `${count} · ${plan.name}, week ${pos.week}`;
}
