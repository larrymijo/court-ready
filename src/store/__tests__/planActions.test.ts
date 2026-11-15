// The plan actions of the store: activatePlan, deletePlan, restoreExamples. Made-up data only.
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { examplePlans } from '@/data/plan-templates';
import { addDaysISO } from '@/lib/dates';
import { planPosition } from '@/lib/plans';
import type { Plan, Workout } from '@/lib/types';
import { DATA_VERSION } from '@/store/migrations';
import { useStore } from '@/store/useStore';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

/** Wednesday of week 4 of a Court-Ready that started on Monday 19 Oct 2026. */
const CR_START = '2026-10-19';
const WED = '2026-11-11';

function at(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  jest.setSystemTime(new Date(y, m - 1, d, 12, 0, 0));
}

function historyWorkout(id: string, planId: string, sessionId: string): Workout {
  return {
    id,
    name: sessionId,
    planId,
    planName: 'A made-up name',
    sessionId,
    startedAt: new Date(2026, 10, 9, 18).getTime(),
    finishedAt: new Date(2026, 10, 9, 19).getTime(),
    exercises: [],
  };
}

function reset(crStart: string = CR_START) {
  useStore.getState().resetAll();
  useStore.setState({
    settings: { ...useStore.getState().settings, programStart: crStart },
    planState: { 'court-ready': { start: crStart } },
  });
}

const state = () => useStore.getState();
const crPos = (day: string) => planPosition(state().plans.find((p) => p.id === 'court-ready') as Plan, state().planState['court-ready'], day);

beforeEach(() => {
  jest.useFakeTimers({ now: new Date(2026, 10, 11, 12) });
  reset();
});
afterEach(() => {
  jest.useRealTimers();
});

describe('data version', () => {
  it('stays at 3', () => {
    expect(DATA_VERSION).toBe(3);
  });
});

describe('activatePlan', () => {
  it('pauses the plan it leaves with the weeks since its start, and starts a plan without state this week', () => {
    expect(state().activatePlan('definition', 'continue')).toBe(true);
    expect(state().activePlanId).toBe('definition');
    expect(state().planState['court-ready']).toEqual({ start: CR_START, leftAtWeek: 4 });
    expect(state().planState.definition).toEqual({ start: '2026-11-09' });
  });

  it('refuses an unknown plan or a bad date and changes nothing', () => {
    const before = JSON.stringify(state().planState);
    expect(state().activatePlan('nope', 'continue')).toBe(false);
    expect(state().activatePlan('definition', '2026-13-45')).toBe(false);
    expect(state().activatePlan('definition', 'soon')).toBe(false);
    expect(JSON.stringify(state().planState)).toBe(before);
    expect(state().activePlanId).toBe('court-ready');
  });

  it('puts Court-Ready back in the same week and phase: same week', () => {
    const left = crPos(WED);
    state().activatePlan('definition', 'continue');
    state().activatePlan('court-ready', 'continue');
    expect(crPos(WED)).toEqual(left);
    expect(left).toMatchObject({ week: 4, phase: 'build' });
    expect(state().planState['court-ready']).toEqual({ start: CR_START });
    expect(state().settings.programStart).toBe(CR_START);
    expect(state().planState.definition.leftAtWeek).toBe(1);
  });

  it('puts Court-Ready back in the same week and phase: weeks later', () => {
    const left = crPos(WED);
    state().activatePlan('definition', 'continue');
    at('2026-12-02'); // three weeks later
    state().activatePlan('court-ready', 'continue');
    expect(state().planState['court-ready']).toEqual({ start: '2026-11-09' });
    expect(crPos('2026-12-02')).toEqual(left);
    expect(state().settings.programStart).toBe('2026-11-09');
    expect(state().planState.definition.leftAtWeek).toBe(4);
  });

  it('puts Court-Ready back in the same week and phase: in the second pass through its cycle', () => {
    reset('2026-08-17'); // 13th week today: week 3 of cycle 2
    const left = crPos(WED);
    expect(left).toMatchObject({ week: 3, cycle: 2 });
    state().activatePlan('muscle-mass', 'continue');
    expect(state().planState['court-ready'].leftAtWeek).toBe(13);
    at('2026-11-25'); // two weeks later
    state().activatePlan('court-ready', 'continue');
    expect(crPos('2026-11-25')).toEqual(left);
  });

  it('keeps the state of a plan that has not started yet', () => {
    reset('2026-12-07'); // Court-Ready starts in the future
    state().activatePlan('definition', 'continue');
    expect(state().planState['court-ready']).toEqual({ start: '2026-12-07' });
  });

  it("keeps a plan's start when it has a state but no leftAtWeek", () => {
    useStore.setState({ planState: { ...state().planState, definition: { start: '2026-09-07' } } });
    state().activatePlan('definition', 'continue');
    expect(state().planState.definition).toEqual({ start: '2026-09-07' });
  });

  it('starts on the Monday of the date given, which need not be a Monday', () => {
    state().activatePlan('definition', 'continue');
    expect(state().activatePlan('definition', '2026-11-18')).toBe(true); // a Wednesday, already active
    expect(state().planState.definition).toEqual({ start: '2026-11-16' });
    expect(state().activePlanId).toBe('definition');
    // "Start again at week 1" on a plan that was left: no leftAtWeek afterwards.
    expect(state().activatePlan('court-ready', '2026-11-22')).toBe(true); // a Sunday
    expect(state().planState['court-ready']).toEqual({ start: '2026-11-16' });
    // Definition now starts next Monday, so leaving it keeps its state unchanged.
    expect(state().planState.definition).toEqual({ start: '2026-11-16' });
  });

  it('restarting the active plan with a date does not pause it', () => {
    state().activatePlan('court-ready', '2026-11-11');
    expect(state().planState['court-ready']).toEqual({ start: '2026-11-09' });
    expect(state().settings.programStart).toBe('2026-11-09');
  });

  it("carries Court-Ready's start to settings only for Court-Ready", () => {
    state().activatePlan('definition', '2026-12-02');
    expect(state().settings.programStart).toBe(CR_START);
    state().activatePlan('court-ready', '2026-12-02');
    expect(state().settings.programStart).toBe('2026-11-30');
    expect(state().planState['court-ready'].start).toBe('2026-11-30');
  });

  it('never touches the workout in progress or the history', () => {
    state().startPlanWorkout('court-ready', 'lower');
    const active = state().active;
    expect(active).not.toBeNull();
    state().activatePlan('definition', 'continue');
    state().activatePlan('court-ready', '2026-11-30');
    expect(state().active).toBe(active);
  });
});

