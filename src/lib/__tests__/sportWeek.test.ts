import { describe, expect, it } from '@jest/globals';

import { examplePlans } from '@/data/plan-templates';
import { chooseWorkoutView, gameModeHint, planWeekView, sportSessionForToday } from '@/lib/planView';
import { weekProgress, workoutHardSets } from '@/lib/plans';
import { doneToday, exerciseBests, muscleSets, plannedMuscleSets, weekSummary } from '@/lib/stats';
import type { ExerciseDef, GymWorkout, Plan, Workout } from '@/lib/types';

const [COURT_READY] = examplePlans();
const MON = '2026-11-09';
const TUE = '2026-11-10';
const WED = '2026-11-11';
const THU = '2026-11-12';
const FRI = '2026-11-13';
const SUN = '2026-11-15';

let n = 1;
function at(dateISO: string, hour = 12): number {
  const [y, m, d] = dateISO.split('-').map(Number);
  return new Date(y, m - 1, d, hour).getTime();
}
function gym(dateISO: string, planId: string | undefined, sessionId: string | undefined): Workout {
  const start = at(dateISO);
  return { id: `g${n++}`, name: 'Gym', planId, sessionId, startedAt: start, finishedAt: start + 3600_000, exercises: [] };
}
function sport(dateISO: string, planId: string | undefined, sessionId: string | undefined, minutes = 60): Workout {
  const start = at(dateISO);
  return {
    id: `s${n++}`,
    name: 'Volleyball',
    kind: 'sport',
    sport: 'volleyball',
    minutes,
    planId,
    sessionId,
    startedAt: start,
    finishedAt: start + minutes * 60_000,
    exercises: [],
  };
}

describe("Court-Ready's week with sport records", () => {
  const state = { start: '2026-10-19' };

  it("marks Tuesday's volleyball done by a sport record, and counts it apart from gym", () => {
    const v = planWeekView(COURT_READY, state, [sport(TUE, 'court-ready', 'volleyball')], WED);
    expect(v.days[1].sessions[0]).toMatchObject({ kind: 'sport', done: true, doneOnWeekday: 1, startable: true });
    expect([v.sessionsDone, v.sessionsPlanned]).toEqual([0, 3]);
    expect([v.sessionsDoneAll, v.sessionsPlannedAll]).toEqual([1, 5]);
    // The one record fills the required Tuesday first; the optional days stay open.
    expect(v.days[3].sessions[0]).toMatchObject({ kind: 'sport', optional: true, done: false });
  });

  it('lets a second record fill an optional volleyball day, without changing the required counts', () => {
    const v = planWeekView(
      COURT_READY,
      state,
      [sport(TUE, 'court-ready', 'volleyball'), sport(THU, 'court-ready', 'volleyball')],
      WED,
    );
    expect(v.days[1].sessions[0].done).toBe(true);
    expect(v.days[3].sessions[0]).toMatchObject({ done: true, doneOnWeekday: 3 });
    expect(v.days[6].sessions[0].done).toBe(false);
    expect([v.sessionsDoneAll, v.sessionsPlannedAll]).toEqual([1, 5]);
  });

  it('counts a sport session done on another day of the week once', () => {
    const v = planWeekView(COURT_READY, state, [sport(MON, 'court-ready', 'volleyball')], WED);
    expect(v.days[1].sessions[0]).toMatchObject({ done: true, doneOnWeekday: 0 });
  });

  it('does not count a sport record without a plan, of another plan or unfinished', () => {
    const unfinished = { ...sport(TUE, 'court-ready', 'volleyball'), finishedAt: undefined };
    const history = [sport(TUE, undefined, undefined), sport(TUE, 'other', 'volleyball'), unfinished];
    const v = planWeekView(COURT_READY, state, history, WED);
    expect(v.sessionsDoneAll).toBe(0);
    expect(v.days.flatMap((d) => d.sessions).some((s) => s.done)).toBe(false);
  });

  it('does not let a gym-shaped record with a sport id mark the sport done', () => {
    const v = planWeekView(COURT_READY, state, [gym(TUE, 'court-ready', 'volleyball')], WED);
    expect(v.days[1].sessions[0].done).toBe(false);
  });
});

