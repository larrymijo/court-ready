import { beforeEach, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { filterExercises, recentExercises } from '@/lib/browseExercises';
import { findExercise, getExercise, type CustomExerciseInput } from '@/lib/exerciseCatalog';
import { exerciseBests, muscleSets } from '@/lib/stats';
import { useStore } from '@/store/useStore';
import exportV4 from './fixtures/export-v4.json';
import exportV5 from './fixtures/export-v5.json';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const state = useStore.getState;
const sample: CustomExerciseInput = {
  name: 'Practice band row', primary: 'back', secondary: ['biceps'],
  equipment: 'band', tracking: 'reps', notes: 'Pause at the top.',
};

function create() {
  const result = state().createCustomExercise(sample);
  if (!result.ok) throw new Error(result.error);
  return result.id;
}

beforeEach(() => state().resetAll());

it('validates names and weight steps and searches by helper muscle and equipment', () => {
  const id = create();
  expect(state().createCustomExercise({ ...sample, name: ' PRACTICE BAND ROW ' }).ok).toBe(false);
  expect(state().createCustomExercise({ ...sample, name: getExercise('incline').name }).ok).toBe(false);
  expect(state().createCustomExercise({ ...sample, name: 'Weighted row', tracking: 'weight_reps', increment: 0 }).ok).toBe(false);
  expect(filterExercises(state().customExercises, 'band row', 'biceps', 'band').map((ex) => ex.id)).toEqual([id]);
  expect(filterExercises(state().customExercises, '', 'quads', 'band')).toEqual([]);
  expect(getExercise('missing-id', state().customExercises).name).toBe('Removed exercise');
  expect(findExercise('toString', state().customExercises)).toBeUndefined();
});

it('keeps a logged custom exercise and its records through archive, reload and backup import', async () => {
  const id = create();
  const workout = state().plans[0].workouts[0];
  const planId = state().plans[0].id;
  expect(state().addPlanExercises(planId, workout.id, [id, id, 'missing-id'])).toBe(1);
  expect(state().addPlanExercises(planId, workout.id, [id])).toBe(0);
  expect(state().startPlanWorkout(planId, workout.id)).toBe(true);
  const row = state().active!.exercises.find((ex) => ex.exerciseId === id)!;
  state().completeSet(row.id, row.sets[0].id, { reps: 12, weight: null });
  expect(state().removeCustomExercise(id)).toBe(true);
  expect(state().addExercises([id])).toBe(0);
  expect(state().plans[0].workouts[0].items.some((item) => item.exerciseId === id)).toBe(false);
  expect(state().active!.exercises.find((ex) => ex.id === row.id)?.sets[0].done).toBe(true);
  expect(state().finishWorkout()).toBeTruthy();
  const before = state().workouts;
  const file = state().exportData();
  await useStore.persist.rehydrate();
  expect(getExercise(id, state().customExercises)).toMatchObject({ name: sample.name, archived: true });
  state().resetAll();
  expect(state().customExercises).toEqual([]);
  expect(state().importData(file)).toMatchObject({ ok: true });
  expect(state().workouts).toEqual(before);
  const lookup = (key: string) => findExercise(key, state().customExercises);
  expect(lookup(id)).toMatchObject({ name: sample.name, archived: true });
  expect(exerciseBests(id, state().workouts, undefined, lookup(id)).reps?.value).toBe(12);
  expect(muscleSets(state().workouts, lookup)).toMatchObject({ back: 1, biceps: 0.5 });
});

it('adds multiple exercises in order, swaps to a custom lift and lists recently logged exercises once', () => {
  const id = create();
  state().startEmpty();
  expect(state().addExercises(['incline', id, id, 'missing-id'])).toBe(2);
  const rows = state().active!.exercises;
  expect(rows.map((ex) => ex.exerciseId)).toEqual(['incline', id]);
  state().swapExercise(rows[0].id, id);
  for (const row of rows) state().completeSet(row.id, row.sets[0].id, { reps: 8, weight: null });
  state().finishWorkout();
  const available = new Map(state().customExercises.map((ex) => [ex.id, ex]));
  expect(recentExercises(state().workouts, available).map((ex) => ex.id)).toEqual([id]);
});

it('imports v5 definitions with their history and rejects an unreadable catalog atomically', () => {
  expect(state().importData(JSON.stringify(exportV5)).ok).toBe(true);
  expect(state().customExercises).toEqual(exportV5.customExercises);
  expect(state().workouts).toEqual(exportV5.workouts);
  const before = state();
  const exercise = exportV5.customExercises[0];
  for (const catalog of [undefined, [exercise, exercise], [{ ...exercise, equipment: 'bad' }]]) {
    expect(state().importData(JSON.stringify({ ...exportV5, workouts: [], customExercises: catalog })).ok).toBe(false);
    expect(state()).toBe(before);
  }
});

it('restores a v4 safety copy including the in-progress sport and gym cooldown', async () => {
  state().startSport({ sport: 'running' });
  const sport = state().activeSport;
  const saved = { ...exportV4, active: null, activeSport: sport, cooldownChecked: [0, 2] };
  await AsyncStorage.setItem('court-ready', JSON.stringify({ state: saved, version: 4 }));
  await useStore.persist.rehydrate();
  create();
  state().discardSport();
  expect((await state().restoreSafetyCopy()).ok).toBe(true);
  expect(state().activeSport).toEqual(sport);
  expect(state().cooldownChecked).toEqual([0, 2]);
  expect(state().customExercises).toEqual([]);
});
