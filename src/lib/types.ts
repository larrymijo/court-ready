export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'adductors'
  | 'calves'
  | 'core'
  | 'mobility';

export type Equipment = 'dumbbell' | 'barbell' | 'kettlebell' | 'ab_wheel' | 'cable' | 'machine' | 'bodyweight' | 'band';

/** weight_reps: log kg × reps. reps: bodyweight/band moves, reps only. */
export type TrackingType = 'weight_reps' | 'reps';

/** Standard exercises count toward hard sets. Care, drills and stretches do not. */
export type ExerciseKind = 'standard' | 'care' | 'drill' | 'stretch';

export interface TechniqueSection {
  label: string;
  items: string[];
}

export interface ExerciseDef {
  id: string;
  name: string;
  muscles: string;
  primary: MuscleGroup;
  secondary?: MuscleGroup[];
  equipment: Equipment;
  isolation: boolean;
  tracking: TrackingType;
  /** False for a loaded carry: each rep denotes a distance, so Epley's formula does not apply. */
  estimate1RM?: false;
  /** Weight step in kg when it's time to go up. */
  increment: number;
  kind: ExerciseKind;
  /** One of the guide's curated alternatives shown by the Swaps filter. */
  swapOption?: boolean;
  sections: TechniqueSection[];
  warning?: string;
  /** Ids of exercises you can swap to. */
  swaps: string[];
  /** A prescribed dose or a cue explaining what to log as one rep. */
  dose?: string;
  perSide?: boolean;
}

export type RoutineId = 'uppera' | 'lower' | 'upperb' | 'bonus';

export interface RoutineItem {
  /** Badge from the guide: "1", "5a", ... */
  key: string;
  exerciseId: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  /** Shown instead of the rep range, e.g. "stop 2 reps before failure". */
  repsLabel?: string;
  rir: string;
  restSec: number;
  cue: string;
  /** Superset / circuit group id. */
  group?: string;
  perSide?: boolean;
  /** Exercises 1 and 2 of a session get +1 set in the Push block. */
  main?: boolean;
  skipInGameMode?: boolean;
}

export interface Routine {
  id: RoutineId;
  name: string;
  title: string;
  /** What the session is about, in a few words: "Chest focus". */
  focus: string;
  day: string;
  minutes: number;
  intro: string;
  warmup: 'upper' | 'lower';
  items: RoutineItem[];
  /** Instructions per superset group. */
  groups: Record<string, string>;
  shortOnTime?: string;
  optional?: boolean;
}

export type PhaseId = 'learn' | 'build' | 'deload' | 'push';

// Plans are saved data from data version 3: a plan holds its gym workouts, its sport sessions and
// its week (docs/polish-plan.md, sections 3 and 12). Plan, workout and sport session ids never
// change once they have shipped, because history points to them.

export type SportId = 'volleyball' | 'basketball' | 'football' | 'running';

/** The built-in example plans. Also their plan ids. */
export type ExamplePlanId = 'court-ready' | 'muscle-mass' | 'definition';

/** A gym workout of a plan: what Routine is for Court-Ready, with a string id and its rules as settings. */
export interface GymWorkout {
  id: string;
  name: string;
  /** Long name for the workout's own page: "Upper A — Chest focus". Without one, `name` is shown. */
  title?: string;
  focus: string;
  minutes: number;
  intro?: string;
  /** Warm-up checklist id: 'upper' or 'lower' until checklists become data (phase 4). */
  warmup: string;
  /** Cool-down checklist id (phase 4). */
  cooldown?: string;
  items: RoutineItem[];
  /** Instructions per superset group. */
  groups: Record<string, string>;
  shortOnTime?: string;
  /** Left out when the week's planned sessions and sets are counted. */
  optional?: boolean;
  /**
   * How the plan's phases change this workout. 'full' (the default): every phase rule applies.
   * 'deloadOnly': the written sets in every week, halved in deload weeks (Court-Ready's Bonus).
   */
  cycleRule?: 'full' | 'deloadOnly';
  /** Offers game mode: at most 2 sets per exercise, RIR 3, without the items marked skipInGameMode. */
  gameMode?: boolean;
}

/** A sport in a plan's week. It can be started and logged from phase 4. */
export interface SportSession {
  id: string;
  sport: SportId;
  name: string;
  minutes?: number;
  /** Checklist ids (phase 4). Without them, the sport's own warm-up and cool-down. */
  warmup?: string;
  cooldown?: string;
}

// Sports and checklists ship with the app (src/data/sports.ts, src/data/checklists.ts). They are
// not saved data, but their ids are: plans and finished sessions point to them, so a sport id or a
// checklist id never changes once it has shipped.

/** A sport: what a session of it logs, and its own warm-up and cool-down. */
export interface SportDef {
  id: SportId;
  name: string;
  /** Checklist ids. */
  warmup: string;
  cooldown: string;
  /** Running: the session asks for the distance and shows the pace. */
  logsDistance: boolean;
  /** Match or practice. Not asked for a run. */
  logsMatch: boolean;
}

export interface ChecklistStep {
  text: string;
  /** The drills or stretches this step links to. */
  exerciseIds?: string[];
}

/** A warm-up or a cool-down: steps to tick or skip. */
export interface Checklist {
  id: string;
  title: string;
  minutes: number;
  kind: 'warmup' | 'cooldown';
  steps: ChecklistStep[];
}