describe('startPlanWorkout of a paused plan', () => {
  it('builds and saves Court-Ready, paused at week 4, as week 4 three weeks later, not week 7', () => {
    state().startPlanWorkout('court-ready', 'uppera');
    const week4 = state().active!;
    expect(week4).toMatchObject({ week: 4, phase: 'build' });
    state().discardWorkout();

    state().activatePlan('definition', 'continue');
    at('2026-12-02'); // three weeks later: Court-Ready's own start would make this week 7, a lighter week
    expect(state().startPlanWorkout('court-ready', 'uppera')).toBe(true);
    const later = state().active!;
    expect(later).toMatchObject({ week: 4, phase: 'build', planId: 'court-ready', sessionId: 'uppera', routineId: 'uppera' });
    expect(later.exercises.map((e) => [e.exerciseId, e.target, e.sets.length])).toEqual(
      week4.exercises.map((e) => [e.exerciseId, e.target, e.sets.length]),
    );
    // Starting it changes no plan data.
    expect(state().activePlanId).toBe('definition');
    expect(state().planState['court-ready']).toEqual({ start: CR_START, leftAtWeek: 4 });
  });

  it('changes nothing for the active plan', () => {
    // A leftAtWeek on the active plan (not written by the app) is not used.
    useStore.setState({ planState: { 'court-ready': { start: CR_START, leftAtWeek: 2 } } });
    state().startPlanWorkout('court-ready', 'lower');
    expect(state().active).toMatchObject({ week: 4, phase: 'build' });
  });

  it('goes by its own start for a plan that is not active and was never paused', () => {
    useStore.setState({ planState: { ...state().planState, 'muscle-mass': { start: '2026-10-05' } } });
    state().startPlanWorkout('muscle-mass', 'mm-push');
    expect(state().active).toMatchObject({ week: 6, phase: 'deload' });
  });
});

