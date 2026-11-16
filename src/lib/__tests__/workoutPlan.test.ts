import { describe, expect, it } from '@jest/globals';

import { examplePlans } from '@/data/plan-templates';
import { PHASES } from '@/lib/program';
import { cooldownOf, groupHeaderFor, planItemOf, planOfWorkout, planWorkoutOf, warmupKindOf, workoutPhaseText } from '@/lib/workoutPlan';
import type { PhaseId, Workout, WorkoutExercise } from '@/lib/types';

const plans = examplePlans();
const [COURT_READY, MUSCLE_MASS, DEFINITION] = plans;
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

describe('planOfWorkout', () => {
  it('finds the saved plan, active or not', () => {
    expect(planOfWorkout(plans, { planId: 'court-ready' })).toBe(COURT_READY);
    expect(planOfWorkout(plans, { planId: 'muscle-mass' })).toBe(MUSCLE_MASS);
  });

  it('falls back to the example of the same id once the plan is deleted, and else finds nothing', () => {
    expect(planOfWorkout([MUSCLE_MASS], { planId: 'court-ready' })).toEqual(COURT_READY);
    expect(planOfWorkout([MUSCLE_MASS], { planId: 'definition' })).toEqual(DEFINITION);
    expect(planOfWorkout(plans, { planId: 'mine' })).toBeUndefined();
    expect(planOfWorkout(plans, {})).toBeUndefined();
  });
});

describe('workoutPhaseText', () => {
  const PHASE_IDS: PhaseId[] = ['learn', 'build', 'deload', 'push'];
  /** What the workout screen and History showed before this check. */
  const oldTag = (week: number, phase?: PhaseId) => `Week ${week}${phase ? ` · ${PHASES[phase].name}` : ''}`;

  it('reads exactly as before for a Court-Ready workout, saved or deleted, and for an empty one', () => {
    for (const phase of PHASE_IDS) {
      for (const list of [plans, [MUSCLE_MASS, DEFINITION]]) {
        expect(workoutPhaseText(list, { planId: 'court-ready', week: 7, phase })).toEqual({
          tag: oldTag(7, phase),
          rule: PHASES[phase].rule,
        });
        // An empty workout has no plan: the phase it saved shows (startEmpty saves one only for a plan with a rhythm).
        expect(workoutPhaseText(list, { week: 7, phase })).toEqual({ tag: oldTag(7, phase), rule: PHASES[phase].rule });
      }
    }
    expect(workoutPhaseText(plans, { week: 3 })).toEqual({ tag: 'Week 3', rule: null });
  });

  it('shows the phase of a plan with a lighter week', () => {
    expect(workoutPhaseText(plans, { planId: 'muscle-mass', week: 6, phase: 'deload' })).toEqual({
      tag: `Week 6 · ${PHASES.deload.name}`,
      rule: PHASES.deload.rule,
    });
    expect(workoutPhaseText(plans, { planId: 'muscle-mass', week: 2, phase: 'build' }).tag).toBe(`Week 2 · ${PHASES.build.name}`);
  });

  it('shows only the week for a plan without a cycle or a lighter week, saved or deleted', () => {
    expect(workoutPhaseText(plans, { planId: 'definition', week: 3, phase: 'build' })).toEqual({ tag: 'Week 3', rule: null });
    expect(workoutPhaseText([COURT_READY], { planId: 'definition', week: 3, phase: 'build' })).toEqual({ tag: 'Week 3', rule: null });
    const flat = { ...MUSCLE_MASS, id: 'flat', lighterWeekEvery: undefined };
    expect(workoutPhaseText([flat], { planId: 'flat', week: 2, phase: 'build' })).toEqual({ tag: 'Week 2', rule: null });
  });

  it('shows the saved phase of a deleted plan that is not an example, and nothing without a week or phase', () => {
    expect(workoutPhaseText(plans, { planId: 'mine', week: 2, phase: 'push' })).toEqual({ tag: oldTag(2, 'push'), rule: PHASES.push.rule });
    expect(workoutPhaseText(plans, { planId: 'court-ready' })).toEqual({ tag: null, rule: null });
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

describe('cooldownOf', () => {
  it('follows the warm-up kind', () => {
    expect(cooldownOf({ ...UPPER_A, warmup: 'upper', cooldown: undefined })?.id).toBe('cool-upper');
    expect(cooldownOf({ ...UPPER_A, warmup: 'lower', cooldown: undefined })?.id).toBe('cool-lower');
  });

  it('gives each example workout a cool-down', () => {
    for (const plan of plans) {
      for (const w of plan.workouts) {
        const c = cooldownOf(w);
        expect(c?.kind).toBe('cooldown');
        expect(c?.id).toBe(w.cooldown ?? `cool-${w.warmup}`);
      }
    }
  });

  it("prefers the workout's own cool-down", () => {
    expect(cooldownOf({ ...UPPER_A, warmup: 'upper', cooldown: 'cool-lower' })?.id).toBe('cool-lower');
    expect(cooldownOf({ ...UPPER_A, warmup: 'none', cooldown: 'after-playing' })?.id).toBe('after-playing');
  });

  it('falls back to the warm-up kind for a cool-down id this app does not know, or one that is a warm-up', () => {
    expect(cooldownOf({ ...UPPER_A, warmup: 'lower', cooldown: 'nope' })?.id).toBe('cool-lower');
    expect(cooldownOf({ ...UPPER_A, warmup: 'upper', cooldown: 'upper' })?.id).toBe('cool-upper');
  });

  it('gives none for a workout without a warm-up kind, or without a workout', () => {
    expect(cooldownOf({ ...UPPER_A, warmup: 'none', cooldown: undefined })).toBeUndefined();
    expect(cooldownOf(undefined)).toBeUndefined();
  });
});
