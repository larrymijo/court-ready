import { describe, expect, it } from '@jest/globals';

import { examplePlans } from '@/data/plan-templates';
import { groupHeaderFor, planItemOf, planWorkoutOf, warmupKindOf } from '@/lib/workoutPlan';
import type { Workout, WorkoutExercise } from '@/lib/types';

const plans = examplePlans();
const [COURT_READY, MUSCLE_MASS] = plans;
const UPPER_A = COURT_READY.workouts[0];

function started(planId: string | undefined, sessionId: string | undefined): Pick<Workout, 'planId' | 'sessionId'> {
  return { planId, sessionId };
}

describe('planWorkoutOf', () => {
  it('finds the workout in its own plan, active or not', () => {
    expect(planWorkoutOf(plans, started('court-ready', 'uppera'))).toBe(UPPER_A);
    expect(planWorkoutOf(plans, started('muscle-mass', 'mm-push'))).toBe(MUSCLE_MASS.workouts[0]);
  });

  it('does not take a workout of another plan with the same id', () => {
    expect(planWorkoutOf(plans, started('muscle-mass', 'uppera'))).toBeUndefined();
  });

  it('returns nothing when the plan or the workout was deleted, or the workout has no plan', () => {
    expect(planWorkoutOf(plans.slice(1), started('court-ready', 'uppera'))).toBeUndefined();
    expect(planWorkoutOf([{ ...COURT_READY, workouts: [] }], started('court-ready', 'uppera'))).toBeUndefined();
    expect(planWorkoutOf(plans, started(undefined, undefined))).toBeUndefined();
    expect(planWorkoutOf(plans, started('court-ready', undefined))).toBeUndefined();
  });
});

describe('planItemOf', () => {
  const item = UPPER_A.items[0];
  const we = (patch: Partial<WorkoutExercise>) => ({ itemKey: item.key, exerciseId: item.exerciseId, ...patch });

  it('finds the item by its key and exercise', () => {
    expect(planItemOf(UPPER_A, we({}))).toBe(item);
  });

  it('finds nothing for a swapped exercise, an added one, or without a workout', () => {
    expect(planItemOf(UPPER_A, we({ exerciseId: 'no-such-exercise' }))).toBeUndefined();
    expect(planItemOf(UPPER_A, we({ itemKey: undefined }))).toBeUndefined();
    expect(planItemOf(undefined, we({}))).toBeUndefined();
  });
});

describe('warmupKindOf', () => {
  it('gives the checklist of a workout, and null when it has none the app knows', () => {
    expect(warmupKindOf(UPPER_A)).toBe('upper');
    expect(warmupKindOf(COURT_READY.workouts[1])).toBe('lower');
    expect(warmupKindOf({ ...UPPER_A, warmup: 'unknown' })).toBeNull();
    expect(warmupKindOf(undefined)).toBeNull();
  });
});

describe('groupHeaderFor', () => {
  const grouped = COURT_READY.workouts.find((w) => Object.keys(w.groups).length > 0)!;
  const group = Object.keys(grouped.groups)[0];

  it('gives the group note once, above the first exercise of the group', () => {
    const rows = [{ group: undefined }, { group }, { group }, { group: undefined }];
    expect(groupHeaderFor(grouped, rows, 0)).toBeNull();
    expect(groupHeaderFor(grouped, rows, 1)).toBe(grouped.groups[group]);
    expect(groupHeaderFor(grouped, rows, 2)).toBeNull();
    expect(groupHeaderFor(grouped, rows, 3)).toBeNull();
  });

  it('gives nothing without the plan workout', () => {
    expect(groupHeaderFor(undefined, [{ group }], 0)).toBeNull();
  });
});
