import { describe, expect, it } from '@jest/globals';
import { getExercise } from '@/data/exercises';
import { getRoutine, ROUTINES } from '@/data/routines';
import { hardSetCount, phaseForWeek, prescribe, programPosition, repsText } from '@/lib/program';

describe('programPosition', () => {
  const start = '2026-10-05'; // a Monday

  it('is week 1 (Learn) on the start day and through its first Sunday', () => {
    expect(programPosition(start, '2026-10-05')).toMatchObject({ week: 1, cycle: 1, phase: 'learn', started: true });
    expect(programPosition(start, '2026-10-11').week).toBe(1);
  });

  it('moves to week 2 on the next Monday and week 3 starts Build', () => {
    expect(programPosition(start, '2026-10-12').week).toBe(2);
    expect(programPosition(start, '2026-10-19')).toMatchObject({ week: 3, phase: 'build' });
  });

  it('has deloads in weeks 7 and 12 and Push in weeks 8–11', () => {
    expect(programPosition(start, '2026-11-16')).toMatchObject({ week: 7, phase: 'deload' });
    expect(programPosition(start, '2026-11-23')).toMatchObject({ week: 8, phase: 'push' });
    expect(programPosition(start, '2026-12-21')).toMatchObject({ week: 12, phase: 'deload' });
  });

  it('starts again at week 3 after week 12', () => {
    expect(programPosition(start, '2026-12-28')).toMatchObject({ week: 3, cycle: 2, phase: 'build' });
    // Weeks 3–12 again (10 weeks), then a third cycle begins at week 3.
    expect(programPosition(start, '2027-03-01')).toMatchObject({ week: 12, cycle: 2, phase: 'deload' });
    expect(programPosition(start, '2027-03-08')).toMatchObject({ week: 3, cycle: 3 });
  });

  it('reports days until a future start date', () => {
    expect(programPosition('2026-10-12', '2026-10-09')).toMatchObject({ started: false, daysUntilStart: 3, week: 1 });
  });

  it('maps weeks to phases', () => {
    expect([1, 2, 3, 6, 7, 8, 11, 12].map(phaseForWeek)).toEqual([
      'learn',
      'learn',
      'build',
      'build',
      'deload',
      'push',
      'push',
      'deload',
    ]);
  });
});

describe('prescribe', () => {
  const upperA = getRoutine('uppera');
  const lower = getRoutine('lower');
  const incline = upperA.items[0];
  const fly = upperA.items[2];

  it('keeps the written sets in Build', () => {
    expect(prescribe(incline, getExercise('incline'), { phase: 'build', routineId: 'uppera' })).toMatchObject({
      sets: 3,
      rir: '1–2',
      skip: false,
    });
  });

  it('drops one set and uses RIR 3 in Learn weeks', () => {
    expect(prescribe(incline, getExercise('incline'), { phase: 'learn', routineId: 'uppera' })).toMatchObject({
      sets: 2,
      rir: '3',
    });
  });

  it('halves sets (rounding up) in deloads', () => {
    expect(prescribe(incline, getExercise('incline'), { phase: 'deload', routineId: 'uppera' })).toMatchObject({
      sets: 2,
      rir: '3–4',
    });
    const facepull = upperA.items.find((i) => i.key === '5b')!;
    expect(prescribe(facepull, getExercise('facepull'), { phase: 'deload', routineId: 'uppera' }).sets).toBe(1);
  });

  it('adds a set to exercises 1 and 2 and takes isolation to RIR 0 in Push weeks', () => {
    expect(prescribe(incline, getExercise('incline'), { phase: 'push', routineId: 'uppera' }).sets).toBe(4);
    expect(prescribe(fly, getExercise('cablefly'), { phase: 'push', routineId: 'uppera' })).toMatchObject({
      sets: 3,
      rir: '1 · last set 0',
    });
    const curl = upperA.items.find((i) => i.key === '6a')!;
    expect(prescribe(curl, getExercise('curl'), { phase: 'push', routineId: 'uppera' }).rir).toBe('1 · last set 0');
  });

  it('applies game mode on the Lower day: 2 sets, RIR 3, no split squats', () => {
    const legpress = lower.items[0];
    const bss = lower.items.find((i) => i.exerciseId === 'bss')!;
    expect(prescribe(legpress, getExercise('legpress'), { phase: 'build', routineId: 'lower', gameMode: true })).toMatchObject({
      sets: 2,
      rir: '3',
      skip: false,
    });
    expect(prescribe(bss, getExercise('bss'), { phase: 'build', routineId: 'lower', gameMode: true }).skip).toBe(true);
  });

  it('leaves non-numeric RIR like "Controlled" alone', () => {
    const pallof = lower.items.find((i) => i.exerciseId === 'pallof')!;
    expect(prescribe(pallof, getExercise('pallof'), { phase: 'learn', routineId: 'lower' }).rir).toBe('Controlled');
  });
});

describe('routines', () => {
  it('match the guide’s hard-set totals in Build weeks (21 / 18 / 23)', () => {
    const totals = Object.fromEntries(
      ROUTINES.filter((r) => r.id !== 'bonus').map((r) => [r.id, hardSetCount(r, getExercise, { phase: 'build' })]),
    );
    expect(totals).toEqual({ uppera: 21, lower: 18, upperb: 23 });
  });

  it('only reference exercises that exist, with valid swaps', () => {
    for (const r of ROUTINES) {
      for (const item of r.items) {
        const ex = getExercise(item.exerciseId);
        for (const s of ex.swaps) expect(() => getExercise(s)).not.toThrow();
        if (item.group) expect(r.groups[item.group]).toBeTruthy();
      }
    }
  });

  it('formats rep targets', () => {
    expect(repsText({ repsMin: 6, repsMax: 10 })).toBe('6–10');
    expect(repsText({ repsMin: 10, repsMax: 10 }, true)).toBe('10 per side');
    expect(repsText({ repsMin: 8, repsMax: 25, repsLabel: 'stop 2 reps before failure' })).toBe(
      'stop 2 reps before failure',
    );
  });
});
