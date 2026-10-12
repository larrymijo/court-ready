import { describe, expect, it } from '@jest/globals';
import { getExercise } from '@/data/exercises';
import { lastPerformance, rampUpSets, suggestNext } from '@/lib/progression';
import type { Workout } from '@/lib/types';

function workout(id: string, startedAt: number, exerciseId: string, sets: [number | null, number][]): Workout {
  return {
    id,
    name: 'Upper A',
    startedAt,
    finishedAt: startedAt + 3600_000,
    exercises: [
      {
        id: `${id}-e`,
        exerciseId,
        restSec: 120,
        pain: null,
        note: '',
        sets: sets.map(([weight, reps], i) => ({ id: `${id}-${i}`, type: 'normal', weight, reps, rir: null, done: true })),
      },
    ],
  };
}

const target = { sets: 3, repsMin: 6, repsMax: 10, rir: '1–2' };

describe('lastPerformance', () => {
  it('returns the most recent finished session for the exercise', () => {
    const ws = [
      workout('a', 1000, 'incline', [[20, 10]]),
      workout('b', 5000, 'incline', [[22, 9], [22, 8]]),
      workout('c', 9000, 'curl', [[10, 12]]),
    ];
    expect(lastPerformance('incline', ws)).toMatchObject({ workoutId: 'b', sets: [{ weight: 22, reps: 9 }, { weight: 22, reps: 8 }] });
  });

  it('ignores warm-up and unfinished sets', () => {
    const w = workout('a', 1000, 'incline', [[22, 9]]);
    w.exercises[0].sets.push({ id: 'w', type: 'warmup', weight: 12, reps: 10, rir: null, done: true });
    w.exercises[0].sets.push({ id: 'x', type: 'normal', weight: 22, reps: null, rir: null, done: false });
    expect(lastPerformance('incline', [w])?.sets).toHaveLength(1);
  });

  it('returns null when the exercise was never done', () => {
    expect(lastPerformance('incline', [])).toBeNull();
  });
});

describe('suggestNext (double progression)', () => {
  const incline = getExercise('incline');

  it('goes up one step when every set hit the top of the range', () => {
    const last = lastPerformance('incline', [workout('a', 1, 'incline', [[22, 10], [22, 10], [22, 10]])]);
    expect(suggestNext(incline, target, last)).toMatchObject({ kind: 'increase', weight: 24 });
  });

  it('repeats the weight when any set fell short', () => {
    const last = lastPerformance('incline', [workout('a', 1, 'incline', [[22, 10], [22, 10], [22, 9]])]);
    const s = suggestNext(incline, target, last);
    expect(s).toMatchObject({ kind: 'repeat', weight: 22 });
    expect(s.message).toContain('22 kg × 10 · 10 · 9');
  });

  it('uses cable steps of 2.5 kg', () => {
    const fly = getExercise('cablefly');
    const last = lastPerformance('cablefly', [workout('a', 1, 'cablefly', [[15, 15], [15, 15]])]);
    expect(suggestNext(fly, { sets: 2, repsMin: 10, repsMax: 15, rir: '1' }, last).weight).toBe(17.5);
  });

  it('asks for a starting weight the first time', () => {
    expect(suggestNext(incline, target, null)).toMatchObject({ kind: 'start', weight: null });
  });

  it('tracks reps only for push-ups', () => {
    const pushup = getExercise('pushup');
    const last = lastPerformance('pushup', [workout('a', 1, 'pushup', [[null, 14], [null, 12]])]);
    expect(
      suggestNext(pushup, { sets: 2, repsMin: 8, repsMax: 25, repsLabel: 'stop 2 reps before failure', rir: '2' }, last),
    ).toMatchObject({ kind: 'repeat', weight: null });
  });
});

describe('rampUpSets', () => {
  it('matches the guide example for 22 kg dumbbells', () => {
    expect(rampUpSets(22, 2)).toEqual([
      { weight: 12, reps: 10 },
      { weight: 16, reps: 5 },
      { weight: 18, reps: 2 },
    ]);
  });

  it('is empty without a working weight', () => {
    expect(rampUpSets(0, 2)).toEqual([]);
  });
});
