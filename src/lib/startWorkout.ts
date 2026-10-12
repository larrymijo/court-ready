import { router } from 'expo-router';

import { confirm } from '@/lib/platform';
import type { RoutineId } from '@/lib/types';
import { useStore } from '@/store/useStore';

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
