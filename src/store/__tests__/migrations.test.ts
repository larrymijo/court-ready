import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COURT_READY_PLAN } from '@/data/plan-templates/court-ready';
import { examplePlans } from '@/data/plan-templates';
import { DATA_VERSION, isNewerData, migrate } from '@/store/migrations';
import { readSafetyCopy } from '@/store/safetyCopy';
import { useStore } from '@/store/useStore';

// Made-up backups in the shapes the app has written. Not anyone's real data.
import activeWorkout from './fixtures/active-workout.json';
import exportV1 from './fixtures/export-v1.json';
import exportV2 from './fixtures/export-v2.json';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

/** What version 1 of the app kept in the phone's storage. */
const v1State = {
  settings: exportV1.settings,
  workouts: exportV1.workouts,
  active: null,
  warmupChecked: [],
  body: exportV1.body,
  rest: null,
};

/** What version 2 kept, with a workout in progress. */
const v2State = {
  settings: exportV2.settings,
  workouts: exportV2.workouts,
  active: activeWorkout,
  warmupChecked: [0],
  body: exportV2.body,
  rest: null,
};

type AnyWorkout = { routineId?: string } & Record<string, unknown>;

/** A workout as version 3 links it: Court-Ready's routines gain the plan fields, nothing else changes. */
const linked = <W extends AnyWorkout>(w: W) =>
  w.routineId ? { ...w, planId: 'court-ready', planName: 'Court-Ready', sessionId: w.routineId } : w;

describe('migrate', () => {
  it('brings version 1 data up to date and leaves the rest alone', () => {
    expect(migrate(v1State, 1)).toEqual({
      ...v1State,
      settings: { ...exportV1.settings, lastExportAt: null },
      workouts: exportV1.workouts.map(linked),
      plans: examplePlans(),
      activePlanId: 'court-ready',
      planState: { 'court-ready': { start: '2026-10-12' } },
      activeSport: null,
      cooldownChecked: [],
    });
  });

  it('brings version 2 data up to date and leaves the rest alone', () => {
    expect(migrate(v2State, 2)).toEqual({
      ...v2State,
      workouts: exportV2.workouts.map(linked),
      active: linked(activeWorkout),
      plans: examplePlans(),
      activePlanId: 'court-ready',
      planState: { 'court-ready': { start: '2026-10-12' } },
      activeSport: null,
      cooldownChecked: [],
    });
  });

  it('is safe to run again on data that is already current', () => {
    for (const [state, version] of [
      [v1State, 1],
      [v2State, 2],
    ] as const) {
      const once = migrate(state, version);
      expect(migrate(once, DATA_VERSION)).toEqual(once);
      expect(migrate(once, 1)).toEqual(once);
      expect(migrate(once, 2)).toEqual(once);
    }
  });

  it('keeps fields it does not know about', () => {
    const out = migrate({ ...v1State, somethingNew: [1, 2], settings: { ...exportV1.settings, extra: 'x' } }, 1);
    expect(out.somethingNew).toEqual([1, 2]);
    expect((out.settings as Record<string, unknown>).extra).toBe('x');
  });

  it('leaves data from a newer app untouched', () => {
    const newer = { settings: { future: true }, workouts: [] };
    expect(isNewerData(DATA_VERSION + 1)).toBe(true);
    expect(isNewerData(DATA_VERSION)).toBe(false);
    expect(migrate(newer, DATA_VERSION + 1)).toEqual(newer);
  });

  it('treats a missing or broken version number as the first version', () => {
    expect(migrate(v1State, 0)).toEqual(migrate(v1State, 1));
    expect(migrate(v1State, Number.NaN)).toEqual(migrate(v1State, 1));
  });

  it('does not throw on unreadable data', () => {
    const empty = { settings: { lastExportAt: null }, plans: examplePlans(), activePlanId: 'court-ready', planState: {} };
    expect(migrate(null, 1)).toEqual(empty);
    expect(migrate('nonsense', 1)).toEqual(empty);
    expect(migrate([1, 2], 2)).toEqual({ plans: examplePlans(), activePlanId: 'court-ready', planState: {} });
  });
});

