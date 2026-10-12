import { formatKg } from '@/lib/format';
import { isWorkingSet } from '@/lib/stats';
import type { ExerciseDef, SetTarget, Workout } from '@/lib/types';

export interface PerformedSet {
  weight: number | null;
  reps: number | null;
  rir: number | null;
}

export interface LastPerformance {
  workoutId: string;
  date: number;
  sets: PerformedSet[];
}

/** Working sets from the most recent finished workout that included this exercise. */
export function lastPerformance(
  exerciseId: string,
  workouts: Workout[],
  excludeWorkoutId?: string,
): LastPerformance | null {
  const sorted = [...workouts].filter((w) => w.finishedAt).sort((a, b) => b.startedAt - a.startedAt);
  for (const w of sorted) {
    if (w.id === excludeWorkoutId) continue;
    const sets = w.exercises
      .filter((e) => e.exerciseId === exerciseId)
      .flatMap((e) => e.sets.filter(isWorkingSet))
      .map((s) => ({ weight: s.weight, reps: s.reps, rir: s.rir }));
    if (sets.length > 0) return { workoutId: w.id, date: w.startedAt, sets };
  }
  return null;
}

export type SuggestionKind = 'start' | 'increase' | 'repeat' | 'harder';

export interface Suggestion {
  kind: SuggestionKind;
  /** Weight to load for working sets, when we know it. */
  weight: number | null;
  message: string;
}

function roundToStep(value: number, step: number): number {
  if (step <= 0) return value;
  return Math.round(value / step) * step;
}

/** Double progression from the guide: top of the range on every set → next weight up. */
export function suggestNext(ex: ExerciseDef, target: SetTarget, last: LastPerformance | null): Suggestion {
  if (!last || last.sets.length === 0) {
    if (ex.tracking === 'reps') {
      return { kind: 'start', weight: null, message: 'First time: count your clean reps and log them.' };
    }
    return {
      kind: 'start',
      weight: null,
      message: `First time: pick a weight you can lift for ${target.repsMin} reps at RIR ${target.rir.split(' ')[0]}.`,
    };
  }

  const reps = last.sets.map((s) => s.reps ?? 0);
  const repsStr = reps.join(' · ');

  if (ex.tracking === 'reps') {
    const allTop = reps.every((r) => r >= target.repsMax);
    if (allTop && !target.repsLabel) {
      return { kind: 'harder', weight: null, message: `Hit ${target.repsMax} on every set — make it harder.` };
    }
    return { kind: 'repeat', weight: null, message: `Last time ${repsStr} — beat it by a rep.` };
  }

  const top = Math.max(...last.sets.map((s) => s.weight ?? 0));
  const allTop = last.sets.every((s) => (s.weight ?? 0) === top && (s.reps ?? 0) >= target.repsMax);
  const bodyweight = ex.equipment === 'bodyweight';
  if (allTop && ex.increment > 0) {
    const next = roundToStep(top + ex.increment, ex.increment >= 1 ? 0.5 : 0.25);
    return {
      kind: 'increase',
      weight: next,
      message: bodyweight
        ? `${target.repsMax}+ on every set last time — add weight: +${formatKg(next)} kg on a belt.`
        : `${target.repsMax}+ on every set last time — go up to ${formatKg(next)} kg.`,
    };
  }
  const load = bodyweight ? (top > 0 ? `+${formatKg(top)} kg` : 'BW') : `${formatKg(top)} kg`;
  return {
    kind: 'repeat',
    weight: top > 0 ? top : null,
    message: `Last time ${load} × ${repsStr} — beat it by a rep.`,
  };
}

/** Ramp-up sets before the first exercise: ~50% × 10, ~70% × 5, ~85% × 2. */
export function rampUpSets(workingWeight: number, step: number): { weight: number; reps: number }[] {
  if (workingWeight <= 0) return [];
  const s = step > 0 ? step : 1;
  const mk = (pct: number, reps: number) => ({ weight: Math.max(s, roundToStep(workingWeight * pct, s)), reps });
  return [mk(0.5, 10), mk(0.7, 5), mk(0.85, 2)];
}
