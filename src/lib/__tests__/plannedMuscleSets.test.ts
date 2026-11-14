import { describe, expect, it } from '@jest/globals';

import { getExercise } from '@/data/exercises';
import { COURT_READY_PLAN } from '@/data/plan-templates/court-ready';
import legacyJson from '@/lib/__fixtures__/court-ready-legacy.json';
import type { LegacyFixture } from '@/lib/__fixtures__/legacy-program';
import { muscleSets, plannedMuscleSets } from '@/lib/stats';
import type { ExerciseDef, MuscleGroup, PhaseId, Plan, RoutineId } from '@/lib/types';

const fixture = legacyJson as unknown as LegacyFixture;
const PHASES: PhaseId[] = ['learn', 'build', 'deload', 'push'];

/**
 * Today's Progress tab logic (src/app/(tabs)/progress.tsx), frozen: the three sessions that aren't
 * the Bonus, every item through the old prescribe, care drills out, main muscle 1 and helpers ½.
 * The old prescribe is replaced by its frozen output in the fixture, so later changes to program.ts
 * can't move the oracle.
 */
function oldProgressPlan(phase: PhaseId): Partial<Record<MuscleGroup, number>> {
  const plan: Partial<Record<MuscleGroup, number>> = {};
  const ids = (Object.keys(fixture.prescriptions[phase]) as RoutineId[]).filter((id) => id !== 'bonus');
  for (const id of ids) {
    for (const item of fixture.prescriptions[phase][id].normal) {
      const ex = getExercise(item.exerciseId);
      if (ex.kind === 'care') continue;
      plan[ex.primary] = (plan[ex.primary] ?? 0) + item.sets;
      for (const m of ex.secondary ?? []) plan[m] = (plan[m] ?? 0) + item.sets / 2;
    }
  }
  return plan;
}

describe('plannedMuscleSets', () => {
  it.each(PHASES)("gives Court-Ready's numbers of the Progress tab in the %s phase", (phase) => {
    const now = plannedMuscleSets(COURT_READY_PLAN, phase, (id) => getExercise(id));
    const old = oldProgressPlan(phase);
    expect(Object.keys(old).length).toBeGreaterThan(5);
    expect(now).toEqual(old);
  });

  // Made-up exercises, to check each rule on its own.
  const defs: Record<string, ExerciseDef> = {
    press: { id: 'press', primary: 'chest', secondary: ['triceps'], kind: 'main', isolation: false } as ExerciseDef,
    curl: { id: 'curl', primary: 'biceps', kind: 'main', isolation: true } as ExerciseDef,
    drill: { id: 'drill', primary: 'shoulders', kind: 'care', isolation: true } as ExerciseDef,
  };
  const item = (key: string, exerciseId: string, sets: number) => ({
    key,
    exerciseId,
    sets,
    repsMin: 8,
    repsMax: 12,
    rir: '2',
    restSec: 60,
    cue: '',
  });
  const plan: Plan = {
    id: 'made-up',
    name: 'Made up',
    progression: 'progress',
    sports: [{ id: 'run', sport: 'running', name: 'Run' }],
    workouts: [
      { id: 'a', name: 'A', focus: '', minutes: 30, warmup: 'upper', groups: {}, gameMode: true, items: [item('1', 'press', 4), item('2', 'drill', 3), item('3', 'curl', 2)] },
      { id: 'b', name: 'B', focus: '', minutes: 30, warmup: 'upper', groups: {}, optional: true, items: [item('1', 'curl', 10)] },
    ],
    week: [
      { sessions: [{ ref: { kind: 'gym', workoutId: 'a' } }] },
      { sessions: [{ ref: { kind: 'sport', sessionId: 'run' } }] },
      { sessions: [{ ref: { kind: 'gym', workoutId: 'b' } }, { ref: { kind: 'gym', workoutId: 'a' }, optional: true }] },
      { sessions: [{ ref: { kind: 'gym', workoutId: 'a' } }] },
      { sessions: [] },
      { sessions: [] },
      { sessions: [] },
    ],
  };
  const get = (id: string) => defs[id];

  it('counts a workout planned twice twice, leaves out optional sessions, care drills and sport, and ignores game mode', () => {
    expect(plannedMuscleSets(plan, 'build', get)).toEqual({ chest: 8, triceps: 4, biceps: 4 });
  });

  it('follows the phase', () => {
    expect(plannedMuscleSets(plan, 'deload', get)).toEqual({ chest: 4, triceps: 2, biceps: 2 });
    expect(plannedMuscleSets(plan, 'learn', get)).toEqual({ chest: 6, triceps: 3, biceps: 2 });
  });

  it('is comparable with muscleSets, and skips exercises it does not know', () => {
    expect(plannedMuscleSets(plan, 'build', () => undefined)).toEqual({});
    expect(muscleSets([], get)).toEqual({});
  });
});
