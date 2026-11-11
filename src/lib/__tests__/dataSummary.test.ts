import { describe, expect, it } from '@jest/globals';

import { summarizeData, summaryLines } from '@/lib/dataSummary';
import type { BodyEntry, Workout, WorkoutSet } from '@/lib/types';

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
