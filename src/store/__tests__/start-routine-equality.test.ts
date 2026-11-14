// startRoutine now builds Court-Ready workouts from the saved plan. With Court-Ready as the upgrade
// saves it, the workout must equal what the old builder made, apart from new ids and the three plan
// fields. The oracle is a frozen copy of the old buildRoutineWorkout (src/store/useStore.ts at
// commit f3380da), fed by frozen fixtures instead of today's program.ts and routines.ts.
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getExercise } from '@/data/exercises';
import { addDaysISO, parseISODate } from '@/lib/dates';
import { lastPerformance, suggestNext } from '@/lib/progression';
import * as legacy from '@/lib/__fixtures__/legacy-program';
import type { LegacyFixture } from '@/lib/__fixtures__/legacy-program';
import legacyJson from '@/lib/__fixtures__/court-ready-legacy.json';
import type { RoutineId, Settings, Workout, WorkoutExercise, WorkoutSet } from '@/lib/types';
import { migrate } from '@/store/migrations';
import { useStore } from '@/store/useStore';

import routinesJson from './fixtures/court-ready-routines-legacy.json';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const fixture = legacyJson as unknown as LegacyFixture;
type FrozenItem = { key: string; exerciseId: string; group?: string; restSec: number };
const ROUTINES = routinesJson.routines as Record<RoutineId, { name: string; items: FrozenItem[] }>;
const START = fixture.start;

// --- The old builder, frozen. Only its inputs come from fixtures. ---

function oldNewSet(weight: number | null): WorkoutSet {
  return { id: 'old', type: 'normal', weight, reps: null, rir: null, done: false };
}

function oldBuildRoutineWorkout(
  routineId: RoutineId,
  gameMode: boolean,
  settings: Settings,
  workouts: Workout[],
  today: string,
): Workout {
  const routine = ROUTINES[routineId];
  const pos = legacy.programPosition(settings.programStart, today);
  const frozen = fixture.prescriptions[pos.phase][routineId][gameMode ? 'game' : 'normal'];
  const exercises: WorkoutExercise[] = [];
  routine.items.forEach((item, i) => {
    const ex = getExercise(item.exerciseId);
    const f = frozen[i];
    if (f.key !== item.key || f.exerciseId !== item.exerciseId) throw new Error(`Fixtures disagree at ${routineId} ${i}`);
    const p = { sets: f.sets, repsMin: f.repsMin, repsMax: f.repsMax, repsLabel: f.repsLabel ?? undefined, rir: f.rir, skip: f.skip };
    if (p.skip) return;
    const last = lastPerformance(item.exerciseId, workouts);
    let weight: number | null = null;
    if (ex.tracking === 'weight_reps') {
      const lastTop = last ? Math.max(...last.sets.map((s) => s.weight ?? 0)) : null;
      weight = pos.phase === 'deload' ? lastTop : (suggestNext(ex, p, last).weight ?? lastTop);
      if (weight === 0) weight = null;
    }
    exercises.push({
      id: 'old',
      exerciseId: item.exerciseId,
      itemKey: item.key,
      group: item.group,
      restSec: item.restSec,
      target: { sets: p.sets, repsMin: p.repsMin, repsMax: p.repsMax, repsLabel: p.repsLabel, rir: p.rir },
      sets: Array.from({ length: p.sets }, () => oldNewSet(weight)),
      pain: null,
      note: '',
    });
  });
  return {
    id: 'old',
    name: gameMode ? `${routine.name} (game mode)` : routine.name,
    routineId,
    startedAt: Date.now(),
    week: pos.week,
    phase: pos.phase,
    gameMode,
    exercises,
  };
}

// --- Made-up history: earlier sets for some exercises of each workout. ---

let n = 0;
const done = (weight: number | null, reps: number, type: 'normal' | 'warmup' = 'normal'): WorkoutSet => ({
  id: `h${n++}`,
  type,
  weight,
  reps,
  rir: 2,
  done: true,
});
const ex = (exerciseId: string, sets: WorkoutSet[]): WorkoutExercise => ({
  id: `he${n++}`,
  exerciseId,
  restSec: 90,
  sets,
  pain: null,
  note: '',
});

