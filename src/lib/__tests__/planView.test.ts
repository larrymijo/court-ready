import { describe, expect, it } from '@jest/globals';

import { examplePlans } from '@/data/plan-templates';
import { ARTICLES } from '@/data/guide';
import {
  chooseWorkoutView,
  isGuideArticleVisible,
  planFacts,
  planSpecificArticleSlugs,
  planStanding,
  planWeekView,
  visibleGuideSlugs,
} from '@/lib/planView';
import type { GymWorkout, Plan, Workout } from '@/lib/types';

const [COURT_READY, MUSCLE_MASS, DEFINITION] = examplePlans();

/** Wednesday of the week Monday 9 Nov to Sunday 15 Nov 2026. */
const WED = '2026-11-11';

let n = 1;
/** A finished workout started at noon on the given day. */
function done(dateISO: string, planId: string, sessionId: string | undefined): Workout {
  const [y, m, d] = dateISO.split('-').map(Number);
  const start = new Date(y, m - 1, d, 12).getTime();
  return { id: `w${n++}`, name: sessionId ?? 'Empty', planId, sessionId, startedAt: start, finishedAt: start + 3600_000, exercises: [] };
}

function allSessions(view: ReturnType<typeof planWeekView>) {
  return view.days.flatMap((d) => d.sessions.map((s) => ({ weekday: d.weekday, ...s })));
}

describe('planWeekView', () => {
  const view = planWeekView(COURT_READY, { start: '2026-10-19' }, [], WED);

  it('lists seven days, Monday first, with dates, today and notes', () => {
    expect(view.mondayISO).toBe('2026-11-09');
    expect(view.days.map((d) => d.date)).toEqual([
      '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15',
    ]);
    expect(view.days.map((d) => d.isToday)).toEqual([false, false, true, false, false, false, false]);
    expect(view.days.map((d) => d.isPast)).toEqual([true, true, false, false, false, false, false]);
    expect(view.position).toMatchObject({ week: 4, phase: 'build', started: true });
    expect(view.days[0].note).toBeUndefined();
    expect(view.days[3].note).toContain('game warm-up');
  });

  it('gives each session its kind, name, focus, minutes and optional flag, in plan order', () => {
    expect(view.days[0].sessions).toMatchObject([
      { kind: 'gym', id: 'uppera', name: 'Upper A', minutes: expect.any(Number), optional: false, done: false, startable: true },
    ]);
    expect(view.days[0].sessions[0].focus.length).toBeGreaterThan(0);
    expect(view.days[1].sessions).toMatchObject([{ kind: 'sport', id: 'volleyball', name: 'Volleyball', optional: false, startable: false }]);
    // Court-Ready's Thursday: optional volleyball, then the optional Bonus.
    expect(view.days[3].sessions).toMatchObject([
      { kind: 'sport', id: 'volleyball', optional: true, startable: false },
      { kind: 'gym', id: 'bonus', optional: true, startable: true },
    ]);
    expect(view.days[6].sessions).toMatchObject([{ kind: 'sport', optional: true }]);
    expect(view.days[2].sessions[0].id).toBe('lower');
  });

  it('counts required gym sessions only: 0 of 3, then a session done on another day counts once', () => {
    expect([view.sessionsDone, view.sessionsPlanned]).toEqual([0, 3]);
    // Upper A (planned Monday) done on Tuesday; the optional Bonus done too; a second Upper A adds nothing.
    const history = [
      done('2026-11-10', 'court-ready', 'uppera'),
      done('2026-11-11', 'court-ready', 'bonus'),
      done('2026-11-12', 'court-ready', 'uppera'),
    ];
    const v = planWeekView(COURT_READY, { start: '2026-10-19' }, history, WED);
    expect([v.sessionsDone, v.sessionsPlanned]).toEqual([1, 3]);
    expect(v.days[0].sessions[0]).toMatchObject({ done: true, doneOnWeekday: 1 });
    expect(v.days[3].sessions[1]).toMatchObject({ id: 'bonus', done: true, doneOnWeekday: 2 });
    expect(allSessions(v).filter((s) => s.kind === 'gym' && s.done)).toHaveLength(2);
  });

  it('ignores other plans, unfinished workouts, other weeks and sport', () => {
    const unfinished = { ...done('2026-11-09', 'court-ready', 'uppera'), finishedAt: undefined };
    const history = [
      done('2026-11-09', 'definition', 'uppera'),
      unfinished,
      done('2026-11-08', 'court-ready', 'lower'),
      done('2026-11-16', 'court-ready', 'lower'),
      done('2026-11-10', 'court-ready', 'volleyball'),
      done('2026-11-10', 'court-ready', undefined),
    ];
    const v = planWeekView(COURT_READY, { start: '2026-10-19' }, history, WED);
    expect(v.sessionsDone).toBe(0);
    expect(allSessions(v).some((s) => s.done)).toBe(false);
  });

  it('needs two finished workouts for a workout planned twice', () => {
    const twice = planWeekView(MUSCLE_MASS, { start: '2026-11-09' }, [done('2026-11-09', 'muscle-mass', 'mm-push')], WED);
    expect([twice.sessionsDone, twice.sessionsPlanned]).toEqual([1, 6]);
    expect(twice.days[0].sessions[0].done).toBe(true);
    expect(twice.days[3].sessions[0].done).toBe(false);
    const both = planWeekView(
      MUSCLE_MASS,
      { start: '2026-11-09' },
      [done('2026-11-09', 'muscle-mass', 'mm-push'), done('2026-11-14', 'muscle-mass', 'mm-push')],
      WED,
    );
    expect(both.days[0].sessions[0]).toMatchObject({ done: true, doneOnWeekday: 0 });
    expect(both.days[3].sessions[0]).toMatchObject({ done: true, doneOnWeekday: 5 });
  });

  it('has no position without a state, and rest days without sessions', () => {
    const v = planWeekView(DEFINITION, undefined, [], WED);
    expect(v.position).toBeNull();
    expect(v.days[2].sessions).toEqual([]);
    expect([v.sessionsDone, v.sessionsPlanned]).toEqual([0, 4]);
  });
});

