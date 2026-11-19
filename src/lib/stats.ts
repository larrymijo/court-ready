import { findExercise } from '@/lib/exerciseCatalog';
import { mondayOfISO, isoFromTimestamp } from '@/lib/dates';
import { isNonHardKind, plannedGymWorkouts, prescribeItem } from '@/lib/plans';
import type { ExerciseDef, MuscleGroup, PhaseId, Plan, PR, PRKind, Workout, WorkoutSet } from '@/lib/types';

/** Estimated one-rep max (Epley). Reps above 15 say little about max strength, so they're capped. */
export function e1rm(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + Math.min(reps, 15) / 30);
}

export function isWorkingSet(s: WorkoutSet): boolean {
  return s.done && s.type === 'normal' && s.reps != null && s.reps > 0;
}

export function setVolume(s: WorkoutSet): number {
  return (s.weight ?? 0) * (s.reps ?? 0);
}

export function workoutVolume(w: Workout): number {
  return w.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(isWorkingSet).reduce((a, s) => a + setVolume(s), 0),
    0,
  );
}

export function workoutSetCount(w: Workout): number {
  return w.exercises.reduce((sum, ex) => sum + ex.sets.filter(isWorkingSet).length, 0);
}

export function workoutDurationMs(w: Workout, now: number = Date.now()): number {
  return Math.max(0, (w.finishedAt ?? now) - w.startedAt);
}

export interface BestSet {
  value: number;
  weight: number;
  reps: number;
  date: number;
}

export interface ExerciseBests {
  weight?: BestSet;
  e1rm?: BestSet;
  volume?: BestSet;
  reps?: BestSet;
}

function consider(bests: ExerciseBests, kind: PRKind, value: number, s: WorkoutSet, date: number) {
  if (value <= 0) return;
  const current = bests[kind];
  if (!current || value > current.value) {
    bests[kind] = { value, weight: s.weight ?? 0, reps: s.reps ?? 0, date };
  }
}

/** Best sets for one exercise across finished workouts (optionally only those before a time). */
export function exerciseBests(exerciseId: string, workouts: Workout[], before?: number, def = findExercise(exerciseId)): ExerciseBests {
  const bests: ExerciseBests = {};
  for (const w of workouts) {
    if (!w.finishedAt) continue;
    if (before != null && w.startedAt >= before) continue;
    for (const ex of w.exercises) {
      if (ex.exerciseId !== exerciseId) continue;
      for (const s of ex.sets.filter(isWorkingSet)) {
        consider(bests, 'weight', s.weight ?? 0, s, w.startedAt);
        if (def?.estimate1RM !== false) consider(bests, 'e1rm', e1rm(s.weight ?? 0, s.reps ?? 0), s, w.startedAt);
        consider(bests, 'volume', setVolume(s), s, w.startedAt);
        consider(bests, 'reps', s.reps ?? 0, s, w.startedAt);
      }
    }
  }
  return bests;
}

/**
 * Personal records set in `workout`, compared with earlier workouts. The first time you do an
 * exercise doesn't count — there's nothing to beat yet.
 */
export function detectPRs(
  workout: Workout,
  history: Workout[],
  getExercise: (id: string) => ExerciseDef | undefined,
): PR[] {
  const prs: PR[] = [];
  const seen = new Set<string>();
  const earlier = history.filter((w) => w.id !== workout.id);
  for (const ex of workout.exercises) {
    if (seen.has(ex.exerciseId)) continue;
    seen.add(ex.exerciseId);
    const def = getExercise(ex.exerciseId);
    const before = exerciseBests(ex.exerciseId, earlier, workout.startedAt, def);
    if (!before.reps) continue;
    const sets = workout.exercises
      .filter((e) => e.exerciseId === ex.exerciseId)
      .flatMap((e) => e.sets.filter(isWorkingSet));
    const now: ExerciseBests = {};
    for (const s of sets) {
      consider(now, 'weight', s.weight ?? 0, s, workout.startedAt);
      if (def?.estimate1RM !== false) consider(now, 'e1rm', e1rm(s.weight ?? 0, s.reps ?? 0), s, workout.startedAt);
      consider(now, 'volume', setVolume(s), s, workout.startedAt);
      consider(now, 'reps', s.reps ?? 0, s, workout.startedAt);
    }
    const kinds: PRKind[] = def?.tracking === 'reps' ? ['reps'] : ['weight', 'e1rm', 'volume'];
    for (const kind of kinds) {
      const n = now[kind];
      const b = before[kind];
      if (n && (!b || n.value > b.value + 1e-9)) {
        prs.push({ exerciseId: ex.exerciseId, kind, value: n.value, weight: n.weight, reps: n.reps });
      }
    }
  }
  return prs;
}

