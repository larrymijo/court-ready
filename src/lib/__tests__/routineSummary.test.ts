import { describe, expect, it } from '@jest/globals';
import { getExercise } from '@/data/exercises';
import { getRoutine, ROUTINES } from '@/data/routines';
import { routineAreas, routineSummary } from '@/lib/routineSummary';

describe('routineAreas', () => {
  it('lists the areas of Upper A with the most sets first', () => {
    expect(routineAreas(getRoutine('uppera'), getExercise)).toEqual(['Chest', 'Back', 'Shoulders', 'Arms']);
  });

  it('groups every leg muscle as Legs', () => {
    expect(routineAreas(getRoutine('lower'), getExercise)).toEqual(['Legs', 'Core']);
  });

  it('leaves shoulder-care drills out of the count', () => {
    // The Bonus has four care drills; counted, they would put Shoulders first.
    expect(routineAreas(getRoutine('bonus'), getExercise)[0]).toBe('Chest');
  });

  it('never returns more than asked for', () => {
    for (const r of ROUTINES) expect(routineAreas(r, getExercise, 2).length).toBeLessThanOrEqual(2);
  });
});

describe('routineSummary', () => {
  it('says what the session is about, how many exercises and how long', () => {
    expect(routineSummary(getRoutine('uppera'))).toBe('Chest focus · 8 exercises · about 60 min');
  });

  it('gives every routine a short focus', () => {
    for (const r of ROUTINES) {
      expect(r.focus.length).toBeGreaterThan(0);
      expect(r.focus.length).toBeLessThanOrEqual(32);
    }
  });
});
