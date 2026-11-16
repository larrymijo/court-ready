import { router } from 'expo-router';

import { confirm } from '@/lib/platform';
import type { SportId } from '@/lib/types';
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

/**
 * Starts a sport session at its warm-up and opens the sport screen. A sport session in progress
 * is replaced only when the person agrees; if they decline, the screen opens on the session in
 * progress. A gym workout in progress is not touched. If the sport, plan or plan session isn't
 * saved, nothing changes (the session in progress, if any, is kept).
 */
export async function startSportFlow(opts: {
  sport: SportId;
  planId?: string;
  sessionId?: string;
  name?: string;
}): Promise<void> {
  const current = useStore.getState().activeSport;
  if (current) {
    const replace = await confirm(
      'Session in progress',
      `You’re in the middle of “${current.name}”. Discard it and start a new one?`,
      'Discard & start',
      true,
    );
    if (!replace) {
      router.push('/sport');
      return;
    }
  }
  // startSport replaces the session in progress only when it starts a new one.
  if (useStore.getState().startSport(opts)) router.push('/sport');
}
