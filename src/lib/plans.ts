// The plan engine: where a plan stands, what it prescribes and what is done this week.
// Pure functions over saved plans, so any plan works the way Court-Ready does now.
import { addDaysISO, daysBetween, isoFromTimestamp } from '@/lib/dates';
import type {
  ExerciseDef,
  ExerciseKind,
  GymWorkout,
  PhaseId,
  Plan,
  PlanState,
  RoutineItem,
  SessionRef,
  SetTarget,
  SportSession,
  Workout,
} from '@/lib/types';

export interface PlanPosition {
  /** Week inside the plan's cycle (1–12 for Court-Ready); without a cycle, weeks since the start. */
  week: number;
  /** 1 for the first pass through the cycle; each repeat from `repeatFrom` is a new cycle. */
  cycle: number;
  phase: PhaseId;
  started: boolean;
  daysUntilStart: number;
}

export interface Prescription extends SetTarget {
  skip: boolean;
}

/** The phase of a week as counted inside the plan (`PlanPosition.week`). */
export function planPhaseForWeek(plan: Plan, week: number): PhaseId {
  const phases = plan.cycle?.phases;
  if (phases && phases.length > 0) {
    return phases[Math.min(Math.max(week, 1), phases.length) - 1];
  }
  const every = plan.lighterWeekEvery;
  if (every && every > 0 && week % every === 0) return 'deload';
  return 'build';
}

/**
 * Where a plan stands today. With a cycle, the plan runs through its phases and then repeats
 * from week `repeatFrom`; without one, the week just counts up.
 */
export function planPosition(plan: Plan, state: PlanState, todayISO: string): PlanPosition {
  const days = daysBetween(state.start, todayISO);
  if (days < 0) {
    return { week: 1, cycle: 1, phase: planPhaseForWeek(plan, 1), started: false, daysUntilStart: -days };
  }
  const absolute = Math.floor(days / 7) + 1;
  let week = absolute;
  let cycle = 1;
  const length = plan.cycle?.phases.length ?? 0;
  if (length > 0 && absolute > length) {
    const from = Math.min(Math.max(Math.floor(plan.cycle!.repeatFrom), 1), length);
    const loop = length - from + 1;
    const offset = absolute - length - 1;
    cycle = 2 + Math.floor(offset / loop);
    week = from + (offset % loop);
  }
  return { week, cycle, phase: planPhaseForWeek(plan, week), started: true, daysUntilStart: 0 };
}

function hasNumber(s: string): boolean {
  return /\d/.test(s);
}

/**
 * Adjusts a workout item for the phase, by the workout's own settings: `cycleRule` says how the
 * phases change it, `gameMode` whether game mode applies to it.
 */
export function prescribeItem(
  item: RoutineItem,
  exercise: ExerciseDef,
  workout: Pick<GymWorkout, 'cycleRule' | 'gameMode'>,
  opts: { phase: PhaseId; gameMode?: boolean },
): Prescription {
  let sets = item.sets;
  let rir = item.rir;
  const numeric = hasNumber(item.rir);

  if (workout.cycleRule === 'deloadOnly') {
    if (opts.phase === 'deload') sets = Math.ceil(sets / 2);
  } else {
    switch (opts.phase) {
      case 'learn':
        sets = Math.max(1, sets - 1);
        if (numeric) rir = '3';
        break;
      case 'deload':
        sets = Math.ceil(sets / 2);
        if (numeric) rir = '3–4';
        break;
      case 'push':
        if (item.main) sets += 1;
        if (exercise.isolation && numeric && !rir.includes('0')) rir = `${rir} · last set 0`;
        break;
      case 'build':
        break;
    }
  }

  let skip = false;
  if (opts.gameMode && workout.gameMode) {
    if (item.skipInGameMode) skip = true;
    sets = Math.min(sets, 2);
    if (numeric && opts.phase !== 'deload') rir = '3';
  }

  return {
    sets,
    repsMin: item.repsMin,
    repsMax: item.repsMax,
    repsLabel: item.repsLabel,
    rir,
    skip,
  };
}

/** Exercises that never count as hard sets or volume: care drills, sport drills and stretches. */
export function isNonHardKind(kind: ExerciseKind): boolean {
  return kind === 'care' || kind === 'drill' || kind === 'stretch';
}

/** Hard sets of a workout in a phase: care drills, drills, stretches and skipped items don't count. */
export function workoutHardSets(
  workout: GymWorkout,
  getExercise: (id: string) => ExerciseDef,
  opts: { phase: PhaseId; gameMode?: boolean },
): number {
  return workout.items.reduce((sum, item) => {
    const ex = getExercise(item.exerciseId);
    if (isNonHardKind(ex.kind)) return sum;
    const p = prescribeItem(item, ex, workout, opts);
    return p.skip ? sum : sum + p.sets;
  }, 0);
}

