// What a workout's plan says about it: the warm-up, the cues and the superset notes. A workout
// finds its plan details again by its saved planId, sessionId and each exercise's itemKey, so it
// works whether or not that plan is the active one. If the plan or the workout has been deleted,
// the warm-up, cue and superset helpers return nothing and the workout shows only what it saved
// itself (its name and sets); planOfWorkout falls back to the example of the same id, if any.
import { checklist } from '@/data/checklists';
import { examplePlan } from '@/data/plan-templates';
import { planFacts } from '@/lib/planView';
import { PHASES } from '@/lib/program';
import type { Checklist, GymWorkout, Plan, RoutineItem, Workout, WorkoutExercise } from '@/lib/types';

/**
 * The plan a workout was started from: the saved plan with its planId; if that plan was deleted,
 * the example with the same id (so a Court-Ready workout keeps reading as one); otherwise
 * undefined (an empty workout, or a deleted plan that is not an example).
 */
export function planOfWorkout(plans: readonly Plan[], workout: Pick<Workout, 'planId'>): Plan | undefined {
  if (!workout.planId) return undefined;
  return plans.find((p) => p.id === workout.planId) ?? examplePlan(workout.planId);
}

export interface WorkoutPhaseText {
  /** "Week 4 · Build", "Week 4" without a phase; null without a week. */
  tag: string | null;
  /** What the phase asks of the sets; null when no phase shows. */
  rule: string | null;
}

/**
 * The week tag and phase rule of a workout. The phase shows only when the workout's plan has a
 * cycle or a lighter week, as positionText does for the plan. A workout without a plan (an empty
 * one), or whose plan can't be found at all, shows the phase it saved.
 */
export function workoutPhaseText(plans: readonly Plan[], workout: Pick<Workout, 'planId' | 'week' | 'phase'>): WorkoutPhaseText {
  const plan = planOfWorkout(plans, workout);
  const saved = workout.phase ? PHASES[workout.phase] : undefined;
  const phase = saved && (!plan || planFacts(plan).hasRhythm) ? saved : null;
  return {
    tag: workout.week ? `Week ${workout.week}${phase ? ` · ${phase.name}` : ''}` : null,
    rule: phase ? phase.rule : null,
  };
}

/** The plan's gym workout that `workout` was started from, or undefined (empty workout, deleted plan or workout, sport). */
export function planWorkoutOf(
  plans: readonly Plan[],
  workout: Pick<Workout, 'planId' | 'sessionId'>,
): GymWorkout | undefined {
  if (!workout.planId || !workout.sessionId) return undefined;
  return plans.find((p) => p.id === workout.planId)?.workouts.find((w) => w.id === workout.sessionId);
}

/** The item of the plan's workout that an exercise of the workout came from; its cue is shown. */
export function planItemOf(gym: GymWorkout | undefined, we: Pick<WorkoutExercise, 'itemKey' | 'exerciseId'>): RoutineItem | undefined {
  if (!gym || !we.itemKey) return undefined;
  return gym.items.find((i) => i.key === we.itemKey && i.exerciseId === we.exerciseId);
}

/** The warm-up checklist the app has for a workout ('upper' or 'lower'), or null if the workout has none. */
export function warmupKindOf(gym: GymWorkout | undefined): 'upper' | 'lower' | null {
  return gym?.warmup === 'upper' || gym?.warmup === 'lower' ? gym.warmup : null;
}

/**
 * The cool-down checklist a gym workout ends with: the workout's own `cooldown` if it names a
 * cool-down this app has, otherwise the one that goes with its warm-up kind ('upper' gives
 * 'cool-upper', 'lower' gives 'cool-lower'). Undefined for a workout without a warm-up kind (an
 * empty workout, or a deleted plan or workout) and no cool-down of its own.
 */
export function cooldownOf(gym: GymWorkout | undefined): Checklist | undefined {
  const own = gym?.cooldown ? checklist(gym.cooldown) : undefined;
  if (own && own.kind === 'cooldown') return own;
  const kind = warmupKindOf(gym);
  return kind ? checklist(`cool-${kind}`) : undefined;
}

/**
 * The superset note to show above an exercise: the instructions of its group, when it is the first
 * of its group in a row. Null for no group, the same group as the exercise before, or no such note.
 */
export function groupHeaderFor(
  gym: GymWorkout | undefined,
  exercises: readonly Pick<WorkoutExercise, 'group'>[],
  index: number,
): string | null {
  const group = exercises[index]?.group;
  if (!gym || !group || group === exercises[index - 1]?.group) return null;
  return gym.groups[group] ?? null;
}
