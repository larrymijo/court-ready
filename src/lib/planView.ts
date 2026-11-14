// What the plan screens show, worked out from saved data. Pure functions with "today" passed in,
// so the screens hold no plan logic (docs/polish-plan.md, sections 3 and 4).
//
// Phase 3: only gym workouts can be started. Sport sessions are shown but never startable and
// never count as done; phase 4 adds logging them.
import { examplePlans } from '@/data/plan-templates';
import { addDaysISO, daysBetween, isoFromTimestamp, mondayOfISO, parseISODate, weekdayIndex } from '@/lib/dates';
import {
  daySessions,
  planPosition,
  sessionRefId,
  weekProgress,
  type DaySession,
  type PlanPosition,
} from '@/lib/plans';
import type { GymWorkout, PhaseId, Plan, PlanState, SessionRef, SportId, Workout } from '@/lib/types';

// ---------------------------------------------------------------------------------------------
// The week of a plan

export interface WeekSessionView {
  kind: 'gym' | 'sport';
  /** The workout id (gym) or the sport session id (sport). */
  id: string;
  ref: SessionRef;
  name: string;
  /** Gym: what the workout is about ("Chest focus"). Sport: empty. */
  focus: string;
  /** Gym: planned minutes. Sport: the session's minutes if it has them. */
  minutes?: number;
  sport?: SportId;
  optional: boolean;
  /** Always false for sport in phase 3. */
  done: boolean;
  /** The weekday (Monday = 0) a done gym session was done on. Not necessarily its planned day. */
  doneOnWeekday?: number;
  /** Gym only in phase 3. */
  startable: boolean;
}

export interface WeekDayView {
  /** Monday = 0. */
  weekday: number;
  date: string;
  isToday: boolean;
  /** Before today in this week. */
  isPast: boolean;
  note?: string;
  /** In plan order; empty for a rest day. */
  sessions: WeekSessionView[];
}

export interface PlanWeekView {
  planId: string;
  mondayISO: string;
  /** Monday first. */
  days: WeekDayView[];
  /** Required gym sessions done this week ("1 of 3 sessions done"). Sport joins in phase 4. */
  sessionsDone: number;
  /** Required gym sessions planned this week. Sport joins in phase 4. */
  sessionsPlanned: number;
  /** Where the plan stands today, or null if it has no state. */
  position: PlanPosition | null;
}

/** The weekday (Monday = 0) a finished workout was started on. */
function weekdayOf(w: Workout): number {
  return weekdayIndex(parseISODate(isoFromTimestamp(w.startedAt)));
}

interface Matched {
  weekday: number;
  session: DaySession;
  done: boolean;
  doneOnWeekday?: number;
}

/**
 * Every planned session of the week with whether it is done and (gym) on which weekday. The done
 * flags are those of `weekProgress`: a workout done on another day of the week counts once, a
 * workout planned twice needs two. A done session shows the weekday of the workout that was
 * done, preferring one on its planned day.
 */
function matchWeek(plan: Plan, workouts: readonly Workout[], mondayISO: string): Matched[] {
  const status = weekProgress(plan, workouts, mondayISO);
  const sunday = addDaysISO(mondayISO, 6);
  const doneDays = new Map<string, number[]>();
  const chronological = workouts
    .filter((w) => w.finishedAt && w.planId === plan.id && w.sessionId)
    .filter((w) => {
      const day = isoFromTimestamp(w.startedAt);
      return day >= mondayISO && day <= sunday;
    })
    .sort((a, b) => a.startedAt - b.startedAt);
  for (const w of chronological) {
    const list = doneDays.get(w.sessionId as string) ?? [];
    list.push(weekdayOf(w));
    doneDays.set(w.sessionId as string, list);
  }

  const out: Matched[] = [];
  let i = 0;
  for (let d = 0; d < 7; d++) {
    for (const session of daySessions(plan, d)) {
      out.push({ weekday: d, session, done: status[i].done });
      i++;
    }
  }
  // Hand out the weekdays: first to entries whose own day is among them, then in order.
  for (const pass of ['same', 'any'] as const) {
    for (const m of out) {
      if (!m.done || m.doneOnWeekday != null) continue;
      const days = doneDays.get(sessionRefId(m.session.ref));
      if (!days || days.length === 0) continue;
      const at = pass === 'same' ? days.indexOf(m.weekday) : 0;
      if (at < 0) continue;
      m.doneOnWeekday = days.splice(at, 1)[0];
    }
  }
  return out;
}

function sessionView(m: Matched): WeekSessionView {
  const s = m.session;
  if (s.kind === 'gym') {
    return {
      kind: 'gym',
      id: s.workout.id,
      ref: s.ref,
      name: s.workout.name,
      focus: s.workout.focus,
      minutes: s.workout.minutes,
      optional: s.optional,
      done: m.done,
      doneOnWeekday: m.done ? m.doneOnWeekday : undefined,
      startable: true,
    };
  }
  return {
    kind: 'sport',
    id: s.session.id,
    ref: s.ref,
    name: s.session.name,
    focus: '',
    minutes: s.session.minutes,
    sport: s.session.sport,
    optional: s.optional,
    done: false, // sport can't be logged until phase 4
    startable: false,
  };
}

