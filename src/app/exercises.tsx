import { router, Stack, useLocalSearchParams } from 'expo-router';

import { ExerciseList } from '@/components/ExerciseList';
import { Screen } from '@/components/ui';
import { EXERCISE_BY_ID } from '@/data/exercises';
import type { ExerciseDef } from '@/lib/types';
import { useStore } from '@/store/useStore';

/** The exercise list as a picker: add one to the open workout (?pick=1) or swap one out (?swap=<id>). */
export default function ExercisesScreen() {
  const { pick, swap } = useLocalSearchParams<{ pick?: string; swap?: string }>();
  const addExercise = useStore((s) => s.addExercise);
  const swapExercise = useStore((s) => s.swapExercise);
  const active = useStore((s) => s.active);
  const swapping = swap ? active?.exercises.find((e) => e.id === swap) : undefined;
  const swappingDef = swapping ? EXERCISE_BY_ID[swapping.exerciseId] : undefined;

  const onChoose = (e: ExerciseDef) => {
    if (swapping) {
      swapExercise(swapping.id, e.id);
      router.back();
    } else if (pick) {
      addExercise(e.id);
      router.back();
    } else {
      router.push(`/exercise/${e.id}`);
    }
  };

  const title = swappingDef ? `Swap ${swappingDef.name}` : pick ? 'Add exercise' : 'Exercises';

  return (
    <>
      <Stack.Screen options={{ title }} />
      <Screen edgesTop={false}>
        <ExerciseList
          initialFilter={swappingDef || pick ? 'all' : 'plan'}
          swapFor={swappingDef}
          adds={!!(pick || swapping)}
          onChoose={onChoose}
        />
      </Screen>
    </>
  );
}
