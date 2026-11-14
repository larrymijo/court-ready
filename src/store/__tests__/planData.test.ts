import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COURT_READY_PLAN } from '@/data/plan-templates/court-ready';
import { DEFINITION_PLAN } from '@/data/plan-templates/definition';
import { EXAMPLE_PLAN_IDS, examplePlan, examplePlans } from '@/data/plan-templates';
import { MUSCLE_MASS_PLAN } from '@/data/plan-templates/muscle-mass';
import { addDaysISO, mondayOfISO, todayISO } from '@/lib/dates';
import type { Plan, Workout, WorkoutSet } from '@/lib/types';
import { normalizePlanData } from '@/store/planData';
import { useStore } from '@/store/useStore';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const TODAY = '2026-11-14'; // a Saturday
const MONDAY = '2026-11-09';
const mine: Plan = { id: 'mine', name: 'Mine', workouts: [], sports: [], week: [], progression: 'progress' };

describe('example plans', () => {
  it('come in list order', () => {
    expect(EXAMPLE_PLAN_IDS).toEqual(['court-ready', 'muscle-mass', 'definition']);
    expect(examplePlans()).toEqual([COURT_READY_PLAN, MUSCLE_MASS_PLAN, DEFINITION_PLAN]);
  });

  it('are fresh deep copies every time', () => {
    const a = examplePlans();
    const b = examplePlans();
    expect(a[1]).not.toBe(MUSCLE_MASS_PLAN);
    expect(a[1].workouts[0].items[0]).not.toBe(b[1].workouts[0].items[0]);
    a[1].workouts[0].items[0].sets = 99;
    a[0].name = 'Changed';
    expect(MUSCLE_MASS_PLAN.workouts[0].items[0].sets).toBe(4);
    expect(COURT_READY_PLAN.name).toBe('Court-Ready');
    expect(examplePlans()[1].workouts[0].items[0].sets).toBe(4);
  });

  it('can be had one at a time', () => {
    expect(examplePlan('definition')).toEqual(DEFINITION_PLAN);
    expect(examplePlan('definition')).not.toBe(DEFINITION_PLAN);
    expect(examplePlan('mine')).toBeUndefined();
    expect(examplePlan('toString')).toBeUndefined();
  });
});

describe('normalizePlanData', () => {
  const good = { plans: examplePlans(), activePlanId: 'muscle-mass', planState: { 'muscle-mass': { start: '2026-11-02' } } };

  it('leaves usable plan data as it is', () => {
    expect(normalizePlanData(good, '2026-10-12', TODAY)).toEqual(good);
  });

  it('uses the examples when there is no readable plan', () => {
    for (const plans of [undefined, null, 'x', {}, [], [null, 3, { id: 'a' }, { id: 'b', name: 'B', workouts: [], sports: [] }]]) {
      const out = normalizePlanData({ plans }, '2026-10-12', TODAY);
      expect(out.plans).toEqual(examplePlans());
      expect(out.activePlanId).toBe('court-ready');
      expect(out.planState).toEqual({ 'court-ready': { start: '2026-10-12' } });
    }
  });

  it('drops entries that are not plans, and leaves a list without an example alone', () => {
    const mm = examplePlan('muscle-mass')!;
    const out = normalizePlanData({ plans: [mm, { id: 1 }, 'x', mine], activePlanId: 'mine' }, '2026-10-12', TODAY);
    expect(out.plans).toEqual([mm, mine]);
    expect(out.activePlanId).toBe('mine');
  });

  it('makes the active plan one that is saved', () => {
    expect(normalizePlanData({ ...good, activePlanId: 'gone' }, '2026-10-12', TODAY).activePlanId).toBe('court-ready');
    expect(normalizePlanData({ ...good, activePlanId: 3 }, '2026-10-12', TODAY).activePlanId).toBe('court-ready');
    const noCourtReady = { plans: [examplePlan('definition')!, mine], activePlanId: 'gone' };
    expect(normalizePlanData(noCourtReady, '2026-10-12', TODAY).activePlanId).toBe('definition');
  });

  it('gives an active plan without a start one: Court-Ready the 12-week start, others this Monday', () => {
    expect(normalizePlanData({ plans: examplePlans(), activePlanId: 'court-ready' }, '2026-10-12', TODAY).planState).toEqual({
      'court-ready': { start: '2026-10-12' },
    });
    const other = normalizePlanData(
      { plans: examplePlans(), activePlanId: 'definition', planState: { definition: { leftAtWeek: 3 }, 'court-ready': { start: '2026-10-12' } } },
      '2026-10-12',
      TODAY,
    );
    expect(other.planState).toEqual({ definition: { leftAtWeek: 3, start: MONDAY }, 'court-ready': { start: '2026-10-12' } });
    const badStart = normalizePlanData({ ...good, planState: { 'muscle-mass': { start: 5 } } }, '2026-10-12', TODAY);
    expect(badStart.planState['muscle-mass']).toEqual({ start: MONDAY });
    const notObject = normalizePlanData({ ...good, planState: 'x' }, '2026-10-12', TODAY);
    expect(notObject.planState).toEqual({ 'muscle-mass': { start: MONDAY } });
  });

  it('does not change other plans’ states or what it was given', () => {
    const input = {
      plans: examplePlans(),
      activePlanId: 'court-ready',
      planState: { definition: { start: 'odd' }, extra: 1 } as Record<string, unknown>,
    };
    const copy = JSON.parse(JSON.stringify(input));
    const out = normalizePlanData(input, '2026-10-12', TODAY);
    expect(out.planState).toEqual({ definition: { start: 'odd' }, extra: 1, 'court-ready': { start: '2026-10-12' } });
    expect(input).toEqual(copy);
  });
});

