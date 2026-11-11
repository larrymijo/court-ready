import { describe, expect, it } from '@jest/globals';
import { getExercise } from '@/data/exercises';
import { ARTICLE_BY_SLUG } from '@/data/guide';
import { COURT_READY_PLAN } from '@/data/plan-templates/court-ready';
import { ROUTINES } from '@/data/routines';
import { DAILY_TARGETS, WEEK_PLAN } from '@/data/schedule';
import { addDaysISO, parseISODate } from '@/lib/dates';
import {
  daySessions,
  findSportSession,
  findWorkout,
  planPhaseForWeek,
  plannedGymWorkouts,
  planPosition,
  prescribeItem,
  resolveSession,
  weekProgress,
  workoutHardSets,
} from '@/lib/plans';
import { hardSetCount } from '@/lib/program';
import type { GymWorkout, Plan, Workout } from '@/lib/types';

const START = '2026-10-05'; // a Monday

/** The Monday of week n counted from START. */
function mondayOfWeek(n: number): string {
  return addDaysISO(START, (n - 1) * 7);
}

function workout(id: string, items: GymWorkout['items'] = []): GymWorkout {
  return { id, name: id, focus: '', minutes: 30, warmup: 'upper', items, groups: {} };
}

/** A made-up plan without a cycle: Push Mon and Thu, Pull Tue, optional Arms on Sat. */
function testPlan(extra: Partial<Plan> = {}): Plan {
  const rest = { sessions: [] };
  return {
    id: 'test-plan',
    name: 'Test plan',
    workouts: [workout('push'), workout('pull'), workout('arms')],
    sports: [{ id: 'run', sport: 'running', name: 'Running' }],
    week: [
      { sessions: [{ ref: { kind: 'gym', workoutId: 'push' } }] },
      { sessions: [{ ref: { kind: 'gym', workoutId: 'pull' } }] },
      { sessions: [{ ref: { kind: 'sport', sessionId: 'run' } }] },
      { sessions: [{ ref: { kind: 'gym', workoutId: 'push' } }] },
      rest,
      { sessions: [{ ref: { kind: 'gym', workoutId: 'arms' }, optional: true }] },
      rest,
    ],
    progression: 'progress',
    ...extra,
  };
}

let nextId = 1;
/** A finished workout started at noon on the given day. */
function done(dateISO: string, sessionId: string | undefined, planId: string | undefined = 'test-plan'): Workout {
  const d = parseISODate(dateISO);
  d.setHours(12);
  return {
    id: `w${nextId++}`,
    name: sessionId ?? 'Empty workout',
    planId,
    sessionId,
    startedAt: d.getTime(),
    finishedAt: d.getTime() + 3600_000,
    exercises: [],
  };
}

describe('planPosition', () => {
  it('runs a cycle and repeats from repeatFrom', () => {
    const plan = testPlan({ cycle: { phases: ['learn', 'build', 'push', 'deload'], repeatFrom: 2 } });
    const at = (n: number) => planPosition(plan, { start: START }, mondayOfWeek(n));
    expect([1, 2, 3, 4].map((n) => at(n).week)).toEqual([1, 2, 3, 4]);
    expect(at(4)).toMatchObject({ phase: 'deload', cycle: 1, started: true });
    // Then weeks 2–4 again.
    expect([5, 6, 7, 8].map((n) => [at(n).week, at(n).cycle])).toEqual([
      [2, 2],
      [3, 2],
      [4, 2],
      [2, 3],
    ]);
    expect(at(5).phase).toBe('build');
  });

  it('gives Court-Ready its 12 weeks, then weeks 3–12 again', () => {
    const at = (n: number) => planPosition(COURT_READY_PLAN, { start: START }, mondayOfWeek(n));
    expect(at(7)).toMatchObject({ week: 7, cycle: 1, phase: 'deload' });
    expect(at(13)).toMatchObject({ week: 3, cycle: 2, phase: 'build' });
    expect(at(23)).toMatchObject({ week: 3, cycle: 3 });
  });

  it('makes every Nth week a lighter week with lighterWeekEvery', () => {
    const plan = testPlan({ lighterWeekEvery: 6 });
    const phases = Array.from({ length: 13 }, (_, i) => planPosition(plan, { start: START }, mondayOfWeek(i + 1)));
    expect(phases.map((p) => p.week)).toEqual(Array.from({ length: 13 }, (_, i) => i + 1));
    expect(phases.filter((p) => p.phase === 'deload').map((p) => p.week)).toEqual([6, 12]);
    expect(phases.every((p) => p.phase === 'deload' || p.phase === 'build')).toBe(true);
    expect(phases.every((p) => p.cycle === 1)).toBe(true);
  });

  it('counts up in Build without a cycle or lighter weeks', () => {
    const plan = testPlan();
    expect(planPosition(plan, { start: START }, mondayOfWeek(30))).toEqual({
      week: 30,
      cycle: 1,
      phase: 'build',
      started: true,
      daysUntilStart: 0,
    });
    expect(planPhaseForWeek(plan, 6)).toBe('build');
  });

  it('reports days until a future start', () => {
    expect(planPosition(testPlan(), { start: '2026-10-12' }, '2026-10-09')).toEqual({
      week: 1,
      cycle: 1,
      phase: 'build',
      started: false,
      daysUntilStart: 3,
    });
  });
});

