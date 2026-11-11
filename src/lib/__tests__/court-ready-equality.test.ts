// Court-Ready as a plan must prescribe exactly what the app prescribed before plans were data.
// Two oracles: a frozen copy of the old code, and a JSON fixture generated from the old code, so a
// later edit of routines.ts, exercises.ts or the engine shows up here.
import { describe, expect, it } from '@jest/globals';
import { getExercise } from '@/data/exercises';
import { COURT_READY_PLAN } from '@/data/plan-templates/court-ready';
import { ROUTINES } from '@/data/routines';
import { addDaysISO } from '@/lib/dates';
import { findWorkout, planPosition, prescribeItem } from '@/lib/plans';
import * as legacy from '@/lib/__fixtures__/legacy-program';
import type { LegacyFixture } from '@/lib/__fixtures__/legacy-program';
import fixtureJson from '@/lib/__fixtures__/court-ready-legacy.json';
import type { RoutineId } from '@/lib/types';

const fixture = fixtureJson as unknown as LegacyFixture;
const start = fixture.start;
const state = { start };
const WEEKS = 40;
const ROUTINE_IDS: RoutineId[] = ['uppera', 'lower', 'upperb', 'bonus'];

describe('Court-Ready position', () => {
  it('covers weeks 1 to 40 in the fixture', () => {
    expect(fixture.weeks.map((w) => w.absolute)).toEqual(Array.from({ length: WEEKS }, (_, i) => i + 1));
  });

  it.each(fixture.weeks.map((w) => [w.absolute, w] as const))('week %i matches on its Monday and Sunday', (n, w) => {
    expect(w.monday).toBe(addDaysISO(start, (n - 1) * 7));
    for (const day of [w.monday, w.sunday]) {
      expect(planPosition(COURT_READY_PLAN, state, day)).toEqual(w.position);
      expect(legacy.programPosition(start, day)).toEqual(w.position);
    }
  });

  it('matches before the start', () => {
    const { today, position } = fixture.notStarted;
    expect(position.started).toBe(false);
    expect(planPosition(COURT_READY_PLAN, state, today)).toEqual(position);
    expect(legacy.programPosition(start, today)).toEqual(position);
    // And further out than one day.
    const earlier = addDaysISO(start, -10);
    expect(planPosition(COURT_READY_PLAN, state, earlier)).toEqual(legacy.programPosition(start, earlier));
  });
});

describe('Court-Ready prescriptions', () => {
  const cases = fixture.weeks.flatMap((w) =>
    ROUTINE_IDS.flatMap((id) => [false, true].map((gameMode) => [w.absolute, id, gameMode] as const)),
  );

  it('has every workout of the plan, in the routines’ order', () => {
    expect(COURT_READY_PLAN.workouts.map((w) => w.id)).toEqual(ROUTINE_IDS);
    expect(ROUTINES.map((r) => r.id)).toEqual(ROUTINE_IDS);
  });

  it.each(cases)('week %i, %s, game mode %s', (n, id, gameMode) => {
    const today = addDaysISO(start, (n - 1) * 7 + 3);
    const { phase } = planPosition(COURT_READY_PLAN, state, today);
    const frozenPhase = fixture.weeks[n - 1].position.phase;
    expect(phase).toBe(frozenPhase);

    const workout = findWorkout(COURT_READY_PLAN, id)!;
    const routine = ROUTINES.find((r) => r.id === id)!;
    const expected = fixture.prescriptions[frozenPhase][id][gameMode ? 'game' : 'normal'];

    const fromPlan = workout.items.map((item) =>
      legacy.freeze(item, prescribeItem(item, getExercise(item.exerciseId), workout, { phase, gameMode })),
    );
    const fromOldCode = routine.items.map((item) =>
      legacy.freeze(item, legacy.prescribe(item, getExercise(item.exerciseId), { phase, routineId: id, gameMode })),
    );
    expect(fromPlan).toEqual(expected);
    expect(fromOldCode).toEqual(expected);
  });

  it('has game mode only on Lower, and Bonus only halved in deloads', () => {
    expect(COURT_READY_PLAN.workouts.filter((w) => w.gameMode).map((w) => w.id)).toEqual(['lower']);
    expect(COURT_READY_PLAN.workouts.filter((w) => w.cycleRule === 'deloadOnly').map((w) => w.id)).toEqual(['bonus']);
  });
});