export function findWorkout(plan: Plan, workoutId: string): GymWorkout | undefined {
  return plan.workouts.find((w) => w.id === workoutId);
}

export function findSportSession(plan: Plan, sessionId: string): SportSession | undefined {
  return plan.sports.find((s) => s.id === sessionId);
}

export type ResolvedSession = { kind: 'gym'; workout: GymWorkout } | { kind: 'sport'; session: SportSession };

/** What a day's entry points to, or undefined if the plan no longer has it. */
export function resolveSession(plan: Plan, ref: SessionRef): ResolvedSession | undefined {
  if (ref.kind === 'gym') {
    const workout = findWorkout(plan, ref.workoutId);
    return workout ? { kind: 'gym', workout } : undefined;
  }
  const session = findSportSession(plan, ref.sessionId);
  return session ? { kind: 'sport', session } : undefined;
}

/** The id a finished workout stores as `sessionId` for this entry. */
export function sessionRefId(ref: SessionRef): string {
  return ref.kind === 'gym' ? ref.workoutId : ref.sessionId;
}

/** Whether a finished record is a sport session or a gym workout (a missing kind means gym). */
export function recordKind(w: Pick<Workout, 'kind'>): 'gym' | 'sport' {
  return w.kind === 'sport' ? 'sport' : 'gym';
}

/** The key that matches a record to a planned session: by kind as well as id, as ids may repeat across kinds. */
export function sessionKey(kind: 'gym' | 'sport', id: string): string {
  return `${kind}:${id}`;
}

export type DaySession = ResolvedSession & { ref: SessionRef; optional: boolean };

/**
 * The sessions of a weekday (Monday = 0), in order. A gym entry is optional if the day says so
 * or the workout itself is optional. Entries the plan no longer has are left out.
 */
export function daySessions(plan: Plan, weekday: number): DaySession[] {
  const day = plan.week[weekday];
  if (!day) return [];
  const out: DaySession[] = [];
  for (const entry of day.sessions) {
    const resolved = resolveSession(plan, entry.ref);
    if (!resolved) continue;
    const optional = !!entry.optional || (resolved.kind === 'gym' && !!resolved.workout.optional);
    out.push({ ...resolved, ref: entry.ref, optional });
  }
  return out;
}

/** The gym workouts the week plans, Monday first: optional ones left out, one entry per time planned. */
export function plannedGymWorkouts(plan: Plan): GymWorkout[] {
  const out: GymWorkout[] = [];
  for (let d = 0; d < 7; d++) {
    for (const s of daySessions(plan, d)) {
      if (s.kind === 'gym' && !s.optional) out.push(s.workout);
    }
  }
  return out;
}

export interface PlannedSessionStatus {
  /** Monday = 0. */
  weekday: number;
  ref: SessionRef;
  optional: boolean;
  done: boolean;
}

/**
 * For each planned session of the week starting `mondayISO`, whether it is done. A finished
 * workout of this plan with the session's kind (sport or gym) and id counts on any day of that week, once: a workout
 * planned twice needs two. Required sessions are matched before optional ones.
 */
export function weekProgress(plan: Plan, workouts: readonly Workout[], mondayISO: string): PlannedSessionStatus[] {
  const sunday = addDaysISO(mondayISO, 6);
  // Dated by the start, as the week's other numbers are (stats.ts).
  const left = new Map<string, number>();
  for (const w of workouts) {
    if (!w.finishedAt || w.planId !== plan.id || !w.sessionId) continue;
    const day = isoFromTimestamp(w.startedAt);
    if (day < mondayISO || day > sunday) continue;
    const key = sessionKey(recordKind(w), w.sessionId);
    left.set(key, (left.get(key) ?? 0) + 1);
  }

  const out: PlannedSessionStatus[] = [];
  for (let d = 0; d < 7; d++) {
    for (const s of daySessions(plan, d)) {
      out.push({ weekday: d, ref: s.ref, optional: s.optional, done: false });
    }
  }
  for (const pass of [false, true]) {
    for (const s of out) {
      if (s.optional !== pass) continue;
      const key = sessionKey(s.ref.kind, sessionRefId(s.ref));
      const n = left.get(key) ?? 0;
      if (n > 0) {
        s.done = true;
        left.set(key, n - 1);
      }
    }
  }
  return out;
}