describe('the same id on a gym workout and a sport session', () => {
  const lift: GymWorkout = { id: 'x', name: 'Lift', focus: '', minutes: 30, warmup: 'upper', items: [], groups: {} };
  const plan = {
    id: 'clash',
    name: 'Clash',
    workouts: [lift],
    sports: [{ id: 'x', sport: 'running', name: 'Run' }],
    week: [
      { sessions: [{ ref: { kind: 'gym', workoutId: 'x' } }] },
      { sessions: [{ ref: { kind: 'sport', sessionId: 'x' } }] },
      { sessions: [] },
      { sessions: [] },
      { sessions: [] },
      { sessions: [] },
      { sessions: [] },
    ],
    progression: 'progress',
  } as unknown as Plan;

  it('marks only the session of the record kind', () => {
    expect(weekProgress(plan, [sport(TUE, 'clash', 'x')], MON).map((s) => s.done)).toEqual([false, true]);
    expect(weekProgress(plan, [gym(TUE, 'clash', 'x')], MON).map((s) => s.done)).toEqual([true, false]);
    const both = weekProgress(plan, [gym(TUE, 'clash', 'x'), sport(TUE, 'clash', 'x')], MON);
    expect(both.map((s) => s.done)).toEqual([true, true]);
  });

  it('keeps the two apart in the week view', () => {
    const v = planWeekView(plan, undefined, [sport(WED, 'clash', 'x')], WED);
    expect(v.days[0].sessions[0]).toMatchObject({ kind: 'gym', done: false });
    expect(v.days[1].sessions[0]).toMatchObject({ kind: 'sport', done: true, doneOnWeekday: 2 });
  });
});

describe('optional sport sessions', () => {
  it('stay out of the required counts', () => {
    const v = planWeekView(COURT_READY, { start: '2026-10-19' }, [sport(SUN, 'court-ready', 'volleyball')], SUN);
    expect(v.days[1].sessions[0].done).toBe(true); // the required Tuesday goes first
    expect(v.days[6].sessions[0]).toMatchObject({ optional: true, done: false });
    expect(v.sessionsPlannedAll).toBe(5);
  });
});

describe('gameModeHint', () => {
  it("names tomorrow's sport when today's gym workout offers game mode", () => {
    // Wednesday is Lower + Core; Thursday offers volleyball.
    expect(gameModeHint(COURT_READY, WED)).toBe('Volleyball');
  });

  it('is empty on a day before no sport, or on a workout without game mode', () => {
    expect(gameModeHint(COURT_READY, MON)).toBeUndefined(); // Upper A has no game mode
    expect(gameModeHint(COURT_READY, TUE)).toBeUndefined();
    expect(gameModeHint(COURT_READY, FRI)).toBeUndefined();
  });

  it('is empty when game mode is offered but tomorrow holds no sport', () => {
    const week = COURT_READY.week.map((d, i) => (i === 3 ? { sessions: [] } : d));
    expect(gameModeHint({ ...COURT_READY, week } as Plan, WED)).toBeUndefined();
  });
});

