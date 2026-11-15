// Sport sessions as the store keeps them (data version 4): the session in progress, and which
// plan a session belongs to. Pure, so it can be tested on its own.
import { sportDef } from '@/data/sports';
import { findSportSession } from '@/lib/plans';
import type { SportPlanLink } from '@/lib/sportSession';
import type { ActiveSport, Plan, PlanState, SportDef, SportId, SportSession } from '@/lib/types';
import { workoutPosition } from '@/store/planData';

const STAGES: readonly string[] = ['warmup', 'playing', 'log', 'cooldown'] satisfies ActiveSport['stage'][];

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

const isNumberList = (v: unknown): v is number[] => Array.isArray(v) && v.every((n) => typeof n === 'number');
const isOptional = (v: unknown, type: 'string' | 'number' | 'boolean') => v === undefined || typeof v === type;

/**
 * True when saved data holds a sport session in progress that this app can carry on with: a sport
 * it knows, the fields it needs, and its clock as numbers. Anything else is dropped on load.
 */
export function isActiveSportShaped(value: unknown): value is ActiveSport {
  if (!isObject(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.sport === 'string' &&
    sportDef(value.sport) !== undefined &&
    typeof value.name === 'string' &&
    typeof value.warmup === 'string' &&
    typeof value.cooldown === 'string' &&
    typeof value.openedAt === 'number' &&
    Number.isFinite(value.openedAt) &&
    typeof value.stage === 'string' &&
    STAGES.includes(value.stage) &&
    isOptional(value.planId, 'string') &&
    isOptional(value.planName, 'string') &&
    isOptional(value.sessionId, 'string') &&
    isOptional(value.playStartedAt, 'number') &&
    isOptional(value.playEndedAt, 'number') &&
    isOptional(value.warmupDone, 'boolean') &&
    isNumberList(value.warmupChecked) &&
    isNumberList(value.cooldownChecked) &&
    isObject(value.draft)
  );
}

/** What a new sport session starts from, once its sport, plan and plan session are known to be saved. */
export interface SportStart {
  def: SportDef;
  plan?: Plan;
  session?: SportSession;
  name: string;
  warmup: string;
  cooldown: string;
}

/**
 * Works out a new sport session, or null when it can't start: an unknown sport, a plan that isn't
 * saved, a plan session without a plan, or a plan session that isn't saved or is another sport.
 * The warm-up and cool-down are the plan session's when it sets them, otherwise the sport's own;
 * the name is the one given, else the plan session's, else the sport's.
 */
export function resolveSportStart(
  plans: readonly Plan[],
  opts: { sport: SportId; planId?: string; sessionId?: string; name?: string },
): SportStart | null {
  const def = sportDef(opts.sport);
  if (!def) return null;
  let plan: Plan | undefined;
  let session: SportSession | undefined;
  if (opts.planId !== undefined) {
    plan = plans.find((p) => p.id === opts.planId);
    if (!plan) return null;
  }
  if (opts.sessionId !== undefined) {
    if (!plan) return null;
    session = findSportSession(plan, opts.sessionId);
    if (!session || session.sport !== def.id) return null;
  }
  const given = typeof opts.name === 'string' ? opts.name.trim() : '';
  return {
    def,
    plan,
    session,
    name: given || session?.name || def.name,
    warmup: session?.warmup ?? def.warmup,
    cooldown: session?.cooldown ?? def.cooldown,
  };
}

/**
 * The plan fields of a sport record: the plan's id and name, the plan session, and the week and
 * phase the plan was in on that day, worked out as for a gym workout (see workoutPosition).
 */
export function sportPlanLink(
  plan: Plan,
  state: PlanState | undefined,
  dateISO: string,
  isActive: boolean,
  sessionId?: string,
): SportPlanLink {
  const pos = workoutPosition(plan, state, dateISO, isActive);
  return {
    planId: plan.id,
    planName: plan.name,
    ...(sessionId !== undefined ? { sessionId } : {}),
    week: pos.week,
    phase: pos.phase,
  };
}