describe('plan defaults', () => {
  it('a new install starts with the examples and Court-Ready active, without an upgrade', async () => {
    let store: typeof useStore | undefined;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      store = (require('@/store/useStore') as { useStore: typeof useStore }).useStore;
    });
    const check = () => {
      const s = store!.getState();
      expect(s.plans).toEqual(examplePlans());
      expect(s.activePlanId).toBe('court-ready');
      expect(s.settings.programStart).toBe(mondayOfISO(todayISO()));
      expect(s.planState).toEqual({ 'court-ready': { start: s.settings.programStart } });
      expect(s.workouts).toEqual([]);
    };
    check();
    await store!.persist.rehydrate();
    check();
  });

  it('reset returns to them', async () => {
    await AsyncStorage.clear();
    useStore.setState({ plans: [mine], activePlanId: 'mine', planState: { mine: { start: '2026-01-05' } } });
    useStore.getState().resetAll();
    const s = useStore.getState();
    expect(s.plans).toEqual(examplePlans());
    expect(s.activePlanId).toBe('court-ready');
    expect(s.planState).toEqual({ 'court-ready': { start: mondayOfISO(todayISO()) } });
    expect(s.settings.programStart).toBe(mondayOfISO(todayISO()));
  });
});

describe('start dates', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useStore.getState().resetAll();
  });

  it('a programStart in the settings also moves Court-Ready', () => {
    useStore.getState().setPlanStart('muscle-mass', '2026-11-02');
    useStore.getState().updateSettings({ programStart: '2026-10-12' });
    expect(useStore.getState().settings.programStart).toBe('2026-10-12');
    expect(useStore.getState().planState).toEqual({
      'court-ready': { start: '2026-10-12' },
      'muscle-mass': { start: '2026-11-02' },
    });
    const before = useStore.getState().planState;
    useStore.getState().updateSettings({ vibrate: false });
    expect(useStore.getState().planState).toBe(before);
  });

  it('setPlanStart writes the plan’s start, and for Court-Ready the setting too', () => {
    useStore.setState({ planState: { 'court-ready': { start: '2026-10-12', leftAtWeek: 4 } } });
    useStore.getState().setPlanStart('court-ready', '2026-11-02');
    expect(useStore.getState().planState['court-ready']).toEqual({ start: '2026-11-02', leftAtWeek: 4 });
    expect(useStore.getState().settings.programStart).toBe('2026-11-02');

    useStore.getState().setPlanStart('definition', '2026-11-09');
    expect(useStore.getState().planState.definition).toEqual({ start: '2026-11-09' });
    expect(useStore.getState().settings.programStart).toBe('2026-11-02');
  });
});

const doneSet = (weight: number, reps: number): WorkoutSet => ({ id: `s${weight}${reps}`, type: 'normal', weight, reps, rir: 1, done: true });
const history = (exerciseId: string, sets: WorkoutSet[]): Workout => ({
  id: `h-${exerciseId}`,
  name: 'Earlier',
  startedAt: 1793000000000,
  finishedAt: 1793003600000,
  exercises: [{ id: 'he', exerciseId, restSec: 90, sets, pain: null, note: '' }],
});