export interface SeriesPoint {
  date: number;
  topWeight: number;
  bestE1rm: number;
  bestReps: number;
  volume: number;
}

/** One point per workout for an exercise, oldest first. */
export function exerciseSeries(exerciseId: string, workouts: Workout[], def = findExercise(exerciseId)): SeriesPoint[] {
  const points: SeriesPoint[] = [];
  const estimateMax = def?.estimate1RM !== false;
  for (const w of workouts) {
    if (!w.finishedAt) continue;
    const sets = w.exercises.filter((e) => e.exerciseId === exerciseId).flatMap((e) => e.sets.filter(isWorkingSet));
    if (sets.length === 0) continue;
    points.push({
      date: w.startedAt,
      topWeight: Math.max(...sets.map((s) => s.weight ?? 0)),
      bestE1rm: estimateMax ? Math.max(...sets.map((s) => e1rm(s.weight ?? 0, s.reps ?? 0))) : 0,
      bestReps: Math.max(...sets.map((s) => s.reps ?? 0)),
      volume: sets.reduce((a, s) => a + setVolume(s), 0),
    });
  }
  return points.sort((a, b) => a.date - b.date);
}

export function workoutsInWeek(workouts: Workout[], mondayISO: string): Workout[] {
  return workouts.filter((w) => w.finishedAt && mondayOfISO(isoFromTimestamp(w.startedAt)) === mondayISO);
}

/** What the week holds. Sport sessions add to the sessions and the time; sets and volume are gym only. */
export interface WeekSummary {
  sessions: number;
  /** Gym time from start to finish, sport time as logged, rounded to minutes. */
  minutes: number;
  sets: number;
  volume: number;
}

export function weekSummary(workouts: Workout[], mondayISO: string): WeekSummary {
  const week = workoutsInWeek(workouts, mondayISO);
  let ms = 0;
  let sets = 0;
  let volume = 0;
  for (const w of week) {
    ms += w.kind === 'sport' ? (w.minutes ?? 0) * 60_000 : workoutDurationMs(w);
    sets += workoutSetCount(w);
    volume += workoutVolume(w);
  }
  return { sessions: week.length, minutes: Math.round(ms / 60_000), sets, volume };
}

/** The finished workouts started on a day, sport sessions included, in the order given. */
export function doneToday(workouts: readonly Workout[], todayISO: string): Workout[] {
  return workouts.filter((w) => w.finishedAt && isoFromTimestamp(w.startedAt) === todayISO);
}

/** Hard sets per muscle: the main muscle counts 1, helpers count ½. Care drills, drills and stretches don't count. */
export function muscleSets(
  workouts: Workout[],
  getExercise: (id: string) => ExerciseDef | undefined,
): Partial<Record<MuscleGroup, number>> {
  const out: Partial<Record<MuscleGroup, number>> = {};
  for (const w of workouts) {
    for (const ex of w.exercises) {
      const def = getExercise(ex.exerciseId);
      if (!def || isNonHardKind(def.kind)) continue;
      const n = ex.sets.filter(isWorkingSet).length;
      if (n === 0) continue;
      out[def.primary] = (out[def.primary] ?? 0) + n;
      for (const m of def.secondary ?? []) out[m] = (out[m] ?? 0) + n / 2;
    }
  }
  return out;
}

/**
 * The hard sets a plan prescribes per muscle in a week of the given phase, to compare with
 * `muscleSets`. The week's planned gym workouts (optional ones left out, one per time planned) go
 * through `prescribeItem` without game mode; care drills, drills and stretches don't count; the main muscle counts 1,
 * helpers ½. Sport sessions have no sets.
 */
export function plannedMuscleSets(
  plan: Plan,
  phase: PhaseId,
  getExercise: (id: string) => ExerciseDef | undefined,
): Partial<Record<MuscleGroup, number>> {
  const out: Partial<Record<MuscleGroup, number>> = {};
  for (const workout of plannedGymWorkouts(plan)) {
    for (const item of workout.items) {
      const def = getExercise(item.exerciseId);
      if (!def || def.archived || isNonHardKind(def.kind)) continue;
      const sets = prescribeItem(item, def, workout, { phase }).sets;
      out[def.primary] = (out[def.primary] ?? 0) + sets;
      for (const m of def.secondary ?? []) out[m] = (out[m] ?? 0) + sets / 2;
    }
  }
  return out;
}