describe('chooseWorkoutView', () => {
  const plans = [COURT_READY, MUSCLE_MASS, DEFINITION];

  it("lists today's, then the rest of the week in week order, with the done weekday", () => {
    const history = [done('2026-11-09', 'court-ready', 'uppera')];
    const v = chooseWorkoutView(plans, 'court-ready', history, WED);
    expect(v.today.map((i) => i.workoutId)).toEqual(['lower']);
    expect(v.restOfWeek.map((i) => [i.workoutId, i.plannedWeekday, i.optional, i.done, i.doneOnWeekday])).toEqual([
      ['uppera', 0, false, true, 0],
      ['bonus', 3, true, false, undefined],
      ['upperb', 5, false, false, undefined],
    ]);
    expect(v.today[0]).toMatchObject({ planId: 'court-ready', name: 'Lower + Core', plannedWeekday: 2, done: false });
    expect(v.otherInPlan).toEqual([]);
  });

  it('shows a session done on another weekday with that weekday', () => {
    const v = chooseWorkoutView(plans, 'court-ready', [done('2026-11-10', 'court-ready', 'upperb')], WED);
    expect(v.restOfWeek.find((i) => i.workoutId === 'upperb')).toMatchObject({ plannedWeekday: 5, done: true, doneOnWeekday: 1 });
  });

  it('lists other saved plans with all their gym workouts', () => {
    const v = chooseWorkoutView(plans, 'court-ready', [], WED);
    expect(v.otherPlans.map((p) => [p.planId, p.planName, p.workouts.map((w) => w.name)])).toEqual([
      ['muscle-mass', 'Muscle Mass Building', ['Push', 'Pull', 'Legs']],
      ['definition', 'Definition', ['Upper', 'Lower']],
    ]);
    expect(v.otherPlans[1].workouts[0]).toMatchObject({
      planId: 'definition',
      workoutId: 'def-upper',
      exerciseCount: 7,
      minutes: 55,
    });
  });

  it('shows a workout planned twice once per day, and workouts outside the week', () => {
    const extra: GymWorkout = { id: 'mm-arms', name: 'Arms', focus: 'Arms', minutes: 30, warmup: 'upper', items: [], groups: {} };
    const mm: Plan = { ...MUSCLE_MASS, workouts: [...MUSCLE_MASS.workouts, extra] };
    const v = chooseWorkoutView([COURT_READY, mm], 'muscle-mass', [done('2026-11-09', 'muscle-mass', 'mm-push')], WED);
    expect(v.today.map((i) => i.workoutId)).toEqual(['mm-legs']);
    expect(v.restOfWeek.map((i) => [i.workoutId, i.plannedWeekday, i.done])).toEqual([
      ['mm-push', 0, true],
      ['mm-pull', 1, false],
      ['mm-push', 3, false],
      ['mm-pull', 4, false],
      ['mm-legs', 5, false],
    ]);
    expect(v.otherInPlan.map((i) => i.workoutId)).toEqual(['mm-arms']);
    expect(v.otherInPlan[0].plannedWeekday).toBeUndefined();
    expect(v.otherPlans.map((p) => p.planId)).toEqual(['court-ready']);
  });

  it('has nothing today on a rest day', () => {
    const v = chooseWorkoutView(plans, 'definition', [], WED);
    expect(v.today).toEqual([]);
    expect(v.restOfWeek.map((i) => i.workoutId)).toEqual(['def-upper', 'def-lower', 'def-upper', 'def-lower']);
  });

  it('copes with an active id that is not saved', () => {
    const v = chooseWorkoutView(plans, 'gone', [], WED);
    expect([v.today, v.restOfWeek, v.otherInPlan]).toEqual([[], [], []]);
    expect(v.otherPlans).toHaveLength(3);
  });
});

