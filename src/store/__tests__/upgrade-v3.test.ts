// Phase 3's data checks: made-up data of versions 1 and 2 upgrades to version 3 with nothing lost,
// both from a backup file and from what the phone saved, and "Go back to that copy" undoes it.
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COURT_READY_PLAN } from '@/data/plan-templates/court-ready';
import { examplePlans } from '@/data/plan-templates';
import { summarizeData, summaryLines } from '@/lib/dataSummary';
import { addDaysISO } from '@/lib/dates';
import { planPosition } from '@/lib/plans';
import * as legacy from '@/lib/__fixtures__/legacy-program';
import type { BodyEntry, Workout } from '@/lib/types';
import { DATA_VERSION } from '@/store/migrations';
import { useStore } from '@/store/useStore';

// Made-up data. Not anyone's real backup.
import activeWorkout from './fixtures/active-workout.json';
import exportV1 from './fixtures/export-v1.json';
import exportV2 from './fixtures/export-v2.json';
import exportV3 from './fixtures/export-v3.json';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

type File = { settings: { programStart: string }; workouts: unknown[]; body: unknown[]; exportedAt: string };

const LINK = ['planId', 'planName', 'sessionId'];

/** The workout as the upgrade must leave it. */
function expectedAfter(w: Workout): Workout {
  return w.routineId ? { ...w, planId: 'court-ready', planName: 'Court-Ready', sessionId: w.routineId } : w;
}

/** What the owner compares before and after: counts, sets, records, weigh-ins and the summary lines. */
function numbers(workouts: Workout[], body: BodyEntry[]) {
  const summary = summarizeData(workouts, body);
  return {
    workouts: workouts.length,
    summary,
    lines: summaryLines(summary),
    prs: workouts.flatMap((w) => w.prs ?? []),
    weighIns: body.length,
  };
}

function expectLinked(before: Workout[], after: Workout[]) {
  expect(after).toHaveLength(before.length);
  before.forEach((b, i) => {
    const a = after[i];
    expect(a).toEqual(expectedAfter(b));
    const added = Object.keys(a).filter((k) => !(k in b)).sort();
    expect(added).toEqual(b.routineId ? LINK : []);
  });
}

function expectSameWeeks(start: string) {
  const plan = useStore.getState().plans.find((p) => p.id === 'court-ready')!;
  const state = useStore.getState().planState['court-ready'];
  for (let day = -10; day <= 7 * 40; day += 3) {
    const d = addDaysISO(start, day);
    const old = legacy.programPosition(start, d);
    expect(planPosition(plan, state, d)).toEqual(old);
  }
}

const FILES: [string, unknown, number][] = [
  ['version 1', exportV1, 1],
  ['version 2', exportV2, 2],
];

// The fixtures must cover what the upgrade treats differently.
it('the made-up data covers a workout without a routine, records and a workout in progress', () => {
  const all = [...exportV1.workouts, ...exportV2.workouts] as Workout[];
  expect(all.some((w) => !w.routineId && w.finishedAt)).toBe(true);
  expect(all.some((w) => (w.prs ?? []).length > 0)).toBe(true);
  expect(activeWorkout.routineId).toBe('lower');
  expect(activeWorkout).not.toHaveProperty('finishedAt');
});

