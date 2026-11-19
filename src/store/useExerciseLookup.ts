import { useMemo } from 'react';

import { findExercise, getExercise } from '@/lib/exerciseCatalog';
import { useStore } from '@/store/useStore';

/** Resolve saved exercise IDs again when a custom definition changes or a backup is restored. */
export function useExerciseLookup() {
  const custom = useStore((s) => s.customExercises);
  return useMemo(() => ({
    get: (id: string) => getExercise(id, custom),
    find: (id: string) => findExercise(id, custom),
    available: (id: string) => {
      const exercise = findExercise(id, custom);
      return !!exercise && !exercise.archived;
    },
  }), [custom]);
}