/** What a day points to: one of the plan's gym workouts or one of its sport sessions. */
export type SessionRef = { kind: 'gym'; workoutId: string } | { kind: 'sport'; sessionId: string };

export interface PlanDay {
  /** In the order they are shown. None means a rest day. */
  sessions: { ref: SessionRef; optional?: boolean }[];
  /** A line about the day: "Volleyball some weeks, or the Bonus session". */
  note?: string;
}

export interface PlanTargets {
  kcal?: number;
  kcalRestDay?: number;
  proteinG?: number;
  steps?: number;
  stepsSportDay?: number;
  /** Aimed change in bodyweight per week, in percent: [from, to]. */
  weightPctPerWeek?: [number, number];
}

export interface Plan {
  id: string;
  name: string;
  /** Set on the built-in examples: the original to restore or reset to. */
  example?: ExamplePlanId;
  workouts: GymWorkout[];
  sports: SportSession[];
  /** Seven days, Monday first. */
  week: PlanDay[];
  /** One phase per week. After the last week the plan goes on from week `repeatFrom` (counted from 1). */
  cycle?: { phases: PhaseId[]; repeatFrom: number };
  /** Without a cycle: every Nth week is a lighter week, with the deload rule. */
  lighterWeekEvery?: number;
  /** 'progress': add reps, then weight. 'maintain': aim to match last time. */
  progression: 'progress' | 'maintain';
  targets?: PlanTargets;
  /** Slugs of the guide pages that belong to this plan. */
  articles?: string[];
}

/** Where a plan stands. Saved per plan id. */
export interface PlanState {
  /** YYYY-MM-DD, the Monday of the plan's week 1. */
  start: string;
  /** The week the plan was in when you switched away from it, to offer "Continue at week N". */
  leftAtWeek?: number;
}

export type SetType = 'normal' | 'warmup';

export interface WorkoutSet {
  id: string;
  type: SetType;
  weight: number | null;
  reps: number | null;
  rir: number | null;
  done: boolean;
}

export interface SetTarget {
  sets: number;
  repsMin: number;
  repsMax: number;
  repsLabel?: string;
  rir: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  itemKey?: string;
  group?: string;
  restSec: number;
  target?: SetTarget;
  sets: WorkoutSet[];
  /** Pain 0–10 during this exercise (null = not rated). */
  pain: number | null;
  note: string;
}

export type PRKind = 'weight' | 'e1rm' | 'volume' | 'reps';

export interface PR {
  exerciseId: string;
  kind: PRKind;
  value: number;
  weight: number;
  reps: number;
}

export interface Workout {
  id: string;
  name: string;
  /** 'sport' on sport sessions (from data version 4). Missing means a gym workout. */
  kind?: 'gym' | 'sport';
  /** The plan the session was started from. Missing on empty workouts. */
  planId?: string;
  /** That plan's name at the time, so history still reads well after the plan is renamed or deleted. */
  planName?: string;
  /** The workout of that plan (from phase 4, also a sport session). */
  sessionId?: string;
  /** Which Court-Ready session it was. From before plans; still written for Court-Ready for one more release. */
  routineId?: RoutineId;
  startedAt: number;
  finishedAt?: number;
  week?: number;
  phase?: PhaseId;
  gameMode?: boolean;
  exercises: WorkoutExercise[];
  prs?: PR[];
  /** Whether the warm-up and the cool-down were done. Written on every session from data version 4. */
  warmupDone?: boolean;
  cooldownDone?: boolean;
  // Sport sessions only. A sport session keeps `exercises: []` and has no sets, so an older version
  // of the app can still read it after a rollback.
  sport?: SportId;
  /** Minutes played. */
  minutes?: number;
  /** How hard it felt, 1 to 10. */
  effort?: number;
  /** true: a match. false: practice. Not set for a run. */
  match?: boolean;
  /** Pain 0–10 during the session (null or missing = not rated). */
  pain?: number | null;
  distanceKm?: number;
  note?: string;
  /** Entered afterwards with "Log a past session". */
  loggedLater?: boolean;
}

/** A sport session in progress. Kept in the store only, never in a backup (like the workout in progress). */
export interface ActiveSport {
  id: string;
  sport: SportId;
  name: string;
  planId?: string;
  planName?: string;
  sessionId?: string;
  /** Checklist ids, resolved when the session starts. */
  warmup: string;
  cooldown: string;
  /** When the session was opened (ms since 1970). */
  openedAt: number;
  stage: 'warmup' | 'playing' | 'log' | 'cooldown';
  /** Set by "Start playing" and "Finish". The clock is always worked out from these, never counted. */
  playStartedAt?: number;
  playEndedAt?: number;
  /** Indexes of the ticked steps. */
  warmupChecked: number[];
  cooldownChecked: number[];
  /** Set by "Start playing": false when the warm-up was skipped. */
  warmupDone?: boolean;
  /** What has been entered on the log sheet so far. */
  draft: Partial<Pick<Workout, 'minutes' | 'effort' | 'match' | 'pain' | 'distanceKm' | 'note'>>;
}

export interface BodyEntry {
  /** YYYY-MM-DD */
  date: string;
  weight?: number;
  waist?: number;
}

export interface Settings {
  /** YYYY-MM-DD, the Monday of week 1. */
  programStart: string;
  restTimer: boolean;
  vibrate: boolean;
  keepAwake: boolean;
  /** When the last backup was exported (ms since 1970); null if never. */
  lastExportAt: number | null;
}