describe('startPlanWorkout', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useStore.getState().resetAll();
  });

  it('starts a Court-Ready workout with its plan fields and routineId', () => {
    expect(useStore.getState().startPlanWorkout('court-ready', 'lower', { gameMode: true })).toBe(true);
    const w = useStore.getState().active!;
    expect(w).toMatchObject({
      name: 'Lower + Core (game mode)',
      planId: 'court-ready',
      planName: 'Court-Ready',
      sessionId: 'lower',
      routineId: 'lower',
      gameMode: true,
      week: 1,
      phase: 'learn',
    });
    expect(w.finishedAt).toBeUndefined();
  });

  it('writes no routineId outside Court-Ready, and no game mode where the workout has none', () => {
    expect(useStore.getState().startPlanWorkout('muscle-mass', 'mm-push', { gameMode: true })).toBe(true);
    const w = useStore.getState().active!;
    expect(w).toMatchObject({ name: 'Push', planId: 'muscle-mass', planName: 'Muscle Mass Building', sessionId: 'mm-push', gameMode: false });
    expect(w).not.toHaveProperty('routineId');

    // A plan of your own with a workout called like a routine is still not Court-Ready.
    const copy = { ...examplePlan('court-ready')!, id: 'copy', name: 'My copy' };
    useStore.setState({ plans: [...useStore.getState().plans, copy] });
    expect(useStore.getState().startPlanWorkout('copy', 'uppera')).toBe(true);
    expect(useStore.getState().active).toMatchObject({ planId: 'copy', planName: 'My copy', sessionId: 'uppera' });
    expect(useStore.getState().active).not.toHaveProperty('routineId');
  });

  it('copies the plan’s name as it is now', () => {
    useStore.setState({ plans: useStore.getState().plans.map((p) => (p.id === 'definition' ? { ...p, name: 'Cut' } : p)) });
    useStore.getState().startPlanWorkout('definition', 'def-upper');
    expect(useStore.getState().active!.planName).toBe('Cut');
  });

  it('counts a plan without a state as not started, and does not create one', () => {
    useStore.getState().startPlanWorkout('muscle-mass', 'mm-legs');
    expect(useStore.getState().active).toMatchObject({ week: 1, phase: 'build' });
    expect(useStore.getState().planState).not.toHaveProperty('muscle-mass');
  });

  it('takes week and phase from the plan’s own position', () => {
    // Week 6 of Muscle Mass Building is its lighter week.
    useStore.getState().setPlanStart('muscle-mass', addDaysISO(mondayOfISO(todayISO()), -35));
    useStore.getState().startPlanWorkout('muscle-mass', 'mm-push');
    expect(useStore.getState().active).toMatchObject({ week: 6, phase: 'deload' });
    expect(useStore.getState().active!.exercises[0].target).toMatchObject({ sets: 2, rir: '3–4' });
  });

  it('starts a maintain plan with last time’s top weight, where a progress plan goes up', () => {
    useStore.setState({ workouts: [history('benchpress', [doneSet(60, 10), doneSet(57.5, 10), doneSet(60, 10)])] });
    useStore.getState().startPlanWorkout('definition', 'def-upper');
    const kept = useStore.getState().active!.exercises.find((e) => e.exerciseId === 'benchpress')!;
    expect(kept.sets.map((s) => s.weight)).toEqual([60, 60, 60]);

    useStore.setState({ workouts: [history('benchpress', [doneSet(60, 10), doneSet(60, 10)])] });
    useStore.getState().startPlanWorkout('muscle-mass', 'mm-push');
    const raised = useStore.getState().active!.exercises.find((e) => e.exerciseId === 'benchpress')!;
    expect(raised.sets[0].weight).toBeGreaterThan(60);
  });

  it('returns false, and starts nothing, for a plan or workout that is not saved', () => {
    expect(useStore.getState().startPlanWorkout('gone', 'uppera')).toBe(false);
    expect(useStore.getState().startPlanWorkout('court-ready', 'gone')).toBe(false);
    expect(useStore.getState().active).toBeNull();
  });
});

describe('startRoutine and startEmpty', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useStore.getState().resetAll();
  });

  it('startRoutine uses the template when Court-Ready is not saved', () => {
    useStore.setState({ plans: [examplePlan('definition')!], activePlanId: 'definition' });
    useStore.getState().startRoutine('upperb');
    expect(useStore.getState().active).toMatchObject({ name: 'Upper B', routineId: 'upperb', planId: 'court-ready', sessionId: 'upperb' });
  });

  it('startEmpty follows the active plan’s week and sets no plan fields', () => {
    useStore.setState({ activePlanId: 'muscle-mass' });
    useStore.getState().setPlanStart('muscle-mass', addDaysISO(mondayOfISO(todayISO()), -35));
    useStore.getState().startEmpty();
    const w = useStore.getState().active!;
    expect(w).toMatchObject({ name: 'Workout', week: 6, phase: 'deload', exercises: [] });
    for (const key of ['planId', 'planName', 'sessionId', 'routineId']) expect(w).not.toHaveProperty(key);
  });
});
