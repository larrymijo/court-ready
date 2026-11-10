import type { ExerciseDef, MuscleGroup, Routine } from '@/lib/types';

/** Body areas as a person would name them: biceps and triceps are "Arms", everything below the hips is "Legs". */
const AREA: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Arms',
  triceps: 'Arms',
  quads: 'Legs',
  hamstrings: 'Legs',
  glutes: 'Legs',
  calves: 'Legs',
  core: 'Core',
  mobility: 'Mobility',
};

/**
 * The body areas a routine trains, the one with the most sets first: "Chest", "Back", "Shoulders",
 * "Arms". Shoulder-care drills don't count, the same as for hard sets.
 */
export function routineAreas(routine: Routine, getExercise: (id: string) => ExerciseDef, max = 4): string[] {
  const sets = new Map<string, number>();
  for (const item of routine.items) {
    const ex = getExercise(item.exerciseId);
    if (ex.kind === 'care') continue;
    const area = AREA[ex.primary];
    sets.set(area, (sets.get(area) ?? 0) + item.sets);
  }
  return [...sets.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([area]) => area);
}

/**
 * "Chest focus · 8 exercises · about 60 min". Pass `exercises` when some are left out today
 * (game mode skips the split squats).
 */
export function routineSummary(routine: Routine, exercises: number = routine.items.length): string {
  return `${routine.focus} · ${exercises} exercise${exercises === 1 ? '' : 's'} · about ${routine.minutes} min`;
}
