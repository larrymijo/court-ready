// Phase 4's data checks: made-up data of versions 1, 2 and 3 upgrades to version 4 with nothing
// lost, a version 4 backup with sport sessions goes out and comes back the same, and sport records
// change none of the numbers worked out from sets.
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { EXERCISE_BY_ID } from '@/data/exercises';
import { summarizeData, summaryLines } from '@/lib/dataSummary';
import { lastPerformance } from '@/lib/progression';
import { detectPRs, exerciseBests, exerciseSeries, muscleSets, workoutVolume } from '@/lib/stats';
import type { BodyEntry, Plan, PlanState, Workout } from '@/lib/types';
import { DATA_VERSION, migrate } from '@/store/migrations';
import { buildPlanWorkout } from '@/store/planData';
import { readSafetyCopy } from '@/store/safetyCopy';
import { useStore } from '@/store/useStore';

// Made-up data. Not anyone's real backup.
import activeWorkout from './fixtures/active-workout.json';
import exportV1 from './fixtures/export-v1.json';
import exportV2 from './fixtures/export-v2.json';
import exportV3 from './fixtures/export-v3.json';
import exportV4 from './fixtures/export-v4.json';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

type File = {
  settings: { programStart: string };
  workouts: unknown[];
  body: unknown[];
  plans?: unknown[];
  activePlanId?: string;
  planState?: Record<string, PlanState>;
};

const STORE_ONLY = ['active', 'activeSport', 'cooldownChecked', 'warmupChecked', 'rest'];

/** The workout as the upgrades must leave it: version 3 links Court-Ready's routines, version 4 changes nothing. */
function expectedAfter(w: Workout): Workout {
  return w.routineId && w.planId === undefined
    ? { ...w, planId: 'court-ready', planName: 'Court-Ready', sessionId: w.routineId }
    : w;
}

/** What the owner compares before and after: counts, sets, records, weigh-ins and the summary lines. */
function numbers(workouts: Workout[], body: BodyEntry[]) {
  const summary = summarizeData(workouts, body);
  return {
    workouts: workouts.length,
    sets: workouts.reduce((n, w) => n + w.exercises.reduce((m, e) => m + e.sets.length, 0), 0),
    summary,
    lines: summaryLines(summary),
    prs: workouts.flatMap((w) => w.prs ?? []),
    weighIns: body.length,
  };
}

const sportRecords = (exportV4.workouts as Workout[]).filter((w) => w.kind === 'sport');
const gymOnly = (exportV4.workouts as Workout[]).filter((w) => w.kind !== 'sport');

it('the made-up version 4 data has sport sessions of every kind, and a gym workout with its marks', () => {
  expect(exportV4.version).toBe(4);
  expect(DATA_VERSION).toBe(4);
  expect(sportRecords.map((w) => w.sport).sort()).toEqual(['basketball', 'running', 'volleyball']);
  expect(sportRecords.some((w) => w.planId === 'court-ready' && w.sessionId === 'volleyball')).toBe(true);
  expect(sportRecords.some((w) => w.loggedLater && w.distanceKm)).toBe(true);
  expect(sportRecords.some((w) => w.match === false)).toBe(true);
  expect(sportRecords.every((w) => Array.isArray(w.exercises) && w.exercises.length === 0)).toBe(true);
  expect(gymOnly.some((w) => w.warmupDone === true && w.cooldownDone === false)).toBe(true);
  // Newest first, as the store keeps history.
  const starts = (exportV4.workouts as Workout[]).map((w) => w.startedAt);
  expect([...starts].sort((a, b) => b - a)).toEqual(starts);
});

const FILES: [string, File, number][] = [
  ['version 1', exportV1 as unknown as File, 1],
  ['version 2', exportV2 as unknown as File, 2],
  ['version 3', exportV3 as unknown as File, 3],
];