describe.each(FILES)('made-up %s data', (_name, fileJson, version) => {
  const file = fileJson as unknown as File;
  const workouts = file.workouts as Workout[];
  const body = file.body as BodyEntry[];

  describe('imported from a backup file', () => {
    beforeEach(async () => {
      await AsyncStorage.clear();
      useStore.getState().resetAll();
      expect(useStore.getState().importData(JSON.stringify(file))).toEqual({ ok: true, workouts: workouts.length });
    });

    it('keeps every workout, set, record and weigh-in, and the same summary', () => {
      const s = useStore.getState();
      expect(numbers(s.workouts, s.body)).toEqual(numbers(workouts, body));
    });

    it('links the Court-Ready workouts and changes nothing else', () => {
      expectLinked(workouts, useStore.getState().workouts);
      expect(useStore.getState().body).toEqual(body);
    });

    it('makes Court-Ready the active plan with the 12-week start', () => {
      const s = useStore.getState();
      expect(s.plans).toEqual(examplePlans());
      expect(s.activePlanId).toBe('court-ready');
      expect(s.planState).toEqual({ 'court-ready': { start: file.settings.programStart } });
      expect(s.settings.programStart).toBe(file.settings.programStart);
      expectSameWeeks(file.settings.programStart);
    });
  });

  describe('saved on the phone', () => {
    const saved = {
      settings: file.settings,
      workouts,
      active: activeWorkout,
      warmupChecked: [0, 2],
      body,
      rest: null,
    };

    beforeEach(async () => {
      await AsyncStorage.clear();
      await AsyncStorage.setItem('court-ready', JSON.stringify({ state: saved, version }));
      await useStore.persist.rehydrate();
    });

    it('keeps every workout, set, record and weigh-in, and the same summary', () => {
      const s = useStore.getState();
      expect(numbers(s.workouts, s.body)).toEqual(numbers(workouts, body));
    });

    it('links the Court-Ready workouts and the one in progress, and changes nothing else', () => {
      const s = useStore.getState();
      expectLinked(workouts, s.workouts);
      expectLinked([activeWorkout as Workout], [s.active!]);
      expect(s.warmupChecked).toEqual([0, 2]);
      expect(s.body).toEqual(body);
    });

    it('makes Court-Ready the active plan, keeps the week, and saves it all at version 3', async () => {
      const s = useStore.getState();
      expect(s.plans).toEqual(examplePlans());
      expect(s.activePlanId).toBe('court-ready');
      expect(s.planState['court-ready'].start).toBe(s.settings.programStart);
      expect(s.settings.programStart).toBe(file.settings.programStart);
      expectSameWeeks(file.settings.programStart);

      const stored = JSON.parse((await AsyncStorage.getItem('court-ready')) ?? '{}');
      expect(stored.version).toBe(DATA_VERSION);
      expect(stored.state.plans).toEqual(examplePlans());
      expect(stored.state.activePlanId).toBe('court-ready');
      expect(stored.state.planState).toEqual({ 'court-ready': { start: file.settings.programStart } });
      expect(stored.state.workouts).toEqual(workouts.map(expectedAfter));
    });
  });
});

describe('"Go back to that copy" after the upgrade from version 2', () => {
  const saved = {
    settings: exportV2.settings,
    workouts: exportV2.workouts,
    active: activeWorkout,
    warmupChecked: [1],
    body: exportV2.body,
    rest: null,
  };

  beforeEach(async () => {
    await AsyncStorage.clear();
    await AsyncStorage.setItem('court-ready', JSON.stringify({ state: saved, version: 2 }));
    await useStore.persist.rehydrate();
  });

  it('returns the data from before the update, and no plan change made since', async () => {
    const s = useStore.getState();
    // Changes made after the update.
    s.deleteWorkout(exportV2.workouts[0].id);
    s.logBody({ date: '2026-11-13', weight: 77 });
    s.updateSettings({ vibrate: true, programStart: '2026-11-02' });
    s.setPlanStart('muscle-mass', '2026-11-09');
    s.discardWorkout();
    useStore.setState({
      activePlanId: 'muscle-mass',
      plans: useStore.getState().plans.filter((p) => p.id !== 'definition').map((p) => ({ ...p, name: `${p.name}!` })),
    });

    expect(await useStore.getState().restoreSafetyCopy()).toEqual({ ok: true, workouts: exportV2.workouts.length });
    const after = useStore.getState();
    expect(after.workouts).toEqual((exportV2.workouts as Workout[]).map(expectedAfter));
    expect(after.body).toEqual(exportV2.body);
    expect(after.settings).toEqual(exportV2.settings);
    expect(after.active).toEqual(expectedAfter(activeWorkout as Workout));
    expect(after.warmupChecked).toEqual([1]);
    expect(after.plans).toEqual(examplePlans());
    expect(after.activePlanId).toBe('court-ready');
    expect(after.planState).toEqual({ 'court-ready': { start: exportV2.settings.programStart } });
  });
});

