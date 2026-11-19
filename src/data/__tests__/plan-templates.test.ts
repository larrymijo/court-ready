import { describe, expect, it } from '@jest/globals';
import { EXERCISES, getExercise } from '../exercises';
import { DEFINITION_PLAN } from '../plan-templates/definition';
import { MUSCLE_MASS_PLAN } from '../plan-templates/muscle-mass';
import type { MuscleGroup, Plan } from '@/lib/types';

type Row = [exerciseId: string, sets: number, repsMin: number, repsMax: number, restSec: number];

// The tables from docs/polish-plan.md, section 6, in order.
const TABLES: Record<string, { plan: Plan; workouts: Record<string, Row[]> }> = {
  'muscle-mass': {
    plan: MUSCLE_MASS_PLAN,
    workouts: {
      'mm-push': [
        ['benchpress', 4, 6, 10, 150],
        ['incline', 3, 8, 12, 120],
        ['shoulderpress', 3, 8, 12, 120],
        ['lateral', 4, 12, 20, 60],
        ['cablefly', 3, 10, 15, 90],
        ['pushdown', 3, 10, 15, 75],
      ],
      'mm-pull': [
        ['latpulldown', 4, 8, 12, 120],
        ['cablerow', 3, 8, 12, 120],
        ['alt_dbrow', 3, 8, 12, 120],
        ['facepull', 3, 12, 20, 75],
        ['curl', 3, 8, 12, 75],
        ['hammer', 3, 10, 15, 60],
      ],
      'mm-legs': [
        ['backsquat', 4, 6, 10, 150],
        ['barbellrdl', 3, 8, 10, 120],
        ['legpress', 3, 10, 12, 120],
        ['legcurl', 3, 10, 15, 90],
        ['legext', 3, 12, 15, 75],
        ['calf', 4, 10, 15, 60],
      ],
    },
  },
  definition: {
    plan: DEFINITION_PLAN,
    workouts: {
      'def-upper': [
        ['benchpress', 3, 6, 10, 150],
        ['latpulldown', 3, 8, 12, 120],
        ['incline', 3, 8, 12, 120],
        ['cablerow', 3, 8, 12, 120],
        ['lateral', 3, 12, 20, 60],
        ['curl', 2, 10, 15, 60],
        ['pushdown', 2, 10, 15, 60],
      ],
      'def-lower': [
        ['backsquat', 3, 6, 10, 150],
        ['barbellrdl', 3, 8, 10, 120],
        ['legpress', 3, 10, 12, 120],
        ['legcurl', 3, 10, 15, 90],
        ['calf', 3, 10, 15, 60],
        ['crunch', 3, 10, 15, 60],
      ],
    },
  },
};

// Hard sets per week from the roadmap. Muscles it does not list are not checked.
const HARD_SETS: Record<string, Partial<Record<MuscleGroup, number>>> = {
  'muscle-mass': {
    chest: 20,
    back: 23,
    shoulders: 27,
    biceps: 22,
    triceps: 16,
    quads: 20,
    hamstrings: 12,
    glutes: 10,
    calves: 8,
  },
  definition: {
    chest: 12,
    back: 12,
    shoulders: 12,
    quads: 12,
    hamstrings: 12,
    biceps: 10,
    triceps: 10,
    glutes: 9,
    calves: 6,
    core: 6,
  },
};

/** A primary muscle gets 1 set per set, each secondary muscle half a set. Over the whole week. */
function weeklyHardSets(plan: Plan): Partial<Record<MuscleGroup, number>> {
  const totals: Partial<Record<MuscleGroup, number>> = {};
  const add = (m: MuscleGroup, n: number) => {
    totals[m] = (totals[m] ?? 0) + n;
  };
  for (const day of plan.week) {
    for (const { ref } of day.sessions) {
      if (ref.kind !== 'gym') continue;
      const workout = plan.workouts.find((w) => w.id === ref.workoutId)!;
      for (const it of workout.items) {
        const ex = getExercise(it.exerciseId);
        add(ex.primary, it.sets);
        for (const m of ex.secondary ?? []) add(m, it.sets / 2);
      }
    }
  }
  return totals;
}