describe.each(FILES)('made-up %s data', (_name, file, version) => {
  const workouts = file.workouts as Workout[];
  const body = file.body as BodyEntry[];

  it('upgrades from a backup file to version 4 with the same workouts, sets, records and weigh-ins', async () => {
    await AsyncStorage.clear();
    useStore.getState().resetAll();
    expect(useStore.getState().importData(JSON.stringify(file))).toEqual({ ok: true, workouts: workouts.length });
    const s = useStore.getState();
    expect(s.workouts).toEqual(workouts.map(expectedAfter));
    expect(numbers(s.workouts, s.body)).toEqual(numbers(workouts, body));
    expect(s.body).toEqual(body);
    expect(JSON.parse(s.exportData()).version).toBe(4);
  });

  it('upgrades from the phone to version 4, keeps a safety copy, and adds only the two store keys', async () => {
    const saved = {
      settings: file.settings,
      workouts,
      active: activeWorkout,
      warmupChecked: [0, 2],
      body,
      rest: null,
      ...(file.plans ? { plans: file.plans, activePlanId: file.activePlanId, planState: file.planState } : {}),
    };
    await AsyncStorage.clear();
    await AsyncStorage.setItem('court-ready', JSON.stringify({ state: saved, version }));
    await useStore.persist.rehydrate();

    const s = useStore.getState();
    expect(s.workouts).toEqual(workouts.map(expectedAfter));
    expect(numbers(s.workouts, s.body)).toEqual(numbers(workouts, body));
    expect(s.activeSport).toBeNull();
    expect(s.cooldownChecked).toEqual([]);
    expect(s.warmupChecked).toEqual([0, 2]);

    const stored = JSON.parse((await AsyncStorage.getItem('court-ready')) ?? '{}');
    expect(stored.version).toBe(4);
    expect(stored.state.workouts).toEqual(workouts.map(expectedAfter));
    expect(stored.state.activeSport).toBeNull();
    expect(stored.state.cooldownChecked).toEqual([]);

    const copy = await readSafetyCopy();
    expect(copy?.version).toBe(version);
    expect(copy?.state).toEqual(saved);
  });
});

describe('a phone holding version 3 data', () => {
  const saved = {
    settings: exportV3.settings,
    workouts: exportV3.workouts,
    active: { ...activeWorkout, planId: 'court-ready', planName: 'Court-Ready', sessionId: 'lower' },
    warmupChecked: [1],
    body: exportV3.body,
    rest: null,
    plans: exportV3.plans,
    activePlanId: exportV3.activePlanId,
    planState: exportV3.planState,
  };

  beforeEach(async () => {
    await AsyncStorage.clear();
    await AsyncStorage.setItem('court-ready', JSON.stringify({ state: saved, version: 3 }));
    await useStore.persist.rehydrate();
  });

  it('upgrades on load with workouts, plans, settings and the workout in progress untouched', () => {
    const s = useStore.getState();
    expect(s.workouts).toEqual(exportV3.workouts);
    expect(s.plans).toEqual(exportV3.plans);
    expect(s.activePlanId).toBe(exportV3.activePlanId);
    expect(s.planState).toEqual(exportV3.planState);
    expect(s.settings).toEqual(exportV3.settings);
    expect(s.active).toEqual(saved.active);
    expect(s.warmupChecked).toEqual([1]);
    expect(s.activeSport).toBeNull();
    expect(s.cooldownChecked).toEqual([]);
  });

  it('keeps a safety copy that puts version 3 back, with no sport session in progress', async () => {
    const copy = await readSafetyCopy();
    expect(copy?.version).toBe(3);
    expect(copy?.state).toEqual(saved);

    const s = useStore.getState();
    expect(s.startSport({ sport: 'running' })).toBe(true);
    s.toggleCooldownStep(2);
    s.deleteWorkout(exportV3.workouts[0].id);

    expect(await useStore.getState().restoreSafetyCopy()).toEqual({ ok: true, workouts: 3 });
    const after = useStore.getState();
    expect(after.workouts).toEqual(exportV3.workouts);
    expect(after.plans).toEqual(exportV3.plans);
    expect(after.active).toEqual(saved.active);
    expect(after.activeSport).toBeNull();
    expect(after.cooldownChecked).toEqual([]);
  });
});

describe('a version 4 backup with sport sessions', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useStore.getState().resetAll();
  });

  it('imports and exports again with nothing changed', () => {
    expect(useStore.getState().importData(JSON.stringify(exportV4))).toEqual({ ok: true, workouts: exportV4.workouts.length });
    const s = useStore.getState();
    expect(s.workouts).toEqual(exportV4.workouts);
    const out = JSON.parse(s.exportData());
    expect({ ...out, exportedAt: exportV4.exportedAt }).toEqual(exportV4);
  });

  it('never exports a session in progress, and its export imports back the same', () => {
    useStore.getState().importData(JSON.stringify(exportV4));
    expect(useStore.getState().startSport({ sport: 'football' })).toBe(true);
    useStore.getState().startEmpty();
    const file = useStore.getState().exportData();
    expect(Object.keys(JSON.parse(file)).sort()).toEqual(
      ['activePlanId', 'app', 'body', 'exportedAt', 'planState', 'plans', 'settings', 'version', 'workouts'],
    );
    const before = useStore.getState();
    useStore.getState().resetAll();
    expect(useStore.getState().importData(file)).toEqual({ ok: true, workouts: exportV4.workouts.length });
    const after = useStore.getState();
    expect(after.workouts).toEqual(before.workouts);
    expect(after.body).toEqual(before.body);
    expect(after.plans).toEqual(before.plans);
    expect(after.planState).toEqual(before.planState);
  });

  it('gives a record without an exercises list an empty one, and puts history newest first', () => {
    const shuffled = [...exportV4.workouts].reverse().map((w) => {
      if (w.id !== 'w4-run') return w;
      const { exercises: _e, ...rest } = w;
      return rest;
    });
    expect(useStore.getState().importData(JSON.stringify({ ...exportV4, workouts: shuffled })).ok).toBe(true);
    const s = useStore.getState();
    expect(s.workouts.map((w) => w.id)).toEqual(exportV4.workouts.map((w) => w.id));
    expect(s.workouts.find((w) => w.id === 'w4-run')?.exercises).toEqual([]);
    expect(s.workouts).toEqual(exportV4.workouts);
  });
});