describe('planFacts', () => {
  it('counts the three examples without optional sessions', () => {
    const cr = planFacts(COURT_READY);
    expect([cr.gymPerWeek, cr.sportPerWeek]).toEqual([3, 2]);
    expect(cr.mixesGymAndSport).toBe(true);
    expect(cr.workoutNames).toEqual(['Upper A', 'Lower + Core', 'Upper B', 'Bonus']);
    const mm = planFacts(MUSCLE_MASS);
    expect([mm.gymPerWeek, mm.sportPerWeek, mm.mixesGymAndSport]).toEqual([6, 0, false]);
    expect(mm.workoutNames).toEqual(['Push', 'Pull', 'Legs']);
    const def = planFacts(DEFINITION);
    expect([def.gymPerWeek, def.sportPerWeek, def.mixesGymAndSport]).toEqual([4, 0, false]);
  });

  it('describes how weights progress and the lighter week', () => {
    expect(planFacts(COURT_READY)).toMatchObject({ progression: 'progress', lighterWeek: { kind: 'cycle', weeks: 12 }, hasRhythm: true });
    expect(planFacts(MUSCLE_MASS)).toMatchObject({ progression: 'progress', lighterWeek: { kind: 'every', every: 6 }, hasRhythm: true });
    expect(planFacts(DEFINITION)).toMatchObject({
      progression: 'maintain',
      progressionTitle: 'Hold',
      progressionText: 'match last time',
      lighterWeek: { kind: 'none' },
      hasRhythm: false,
    });
    expect(planFacts(MUSCLE_MASS).progressionTitle).toBe('Progress');
  });

  it('ignores a lighterWeekEvery that is not positive', () => {
    expect(planFacts({ ...MUSCLE_MASS, lighterWeekEvery: 0 }).hasRhythm).toBe(false);
  });
});

describe('planStanding', () => {
  it('reads the active plan from its start', () => {
    expect(planStanding(COURT_READY, { start: '2026-10-19' }, true, WED)).toEqual({
      status: 'active', week: 4, cycle: 1, phase: 'build', cycleLength: 12,
    });
    expect(planStanding(DEFINITION, { start: '2026-10-19' }, true, WED)).toMatchObject({
      status: 'active', week: 4, cycleLength: null,
    });
  });

  it('reads a paused plan from leftAtWeek, whatever the date is now', () => {
    expect(planStanding(COURT_READY, { start: '2026-01-05', leftAtWeek: 7 }, false, WED)).toEqual({
      status: 'paused', week: 7, cycle: 1, phase: 'deload', cycleLength: 12, leftAtWeek: 7,
    });
    // In its second pass: absolute week 13 is week 3 of cycle 2.
    expect(planStanding(COURT_READY, { start: '2026-01-05', leftAtWeek: 13 }, false, WED)).toMatchObject({
      status: 'paused', week: 3, cycle: 2, leftAtWeek: 13,
    });
  });

  it('knows a plan that has not started, and one never used', () => {
    expect(planStanding(COURT_READY, { start: '2026-11-16' }, true, WED)).toEqual({
      status: 'notStarted', startISO: '2026-11-16', daysUntilStart: 5,
    });
    expect(planStanding(COURT_READY, { start: '2026-11-16' }, false, WED).status).toBe('notStarted');
    expect(planStanding(DEFINITION, undefined, false, WED)).toEqual({ status: 'unused' });
  });

  it('continues a paused plan with a state but no leftAtWeek from its start', () => {
    expect(planStanding(DEFINITION, { start: '2026-11-02' }, false, WED)).toMatchObject({
      status: 'paused', week: 2, leftAtWeek: 2,
    });
  });
});

describe('guide pages', () => {
  const crArticles = ['how', 'week', 'weeks12', 'chest', 'food', 'life', 'cheat'];
  const everySlug = ARTICLES.map((a) => a.slug);

  it('takes the plan-specific set from the example templates', () => {
    expect([...planSpecificArticleSlugs()].sort()).toEqual([...crArticles].sort());
    for (const slug of crArticles) expect(everySlug).toContain(slug);
  });

  it('shows every page with Court-Ready active', () => {
    expect(visibleGuideSlugs(everySlug, COURT_READY)).toEqual(everySlug);
    expect(crArticles.every((s) => isGuideArticleVisible(s, COURT_READY))).toBe(true);
  });

  it('shows only the general pages with another plan active', () => {
    const shown = visibleGuideSlugs(everySlug, DEFINITION);
    expect(shown).toEqual(everySlug.filter((s) => !crArticles.includes(s)));
    expect(shown.length).toBeGreaterThan(0);
    expect(isGuideArticleVisible('how', DEFINITION)).toBe(false);
    expect(isGuideArticleVisible(shown[0], DEFINITION)).toBe(true);
  });

  it('keeps the Court-Ready pages hidden once Court-Ready is deleted, and shows them when a plan lists them', () => {
    // Court-Ready is gone: the active plan is Definition, whose saved copy lists nothing.
    expect(visibleGuideSlugs(everySlug, DEFINITION)).not.toContain('weeks12');
    expect(visibleGuideSlugs(everySlug, undefined)).not.toContain('weeks12');
    // A plan that lists a page shows it.
    const mine: Plan = { ...DEFINITION, articles: ['food'] };
    expect(isGuideArticleVisible('food', mine)).toBe(true);
    expect(isGuideArticleVisible('how', mine)).toBe(false);
  });
});