describe('the Sports section of the workout list', () => {
  it('lists the four sports, each with the Court-Ready session it counts for', () => {
    const v = chooseWorkoutView([COURT_READY], 'court-ready', [], WED);
    expect(v.sports.map((s) => s.sport)).toEqual(['volleyball', 'basketball', 'football', 'running']);
    expect(v.sports[0]).toMatchObject({ planId: 'court-ready', sessionId: 'volleyball' });
    expect(v.sports[1]).toMatchObject({ planId: 'court-ready', sessionId: 'basketball' });
    expect(v.sports[2]).toMatchObject({ name: 'Football' });
    expect(v.sports[2].sessionId).toBeUndefined();
    expect(v.sports[3].planId).toBeUndefined();
  });

  it('lists them without a session when the plan has no sport or there is no active plan', () => {
    const bare = { ...COURT_READY, id: 'bare', sports: [], week: COURT_READY.week.map(() => ({ sessions: [] })) } as Plan;
    const v = chooseWorkoutView([bare], 'bare', [], WED);
    expect(v.sports).toHaveLength(4);
    expect(v.sports.every((s) => s.sessionId === undefined)).toBe(true);
    expect(chooseWorkoutView([], 'none', [], WED).sports).toHaveLength(4);
  });

  it('picks the session planned today, otherwise the first of the sport', () => {
    const second = { id: 'v2', sport: 'volleyball' as const, name: 'Beach volleyball' };
    const plan = {
      ...COURT_READY,
      sports: [...COURT_READY.sports, second],
      week: COURT_READY.week.map((d, i) => (i === 2 ? { sessions: [{ ref: { kind: 'sport' as const, sessionId: 'v2' } }] } : d)),
    } as Plan;
    expect(sportSessionForToday(plan, 'volleyball', WED)?.id).toBe('v2');
    expect(sportSessionForToday(plan, 'volleyball', MON)?.id).toBe('volleyball');
    expect(sportSessionForToday(plan, 'football', MON)).toBeUndefined();
  });
});

describe('stats with sport records', () => {
  const ex = (kind: ExerciseDef['kind']): ExerciseDef =>
    ({ id: kind, name: kind, kind, primary: 'quads', secondary: ['glutes'], isolation: false, tracking: 'weightReps' }) as unknown as ExerciseDef;
  const defs: Record<string, ExerciseDef> = { main: ex('standard'), drill: ex('drill'), stretch: ex('stretch'), care: ex('care') };
  const ids = ['main', 'drill', 'stretch', 'care'];
  const lifting: Workout = {
    ...gym(MON, 'court-ready', 'lower'),
    exercises: ids.map((id) => ({
      exerciseId: id,
      sets: [{ id: `${id}1`, type: 'normal', weight: 100, reps: 5, done: true }],
    })) as unknown as Workout['exercises'],
  };

  it('leaves drills and stretches out of sets, like care drills', () => {
    const sets = muscleSets([lifting], (id) => defs[id]);
    expect(sets.quads).toBe(1);
    expect(sets.glutes).toBe(0.5);
    const w = {
      ...(COURT_READY.workouts[0] as GymWorkout),
      cycleRule: undefined,
      items: ids.map((exerciseId) => ({ exerciseId, sets: 3, repsMin: 5, repsMax: 5, repsLabel: '5', rir: '2' })),
    } as unknown as GymWorkout;
    expect(workoutHardSets(w, (id) => defs[id], { phase: 'build' })).toBe(3);
    const week = [{ sessions: [{ ref: { kind: 'gym', workoutId: w.id } }] }, ...Array(6).fill({ sessions: [] })];
    const plan = { ...COURT_READY, workouts: [w], week } as unknown as Plan;
    expect(plannedMuscleSets(plan, 'build', (id) => defs[id]).quads).toBe(3);
  });

  it('is identical for sets, volume and bests with and without sport records', () => {
    const withSport = [lifting, sport(MON, 'court-ready', 'volleyball')];
    expect(muscleSets(withSport, (id) => defs[id])).toEqual(muscleSets([lifting], (id) => defs[id]));
    expect(exerciseBests('main', withSport)).toEqual(exerciseBests('main', [lifting]));
    const a = weekSummary([lifting], MON);
    const b = weekSummary(withSport, MON);
    expect([b.sets, b.volume]).toEqual([a.sets, a.volume]);
  });

  it('counts sport sessions and their minutes in the week', () => {
    const b = weekSummary([lifting, sport(TUE, 'court-ready', 'volleyball', 90), sport('2026-11-16', undefined, undefined)], MON);
    expect(b.sessions).toBe(2);
    expect(b.minutes).toBe(60 + 90);
  });

  it("lists the day's finished workouts, sport included", () => {
    const s = sport(TUE, undefined, undefined);
    expect(doneToday([lifting, s], TUE)).toEqual([s]);
    expect(doneToday([lifting, { ...s, finishedAt: undefined }], TUE)).toEqual([]);
  });
});
