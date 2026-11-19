import { EXERCISES, EXERCISE_BY_ID } from '@/data/exercises';
import type { Equipment, ExerciseDef, MuscleGroup, TrackingType } from '@/lib/types';

export const MUSCLE_GROUPS: readonly MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'quads', 'hamstrings', 'glutes', 'calves',
  'biceps', 'triceps', 'core', 'forearms', 'adductors', 'mobility',
];
export const EQUIPMENT: readonly Equipment[] = [
  'barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'band', 'kettlebell', 'ab_wheel',
];

export function exerciseLabel(value: MuscleGroup | Equipment): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ');
}

export function findExercise(id: string, customExercises: readonly ExerciseDef[] = []): ExerciseDef | undefined {
  if (Object.prototype.hasOwnProperty.call(EXERCISE_BY_ID, id)) return EXERCISE_BY_ID[id];
  return customExercises.find((exercise) => exercise.id === id);
}

/** Archived definitions keep their original name, tracking and muscles for history. */
export function getExercise(id: string, customExercises: readonly ExerciseDef[] = []): ExerciseDef {
  return findExercise(id, customExercises) ?? {
    id, name: 'Removed exercise', muscles: '', primary: 'mobility', equipment: 'bodyweight',
    isolation: false, tracking: 'weight_reps', increment: 0, kind: 'standard', sections: [], swaps: [], archived: true,
  };
}

export function isLoggableExercise(def: ExerciseDef | undefined): def is ExerciseDef {
  return !!def && !def.archived && def.kind !== 'drill' && def.kind !== 'stretch';
}

export interface CustomExerciseInput {
  name: string;
  primary: MuscleGroup;
  secondary?: MuscleGroup[];
  equipment: Equipment;
  tracking: TrackingType;
  increment?: number;
  notes?: string;
}

export function makeCustomExercise(input: CustomExerciseInput, id: string, saved: ExerciseDef[]):
  { ok: true; exercise: ExerciseDef } | { ok: false; error: string } {
  const name = input.name.trim();
  const notes = input.notes?.trim() ?? '';
  if (!name || name.length > 65) return { ok: false, error: 'Enter an exercise name of up to 65 characters.' };
  if ([...EXERCISES, ...saved].some((ex) => !ex.archived && ex.name.trim().toLowerCase() === name.toLowerCase())) {
    return { ok: false, error: 'An exercise already uses this name.' };
  }
  const secondary = [...new Set(input.secondary)].filter((muscle) => muscle !== input.primary);
  if (!MUSCLE_GROUPS.includes(input.primary) || !secondary.every((m) => MUSCLE_GROUPS.includes(m))) {
    return { ok: false, error: 'Select muscles from the list.' };
  }
  if (!EQUIPMENT.includes(input.equipment)) return { ok: false, error: 'Select the equipment.' };
  if (input.tracking !== 'weight_reps' && input.tracking !== 'reps') return { ok: false, error: 'Choose how to log each set.' };
  const increment = input.tracking === 'weight_reps' ? (input.increment ?? 2.5) : 0;
  if (input.tracking === 'weight_reps' && (!Number.isFinite(increment) || increment < 0.01 || Number(increment.toFixed(2)) !== increment)) {
    return { ok: false, error: 'Enter a positive weight step with up to two decimal places.' };
  }
  if (notes.length > 600) return { ok: false, error: 'Keep technique notes to 600 characters.' };
  return {
    ok: true,
    exercise: {
      id, name, primary: input.primary, secondary, muscles: [input.primary, ...secondary].map(exerciseLabel).join(', '),
      equipment: input.equipment, tracking: input.tracking, increment, isolation: false, kind: 'standard',
      sections: notes ? [{ label: 'Technique notes', items: [notes] }] : [], swaps: [],
    },
  };
}

function isCustomDefinition(value: unknown): value is ExerciseDef {
  if (!value || typeof value !== 'object') return false;
  const e = value as Partial<ExerciseDef>;
  return typeof e.id === 'string' && /^custom_[a-zA-Z0-9_-]+$/.test(e.id)
    && typeof e.name === 'string' && !!e.name.trim() && typeof e.muscles === 'string'
    && !!e.primary && MUSCLE_GROUPS.includes(e.primary)
    && (e.secondary === undefined || (Array.isArray(e.secondary) && e.secondary.every((m) => MUSCLE_GROUPS.includes(m))))
    && !!e.equipment && EQUIPMENT.includes(e.equipment)
    && typeof e.isolation === 'boolean' && e.kind === 'standard'
    && (e.tracking === 'weight_reps' || e.tracking === 'reps')
    && typeof e.increment === 'number' && Number.isFinite(e.increment)
    && (e.tracking === 'weight_reps' ? e.increment > 0 : e.increment === 0)
    && (e.archived === undefined || typeof e.archived === 'boolean')
    && Array.isArray(e.sections) && e.sections.every((s) => s && typeof s.label === 'string'
      && Array.isArray(s.items) && s.items.every((item) => typeof item === 'string'))
    && Array.isArray(e.swaps) && e.swaps.every((swap) => typeof swap === 'string')
    && (e.warning === undefined || typeof e.warning === 'string')
    && (e.dose === undefined || typeof e.dose === 'string');
}

/** One readable custom definition per id. An invalid entry cannot mask a built-in or a valid entry. */
export function readCustomExercises(value: unknown): ExerciseDef[] {
  if (!Array.isArray(value)) return [];
  const unique = new Map<string, ExerciseDef>();
  for (const entry of value) {
    if (isCustomDefinition(entry) && !unique.has(entry.id)) unique.set(entry.id, entry);
  }
  return [...unique.values()];
}