describe('deletePlan', () => {
  it('removes a plan that is not active, with its state, and leaves history alone', () => {
    const w = historyWorkout('h1', 'definition', 'def-upper');
    useStore.setState({ workouts: [w] });
    state().activatePlan('definition', 'continue');
    state().activatePlan('court-ready', 'continue');
    expect(state().deletePlan('definition')).toBe(true);
    expect(state().plans.map((p) => p.id)).toEqual(['court-ready', 'muscle-mass']);
    expect(state().planState.definition).toBeUndefined();
    expect(state().workouts).toEqual([w]);
    expect(state().workouts[0]).toMatchObject({ planId: 'definition', planName: 'A made-up name', sessionId: 'def-upper' });
    expect(state().settings.programStart).toBe(CR_START);
  });

  it('needs another saved plan to delete the active one, and then continues that plan', () => {
    state().activatePlan('definition', 'continue');
    state().activatePlan('muscle-mass', 'continue');
    state().activatePlan('court-ready', 'continue');
    const before = JSON.stringify([state().plans, state().planState, state().activePlanId]);
    expect(state().deletePlan('court-ready')).toBe(false);
    expect(state().deletePlan('court-ready', 'court-ready')).toBe(false);
    expect(state().deletePlan('court-ready', 'missing')).toBe(false);
    expect(JSON.stringify([state().plans, state().planState, state().activePlanId])).toBe(before);

    expect(state().deletePlan('court-ready', 'definition')).toBe(true);
    expect(state().activePlanId).toBe('definition');
    expect(state().plans.map((p) => p.id)).toEqual(['muscle-mass', 'definition']);
    expect(state().planState['court-ready']).toBeUndefined();
    // Definition had been left in its first week and is back in this week as its week 1.
    expect(state().planState.definition).toEqual({ start: '2026-11-09' });
    // settings.programStart stays as it was.
    expect(state().settings.programStart).toBe(CR_START);
  });

  it("brings settings.programStart along when Court-Ready continues in place of the deleted plan", () => {
    state().activatePlan('definition', 'continue'); // Court-Ready paused in week 4
    at('2026-12-02'); // three weeks later
    expect(state().settings.programStart).toBe(CR_START);
    expect(state().deletePlan('definition', 'court-ready')).toBe(true);
    expect(state().activePlanId).toBe('court-ready');
    expect(state().planState['court-ready']).toEqual({ start: '2026-11-09' });
    expect(state().settings.programStart).toBe('2026-11-09');
    expect(crPos('2026-12-02')).toMatchObject({ week: 4 });
  });

  it('keeps the last plan and ignores unknown ids', () => {
    expect(state().deletePlan('nope')).toBe(false);
    expect(state().deletePlan('muscle-mass')).toBe(true);
    expect(state().deletePlan('definition')).toBe(true);
    expect(state().plans.map((p) => p.id)).toEqual(['court-ready']);
    expect(state().deletePlan('court-ready', 'court-ready')).toBe(false);
    expect(state().plans).toHaveLength(1);
  });
});

describe('restoreExamples', () => {
  it('adds a fresh copy of each missing example after the existing plans', () => {
    state().deletePlan('muscle-mass');
    state().deletePlan('definition');
    expect(state().restoreExamples()).toBe(2);
    expect(state().plans.map((p) => p.id)).toEqual(['court-ready', 'muscle-mass', 'definition']);
    expect(state().plans[1]).toEqual(examplePlans()[1]);
    expect(state().restoreExamples()).toBe(0);
    expect(state().plans).toHaveLength(3);
  });

  it('leaves a saved plan with an example id alone, whatever it holds', () => {
    const edited: Plan = { ...(examplePlans()[2] as Plan), name: 'My Definition', workouts: [] };
    useStore.setState({ plans: [state().plans[0], edited] });
    expect(state().restoreExamples()).toBe(1); // only Muscle Mass
    expect(state().plans.map((p) => p.id)).toEqual(['court-ready', 'definition', 'muscle-mass']);
    expect(state().plans[1]).toEqual(edited);
  });

  it('does not give a restored example any state, and does not change the active plan', () => {
    state().activatePlan('definition', 'continue');
    state().deletePlan('court-ready', 'definition');
    expect(state().restoreExamples()).toBe(1);
    expect(state().plans[state().plans.length - 1].id).toBe('court-ready');
    expect(state().planState['court-ready']).toBeUndefined();
    expect(state().activePlanId).toBe('definition');
    // Restored, it can be used: it starts this week.
    state().activatePlan('court-ready', 'continue');
    expect(state().planState['court-ready']).toEqual({ start: addDaysISO(WED, -2) });
  });
});
