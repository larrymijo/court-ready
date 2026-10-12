import { WEEK_PLAN, type DayPlan } from '@/data/schedule';
import { daysBetween, weekdayIndex } from '@/lib/dates';
import type { ExerciseDef, PhaseId, Routine, RoutineId, RoutineItem, SetTarget } from '@/lib/types';

export interface ProgramPosition {
  /** Week inside the 12-week plan, 1–12. */
  week: number;
  /** 1 for the first 12 weeks; then each repeat of weeks 3–12 is a new cycle. */
  cycle: number;
  phase: PhaseId;
  started: boolean;
  daysUntilStart: number;
}

export const PHASES: Record<PhaseId, { name: string; rule: string }> = {
  learn: {
    name: 'Learn',
    rule: 'One set less than written, RIR 3. Learn the technique and find your weights.',
  },
  build: {
    name: 'Build',
    rule: 'Sets and RIR as written. Beat last week by a rep or a little weight.',
  },
  deload: {
    name: 'Deload',
    rule: 'Half the sets, same weights, RIR 3–4. Easy on purpose.',
  },
  push: {
    name: 'Push',
    rule: '+1 set on exercises 1 and 2. Isolation: last set to RIR 0.',
  },
};

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

export function hardSetCount(
  routine: Routine,
  getExercise: (id: string) => ExerciseDef,
  opts: { phase: PhaseId; gameMode?: boolean },
): number {
  return routine.items.reduce((sum, item) => {
    const ex = getExercise(item.exerciseId);
    if (ex.kind === 'care') return sum;
    const p = prescribe(item, ex, { ...opts, routineId: routine.id });
    return p.skip ? sum : sum + p.sets;
  }, 0);
}

export function planForDate(d: Date): DayPlan {
  return WEEK_PLAN[weekdayIndex(d)];
}

export function repsText(t: Pick<SetTarget, 'repsMin' | 'repsMax' | 'repsLabel'>, perSide?: boolean): string {
  if (t.repsLabel) return t.repsLabel;
  const range = t.repsMin === t.repsMax ? `${t.repsMin}` : `${t.repsMin}–${t.repsMax}`;
  return perSide ? `${range} per side` : range;
}
