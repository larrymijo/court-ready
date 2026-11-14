// Plan data as the store saves it (data version 3): the plans, which one is active and where each
// plan stands. Helpers here are pure apart from new ids, so they can be tested on their own.
import { EXERCISE_BY_ID } from '@/data/exercises';
import { examplePlans } from '@/data/plan-templates';
import { mondayOfISO } from '@/lib/dates';
import { uid } from '@/lib/id';
import { findWorkout, planPhaseForWeek, planPosition, prescribeItem } from '@/lib/plans';
import { lastPerformance, suggestNext } from '@/lib/progression';
import type { PhaseId, Plan, PlanState, RoutineId, Workout, WorkoutExercise } from '@/lib/types';

export interface PlanData {
  plans: Plan[];
  activePlanId: string;
  planState: Record<string, PlanState>;
}

/** Court-Ready's workouts that were routines before plans: workouts of these still get a routineId. */
const ROUTINE_IDS: readonly string[] = ['uppera', 'lower', 'upperb', 'bonus'] satisfies RoutineId[];

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Enough of a plan to show and use it: an id, a name and the three lists. */
export function isPlanShaped(value: unknown): value is Plan {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    Array.isArray(value.workouts) &&
    Array.isArray(value.sports) &&
    Array.isArray(value.week)
  );
}

/**
 * Makes plan data usable, whatever was read: there is always at least one plan, the active plan
 * is one of them, and it has a state with a start. Without any readable plan, the three examples.
 * Unreadable plan entries are dropped; a list that merely lacks an example is left alone. An
 * active plan without a start gets one: Court-Ready the 12-week start from settings, any other
 * plan the Monday of this week. Nothing else changes.
 */
export function normalizePlanData(
  data: { plans?: unknown; activePlanId?: unknown; planState?: unknown },
  programStart: unknown,
  today: string,
): PlanData {
  let plans = Array.isArray(data.plans) ? data.plans.filter(isPlanShaped) : [];
  if (plans.length === 0) plans = examplePlans();

  const ids = new Set(plans.map((p) => p.id));
  let activePlanId: string;
  if (typeof data.activePlanId === 'string' && ids.has(data.activePlanId)) activePlanId = data.activePlanId;
  else if (ids.has('court-ready')) activePlanId = 'court-ready';
  else activePlanId = plans[0].id;

  const planState = { ...(isObject(data.planState) ? data.planState : {}) } as Record<string, PlanState>;
  const current: unknown = planState[activePlanId];
  if (!isObject(current) || typeof current.start !== 'string') {
    const start =
      activePlanId === 'court-ready' && typeof programStart === 'string' ? programStart : mondayOfISO(today);
    planState[activePlanId] = { ...(isObject(current) ? current : {}), start };
  }
  return { plans, activePlanId, planState };
}

/** Where a plan stands for a new workout. Without a saved start it counts as not started: week 1. */
export function workoutPosition(plan: Plan, state: PlanState | undefined, today: string): { week: number; phase: PhaseId } {
  if (state && typeof state.start === 'string') {
    const pos = planPosition(plan, state, today);
    return { week: pos.week, phase: pos.phase };
  }
  return { week: 1, phase: planPhaseForWeek(plan, 1) };
}

function newSet(weight: number | null) {
  return { id: uid(), type: 'normal' as const, weight, reps: null, rir: null, done: false };
}

/**
 * The workout in progress for one workout of a plan, or null if the plan doesn't have it. Sets,
 * reps and effort come from the plan's phase; weights from the last time each exercise was done.
 */
export function buildPlanWorkout(
  plan: Plan,
  state: PlanState | undefined,
  workoutId: string,
  opts: { gameMode?: boolean; history: Workout[]; today: string; now: number },
): Workout | null {
  const workout = findWorkout(plan, workoutId);
  if (!workout) return null;
  const pos = workoutPosition(plan, state, opts.today);
  const gameMode = !!opts.gameMode && !!workout.gameMode;
  // Deloads keep the same weights, and so does a plan that aims to match last time.
  const keepWeights = pos.phase === 'deload' || plan.progression === 'maintain';

  const exercises: WorkoutExercise[] = [];
  for (const item of workout.items) {
    // An exercise this app doesn't know can't be prescribed; leave it out rather than fail.
    const ex = EXERCISE_BY_ID[item.exerciseId];
    if (!ex) continue;
    const p = prescribeItem(item, ex, workout, { phase: pos.phase, gameMode });
    if (p.skip) continue;
    const last = lastPerformance(item.exerciseId, opts.history);
    let weight: number | null = null;
    if (ex.tracking === 'weight_reps') {
      const lastTop = last ? Math.max(...last.sets.map((s) => s.weight ?? 0)) : null;
      weight = keepWeights ? lastTop : (suggestNext(ex, p, last).weight ?? lastTop);
      if (weight === 0) weight = null;
    }
    exercises.push({
      id: uid(),
      exerciseId: item.exerciseId,
      itemKey: item.key,
      group: item.group,
      restSec: item.restSec,
      target: { sets: p.sets, repsMin: p.repsMin, repsMax: p.repsMax, repsLabel: p.repsLabel, rir: p.rir },
      sets: Array.from({ length: p.sets }, () => newSet(weight)),
      pain: null,
      note: '',
    });
  }

  const out: Workout = {
    id: uid(),
    name: gameMode ? `${workout.name} (game mode)` : workout.name,
    planId: plan.id,
    planName: plan.name,
    sessionId: workout.id,
    startedAt: opts.now,
    week: pos.week,
    phase: pos.phase,
    gameMode,
    exercises,
  };
  if (plan.id === 'court-ready' && ROUTINE_IDS.includes(workout.id)) out.routineId = workout.id as RoutineId;
  return out;
}