/** The week of a plan that holds `today`, Monday first. */
export function planWeekView(
  plan: Plan,
  state: PlanState | undefined,
  workouts: readonly Workout[],
  today: string,
): PlanWeekView {
  const monday = mondayOfISO(today);
  const matched = matchWeek(plan, workouts, monday);
  const days: WeekDayView[] = [];
  let done = 0;
  let planned = 0;
  for (let d = 0; d < 7; d++) {
    const date = addDaysISO(monday, d);
    const sessions = matched.filter((m) => m.weekday === d).map(sessionView);
    for (const s of sessions) {
      if (s.kind === 'gym' && !s.optional) {
        planned++;
        if (s.done) done++;
      }
    }
    days.push({
      weekday: d,
      date,
      isToday: date === today,
      isPast: date < today,
      note: plan.week[d]?.note,
      sessions,
    });
  }
  return {
    planId: plan.id,
    mondayISO: monday,
    days,
    sessionsDone: done,
    sessionsPlanned: planned,
    position: state && typeof state.start === 'string' ? planPosition(plan, state, today) : null,
  };
}

// ---------------------------------------------------------------------------------------------
// The "Choose a workout" sheet

export interface ChooseWorkoutItem {
  planId: string;
  workoutId: string;
  name: string;
  focus: string;
  minutes: number;
  exerciseCount: number;
  optional: boolean;
  /** The weekday (Monday = 0) the active plan plans it on; absent for workouts outside its week. */
  plannedWeekday?: number;
  /** Done this week as planned (active plan's week only). */
  done: boolean;
  /** The weekday it was done on, if done. */
  doneOnWeekday?: number;
}

export interface ChooseWorkoutView {
  /** Today's gym sessions of the active plan, optional ones included. */
  today: ChooseWorkoutItem[];
  /** The rest of this week's planned gym sessions, in week order; a workout planned twice appears per day. */
  restOfWeek: ChooseWorkoutItem[];
  /** Workouts of the active plan that its week doesn't use. */
  otherInPlan: ChooseWorkoutItem[];
  /** Each other saved plan with all its gym workouts, in saved order. */
  otherPlans: { planId: string; planName: string; workouts: ChooseWorkoutItem[] }[];
}

function chooseItem(plan: Plan, w: GymWorkout, extra: Partial<ChooseWorkoutItem> = {}): ChooseWorkoutItem {
  return {
    planId: plan.id,
    workoutId: w.id,
    name: w.name,
    focus: w.focus,
    minutes: w.minutes,
    exerciseCount: w.items.length,
    optional: !!w.optional,
    done: false,
    ...extra,
  };
}