describe('the step to version 3', () => {
  it('links only workouts with a routineId, and only with the three fields', () => {
    const out = migrate(v2State, 2);
    const workouts = out.workouts as AnyWorkout[];
    expect(workouts).toHaveLength(exportV2.workouts.length);
    exportV2.workouts.forEach((before, i) => {
      const after = workouts[i];
      if ('routineId' in before) {
        expect(after).toEqual({ ...before, planId: 'court-ready', planName: 'Court-Ready', sessionId: before.routineId });
        expect(Object.keys(after).filter((k) => !(k in before)).sort()).toEqual(['planId', 'planName', 'sessionId']);
      } else {
        expect(after).toEqual(before);
        expect(after).not.toHaveProperty('planId');
      }
    });
    expect(out.active).toEqual({ ...activeWorkout, planId: 'court-ready', planName: 'Court-Ready', sessionId: 'lower' });
    // The old fields stay for one more release.
    expect((out.settings as { programStart: string }).programStart).toBe('2026-10-12');
    expect(workouts.map((w) => w.routineId)).toEqual(exportV2.workouts.map((w) => ('routineId' in w ? w.routineId : undefined)));
  });

  it('does not add a workout in progress to a backup file', () => {
    const file = { settings: exportV2.settings, workouts: exportV2.workouts, body: exportV2.body };
    expect(migrate(file, 2)).not.toHaveProperty('active');
    expect(migrate({ ...file, active: null }, 2).active).toBeNull();
  });

  it('keeps plan data that is already there', () => {
    const plans = [{ id: 'mine', name: 'Mine', workouts: [], sports: [], week: [] }];
    const planState = { mine: { start: '2026-11-02' } };
    const out = migrate({ ...v2State, plans, activePlanId: 'mine', planState }, 2);
    expect(out.plans).toBe(plans);
    expect(out.activePlanId).toBe('mine');
    expect(out.planState).toBe(planState);
  });

  it('replaces plan data of the wrong basic type', () => {
    const out = migrate({ ...v2State, plans: { a: 1 }, activePlanId: 7, planState: [] }, 2);
    expect(out.plans).toEqual(examplePlans());
    expect(out.activePlanId).toBe('court-ready');
    expect(out.planState).toEqual({ 'court-ready': { start: '2026-10-12' } });
  });

  it('leaves a workout that already has a plan alone', () => {
    const w = { ...exportV2.workouts[0], planId: 'muscle-mass', planName: 'Muscle Mass Building', sessionId: 'mm-push' };
    expect((migrate({ workouts: [w] }, 2).workouts as unknown[])[0]).toBe(w);
  });

  it('keeps fields of workouts it does not know about', () => {
    const w = { ...exportV2.workouts[0], mood: 'great', exercises: [{ ...exportV2.workouts[0].exercises[0], tempo: '3-1-1' }] };
    expect((migrate({ workouts: [w] }, 2).workouts as unknown[])[0]).toEqual({
      ...w,
      planId: 'court-ready',
      planName: 'Court-Ready',
      sessionId: 'upperb',
    });
  });

  it('does not throw on unreadable parts, and leaves them alone', () => {
    const odd = [null, 3, 'text', [1], { name: 'No routine' }, { routineId: 5 }];
    const out = migrate({ workouts: odd, active: 'running', settings: [1], body: 'x' }, 2);
    expect(out.workouts).toEqual(odd);
    expect(out.active).toBe('running');
    expect(out.settings).toEqual([1]);
    expect(out.body).toBe('x');
    expect(out.planState).toEqual({});
    expect(migrate({ workouts: 'nope', settings: { programStart: 20261012 } }, 2)).toMatchObject({
      workouts: 'nope',
      planState: {},
    });
    expect(() => migrate(undefined, 2)).not.toThrow();
    expect(() => migrate(42, 1)).not.toThrow();
  });

  it('saves copies of the examples, never the templates themselves', () => {
    const a = migrate(v2State, 2).plans as typeof COURT_READY_PLAN[];
    const b = migrate(v2State, 2).plans as typeof COURT_READY_PLAN[];
    expect(a[0]).toEqual(COURT_READY_PLAN);
    expect(a[0]).not.toBe(COURT_READY_PLAN);
    expect(a[0].workouts[0]).not.toBe(b[0].workouts[0]);
    a[0].workouts[0].items[0].sets = 99;
    expect(COURT_READY_PLAN.workouts[0].items[0].sets).not.toBe(99);
    expect(b[0].workouts[0].items[0].sets).not.toBe(99);
  });
});