describe('prescribeItem', () => {
  const lower = findWorkout(COURT_READY_PLAN, 'lower')!;
  const bss = lower.items.find((i) => i.exerciseId === 'bss')!;

  it('applies game mode only to workouts that offer it', () => {
    expect(prescribeItem(bss, getExercise('bss'), lower, { phase: 'build', gameMode: true }).skip).toBe(true);
    const copy = { ...lower, gameMode: undefined };
    expect(prescribeItem(bss, getExercise('bss'), copy, { phase: 'build', gameMode: true })).toMatchObject({
      skip: false,
      sets: 2,
      rir: '1–2',
    });
  });

  it('only halves sets in deloads with cycleRule deloadOnly', () => {
    const w = { ...lower, cycleRule: 'deloadOnly' as const };
    const legpress = lower.items[0];
    expect(prescribeItem(legpress, getExercise('legpress'), w, { phase: 'learn' })).toMatchObject({ sets: 3, rir: '1–2' });
    expect(prescribeItem(legpress, getExercise('legpress'), w, { phase: 'deload' })).toMatchObject({ sets: 2, rir: '1–2' });
  });
});

describe('lookups', () => {
  it('finds workouts and sport sessions and resolves refs', () => {
    expect(findWorkout(COURT_READY_PLAN, 'upperb')?.name).toBe('Upper B');
    expect(findWorkout(COURT_READY_PLAN, 'nope')).toBeUndefined();
    expect(findSportSession(COURT_READY_PLAN, 'basketball')?.sport).toBe('basketball');
    expect(resolveSession(COURT_READY_PLAN, { kind: 'gym', workoutId: 'bonus' })).toMatchObject({ kind: 'gym' });
    expect(resolveSession(COURT_READY_PLAN, { kind: 'sport', sessionId: 'volleyball' })).toMatchObject({
      kind: 'sport',
      session: { name: 'Volleyball' },
    });
    expect(resolveSession(COURT_READY_PLAN, { kind: 'sport', sessionId: 'uppera' })).toBeUndefined();
  });

  it('lists a weekday’s sessions with their optional flag', () => {
    const thu = daySessions(COURT_READY_PLAN, 3);
    expect(thu.map((s) => [s.kind, s.optional])).toEqual([
      ['sport', true],
      ['gym', true],
    ]);
    expect(daySessions(testPlan(), 4)).toEqual([]);
  });

  it('counts the planned gym sessions, twice for a workout planned twice, without optional ones', () => {
    expect(plannedGymWorkouts(testPlan()).map((w) => w.id)).toEqual(['push', 'pull', 'push']);
    expect(plannedGymWorkouts(COURT_READY_PLAN).map((w) => w.id)).toEqual(['uppera', 'lower', 'upperb']);
  });

  it('counts hard sets of a workout as hardSetCount does for its routine', () => {
    for (const r of ROUTINES) {
      for (const phase of ['learn', 'build', 'deload', 'push'] as const) {
        for (const gameMode of [false, true]) {
          expect(workoutHardSets(findWorkout(COURT_READY_PLAN, r.id)!, getExercise, { phase, gameMode })).toBe(
            hardSetCount(r, getExercise, { phase, gameMode }),
          );
        }
      }
    }
    expect(
      Object.fromEntries(
        plannedGymWorkouts(COURT_READY_PLAN).map((w) => [w.id, workoutHardSets(w, getExercise, { phase: 'build' })]),
      ),
    ).toEqual({ uppera: 21, lower: 18, upperb: 23 });
  });
});

describe('weekProgress', () => {
  const monday = mondayOfWeek(3);
  const day = (i: number) => addDaysISO(monday, i);
  const doneMap = (plan: Plan, workouts: Workout[]) =>
    weekProgress(plan, workouts, monday).map((s) => [s.weekday, s.optional, s.done]);

  it('lists every planned session, nothing done in an empty week', () => {
    expect(doneMap(testPlan(), [])).toEqual([
      [0, false, false],
      [1, false, false],
      [2, false, false],
      [3, false, false],
      [5, true, false],
    ]);
  });

  it('counts a session done on another day of the week', () => {
    const progress = weekProgress(testPlan(), [done(day(6), 'pull')], monday);
    expect(progress.find((s) => s.weekday === 1)?.done).toBe(true);
  });

  it('needs two workouts for a workout planned twice', () => {
    const one = weekProgress(testPlan(), [done(day(0), 'push')], monday);
    expect(one.filter((s) => s.ref.kind === 'gym' && s.ref.workoutId === 'push').map((s) => s.done)).toEqual([
      true,
      false,
    ]);
    const two = weekProgress(testPlan(), [done(day(0), 'push'), done(day(4), 'push')], monday);
    expect(two.filter((s) => s.ref.kind === 'gym' && s.ref.workoutId === 'push').map((s) => s.done)).toEqual([
      true,
      true,
    ]);
  });

  it('marks optional sessions done and fills required ones first', () => {
    const plan = testPlan();
    plan.week[6] = { sessions: [{ ref: { kind: 'gym', workoutId: 'pull' }, optional: true }] };
    // One Pull, done on Sunday: it counts for Tuesday's required Pull, not Sunday's optional one.
    expect(doneMap(plan, [done(day(6), 'pull')]).filter(([d]) => d === 1 || d === 6)).toEqual([
      [1, false, true],
      [6, true, false],
    ]);
    expect(doneMap(plan, [done(day(5), 'arms')]).find(([d]) => d === 5)).toEqual([5, true, true]);
  });

  it('ignores other plans, empty workouts, unfinished ones and other weeks', () => {
    const unfinished = { ...done(day(0), 'push'), finishedAt: undefined };
    const workouts = [
      done(day(0), 'push', 'other-plan'),
      done(day(1), undefined, undefined),
      unfinished,
      done(day(7), 'push'),
      done(day(-1), 'pull'),
    ];
    expect(weekProgress(testPlan(), workouts, monday).every((s) => !s.done)).toBe(true);
  });
});

