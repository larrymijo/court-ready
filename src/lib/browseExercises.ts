import { exerciseLabel } from '@/lib/exerciseCatalog';
import { isWorkingSet } from '@/lib/stats';
import type { Equipment, ExerciseDef, MuscleGroup, Workout } from '@/lib/types';

export function exerciseCategory(exercise: ExerciseDef): string {
  if (exercise.kind === 'drill') return 'Warm-up drill';
  if (exercise.kind === 'stretch') return 'Cool-down stretch';
  return exerciseLabel(exercise.primary);
}

function normalizeSearch(text: string) {
  return text.toLowerCase().replace(/['’]/g, '').replace(/[-_]/g, ' ').trim();
}

export function filterExercises(
  exercises: readonly ExerciseDef[],
  query: string,
  muscle: MuscleGroup | null,
  equipment: Equipment | null,
) {
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  return exercises.filter((ex) => {
    if (muscle && ex.primary !== muscle && !ex.secondary?.includes(muscle)) return false;
    if (equipment && ex.equipment !== equipment) return false;
    if (words.length === 0) return true;
    const searchable = normalizeSearch([
      ex.name, ex.muscles, ex.primary, ...(ex.secondary ?? []), exerciseLabel(ex.equipment),
      exerciseCategory(ex), ex.kind, ex.swapOption ? 'swap' : '',
    ].join(' '));
    return words.every((word) => searchable.includes(word));
  });
}

/** History is stored newest first. An exercise appears once, after at least one logged working set. */
export function recentExercises(workouts: readonly Workout[], available: ReadonlyMap<string, ExerciseDef>) {
  const recent = new Map<string, ExerciseDef>();
  for (const workout of workouts) {
    if (!workout.finishedAt) continue;
    for (const row of workout.exercises) {
      const ex = available.get(row.exerciseId);
      if (ex && !recent.has(ex.id) && row.sets.some(isWorkingSet)) recent.set(ex.id, ex);
      if (recent.size === 5) return [...recent.values()];
    }
  }
  return [...recent.values()];
}