describe('backup files', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useStore.getState().resetAll();
  });

  it('imports a version 1 backup', () => {
    expect(useStore.getState().importData(JSON.stringify(exportV1))).toEqual({ ok: true, workouts: 2 });
    const state = useStore.getState();
    expect(state.workouts).toEqual(exportV1.workouts.map(linked));
    expect(state.body).toEqual(exportV1.body);
    // The phone holds what the file holds, so it counts as backed up when the file was made.
    expect(state.settings).toEqual({ ...exportV1.settings, lastExportAt: Date.parse(exportV1.exportedAt) });
    expect(state.plans).toEqual(examplePlans());
    expect(state.activePlanId).toBe('court-ready');
    expect(state.planState).toEqual({ 'court-ready': { start: '2026-10-12' } });
  });

  it('exports at the current version, and that file imports back the same', () => {
    useStore.getState().importData(JSON.stringify(exportV1));
    const before = useStore.getState();
    const file = before.exportData();
    expect(JSON.parse(file)).toMatchObject({ app: 'court-ready', version: DATA_VERSION });

    useStore.getState().resetAll();
    expect(useStore.getState().workouts).toEqual([]);
    expect(useStore.getState().importData(file)).toEqual({ ok: true, workouts: 2 });
    const after = useStore.getState();
    expect(after.workouts).toEqual(before.workouts);
    expect(after.body).toEqual(before.body);
    expect({ ...after.settings, lastExportAt: null }).toEqual({ ...before.settings, lastExportAt: null });
    expect(after.plans).toEqual(before.plans);
    expect(after.activePlanId).toBe(before.activePlanId);
    expect(after.planState).toEqual(before.planState);
  });

  it('refuses a backup from a newer app and keeps what is on the phone', () => {
    useStore.getState().importData(JSON.stringify(exportV1));
    const res = useStore.getState().importData(JSON.stringify({ ...exportV1, version: DATA_VERSION + 1, workouts: [] }));
    expect(res.ok).toBe(false);
    expect(useStore.getState().workouts).toHaveLength(2);
  });

  it('refuses text that is not a backup', () => {
    expect(useStore.getState().importData('not json').ok).toBe(false);
    expect(useStore.getState().importData(JSON.stringify({ app: 'something-else', workouts: [], body: [] })).ok).toBe(false);
  });
});

describe('data saved on the phone by version 1', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    await AsyncStorage.setItem('court-ready', JSON.stringify({ state: v1State, version: 1 }));
    await useStore.persist.rehydrate();
  });

  it('is upgraded when the app loads', async () => {
    const state = useStore.getState();
    expect(state.workouts).toEqual(exportV1.workouts.map(linked));
    expect(state.body).toEqual(exportV1.body);
    expect(state.settings).toEqual({ ...exportV1.settings, lastExportAt: null });

    const saved = JSON.parse((await AsyncStorage.getItem('court-ready')) ?? '{}');
    expect(saved.version).toBe(DATA_VERSION);
    expect(saved.state.workouts).toEqual(exportV1.workouts.map(linked));
    expect(saved.state.plans).toEqual(examplePlans());
    expect(saved.state.activePlanId).toBe('court-ready');
    expect(saved.state.planState).toEqual({ 'court-ready': { start: '2026-10-12' } });
  });

  it('is kept as a copy that can be put back', async () => {
    const copy = await readSafetyCopy();
    expect(copy?.version).toBe(1);
    expect(copy?.state).toEqual(v1State);

    useStore.getState().deleteWorkout(exportV1.workouts[0].id);
    expect(useStore.getState().workouts).toHaveLength(1);
    expect(await useStore.getState().restoreSafetyCopy()).toEqual({ ok: true, workouts: 2 });
    expect(useStore.getState().workouts).toEqual(exportV1.workouts.map(linked));
  });
});

describe('with nothing saved yet', () => {
  it('starts empty and has no copy to put back', async () => {
    await AsyncStorage.clear();
    useStore.getState().resetAll();
    await AsyncStorage.clear();
    expect(await readSafetyCopy()).toBeNull();
    expect((await useStore.getState().restoreSafetyCopy()).ok).toBe(false);
  });
});
