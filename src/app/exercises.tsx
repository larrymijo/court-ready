import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import { ExerciseList } from '@/components/ExerciseList';
import { BOTTOM_BAR_SPACE, BottomBar, Button, Screen, Txt } from '@/components/ui';
import { getExercise } from '@/lib/exerciseCatalog';
import { plural } from '@/lib/format';
import { findWorkout } from '@/lib/plans';
import type { ExerciseDef } from '@/lib/types';
import { useStore } from '@/store/useStore';
import { C } from '@/theme';

export default function ExercisesScreen() {
  const { pick, swap, planId, workoutId } = useLocalSearchParams<{
    pick?: string; swap?: string; planId?: string; workoutId?: string;
  }>();
  const active = useStore((s) => s.active);
  const plan = useStore((s) => s.plans.find((p) => p.id === planId));
  const custom = useStore((s) => s.customExercises);
  const addExercises = useStore((s) => s.addExercises);
  const addPlanExercises = useStore((s) => s.addPlanExercises);
  const swapExercise = useStore((s) => s.swapExercise);
  const [selected, setSelected] = useState<string[]>([]);
  const committed = useRef(false);
  const targetPlanWorkout = plan && workoutId ? findWorkout(plan, workoutId) : undefined;
  const excludedIds = useMemo(() => targetPlanWorkout
    ? new Set(targetPlanWorkout.items.map((i) => i.exerciseId)) : undefined, [targetPlanWorkout]);
  const swapping = swap ? active?.exercises.find((e) => e.id === swap) : undefined;
  const swappingDef = swapping && getExercise(swapping.exerciseId, custom);
  const pickingForPlan = !!(planId || workoutId);
  const multi = !!pick || pickingForPlan;
  const title = swappingDef ? `Swap ${swappingDef.name}` : multi ? 'Add exercises' : 'Exercises';

  function returnToWorkout() {
    if (router.canGoBack()) router.back();
    else if (planId && workoutId) router.replace({ pathname: '/plans/[id]/[workoutId]', params: { id: planId, workoutId } });
    else router.replace('/workout');
  }

  function choose(ex: ExerciseDef) {
    if (swapping) {
      if (committed.current) return;
      committed.current = true;
      swapExercise(swapping.id, ex.id);
      returnToWorkout();
    } else if (multi) {
      setSelected((ids) => ids.includes(ex.id) ? ids.filter((id) => id !== ex.id) : [...ids, ex.id]);
    } else {
      router.push(`/exercise/${ex.id}`);
    }
  }

  function add() {
    if (!selected.length || committed.current) return;
    committed.current = true;
    if (planId && workoutId) addPlanExercises(planId, workoutId, selected);
    else addExercises(selected);
    returnToWorkout();
  }

  const unavailable = pickingForPlan ? !targetPlanWorkout : swap ? !swapping : !!pick && !active;
  if (unavailable) return (
    <Screen edgesTop={false}>
      <Stack.Screen options={{ title: 'Exercises' }} />
      <Txt>{pickingForPlan ? 'This plan workout is unavailable.' : 'There is no open workout to change.'}</Txt>
      <Button title="Open Library" onPress={() => router.replace('/library')} />
    </Screen>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Stack.Screen options={{ title }} />
      <ExerciseList pick={multi || !!swap} swapFor={swappingDef} excludedIds={excludedIds}
        selectedIds={multi ? selected : undefined} onChoose={choose} bottomPad={multi ? BOTTOM_BAR_SPACE : undefined} />
      {multi ? (
        <BottomBar>
          <Button title={selected.length ? `Add ${plural(selected.length, 'exercise')}` : 'Add exercises'}
            disabled={!selected.length} onPress={add} />
        </BottomBar>
      ) : null}
    </View>
  );
}
