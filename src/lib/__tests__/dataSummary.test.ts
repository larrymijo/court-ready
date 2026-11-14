import { describe, expect, it } from '@jest/globals';

import { examplePlans } from '@/data/plan-templates';
import { planSummaryLine, summarizeData, summaryLines } from '@/lib/dataSummary';
import type { BodyEntry, Workout, WorkoutSet } from '@/lib/types';
import { migrate } from '@/store/migrations';

const set = (over: Partial<WorkoutSet> = {}): WorkoutSet => ({
  id: 's',
  type: 'normal',
  weight: 20,
  reps: 10,
  rir: null,
  done: true,
  ...over,
});

const workout = (id: string, startedAt: number, sets: WorkoutSet[], finished = true): Workout => ({
  id,
  name: id,
  startedAt,
  finishedAt: finished ? startedAt + 3_600_000 : undefined,
  exercises: [{ id: `${id}-e`, exerciseId: 'bench', restSec: 90, pain: null, note: '', sets }],
});

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day, 12).getTime();

const workouts = [
  workout('a', d(2026, 11, 2), [set(), set(), set({ done: false })]),
  workout('b', d(2026, 11, 9), [set(), set({ type: 'warmup' }), set({ reps: null })]),
  workout('c', d(2026, 10, 1), [set()]),
  workout('open', d(2026, 11, 10), [set(), set()], false),
];
const body: BodyEntry[] = [{ date: '2026-11-01', weight: 80 }, { date: '2026-11-02', waist: 90 }, { date: '2026-11-03', weight: 79.5 }];

describe('summarizeData', () => {
  it('counts finished workouts, done working sets, weigh-ins and the last workout', () => {
    expect(summarizeData(workouts, body)).toEqual({
      workouts: 3,
      sets: 4,
      weighIns: 2,
      lastWorkoutAt: d(2026, 11, 9),
    });
  });

  it('does not depend on the order of the workouts', () => {
    const a = summarizeData(workouts, body);
    expect(summarizeData([...workouts].reverse(), body)).toEqual(a);
    expect(summarizeData([workouts[2], workouts[0], workouts[3], workouts[1]], body)).toEqual(a);
  });

  it('is empty without data', () => {
    expect(summarizeData([], [])).toEqual({ workouts: 0, sets: 0, weighIns: 0, lastWorkoutAt: null });
  });

  it('ignores a workout still in progress for the last date', () => {
    expect(summarizeData([workouts[3]], []).lastWorkoutAt).toBeNull();
  });
});

describe('summaryLines', () => {
  it('reads sensibly with no data', () => {
    expect(summaryLines(summarizeData([], []))).toEqual(['No workouts yet']);
  });

  it('shows weigh-ins even without workouts', () => {
    expect(summaryLines(summarizeData([], body))).toEqual(['No workouts yet · 2 weigh-ins']);
  });

  it('shows the counts and the last date', () => {
    expect(summaryLines(summarizeData(workouts, body))).toEqual([
      '3 workouts · 4 sets · 2 weigh-ins',
      'Last workout: 9 Nov 2026',
    ]);
  });

  it('uses thousands separators and singular forms', () => {
    expect(
      summaryLines({ workouts: 142, sets: 2318, weighIns: 1, lastWorkoutAt: d(2026, 11, 9) }),
    ).toEqual(['142 workouts · 2,318 sets · 1 weigh-in', 'Last workout: 9 Nov 2026']);
  });
});

describe('the summary across the upgrade to plans', () => {
  it('reads the same for the same workouts and weigh-ins before and after', () => {
    const before = workouts.map((w, i) => (i % 2 === 0 ? { ...w, routineId: 'uppera' as const } : w));
    const after = migrate({ settings: { programStart: '2026-10-12' }, workouts: before, body }, 2);
    const linked = after.workouts as Workout[];
    expect(linked.filter((w) => w.planId === 'court-ready')).toHaveLength(2);
    expect(summarizeData(linked, after.body as BodyEntry[])).toEqual(summarizeData(before, body));
    expect(summaryLines(summarizeData(linked, after.body as BodyEntry[]))).toEqual([
      '3 workouts · 4 sets · 2 weigh-ins',
      'Last workout: 9 Nov 2026',
    ]);
  });
});

describe('planSummaryLine', () => {
  const plans = examplePlans();
  const TODAY = '2026-11-14';

  it('names the active plan and its week', () => {
    expect(planSummaryLine({ plans, activePlanId: 'court-ready', planState: { 'court-ready': { start: '2026-10-12' } } }, TODAY)).toBe(
      '3 plans · Court-Ready, week 5',
    );
    // Court-Ready repeats from week 3 after week 12.
    expect(planSummaryLine({ plans, activePlanId: 'court-ready', planState: { 'court-ready': { start: '2026-08-17' } } }, TODAY)).toBe(
      '3 plans · Court-Ready, week 3',
    );
  });

  it('says when a plan that has not started starts', () => {
    expect(
      planSummaryLine({ plans, activePlanId: 'definition', planState: { definition: { start: '2026-11-16' } } }, TODAY),
    ).toBe('3 plans · Definition, starts Mon 16 Nov');
  });

  it('uses the singular, and copes with missing state or plan', () => {
    expect(planSummaryLine({ plans: [plans[2]], activePlanId: 'definition', planState: { definition: { start: '2026-11-09' } } }, TODAY)).toBe(
      '1 plan · Definition, week 1',
    );
    expect(planSummaryLine({ plans, activePlanId: 'muscle-mass', planState: {} }, TODAY)).toBe(
      '3 plans · Muscle Mass Building, not started',
    );
    expect(planSummaryLine({ plans, activePlanId: 'gone', planState: {} }, TODAY)).toBe('3 plans');
  });
});
