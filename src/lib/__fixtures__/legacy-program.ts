// Frozen copy of the plan rules as they were before plans became data (src/lib/program.ts at
// commit 3a10328). It is the oracle for court-ready-equality.test.ts: never edit it to make a
// test pass. It lives outside __tests__ so Jest doesn't collect it as a test suite.
import type { ExerciseDef, PhaseId, RoutineId, RoutineItem, SetTarget } from '@/lib/types';

const DAY_MS = 24 * 60 * 60 * 1000;

// Copied from src/lib/dates.ts so the oracle doesn't move if that file changes.
function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / DAY_MS);
}

export interface ProgramPosition {
  /** Week inside the 12-week plan, 1–12. */
  week: number;
  /** 1 for the first 12 weeks; then each repeat of weeks 3–12 is a new cycle. */
  cycle: number;
  phase: PhaseId;
  started: boolean;
  daysUntilStart: number;
}

export function phaseForWeek(week: number): PhaseId {
  if (week <= 2) return 'learn';
  if (week <= 6) return 'build';
  if (week === 7) return 'deload';
  if (week <= 11) return 'push';
  return 'deload';
}

/**
 * Where you are in the plan. After week 12 the guide says to start again at week 3,
 * so later weeks repeat weeks 3–12.
 */
export function programPosition(startISO: string, todayISO: string): ProgramPosition {
  const days = daysBetween(startISO, todayISO);
  if (days < 0) {
    return { week: 1, cycle: 1, phase: 'learn', started: false, daysUntilStart: -days };
  }
  const absolute = Math.floor(days / 7) + 1;
  let week = absolute;
  let cycle = 1;
  if (absolute > 12) {
    const offset = absolute - 13;
    cycle = 2 + Math.floor(offset / 10);
    week = 3 + (offset % 10);
  }
  return { week, cycle, phase: phaseForWeek(week), started: true, daysUntilStart: 0 };
}

export interface Prescription extends SetTarget {
  skip: boolean;
}

function hasNumber(s: string): boolean {
  return /\d/.test(s);
}

/** Adjusts a routine item for the current phase (and game mode on the Lower day). */
export function prescribe(
  item: RoutineItem,
  exercise: ExerciseDef,
  opts: { phase: PhaseId; routineId: RoutineId; gameMode?: boolean },
): Prescription {
  let sets = item.sets;
  let rir = item.rir;
  const numeric = hasNumber(item.rir);

  if (opts.routineId === 'bonus') {
    if (opts.phase === 'deload') {
      sets = Math.ceil(sets / 2);
    }
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
  if (opts.gameMode && opts.routineId === 'lower') {
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

// --- Not part of the old code: the shape the fixture stores. ---

/** One prescribed item as the fixture stores it: no missing keys, so JSON keeps every field. */
export interface FrozenPrescription {
  key: string;
  exerciseId: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  repsLabel: string | null;
  rir: string;
  skip: boolean;
}

export function freeze(item: RoutineItem, p: SetTarget & { skip: boolean }): FrozenPrescription {
  return {
    key: item.key,
    exerciseId: item.exerciseId,
    sets: p.sets,
    repsMin: p.repsMin,
    repsMax: p.repsMax,
    repsLabel: p.repsLabel ?? null,
    rir: p.rir,
    skip: p.skip,
  };
}

export interface LegacyFixture {
  /** Where the numbers came from. */
  source: string;
  /** The Monday of week 1 used for every date below. */
  start: string;
  notStarted: { today: string; position: ProgramPosition };
  /** Weeks 1 to 40 counted from the start, each read on its Monday and its Sunday. */
  weeks: { absolute: number; monday: string; sunday: string; position: ProgramPosition }[];
  /** Phase → routine id → normal / game mode → one entry per item, in order. */
  prescriptions: Record<PhaseId, Record<RoutineId, { normal: FrozenPrescription[]; game: FrozenPrescription[] }>>;
}