describe('the step to version 4', () => {
  const v3Store = {
    settings: exportV3.settings,
    workouts: exportV3.workouts,
    active: null,
    warmupChecked: [],
    body: exportV3.body,
    rest: null,
    plans: exportV3.plans,
    activePlanId: exportV3.activePlanId,
    planState: exportV3.planState,
  };
  const v3File = {
    settings: exportV3.settings,
    workouts: exportV3.workouts,
    body: exportV3.body,
    plans: exportV3.plans,
    activePlanId: exportV3.activePlanId,
    planState: exportV3.planState,
  };

  it('adds the two store keys to store data and changes nothing else', () => {
    const out = migrate(v3Store, 3);
    expect(out).toEqual({ ...v3Store, activeSport: null, cooldownChecked: [] });
    expect(out.workouts).toBe(v3Store.workouts);
    expect(out.plans).toBe(v3Store.plans);
    expect(out.settings).toBe(v3Store.settings);
  });

  it('adds nothing to a backup file', () => {
    const out = migrate(v3File, 3);
    expect(out).toEqual(v3File);
    for (const key of STORE_ONLY) expect(out).not.toHaveProperty(key);
    // A backup file from any version gets none of the store's keys either.
    for (const [file, version] of [
      [exportV1, 1],
      [exportV2, 2],
    ] as const) {
      const { app: _a, version: _v, exportedAt: _x, ...data } = file;
      const up = migrate(data, version);
      for (const key of STORE_ONLY) expect(up).not.toHaveProperty(key);
    }
  });

  it('is safe to run twice, also on data that is already at version 4', () => {
    const once = migrate(v3Store, 3);
    expect(migrate(once, 3)).toEqual(once);
    expect(migrate(once, DATA_VERSION)).toEqual(once);
    const withSport = { ...once, activeSport: { id: 'x', sport: 'running' }, cooldownChecked: [1, 3] };
    expect(migrate(withSport, 3)).toEqual(withSport);
    expect(migrate(migrate(v3File, 3), 3)).toEqual(v3File);
  });

  it('keeps fields it does not know about', () => {
    const out = migrate({ ...v3Store, somethingNew: { a: 1 }, workouts: [{ ...exportV3.workouts[0], mood: 'great' }] }, 3);
    expect(out.somethingNew).toEqual({ a: 1 });
    expect((out.workouts as { mood?: string }[])[0].mood).toBe('great');
  });

  it('survives junk and leaves what it cannot read alone', () => {
    expect(migrate(null, 3)).toEqual({});
    expect(migrate('nonsense', 3)).toEqual({});
    expect(migrate([1, 2], 3)).toEqual({});
    expect(migrate({ active: 'x', activeSport: 'junk', cooldownChecked: 7 }, 3)).toEqual({
      active: 'x',
      activeSport: 'junk',
      cooldownChecked: 7,
    });
    expect(migrate({ active: undefined, workouts: 'nope' }, 3)).toEqual({
      active: undefined,
      workouts: 'nope',
      activeSport: null,
      cooldownChecked: [],
    });
    expect(() => migrate(undefined, 3)).not.toThrow();
    expect(() => migrate(Symbol('x'), 3)).not.toThrow();
  });
});

