export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core'
  | 'mobility';

export type Equipment = 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'band';

/** weight_reps: log kg × reps. reps: bodyweight/band moves, reps only. */
export type TrackingType = 'weight_reps' | 'reps';

/** main: in the plan's routines. care: shoulder-care drills. alternative: a swap option. */
export type ExerciseKind = 'main' | 'care' | 'alternative';

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
  /** Weight step in kg when it's time to go up. */
  increment: number;
  kind: ExerciseKind;
  sections: TechniqueSection[];
  warning?: string;
  /** Ids of exercises you can swap to. */
  swaps: string[];
  /** Care drills: prescribed dose, e.g. "15 per side". */
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
  routineId?: RoutineId;
  startedAt: number;
  finishedAt?: number;
  week?: number;
  phase?: PhaseId;
  gameMode?: boolean;
  exercises: WorkoutExercise[];
  prs?: PR[];
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
}