describe.each(Object.entries(TABLES))('example plan %s', (planId, { plan, workouts }) => {
  it('has the expected id, example and week length', () => {
    expect(plan.id).toBe(planId);
    expect(plan.example).toBe(planId);
    expect(plan.week).toHaveLength(7);
  });

  it('has unique workout ids and unique item keys in each workout', () => {
    const ids = plan.workouts.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const w of plan.workouts) {
      const keys = w.items.map((i) => i.key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it('only uses exercises that exist', () => {
    for (const w of plan.workouts) {
      for (const i of w.items) expect(() => getExercise(i.exerciseId)).not.toThrow();
    }
  });

  it('points every day at a workout of the plan', () => {
    const ids = new Set(plan.workouts.map((w) => w.id));
    for (const day of plan.week) {
      for (const { ref } of day.sessions) {
        expect(ref.kind).toBe('gym');
        if (ref.kind === 'gym') expect(ids.has(ref.workoutId)).toBe(true);
      }
    }
  });

  it('matches the roadmap table row by row', () => {
    expect(plan.workouts.map((w) => w.id)).toEqual(Object.keys(workouts));
    for (const w of plan.workouts) {
      const rows = w.items.map((i): Row => [i.exerciseId, i.sets, i.repsMin, i.repsMax, i.restSec]);
      expect(rows).toEqual(workouts[w.id]);
      expect(w.items.map((i) => i.key)).toEqual(w.items.map((_, n) => String(n + 1)));
    }
  });

  it('gives the roadmap hard sets per muscle per week', () => {
    const totals = weeklyHardSets(plan);
    for (const [muscle, expected] of Object.entries(HARD_SETS[planId])) {
      expect([muscle, totals[muscle as MuscleGroup]]).toEqual([muscle, expected]);
    }
  });

  it('survives a JSON round trip unchanged', () => {
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan);
  });
});

describe('exercise library', () => {
  it('contains the 117 gym exercises and 28 warm-up drills and stretches', () => {
    const lifts = EXERCISES.filter((ex) => ex.kind === 'standard' || ex.kind === 'care');
    expect(lifts).toHaveLength(117);
    expect(EXERCISES.length - lifts.length).toBe(28);
  });

  it('provides logging defaults, technique instructions and valid swap targets for every exercise', () => {
    for (const ex of EXERCISES) {
      expect(ex.id).toMatch(/^[a-z][a-z0-9_]*$/);
      expect(ex.name.trim()).toBeTruthy();
      expect(ex.muscles.trim()).toBeTruthy();
      expect(ex.sections.length).toBeGreaterThan(0);
      for (const section of ex.sections) {
        expect(section.label.trim()).toBeTruthy();
        expect(section.items.length).toBeGreaterThan(0);
        expect(section.items.every((line) => line.trim().length > 0)).toBe(true);
      }
      if (ex.tracking === 'reps') expect(ex.increment).toBe(0);
      else expect(ex.increment).toBeGreaterThan(0);
      for (const id of ex.swaps) expect(getExercise(id).id).toBe(id);
    }
  });

  it('has unique ids', () => {
    const ids = EXERCISES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has the six new lifts', () => {
    const expected = [
      ['benchpress', 'Barbell bench press', 'barbell', 'chest', ['shoulders', 'triceps'], false],
      ['shoulderpress', 'Dumbbell shoulder press', 'dumbbell', 'shoulders', ['triceps'], false],
      ['latpulldown', 'Lat pulldown', 'cable', 'back', ['biceps'], false],
      ['backsquat', 'Barbell back squat', 'barbell', 'quads', ['glutes'], false],
      ['barbellrdl', 'Barbell Romanian deadlift', 'barbell', 'hamstrings', ['glutes'], false],
      ['legext', 'Leg extension', 'machine', 'quads', undefined, true],
    ] as const;
    for (const [id, name, equipment, primary, secondary, isolation] of expected) {
      const ex = getExercise(id);
      expect(ex.name).toBe(name);
      expect(ex.equipment).toBe(equipment);
      expect(ex.primary).toBe(primary);
      expect(ex.secondary).toEqual(secondary);
      expect(ex.isolation).toBe(isolation);
      expect(ex.kind).toBe('standard');
      expect(ex.tracking).toBe('weight_reps');
      expect(ex.increment).toBeGreaterThan(0);
      expect(ex.sections.length).toBeGreaterThan(0);
      for (const s of ex.swaps) expect(() => getExercise(s)).not.toThrow();
    }
  });
});
