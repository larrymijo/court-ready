import { router } from 'expo-router';

import { confirm } from '@/lib/platform';
import type { RoutineId } from '@/lib/types';
import { useStore } from '@/store/useStore';

/**
 * The "workout in progress" question. True when the caller may go on and start a new workout;
 * false when the person chose to go back to the one in progress (the workout screen is opened).
 */
async function mayReplaceActive(): Promise<boolean> {
  const { active } = useStore.getState();
  if (!active) return true;
  const replace = await confirm(
    'Workout in progress',
    `You’re in the middle of “${active.name}”. Discard it and start a new one?`,
    'Discard & start',
    true,
  );
  if (!replace) router.push('/workout');
  return replace;
}

/**
 * Starts a gym workout of a saved plan (or resumes the one in progress) and opens the workout
 * screen. The workout screen opens only if the store started one; if the plan or the workout isn't
 * saved any more, nothing changes and the workout in progress, if any, is kept.
 */
export async function startPlanWorkoutFlow(
  planId: string,
  workoutId: string,
  opts?: { gameMode?: boolean },
): Promise<void> {
  if (!(await mayReplaceActive())) return;
  // startPlanWorkout replaces the workout in progress only when it starts a new one.
  if (useStore.getState().startPlanWorkout(planId, workoutId, opts)) router.push('/workout');
}

/** Starts an empty workout (or resumes the one in progress) and opens the workout screen. */
export async function startEmptyWorkoutFlow(): Promise<void> {
  if (!(await mayReplaceActive())) return;
  const { discardWorkout, startEmpty } = useStore.getState();
  discardWorkout();
  startEmpty();
  router.push('/workout');
}

/** Starts a routine (or resumes the one in progress) and opens the workout screen. */
export async function startRoutineFlow(routineId: RoutineId | null, opts?: { gameMode?: boolean }): Promise<void> {
  const { active, startRoutine, startEmpty, discardWorkout } = useStore.getState();
  if (active) {
    const replace = await confirm(
      'Workout in progress',
      `You’re in the middle of “${active.name}”. Discard it and start a new one?`,
      'Discard & start',
      true,
    );
    if (!replace) {
      router.push('/workout');
      return;
    }
    discardWorkout();
  }
  if (routineId) startRoutine(routineId, opts);
  else startEmpty();
  router.push('/workout');
}