describe('loading saved data with a sport session in progress', () => {
  const base = {
    settings: exportV3.settings,
    workouts: exportV3.workouts,
    active: null,
    warmupChecked: [],
    body: exportV3.body,
    rest: null,
    plans: exportV3.plans,
    activePlanId: exportV3.activePlanId,
    planState: exportV3.planState,
  };
  const playing = {
    id: 'sp1',
    sport: 'volleyball',
    name: 'Volleyball',
    planId: 'court-ready',
    planName: 'Court-Ready',
    sessionId: 'volleyball',
    warmup: 'game',
    cooldown: 'after-playing',
    openedAt: 1794700000000,
    stage: 'playing',
    playStartedAt: 1794700600000,
    warmupChecked: [0, 1],
    cooldownChecked: [],
    warmupDone: true,
    draft: {},
  };

  async function load(state: Record<string, unknown>) {
    await AsyncStorage.clear();
    await AsyncStorage.setItem('court-ready', JSON.stringify({ state, version: DATA_VERSION }));
    await useStore.persist.rehydrate();
    return useStore.getState();
  }

  it('keeps a session of the right shape', async () => {
    const s = await load({ ...base, activeSport: playing, cooldownChecked: [0] });
    expect(s.activeSport).toEqual(playing);
    expect(s.cooldownChecked).toEqual([0]);
    expect(s.workouts).toEqual(exportV3.workouts);
  });

  it('drops a session of the wrong shape, and keeps everything else', async () => {
    for (const junk of [
      'playing',
      42,
      [playing],
      { ...playing, sport: 'curling' },
      { ...playing, stage: 'halftime' },
      { ...playing, openedAt: '2026-11-14' },
      { ...playing, playStartedAt: 'soon' },
      { ...playing, warmupChecked: null },
      { ...playing, draft: undefined },
      { id: 'sp1' },
    ]) {
      const s = await load({ ...base, activeSport: junk, cooldownChecked: 'x' });
      expect(s.activeSport).toBeNull();
      expect(s.cooldownChecked).toEqual([]);
      expect(s.workouts).toEqual(exportV3.workouts);
      expect(s.plans).toEqual(exportV3.plans);
    }
  });
});

describe('numbers worked out from sets, with and without sport sessions in history', () => {
  const withSport = exportV4.workouts as Workout[];
  const exerciseIds = [...new Set(gymOnly.flatMap((w) => w.exercises.map((e) => e.exerciseId)))];
  // More sport, mixed in at every place in history.
  const moreSport: Workout[] = [...withSport, ...sportRecords.map((w, i) => ({ ...w, id: `more-${i}`, startedAt: w.startedAt - 5 * 86_400_000 }))].sort(
    (a, b) => b.startedAt - a.startedAt,
  );
  const histories = [withSport, moreSport];

  it('has exercises to compare', () => {
    expect(exerciseIds.length).toBeGreaterThanOrEqual(3);
    expect(sportRecords.length).toBe(3);
  });

  it('volume and sets per muscle are the same', () => {
    for (const h of histories) {
      expect(h.reduce((n, w) => n + workoutVolume(w), 0)).toBe(gymOnly.reduce((n, w) => n + workoutVolume(w), 0));
      expect(muscleSets(h, (id) => EXERCISE_BY_ID[id])).toEqual(muscleSets(gymOnly, (id) => EXERCISE_BY_ID[id]));
    }
    for (const w of sportRecords) expect(workoutVolume(w)).toBe(0);
  });

  it('bests, progress points and the last performance are the same', () => {
    for (const h of histories) {
      for (const id of exerciseIds) {
        expect(exerciseBests(id, h)).toEqual(exerciseBests(id, gymOnly));
        expect(exerciseSeries(id, h)).toEqual(exerciseSeries(id, gymOnly));
        expect(lastPerformance(id, h)).toEqual(lastPerformance(id, gymOnly));
      }
    }
  });

  it('records are the same, and a sport session sets none', () => {
    const next: Workout = {
      ...gymOnly[0],
      id: 'next',
      startedAt: gymOnly[0].startedAt + 7 * 86_400_000,
      finishedAt: gymOnly[0].startedAt + 7 * 86_400_000 + 3_600_000,
      exercises: gymOnly.flatMap((w) => w.exercises).map((e) => ({ ...e, sets: e.sets.map((s) => ({ ...s, reps: (s.reps ?? 0) + 1 })) })),
    };
    const get = (id: string) => EXERCISE_BY_ID[id];
    for (const h of histories) expect(detectPRs(next, h, get)).toEqual(detectPRs(next, gymOnly, get));
    expect(detectPRs(next, gymOnly, get).length).toBeGreaterThan(0);
    for (const w of sportRecords) expect(detectPRs(w, gymOnly, get)).toEqual([]);
  });

  it('the weights a plan workout suggests are the same', () => {
    const today = '2026-11-16';
    for (const plan of exportV4.plans as Plan[]) {
      const state = (exportV4.planState as Record<string, PlanState>)[plan.id];
      for (const workout of plan.workouts) {
        const weights = (history: Workout[]) =>
          buildPlanWorkout(plan, state, workout.id, { history, today, now: 1 })!.exercises.map((e) => [
            e.exerciseId,
            e.sets.map((s) => s.weight),
          ]);
        for (const h of histories) expect(weights(h)).toEqual(weights(gymOnly));
      }
    }
  });

  it("the summary's sets are the same; sport sessions count as workouts there, as before", () => {
    for (const h of histories) {
      const a = summarizeData(h, exportV4.body as BodyEntry[]);
      const b = summarizeData(gymOnly, exportV4.body as BodyEntry[]);
      expect(a.sets).toBe(b.sets);
      expect(a.weighIns).toBe(b.weighIns);
      expect(a.workouts).toBe(h.length);
    }
  });
});
