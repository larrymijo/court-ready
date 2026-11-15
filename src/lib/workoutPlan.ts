// What a workout's plan says about it: the warm-up, the cues and the superset notes. A workout
// finds its plan details again by its saved planId, sessionId and each exercise's itemKey, so it
// works whether or not that plan is the active one. If the plan or the workout has been deleted,
// every helper returns nothing and the workout shows only what it saved itself (its name and sets).
import type { GymWorkout, Plan, RoutineItem, Workout, WorkoutExercise } from '@/lib/types';

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
