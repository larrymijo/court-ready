// What the plan screens show, worked out from saved data. Pure functions with "today" passed in,
// so the screens hold no plan logic (docs/polish-plan.md, sections 3 and 4).
//
// Phase 4: sport sessions can be started and done like gym workouts. A record matches a planned
// session by kind as well as id.
import { examplePlans } from '@/data/plan-templates';
import { DAY_LONG } from '@/data/schedule';
import { SPORTS } from '@/data/sports';
import { addDaysISO, daysBetween, isoFromTimestamp, mondayOfISO, parseISODate, weekdayIndex } from '@/lib/dates';
import {
  daySessions,
  planPosition,
  recordKind,
  sessionKey,
  sessionRefId,
  weekProgress,
  type DaySession,
  type PlanPosition,
} from '@/lib/plans';
import { PHASES } from '@/lib/program';
import type {
  GymWorkout,
  PhaseId,
  Plan,
  PlanState,
  RoutineItem,
  SessionRef,
  SportId,
  SportSession,
  Workout,
} from '@/lib/types';

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
  done: boolean;
  /** The weekday (Monday = 0) a done session was done on. Not necessarily its planned day. */
  doneOnWeekday?: number;
  /** Gym and sport sessions can both be started. */
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
  /** Required gym sessions done this week ("1 of 3 sessions done"). Sport is not in this number. */
  sessionsDone: number;
  /** Required gym sessions planned this week. */
  sessionsPlanned: number;
  /** Required gym and sport sessions done this week. */
  sessionsDoneAll: number;
  /** Required gym and sport sessions planned this week. */
  sessionsPlannedAll: number;
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
    const key = sessionKey(recordKind(w), w.sessionId as string);
    const list = doneDays.get(key) ?? [];
    list.push(weekdayOf(w));
    doneDays.set(key, list);
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
      const days = doneDays.get(sessionKey(m.session.ref.kind, sessionRefId(m.session.ref)));
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
    done: m.done,
    doneOnWeekday: m.done ? m.doneOnWeekday : undefined,
    startable: true,
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
  let doneAll = 0;
  let plannedAll = 0;
  for (let d = 0; d < 7; d++) {
    const date = addDaysISO(monday, d);
    const sessions = matched.filter((m) => m.weekday === d).map(sessionView);
    for (const s of sessions) {
      if (s.optional) continue;
      plannedAll++;
      if (s.done) doneAll++;
      if (s.kind === 'gym') {
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
    sessionsDoneAll: doneAll,
    sessionsPlannedAll: plannedAll,
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
  /** The four sports, in the order of src/data/sports.ts, each with the plan session it would count for. */
  sports: ChooseSportItem[];
}

export interface ChooseSportItem {
  sport: SportId;
  name: string;
  /** The active plan's session this sport counts for when started from the list; absent when the plan has none. */
  planId?: string;
  sessionId?: string;
  sessionName?: string;
}

/**
 * Which session of a plan a session of this sport, started from the list today, counts for: the
 * plan's sport session of that sport planned today if there is one, otherwise the first in the
 * plan's list; undefined when the plan has no session of that sport.
 */
export function sportSessionForToday(plan: Plan, sport: SportId, today: string): SportSession | undefined {
  const planned = daySessions(plan, weekdayIndex(parseISODate(today))).find(
    (s) => s.kind === 'sport' && s.session.sport === sport,
  );
  if (planned && planned.kind === 'sport') return planned.session;
  return plan.sports.find((s) => s.sport === sport);
}

/**
 * The line for Lower + Core's game mode hint: when one of today's gym workouts offers game mode
 * and tomorrow's planned sessions (optional ones too, required first) include a sport, the name of
 * that sport session ("Volleyball"); otherwise undefined. Sunday looks at Monday. It only informs.
 */
export function gameModeHint(plan: Plan, today: string): string | undefined {
  const weekday = weekdayIndex(parseISODate(today));
  const offers = daySessions(plan, weekday).some((s) => s.kind === 'gym' && !!s.workout.gameMode);
  if (!offers) return undefined;
  const sports = daySessions(plan, (weekday + 1) % 7).filter((s) => s.kind === 'sport');
  const pick = sports.find((s) => !s.optional) ?? sports[0];
  return pick && pick.kind === 'sport' ? pick.session.name : undefined;
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
  const out: ChooseWorkoutView = { today: [], restOfWeek: [], otherInPlan: [], otherPlans: [], sports: [] };
  out.sports = SPORTS.map((def) => {
    const session = active ? sportSessionForToday(active, def.id, today) : undefined;
    return {
      sport: def.id,
      name: def.name,
      ...(active && session ? { planId: active.id, sessionId: session.id, sessionName: session.name } : {}),
    };
  });
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

// ---------------------------------------------------------------------------------------------
// Wording for the plan screens

/** The second line of a session in the week list: "Legs and core · 55 min · today". */
export function weekSessionLine(day: WeekDayView, session: WeekSessionView): string {
  if (session.kind === 'sport') {
    if (!session.optional) return 'Sport';
    return day.sessions.length === 1 ? 'Sport · optional, or rest' : 'Sport · optional';
  }
  const parts: string[] = [session.optional ? 'Optional' : session.focus];
  if (session.done) {
    const at = session.doneOnWeekday;
    parts.push(at == null || at === day.weekday ? 'done' : `done ${DAY_LONG[at]}`);
    return parts.join(' · ');
  }
  if (session.minutes) parts.push(`${session.minutes} min`);
  if (day.isToday) parts.push('today');
  return parts.join(' · ');
}

/**
 * The second line of a sport session in the week list: "Sport", "Sport · optional", then "done",
 * "done Thursday" (done on another day) or, while open, its minutes if it has them and "today".
 */
export function sportWeekSessionLine(day: WeekDayView, session: WeekSessionView): string {
  const parts: string[] = [weekSessionLine(day, session)];
  if (session.done) {
    const at = session.doneOnWeekday;
    parts.push(at == null || at === day.weekday ? 'done' : `done ${DAY_LONG[at]}`);
    return parts.join(' · ');
  }
  if (session.minutes) parts.push(`${session.minutes} min`);
  if (day.isToday) parts.push('today');
  return parts.join(' · ');
}

/** The suggestion under a workout that offers game mode: "Tomorrow is volleyball. Game mode?" `sessionName` is what `gameModeHint` gives. */
export function gameModeHintText(sessionName: string): string {
  const name = sessionName.length > 1 && sessionName[1] === sessionName[1].toLowerCase() ? sessionName[0].toLowerCase() + sessionName.slice(1) : sessionName;
  return `Tomorrow is ${name}. Game mode?`;
}

/** "3 gym and 2 sport sessions a week", "4 gym sessions a week". */
export function sessionsPerWeekText(facts: Pick<PlanFacts, 'gymPerWeek' | 'sportPerWeek'>): string {
  const { gymPerWeek: g, sportPerWeek: s } = facts;
  if (g > 0 && s > 0) return `${g} gym and ${s} sport sessions a week`;
  if (s > 0) return `${s} sport ${s === 1 ? 'session' : 'sessions'} a week`;
  return `${g} gym ${g === 1 ? 'session' : 'sessions'} a week`;
}

function listWithAnd(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

const TIMES = ['', 'once', 'twice'];

/** One line about a plan, made from its data: "Upper and Lower, each twice a week. Gym only." */
export function planDescription(plan: Plan): string {
  const counts = new Map<string, number>();
  const optional = new Set<string>();
  let anyGym = false;
  let anySport = false;
  for (let d = 0; d < 7; d++) {
    for (const s of daySessions(plan, d)) {
      if (s.kind === 'sport') {
        anySport = true;
        continue;
      }
      anyGym = true;
      if (s.optional) optional.add(s.workout.id);
      else counts.set(s.workout.id, (counts.get(s.workout.id) ?? 0) + 1);
    }
  }
  const required = plan.workouts.filter((w) => counts.has(w.id));
  const extra = plan.workouts.filter((w) => !counts.has(w.id) && optional.has(w.id));
  let text = '';
  if (required.length > 0) {
    text = listWithAnd(required.map((w) => w.name));
    const first = counts.get(required[0].id) ?? 1;
    if (required.every((w) => counts.get(w.id) === first)) {
      const times = TIMES[first] ?? `${first} times`;
      text += required.length > 1 ? `, each ${times} a week` : `, ${times} a week`;
    }
  }
  if (extra.length > 0) {
    const names = listWithAnd(extra.map((w) => w.name));
    text = text ? `${text}, plus an optional ${names}` : `Optional: ${names}`;
  }
  if (!text) text = anySport ? 'Sport sessions' : 'No sessions planned yet';
  return `${text}. ${anyGym && anySport ? 'Gym and sport.' : anySport ? 'Sport only.' : 'Gym only.'}`;
}

/**
 * The big title of the Today card on a day without a required gym session: the planned sessions
 * joined with "or" ("Volleyball or Bonus"), "Volleyball or rest" when the only session is
 * optional, "Rest" when nothing is planned.
 */
export function offDayTitle(day: Pick<WeekDayView, 'sessions'>): string {
  const names = day.sessions.map((s) => s.name);
  if (names.length === 0) return 'Rest';
  if (names.length === 1 && day.sessions[0].optional) return `${names[0]} or rest`;
  return names.join(' or ');
}

/** "week 4 of 12", "week 4". */
export function weekOfText(week: number, cycleLength: number | null): string {
  return cycleLength ? `week ${week} of ${cycleLength}` : `week ${week}`;
}

/** The line under a plan's name in the plan list. */
export function planListLine(plan: Plan, standing: PlanStanding): string {
  const facts = planFacts(plan);
  const kind = facts.mixesGymAndSport ? 'Gym and sport' : facts.workoutNames.join(', ');
  switch (standing.status) {
    case 'active':
      return `${kind} · ${weekOfText(standing.week, standing.cycleLength)}`;
    case 'paused':
      return `${kind} · paused at ${weekOfText(standing.week, standing.cycleLength)}`;
    case 'notStarted':
      return `${kind} · starts in ${standing.daysUntilStart} ${standing.daysUntilStart === 1 ? 'day' : 'days'}`;
    default:
      return `${kind} · ${sessionsPerWeekText(facts)}`;
  }
}

export interface PositionText {
  /** "Week 4 of 12". */
  week: string;
  /** "Build"; null for a plan without a rhythm. */
  phase: string | null;
  /** What the phase asks of the sets; null for a plan without a rhythm. */
  rule: string | null;
  /** 1 for the first pass through the cycle. */
  cycle: number;
}

/** Where a started plan stands, as words. */
export function positionText(plan: Plan, pos: PlanPosition): PositionText {
  const length = plan.cycle?.phases.length ?? 0;
  const rhythm = planFacts(plan).hasRhythm;
  return {
    week: `Week ${pos.week}${length > 0 ? ` of ${length}` : ''}`,
    phase: rhythm ? PHASES[pos.phase].name : null,
    rule: rhythm ? PHASES[pos.phase].rule : null,
    cycle: pos.cycle,
  };
}

export interface TargetTile {
  key: 'kcal' | 'protein' | 'steps';
  label: string;
  value: string;
  caption: string;
}

/** Today's daily targets from the plan; empty when the plan has none. `sportDay`: a required sport session today. */
export function planTargetTiles(plan: Plan, sportDay: boolean): TargetTile[] {
  const t = plan.targets;
  if (!t) return [];
  const out: TargetTile[] = [];
  const num = (n: number) => n.toLocaleString('en-US');
  if (t.kcal != null) {
    out.push({
      key: 'kcal',
      label: 'Calories',
      value: num(t.kcal),
      caption: t.kcalRestDay != null ? `${num(t.kcalRestDay)} rest day` : 'every day',
    });
  }
  if (t.proteinG != null) out.push({ key: 'protein', label: 'Protein', value: `${t.proteinG} g`, caption: 'every day' });
  if (t.steps != null) {
    out.push({
      key: 'steps',
      label: 'Steps',
      value: `${t.steps / 1000}k`,
      caption: sportDay && t.stepsSportDay != null ? `${t.stepsSportDay / 1000}k ok today` : 'every day',
    });
  }
  return out;
}

/** The days a workout is planned on: "Monday", "Monday and Thursday", "Thursday" (empty if the week doesn't use it). */
export function plannedDaysText(plan: Plan, workoutId: string): string {
  const names: string[] = [];
  let anyRequired = false;
  for (let d = 0; d < 7; d++) {
    for (const s of daySessions(plan, d)) {
      if (s.kind !== 'gym' || s.workout.id !== workoutId) continue;
      if (!s.optional) anyRequired = true;
      if (!names.includes(DAY_LONG[d])) names.push(DAY_LONG[d]);
    }
  }
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} ${anyRequired ? 'and' : 'or'} ${names[names.length - 1]}`;
}

/** The "Lighter week" tile of the plan page. */
export function lighterWeekTile(plan: Plan): { value: string; caption: string } {
  const facts = planFacts(plan);
  const lw = facts.lighterWeek;
  if (lw.kind === 'every') return { value: `Every ${lw.every}${lw.every === 1 ? 'st' : lw.every === 2 ? 'nd' : lw.every === 3 ? 'rd' : 'th'}`, caption: 'week' };
  if (lw.kind === 'cycle') {
    const weeks = (plan.cycle?.phases ?? []).flatMap((p, i) => (p === 'deload' ? [i + 1] : []));
    if (weeks.length === 1) return { value: `Week ${weeks[0]}`, caption: 'in the cycle' };
    if (weeks.length > 1) {
      const last = weeks[weeks.length - 1];
      return { value: `Weeks ${weeks.slice(0, -1).join(', ')} and ${last}`, caption: 'in the cycle' };
    }
  }
  return { value: 'None', caption: 'in this plan' };
}

// ---------------------------------------------------------------------------------------------
// Exercises in a plan

/** Every exercise id the plan's gym workouts use; empty without a plan. */
export function planExerciseIds(plan: Plan | undefined): Set<string> {
  return new Set((plan?.workouts ?? []).flatMap((w) => w.items.map((i) => i.exerciseId)));
}

/** Where a plan uses an exercise: each workout and item that holds it, in plan order. */
export function exerciseUsage(plan: Plan | undefined, exerciseId: string): { workout: GymWorkout; item: RoutineItem }[] {
  return (plan?.workouts ?? []).flatMap((workout) =>
    workout.items.filter((i) => i.exerciseId === exerciseId).map((item) => ({ workout, item })),
  );
}