const HISTORY: Workout[] = [
  {
    id: 'h-new',
    name: 'Upper A',
    routineId: 'uppera',
    startedAt: 1792915200000,
    finishedAt: 1792918800000,
    exercises: [
      // Top of the range on every set: the old builder goes up a step.
      ex('incline', [done(10, 10, 'warmup'), done(22, 10), done(22, 10), done(22, 10)]),
      // Not at the top: the same weight again.
      ex('cablefly', [done(12.5, 12), done(12.5, 10)]),
      ex('lateral', [done(8, 20), done(8, 18)]),
      ex('curl', [done(12, 12), done(10, 12)]),
    ],
  },
  {
    id: 'h-lower',
    name: 'Lower + Core',
    routineId: 'lower',
    startedAt: 1792828800000,
    finishedAt: 1792832400000,
    exercises: [
      ex('legpress', [done(130, 9), done(130, 8)]),
      ex('rdl', [done(24, 10), done(24, 10), done(24, 10)]),
      ex('pallof', [done(10, 10)]),
      ex('crunch', [done(null, 15)]),
    ],
  },
  {
    id: 'h-old',
    name: 'Upper B',
    routineId: 'upperb',
    startedAt: 1792742400000,
    finishedAt: 1792746000000,
    exercises: [
      // Older than h-new: the builder must use the newer incline sets.
      ex('incline', [done(20, 8)]),
      ex('pullup', [done(0, 8), done(0, 7)]),
      ex('pushup', [done(null, 15), done(null, 13)]),
      ex('hammer', [done(14, 15), done(14, 15)]),
      ex('c_er', [done(4, 15)]),
    ],
  },
];

const CASES: [RoutineId, boolean][] = [
  ['uppera', false],
  ['lower', false],
  ['lower', true],
  ['upperb', false],
  ['bonus', false],
];

/** A workout without what differs by design: new ids, and the plan fields the old builder didn't write. */
function comparable(w: Workout) {
  const { id: _id, planId: _planId, planName: _planName, sessionId: _sessionId, ...rest } = w;
  return {
    ...rest,
    exercises: w.exercises.map((e) => ({ ...e, id: 'x', sets: e.sets.map((s) => ({ ...s, id: 'x' })) })),
  };
}

const settings: Settings = { programStart: START, restTimer: true, vibrate: true, keepAwake: true, lastExportAt: null };

beforeAll(async () => {
  jest.useFakeTimers({
    doNotFake: [
      'hrtime',
      'nextTick',
      'performance',
      'queueMicrotask',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'requestIdleCallback',
      'cancelIdleCallback',
      'setImmediate',
      'clearImmediate',
      'setInterval',
      'clearInterval',
      'setTimeout',
      'clearTimeout',
    ],
  });
  await AsyncStorage.clear();
  // Court-Ready exactly as the upgrade from version 2 saves it.
  const upgraded = migrate({ settings, workouts: HISTORY, body: [] }, 2) as Record<string, unknown>;
  useStore.setState({
    settings,
    workouts: upgraded.workouts as Workout[],
    plans: upgraded.plans as never,
    activePlanId: upgraded.activePlanId as string,
    planState: upgraded.planState as never,
  });
});

afterAll(() => {
  jest.useRealTimers();
});

it('the history holds earlier sets for some exercises', () => {
  expect(useStore.getState().planState).toEqual({ 'court-ready': { start: START } });
  expect(useStore.getState().workouts).toHaveLength(HISTORY.length);
  for (const id of ['uppera', 'lower', 'upperb'] as RoutineId[]) {
    useStore.getState().startRoutine(id);
    const weights = useStore.getState().active!.exercises.map((e) => e.sets[0]?.weight ?? null);
    expect(weights.some((w) => w != null)).toBe(true);
    expect(weights.some((w) => w == null)).toBe(true);
  }
});

describe.each(Array.from({ length: 40 }, (_, i) => i + 1))('week %i', (week) => {
  const today = addDaysISO(START, (week - 1) * 7 + 3);

  it.each(CASES)('%s, game mode %s', (routineId, gameMode) => {
    const at = parseISODate(today);
    at.setHours(12);
    jest.setSystemTime(at);

    const old = oldBuildRoutineWorkout(routineId, gameMode, settings, HISTORY, today);
    useStore.getState().startRoutine(routineId, { gameMode });
    const built = useStore.getState().active!;

    expect(built.week).toBe(fixture.weeks[week - 1].position.week);
    expect(comparable(built)).toEqual(comparable(old));
    expect(built).toMatchObject({ planId: 'court-ready', planName: 'Court-Ready', sessionId: routineId, routineId });
    expect(built.id).not.toBe('old');
  });
});