export function chooseWorkoutView(
  plans: readonly Plan[],
  activePlanId: string,
  workouts: readonly Workout[],
  today: string,
): ChooseWorkoutView {
  const active = plans.find((p) => p.id === activePlanId);
  const out: ChooseWorkoutView = { today: [], restOfWeek: [], otherInPlan: [], otherPlans: [] };
  if (active) {
    const todayWeekday = weekdayIndex(parseISODate(today));
    const used = new Set<string>();
    for (const m of matchWeek(active, workouts, mondayOfISO(today))) {
      if (m.session.kind !== 'gym') continue;
      const w = m.session.workout;
      used.add(w.id);
      const item = chooseItem(active, w, {
        optional: m.session.optional,
        plannedWeekday: m.weekday,
        done: m.done,
        doneOnWeekday: m.done ? m.doneOnWeekday : undefined,
      });
      (m.weekday === todayWeekday ? out.today : out.restOfWeek).push(item);
    }
    // A workout planned on no day at all (optional or not) is "not in its week"; one planned on
    // an earlier or later day is already in restOfWeek.
    out.otherInPlan = active.workouts.filter((w) => !used.has(w.id)).map((w) => chooseItem(active, w));
  }
  for (const plan of plans) {
    if (plan.id === activePlanId) continue;
    out.otherPlans.push({
      planId: plan.id,
      planName: plan.name,
      workouts: plan.workouts.map((w) => chooseItem(plan, w)),
    });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Facts about a plan

export type LighterWeek =
  | { kind: 'cycle'; weeks: number }
  | { kind: 'every'; every: number }
  | { kind: 'none' };

export interface PlanFacts {
  /** Required gym sessions a week (optional ones left out). */
  gymPerWeek: number;
  /** Required sport sessions a week (optional ones left out). */
  sportPerWeek: number;
  /** Names of the plan's gym workouts, in the plan's order. */
  workoutNames: string[];
  /** The week has both gym and sport sessions (optional ones count here). */
  mixesGymAndSport: boolean;
  progression: 'progress' | 'maintain';
  /** "Progress" or "Hold". */
  progressionTitle: string;
  /** "add reps, then weight" or "match last time". */
  progressionText: string;
  lighterWeek: LighterWeek;
  /** The plan has a cycle or a lighter week, so its start date matters. */
  hasRhythm: boolean;
}

export function planFacts(plan: Plan): PlanFacts {
  let gym = 0;
  let sport = 0;
  let anyGym = false;
  let anySport = false;
  for (let d = 0; d < 7; d++) {
    for (const s of daySessions(plan, d)) {
      if (s.kind === 'gym') anyGym = true;
      else anySport = true;
      if (s.optional) continue;
      if (s.kind === 'gym') gym++;
      else sport++;
    }
  }
  let lighterWeek: LighterWeek = { kind: 'none' };
  const cycleLength = plan.cycle?.phases.length ?? 0;
  if (cycleLength > 0) lighterWeek = { kind: 'cycle', weeks: cycleLength };
  else if (plan.lighterWeekEvery && plan.lighterWeekEvery > 0) {
    lighterWeek = { kind: 'every', every: plan.lighterWeekEvery };
  }
  const progress = plan.progression === 'progress';
  return {
    gymPerWeek: gym,
    sportPerWeek: sport,
    workoutNames: plan.workouts.map((w) => w.name),
    mixesGymAndSport: anyGym && anySport,
    progression: plan.progression,
    progressionTitle: progress ? 'Progress' : 'Hold',
    progressionText: progress ? 'add reps, then weight' : 'match last time',
    lighterWeek,
    hasRhythm: lighterWeek.kind !== 'none',
  };
}

// ---------------------------------------------------------------------------------------------
// Where a plan stands

export type PlanStanding =
  /** The active plan, started. */
  | { status: 'active'; week: number; cycle: number; phase: PhaseId; cycleLength: number | null }
  /** Not the active plan; where "Continue" would put it. */
  | { status: 'paused'; week: number; cycle: number; phase: PhaseId; cycleLength: number | null; leftAtWeek: number }
  /** Its start is still ahead. */
  | { status: 'notStarted'; startISO: string; daysUntilStart: number }
  /** Never used: no saved state. */
  | { status: 'unused' };

/**
 * Where a plan stands today. `week` is the week inside the plan (as planPosition counts it, "week 4
 * of 12" with `cycleLength` 12); `leftAtWeek` is the weeks since the start it was left at. A paused
 * plan without `leftAtWeek` goes on from its own start, as "Continue" does.
 */
export function planStanding(plan: Plan, state: PlanState | undefined, isActive: boolean, today: string): PlanStanding {
  if (!state || typeof state.start !== 'string') return { status: 'unused' };
  const length = plan.cycle?.phases.length ?? 0;
  const cycleLength = length > 0 ? length : null;
  const left = state.leftAtWeek;
  if (!isActive && typeof left === 'number' && Number.isInteger(left) && left >= 1) {
    const pos = planPosition(plan, { start: addDaysISO(mondayOfISO(today), -(left - 1) * 7) }, today);
    return { status: 'paused', week: pos.week, cycle: pos.cycle, phase: pos.phase, cycleLength, leftAtWeek: left };
  }
  const pos = planPosition(plan, state, today);
  if (!pos.started) return { status: 'notStarted', startISO: state.start, daysUntilStart: pos.daysUntilStart };
  if (isActive) return { status: 'active', week: pos.week, cycle: pos.cycle, phase: pos.phase, cycleLength };
  const weeksIn = Math.floor(daysBetween(state.start, today) / 7) + 1;
  return { status: 'paused', week: pos.week, cycle: pos.cycle, phase: pos.phase, cycleLength, leftAtWeek: weeksIn };
}

// ---------------------------------------------------------------------------------------------
// Guide pages

/** Guide page slugs that belong to a plan: those listed in the `articles` of any example template. */
export function planSpecificArticleSlugs(): Set<string> {
  const slugs = new Set<string>();
  for (const plan of examplePlans()) for (const slug of plan.articles ?? []) slugs.add(slug);
  return slugs;
}

/**
 * Whether a guide page shows. A plan-specific page (taken from the example templates, so deleting a
 * plan doesn't make its pages general) shows only while a plan that lists it is active; every
 * other page always shows.
 */
export function isGuideArticleVisible(slug: string, activePlan: Plan | undefined): boolean {
  if (!planSpecificArticleSlugs().has(slug)) return true;
  return !!activePlan?.articles?.includes(slug);
}

/** The slugs among `slugs` that show, in the same order. */
export function visibleGuideSlugs(slugs: readonly string[], activePlan: Plan | undefined): string[] {
  const specific = planSpecificArticleSlugs();
  const mine = new Set(activePlan?.articles ?? []);
  return slugs.filter((s) => !specific.has(s) || mine.has(s));
}