describe('a version 3 backup', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useStore.getState().resetAll();
  });

  it('is made-up data of the right shape', () => {
    expect(exportV3.version).toBe(3);
    const ws = exportV3.workouts as Workout[];
    expect(ws.some((w) => w.planId === 'court-ready' && w.routineId === 'uppera')).toBe(true);
    expect(ws.some((w) => w.planId === 'muscle-mass' && !('routineId' in w))).toBe(true);
    expect(ws.some((w) => !('planId' in w))).toBe(true);
    expect(exportV3.activePlanId).not.toBe('court-ready');
    expect(Object.keys(exportV3.planState)).toHaveLength(2);
  });

  it('imports and exports again with nothing changed', () => {
    expect(useStore.getState().importData(JSON.stringify(exportV3))).toEqual({ ok: true, workouts: 3 });
    const s = useStore.getState();
    expect(s.activePlanId).toBe('muscle-mass');
    expect(s.planState).toEqual(exportV3.planState);
    const out = JSON.parse(s.exportData());
    expect(out.exportedAt).not.toBe(exportV3.exportedAt);
    expect({ ...out, exportedAt: exportV3.exportedAt }).toEqual(exportV3);
  });

  it('does not reach the templates when the imported plans change', () => {
    useStore.getState().importData(JSON.stringify(exportV3));
    const cr = useStore.getState().plans.find((p) => p.id === 'court-ready')!;
    expect(cr).toEqual(COURT_READY_PLAN);
    expect(cr).not.toBe(COURT_READY_PLAN);
  });

  it('still imports when its plan data is broken, and the plan data is made usable', () => {
    const broken = { ...exportV3, plans: 'nonsense', activePlanId: 42, planState: null };
    expect(useStore.getState().importData(JSON.stringify(broken))).toEqual({ ok: true, workouts: 3 });
    const s = useStore.getState();
    expect(s.workouts).toEqual(exportV3.workouts);
    expect(s.plans).toEqual(examplePlans());
    expect(s.activePlanId).toBe('court-ready');
    expect(s.planState).toEqual({ 'court-ready': { start: exportV3.settings.programStart } });
  });

  it("sets the old programStart to Court-Ready's start when a hand-edited file has them differ", () => {
    const edited = { ...exportV3, settings: { ...exportV3.settings, programStart: '2026-08-03' } };
    expect(useStore.getState().importData(JSON.stringify(edited))).toEqual({ ok: true, workouts: 3 });
    const s = useStore.getState();
    expect(s.planState).toEqual(exportV3.planState);
    expect(s.settings.programStart).toBe(exportV3.planState['court-ready'].start);
    expect(s.settings).toEqual({ ...edited.settings, programStart: '2026-10-12', lastExportAt: Date.parse(exportV3.exportedAt) });
  });

  it('leaves the old programStart as the file has it when Court-Ready has no state', () => {
    const { 'court-ready': _cr, ...rest } = exportV3.planState;
    const noCr = {
      ...exportV3,
      settings: { ...exportV3.settings, programStart: '2026-08-03' },
      plans: exportV3.plans.filter((p) => p.id !== 'court-ready'),
      planState: rest,
    };
    expect(useStore.getState().importData(JSON.stringify(noCr)).ok).toBe(true);
    expect(useStore.getState().planState).not.toHaveProperty('court-ready');
    expect(useStore.getState().settings.programStart).toBe('2026-08-03');
  });

  it("sets the old programStart to Court-Ready's start when saved data on the phone has them differ", async () => {
    const saved = {
      settings: { ...exportV3.settings, programStart: '2026-08-03' },
      workouts: exportV3.workouts,
      active: null,
      warmupChecked: [],
      body: exportV3.body,
      rest: null,
      plans: exportV3.plans,
      activePlanId: exportV3.activePlanId,
      planState: exportV3.planState,
    };
    await AsyncStorage.setItem('court-ready', JSON.stringify({ state: saved, version: 3 }));
    await useStore.persist.rehydrate();
    const s = useStore.getState();
    expect(s.activePlanId).toBe('muscle-mass');
    expect(s.planState).toEqual(exportV3.planState);
    expect(s.settings).toEqual({ ...saved.settings, programStart: '2026-10-12' });
    expect(s.workouts).toEqual(exportV3.workouts);
  });

  it('keeps the readable plans of a partly broken file', () => {
    const mm = exportV3.plans.find((p) => p.id === 'muscle-mass')!;
    const partly = { ...exportV3, plans: [{ id: 'bad' }, mm, 'x'], activePlanId: 'gone' };
    expect(useStore.getState().importData(JSON.stringify(partly)).ok).toBe(true);
    const s = useStore.getState();
    expect(s.plans).toEqual([mm]);
    expect(s.activePlanId).toBe('muscle-mass');
    expect(s.planState).toEqual(exportV3.planState);
  });
});