describe('COURT_READY_PLAN', () => {
  const plan = COURT_READY_PLAN;

  it('has the example’s ids, sports and settings', () => {
    expect(plan).toMatchObject({ id: 'court-ready', name: 'Court-Ready', example: 'court-ready', progression: 'progress' });
    expect(plan.workouts.map((w) => w.id)).toEqual(['uppera', 'lower', 'upperb', 'bonus']);
    expect(plan.sports).toEqual([
      { id: 'volleyball', sport: 'volleyball', name: 'Volleyball' },
      { id: 'basketball', sport: 'basketball', name: 'Basketball' },
    ]);
    expect(plan.cycle).toEqual({
      phases: ['learn', 'learn', 'build', 'build', 'build', 'build', 'deload', 'push', 'push', 'push', 'push', 'deload'],
      repeatFrom: 3,
    });
    expect(plan.lighterWeekEvery).toBeUndefined();
    expect(plan.targets).toEqual({
      kcal: DAILY_TARGETS.kcal,
      kcalRestDay: DAILY_TARGETS.kcalRestDay,
      proteinG: DAILY_TARGETS.proteinG,
      steps: DAILY_TARGETS.steps,
      stepsSportDay: DAILY_TARGETS.stepsGameDay,
    });
    expect(plan.targets).toEqual({ kcal: 2100, kcalRestDay: 1900, proteinG: 165, steps: 10000, stepsSportDay: 7000 });
  });

  it('has the week of the app, Monday first', () => {
    const note =
      'If you play, do the game warm-up and rest from the gym. If this week is only Tuesday and Friday, you can do the optional Bonus session, or just rest.';
    const gym = (workoutId: string, optional?: boolean) => ({
      ref: { kind: 'gym', workoutId },
      ...(optional ? { optional } : {}),
    });
    const sport = (sessionId: string, optional?: boolean) => ({
      ref: { kind: 'sport', sessionId },
      ...(optional ? { optional } : {}),
    });
    expect(plan.week).toEqual([
      { sessions: [gym('uppera')] },
      { sessions: [sport('volleyball')] },
      { sessions: [gym('lower')] },
      { sessions: [sport('volleyball', true), gym('bonus', true)], note },
      { sessions: [sport('basketball')] },
      { sessions: [gym('upperb')] },
      { sessions: [sport('volleyball', true)], note },
    ]);
    // Same gym days as the old week.
    WEEK_PLAN.forEach((d, i) => {
      if (d.kind === 'gym') expect(plan.week[i].sessions[0].ref).toEqual({ kind: 'gym', workoutId: d.routineId });
    });
  });

  it('survives a JSON round trip unchanged', () => {
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan);
    // toEqual ignores undefined keys; make sure there are none to lose.
    expect(JSON.stringify(JSON.parse(JSON.stringify(plan)))).toBe(JSON.stringify(plan));
    const hasUndefined = (v: unknown): boolean =>
      v === undefined ||
      (typeof v === 'object' && v !== null && Object.values(v as Record<string, unknown>).some(hasUndefined));
    expect(hasUndefined(plan)).toBe(false);
  });

  it('copies each routine field for field, apart from day, cycleRule and gameMode', () => {
    for (const r of ROUTINES) {
      const w = findWorkout(plan, r.id)!;
      const { day: _day, ...routine } = r;
      const { cycleRule: _rule, gameMode: _game, ...rest } = w;
      expect(rest).toStrictEqual(routine);
    }
  });

  it('shares no objects with ROUTINES', () => {
    const w = findWorkout(plan, 'uppera')!;
    const r = ROUTINES.find((x) => x.id === 'uppera')!;
    expect(w.items).not.toBe(r.items);
    expect(w.items[0]).not.toBe(r.items[0]);
    expect(w.groups).not.toBe(r.groups);
  });

  it('lists only guide pages that exist', () => {
    for (const slug of plan.articles ?? []) expect(ARTICLE_BY_SLUG[slug]).toBeDefined();
  });
});
