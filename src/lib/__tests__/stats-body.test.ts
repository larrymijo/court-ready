import { describe, expect, it } from '@jest/globals';
import { EXERCISE_BY_ID } from '@/data/exercises';
import { weeklyAdvice, weeklyAverages } from '@/lib/body';
import { daysBetween, mondayOfISO } from '@/lib/dates';
import {
  formatChange,
  formatClock,
  formatDuration,
  formatElapsed,
  formatSet,
  parseNumber,
  plural,
  setLabels,
} from '@/lib/format';
import { detectPRs, e1rm, exerciseSeries, muscleSets, workoutSetCount, workoutVolume } from '@/lib/stats';
import type { Workout } from '@/lib/types';

const get = (id: string) => EXERCISE_BY_ID[id];

function w(id: string, startedAt: number, exerciseId: string, sets: [number, number][]): Workout {
  return {
    id,
    name: 'x',
    startedAt,
    finishedAt: startedAt + 1,
    exercises: [
      {
        id: `${id}e`,
        exerciseId,
        restSec: 90,
        pain: null,
        note: '',
        sets: sets.map(([weight, reps], i) => ({ id: `${id}${i}`, type: 'normal', weight, reps, rir: null, done: true })),
      },
    ],
  };
}

describe('stats', () => {
  it('estimates 1RM with Epley', () => {
    expect(e1rm(100, 1)).toBe(100);
    expect(e1rm(100, 10)).toBeCloseTo(133.33, 1);
    expect(e1rm(0, 10)).toBe(0);
  });

  it('counts volume and sets from working sets only', () => {
    const x = w('a', 1, 'incline', [[20, 10], [20, 8]]);
    x.exercises[0].sets.push({ id: 'wu', type: 'warmup', weight: 10, reps: 10, rir: null, done: true });
    expect(workoutVolume(x)).toBe(360);
    expect(workoutSetCount(x)).toBe(2);
  });

  it('detects weight, e1RM and volume PRs but not on the first session', () => {
    const first = w('a', 1000, 'incline', [[20, 10]]);
    expect(detectPRs(first, [], get)).toEqual([]);
    const second = w('b', 2000, 'incline', [[22, 8]]);
    const kinds = detectPRs(second, [first], get).map((p) => p.kind);
    expect(kinds).toContain('weight');
    expect(kinds).toContain('e1rm');
    expect(kinds).not.toContain('volume'); // 176 < 200
  });

  it('builds an exercise series oldest first', () => {
    const s = exerciseSeries('incline', [w('b', 2000, 'incline', [[22, 8]]), w('a', 1000, 'incline', [[20, 10]])]);
    expect(s.map((p) => p.topWeight)).toEqual([20, 22]);
  });

  it('counts hard sets per muscle (helpers count half)', () => {
    const sets = muscleSets([w('a', 1, 'incline', [[20, 10], [20, 10]])], get);
    expect(sets.chest).toBe(2);
    expect(sets.triceps).toBe(1);
  });
});

describe('body', () => {
  const entries = [
    { date: '2026-10-05', weight: 80, waist: 92 },
    { date: '2026-10-07', weight: 79.6 },
    { date: '2026-10-12', weight: 79.2 },
    { date: '2026-10-14', weight: 78.8, waist: 91 },
  ];

  it('averages by Monday-start week', () => {
    const weeks = weeklyAverages(entries);
    expect(weeks.map((x) => x.weekStart)).toEqual(['2026-10-05', '2026-10-12']);
    expect(weeks[0].weight).toBeCloseTo(79.8);
    expect(weeks[1].weight).toBeCloseTo(79.0);
  });

  it('says “perfect” for a 0.5–1 kg weekly drop', () => {
    expect(weeklyAdvice(entries)).toMatchObject({ tone: 'ok', detail: 'Perfect: change nothing.' });
  });

  it('flags fast loss and stalls', () => {
    expect(weeklyAdvice([{ date: '2026-10-05', weight: 80 }, { date: '2026-10-12', weight: 78.5 }])?.tone).toBe('warn');
    expect(weeklyAdvice([{ date: '2026-10-05', weight: 80 }, { date: '2026-10-12', weight: 80 }])?.title).toContain('Down only');
    expect(weeklyAdvice([{ date: '2026-10-05', weight: 80 }])).toBeNull();
  });

  it('praises a smaller waist at the same weight', () => {
    const advice = weeklyAdvice([
      { date: '2026-10-05', weight: 80, waist: 92 },
      { date: '2026-10-12', weight: 80, waist: 91 },
    ]);
    expect(advice?.title).toBe('Same weight, smaller waist');
  });
});

describe('dates and format', () => {
  it('handles weeks and day differences across DST', () => {
    expect(mondayOfISO('2026-10-11')).toBe('2026-10-05');
    expect(daysBetween('2026-10-24', '2026-10-26')).toBe(2);
  });

  it('formats clocks, durations and parses decimal commas', () => {
    expect(formatClock(65)).toBe('1:05');
    expect(formatDuration(62 * 60000)).toBe('1h 02m');
    expect(formatElapsed(3725_000)).toBe('1:02:05');
    expect(parseNumber('22,5')).toBe(22.5);
    expect(parseNumber('')).toBeNull();
  });

  it('formats sets for weighted, bodyweight and reps-only exercises', () => {
    const db = { tracking: 'weight_reps' as const, equipment: 'dumbbell' };
    const bw = { tracking: 'weight_reps' as const, equipment: 'bodyweight' };
    expect(formatSet(db, 22.5, 10)).toBe('22.5 kg × 10');
    expect(formatSet(db, 22.5, 10, true)).toBe('22.5 × 10');
    expect(formatSet(bw, null, 7)).toBe('BW × 7');
    expect(formatSet(bw, 2.5, 7)).toBe('+2.5 kg × 7');
    expect(formatSet({ tracking: 'reps', equipment: 'bodyweight' }, null, 12)).toBe('12 reps');
    expect(formatChange(-0.94)).toBe('−0.9 kg');
    expect(formatChange(0.04)).toBe('0 kg');
    expect(plural(1, 'set')).toBe('1 set');
    expect(plural(3, 'set')).toBe('3 sets');
  });

  it('labels warm-ups W and numbers working sets', () => {
    const t = (type: 'normal' | 'warmup') => ({ type });
    expect(setLabels([t('warmup'), t('warmup'), t('normal'), t('normal'), t('normal')])).toEqual(['W', 'W', '1', '2', '3']);
  });
});

describe('weekly check-in with a part week', () => {
  it('compares the two weeks before when the current week has fewer than 3 weigh-ins', () => {
    const advice = weeklyAdvice([
      { date: '2026-09-28', weight: 80 },
      { date: '2026-09-30', weight: 80 },
      { date: '2026-10-02', weight: 80 },
      { date: '2026-10-05', weight: 79.3 },
      { date: '2026-10-07', weight: 79.3 },
      { date: '2026-10-09', weight: 79.3 },
      { date: '2026-10-12', weight: 79.9 },
    ]);
    expect(advice).toMatchObject({ title: 'Down 0.7 kg last week', detail: 'Perfect: change nothing.' });
  });
});
