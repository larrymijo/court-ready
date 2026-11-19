import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { examplePlan, examplePlans } from '@/data/plan-templates';
import { STORE_KEY } from '@/lib/channel';
import { isISODate, isoFromTimestamp, mondayOfISO, parseISODate, todayISO } from '@/lib/dates';
import { findExercise, isLoggableExercise, makeCustomExercise, readCustomExercises, type CustomExerciseInput } from '@/lib/exerciseCatalog';
import { uid } from '@/lib/id';
import { lastPerformance } from '@/lib/progression';
import { buildSportRecord, insertNewestFirst, minutesBetween, type SportPlanLink } from '@/lib/sportSession';
import { detectPRs } from '@/lib/stats';
import type {
  ActiveSport,
  BodyEntry,
  ExerciseDef,
  Plan,
  PlanState,
  RoutineId,
  RoutineItem,
  Settings,
  SportId,
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from '@/lib/types';
import { DATA_VERSION, isNewerData, migrate } from '@/store/migrations';
import {
  activatePlanData,
  buildPlanWorkout,
  deletePlanData,
  emptyWorkoutPosition,
  missingExamples,
  normalizePlanData,
  syncProgramStart,
  type PlanData,
} from '@/store/planData';
import { keepSafetyCopy, readSafetyCopy } from '@/store/safetyCopy';
import { isActiveSportShaped, resolveSportStart, sportPlanLink } from '@/store/sportData';

export interface RestState {
  endsAt: number;
  duration: number;
  label: string;
}

export interface ExportData {
  app: 'court-ready';
  /** Data version the file was written at (see store/migrations.ts). */
  version: number;
  exportedAt: string;
  settings: Settings;
  workouts: Workout[];
  body: BodyEntry[];
  plans: Plan[];
  customExercises: ExerciseDef[];
  activePlanId: string;
  planState: Record<string, PlanState>;
}

/** "Log a past session": a sport session that wasn't started in the app. */
export interface PastSportEntry {
  sport: SportId;
  /** YYYY-MM-DD and HH:MM, local time: when it started. */
  date: string;
  time: string;
  minutes: number;
  effort?: number;
  match?: boolean;
  pain?: number | null;
  distanceKm?: number;
  note?: string;
  warmupDone?: boolean;
  cooldownDone?: boolean;
  planId?: string;
  sessionId?: string;
}

interface State {
  settings: Settings;
  /** Finished workouts and sport sessions, newest first by startedAt. */
  workouts: Workout[];
  active: Workout | null;
  warmupChecked: number[];
  /** The cool-down ticks of the gym workout in progress. */
  cooldownChecked: number[];
  /** The sport session in progress. Never exported. It can run alongside a gym workout in progress. */
  activeSport: ActiveSport | null;
  body: BodyEntry[];
  rest: RestState | null;
  /** Saved plans: the examples and, later, your own. There is always at least one. */
  plans: Plan[];
  customExercises: ExerciseDef[];
  /** Always the id of one of `plans`. */
  activePlanId: string;
  /** Where each plan stands, by plan id. The active plan always has one. */
  planState: Record<string, PlanState>;

  /** Starts a Court-Ready workout. Kept for the screens until they start plan workouts. */
  startRoutine: (routineId: RoutineId, opts?: { gameMode?: boolean }) => void;
  /** Starts a workout of a saved plan. False when the plan or the workout isn't saved any more. */
  startPlanWorkout: (planId: string, workoutId: string, opts?: { gameMode?: boolean }) => boolean;
  startEmpty: () => void;
  discardWorkout: () => void;
  /**
   * Saves the workout in progress with its ticked sets; null (nothing changes) without one. The
   * warm-up and cool-down marks are written when given. History stays newest first.
   */
  finishWorkout: (opts?: { warmupDone?: boolean; cooldownDone?: boolean }) => string | null;
  renameWorkout: (name: string) => void;

  addExercise: (exerciseId: string) => void;
  addExercises: (exerciseIds: string[]) => number;
  addPlanExercises: (planId: string, workoutId: string, exerciseIds: string[]) => number;
  createCustomExercise: (input: CustomExerciseInput) => { ok: true; id: string } | { ok: false; error: string };
  removeCustomExercise: (id: string) => boolean;
  removeExercise: (workoutExerciseId: string) => void;
  swapExercise: (workoutExerciseId: string, exerciseId: string) => void;
  setPain: (workoutExerciseId: string, pain: number | null) => void;
  setNote: (workoutExerciseId: string, note: string) => void;

  addSet: (workoutExerciseId: string) => void;
  insertWarmups: (workoutExerciseId: string, sets: { weight: number; reps: number }[]) => void;
  removeSet: (workoutExerciseId: string, setId: string) => void;
  updateSet: (workoutExerciseId: string, setId: string, patch: Partial<WorkoutSet>) => void;
  toggleSetType: (workoutExerciseId: string, setId: string) => void;
  /** Ticks a set, filling empty fields with the given defaults. Returns rest seconds to start. */
  completeSet: (
    workoutExerciseId: string,
    setId: string,
    fill: { weight: number | null; reps: number | null },
  ) => number;
  uncompleteSet: (workoutExerciseId: string, setId: string) => void;
  toggleWarmup: (index: number) => void;
  /** Ticks or unticks a step of the gym workout's cool-down. */
  toggleCooldownStep: (index: number) => void;

  /**
   * Opens a sport session at its warm-up, in place of any sport session in progress (the gym
   * workout in progress is not touched). With a plan session, its warm-up, cool-down and name;
   * otherwise the sport's own. False (nothing changes) for an unknown sport, a plan that isn't
   * saved, a session without a plan, or a plan session that isn't saved or is another sport.
   */
  startSport: (opts: { sport: SportId; planId?: string; sessionId?: string; name?: string }) => boolean;
  toggleSportStep: (list: 'warmup' | 'cooldown', index: number) => void;
  /** From the warm-up: starts the clock (saved at once, so a reload keeps it). */
  startPlaying: (opts?: { skippedWarmup?: boolean }) => void;
  /** While playing: stops the clock and opens the log sheet with the minutes played (at least 1). */
  finishPlaying: () => void;
  /** From the log sheet back to the clock: it runs on from the saved start, as if Finish had not been tapped. */
  resumePlaying: () => void;
  updateSportDraft: (patch: ActiveSport['draft']) => void;
  /** From the log sheet to the cool-down. */
  goToCooldown: () => void;
  /**
   * From the log sheet or the cool-down: saves the session and closes it. Returns the record's id,
   * or null (nothing changes) when there is none or the log breaks the rules (lib/sportSession.ts).
   * The cool-down counts as done only when saved from the cool-down without skipping it.
   */
  saveSport: (opts?: { skippedCooldown?: boolean }) => string | null;
  discardSport: () => void;
  /** Saves a session entered afterwards, in date order. Its id, or null (nothing changes) when it can't be saved. */
  logPastSport: (entry: PastSportEntry) => string | null;

  startRest: (seconds: number, label: string) => void;
  adjustRest: (deltaSec: number) => void;
  clearRest: () => void;

  /** Removes a finished gym workout or sport session from history. */
  deleteWorkout: (id: string) => void;
  logBody: (entry: BodyEntry) => void;
  deleteBody: (date: string) => void;
  /** A programStart in the patch is also Court-Ready's start. */
  updateSettings: (patch: Partial<Settings>) => void;
  /** Sets the Monday of a plan's week 1. For Court-Ready, also settings.programStart. */
  setPlanStart: (planId: string, startISO: string) => void;
  /**
   * Makes a saved plan the active one; false if it isn't saved (or the date is not YYYY-MM-DD). The plan
   * left keeps its week (leftAtWeek). 'continue' returns to the week a plan was left in (a plan never
   * used starts this week); a date starts the plan on the Monday of that date's week, also for the
   * plan that is already active. The workout in progress is never touched.
   */
  activatePlan: (planId: string, start: 'continue' | string) => boolean;
  /**
   * Removes a saved plan and its state; history keeps its plan fields. False (nothing changes) for
   * the last plan, an unknown id, or the active plan without a valid `useInstead` (another saved plan,
   * which becomes active as activatePlan(useInstead, 'continue') does).
   */
  deletePlan: (planId: string, useInstead?: string) => boolean;
  /**
   * Adds a fresh copy of each example whose id isn't saved, after the saved plans. Returns how many.
   * A restored Court-Ready without a start gets `settings.programStart` (if it is a date) back as its
   * start, so it stands in its 12-week cycle again.
   */
  restoreExamples: () => number;
  exportData: () => string;
  importData: (json: string) => RestoreResult;
  /** Puts back the data as it was before the last app update changed its shape. */
  restoreSafetyCopy: () => Promise<RestoreResult>;
  resetAll: () => void;
}

export type RestoreResult = { ok: true; workouts: number } | { ok: false; error: string };

/** The part of the state that is saved on the phone. */
type Saved = Pick<
  State,
  | 'settings'
  | 'workouts'
  | 'active'
  | 'warmupChecked'
  | 'cooldownChecked'
  | 'activeSport'
  | 'body'
  | 'rest'
  | 'plans'
  | 'customExercises'
  | 'activePlanId'
  | 'planState'
>;

const isNumberList = (v: unknown): v is number[] => Array.isArray(v) && v.every((n) => typeof n === 'number');

/** Ticks a step on or off in a list of ticked step indexes. */
function toggleIndex(list: readonly number[], index: number): number[] {
  return list.includes(index) ? list.filter((i) => i !== index) : [...list, index];
}

/** Local time of a YYYY-MM-DD date and an HH:MM time (ms since 1970), or null if either isn't one. */
function localTime(dateISO: string, time: string): number | null {
  if (typeof dateISO !== 'string' || !isISODate(dateISO) || typeof time !== 'string') return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!m) return null;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  if (hours > 23 || minutes > 59) return null;
  const d = parseISODate(dateISO);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes).getTime();
}

/** The plan fields a sport session in progress is saved with. A plan deleted since keeps its link without a week. */
function activeSportLink(a: ActiveSport, data: PlanData): SportPlanLink | undefined {
  if (a.planId === undefined) return undefined;
  const plan = data.plans.find((p) => p.id === a.planId);
  if (!plan) {
    return { planId: a.planId, planName: a.planName ?? a.planId, ...(a.sessionId !== undefined ? { sessionId: a.sessionId } : {}) };
  }
  const link = sportPlanLink(plan, data.planState[plan.id], isoFromTimestamp(a.openedAt), plan.id === data.activePlanId, a.sessionId);
  // The plan's name when the session started, as gym workouts keep it.
  return { ...link, planName: a.planName ?? link.planName };
}

function defaultSettings(programStart: string = mondayOfISO(todayISO())): Settings {
  return {
    programStart,
    restTimer: true,
    vibrate: true,
    keepAwake: true,
    lastExportAt: null,
  };
}

/**
 * What a new install starts with, and what "reset" returns to. The persist migrate doesn't run
 * when nothing is saved, so these are the plan defaults the upgrade would give, with one start
 * date for both Court-Ready and the old settings field.
 */
function defaultData(): Pick<Saved, 'settings' | 'plans' | 'activePlanId' | 'planState' | 'customExercises'> {
  const start = mondayOfISO(todayISO());
  return {
    settings: defaultSettings(start),
    plans: examplePlans(),
    customExercises: [],
    activePlanId: 'court-ready',
    planState: { 'court-ready': { start } },
  };
}

function pickPlanData(s: PlanData): PlanData {
  return { plans: s.plans, activePlanId: s.activePlanId, planState: s.planState };
}

/** Court-Ready as saved, or the example if it isn't saved. */
function courtReadyPlan(plans: Plan[]): Plan {
  return plans.find((p) => p.id === 'court-ready') ?? examplePlan('court-ready')!;
}

function newSet(weight: number | null): WorkoutSet {
  return { id: uid(), type: 'normal', weight, reps: null, rir: null, done: false };
}

function defaultRest(ex: ExerciseDef): number {
  if (ex.kind === 'care') return 30;
  return ex.isolation ? 75 : 120;
}

function freeExercise(ex: ExerciseDef, workouts: Workout[]): WorkoutExercise {
  const last = lastPerformance(ex.id, workouts);
  const weight = ex.tracking === 'weight_reps' ? (last?.sets[0]?.weight ?? null) : null;
  const count = Math.max(1, Math.min(last?.sets.length ?? 3, 5));
  return {
    id: uid(),
    exerciseId: ex.id,
    restSec: defaultRest(ex),
    sets: Array.from({ length: count }, () => newSet(weight)),
    pain: null,
    note: '',
  };
}

function mapExercise(
  active: Workout | null,
  workoutExerciseId: string,
  fn: (e: WorkoutExercise) => WorkoutExercise,
): Workout | null {
  if (!active) return active;
  return {
    ...active,
    exercises: active.exercises.map((e) => (e.id === workoutExerciseId ? fn(e) : e)),
  };
}

function mapSet(
  active: Workout | null,
  workoutExerciseId: string,
  setId: string,
  fn: (s: WorkoutSet) => WorkoutSet,
): Workout | null {
  return mapExercise(active, workoutExerciseId, (e) => ({
    ...e,
    sets: e.sets.map((s) => (s.id === setId ? fn(s) : s)),
  }));
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...defaultData(),
      workouts: [],
      active: null,
      warmupChecked: [],
      cooldownChecked: [],
      activeSport: null,
      body: [],
      rest: null,

      startRoutine: (routineId, opts) => {
        const { plans, planState, settings, workouts, customExercises } = get();
        // Until the screens move to plans they show the week from settings.programStart, which the
        // store keeps equal to Court-Ready's start; it is the fallback if Court-Ready has no state.
        const state = planState['court-ready'] ?? { start: settings.programStart };
        const active = buildPlanWorkout(courtReadyPlan(plans), state, routineId, {
          customExercises,
          gameMode: opts?.gameMode,
          history: workouts,
          today: todayISO(),
          now: Date.now(),
        });
        if (active) set({ active, warmupChecked: [], cooldownChecked: [], rest: null });
      },

      startPlanWorkout: (planId, workoutId, opts) => {
        const { plans, activePlanId, planState, workouts, customExercises } = get();
        const plan = plans.find((p) => p.id === planId);
        if (!plan) return false;
        // A paused plan is built for the week it was paused at.
        const active = buildPlanWorkout(plan, planState[planId], workoutId, {
          customExercises,
          gameMode: opts?.gameMode,
          history: workouts,
          today: todayISO(),
          now: Date.now(),
          isActive: planId === activePlanId,
        });
        if (!active) return false;
        set({ active, warmupChecked: [], cooldownChecked: [], rest: null });
        return true;
      },

      startEmpty: () => {
        const { plans, activePlanId, planState } = get();
        const plan = plans.find((p) => p.id === activePlanId) ?? courtReadyPlan(plans);
        // The phase only for a plan with a cycle or a lighter week; Court-Ready's is kept as before.
        set({
          active: {
            id: uid(),
            name: 'Workout',
            startedAt: Date.now(),
            ...emptyWorkoutPosition(plan, planState[plan.id], todayISO()),
            exercises: [],
          },
          warmupChecked: [],
          cooldownChecked: [],
          rest: null,
        });
      },

      discardWorkout: () => set({ active: null, rest: null, warmupChecked: [], cooldownChecked: [] }),

      finishWorkout: (opts) => {
        const { active, workouts, customExercises } = get();
        if (!active) return null;
        const exercises = active.exercises
          .map((e) => ({ ...e, sets: e.sets.filter((s) => s.done && (s.reps ?? 0) > 0) }))
          .filter((e) => e.sets.length > 0);
        if (exercises.length === 0) return null;
        const finished: Workout = { ...active, exercises, finishedAt: Date.now() };
        if (typeof opts?.warmupDone === 'boolean') finished.warmupDone = opts.warmupDone;
        if (typeof opts?.cooldownDone === 'boolean') finished.cooldownDone = opts.cooldownDone;
        finished.prs = detectPRs(finished, workouts, (id) => findExercise(id, customExercises));
        // A prepend whenever the workout started after everything saved; a sport session saved or
        // logged while it was in progress can have started later, and history stays in order.
        set({
          workouts: insertNewestFirst(workouts, finished),
          active: null,
          rest: null,
          warmupChecked: [],
          cooldownChecked: [],
        });
        return finished.id;
      },

      renameWorkout: (name) => {
        const { active } = get();
        if (active) set({ active: { ...active, name } });
      },

      createCustomExercise: (input) => {
        const { customExercises } = get();
        const result = makeCustomExercise(input, `custom_${uid()}`, customExercises);
        if (!result.ok) return result;
        set({ customExercises: [...customExercises, result.exercise] });
        return { ok: true, id: result.exercise.id };
      },

      removeCustomExercise: (id) => {
        const { customExercises, plans } = get();
        const exercise = customExercises.find((ex) => ex.id === id && !ex.archived);
        if (!exercise) return false;
        set({
          customExercises: customExercises.map((ex) => ex === exercise ? { ...ex, archived: true } : ex),
          plans: plans.map((plan) => ({
            ...plan,
            workouts: plan.workouts.map((w) => ({ ...w, items: w.items.filter((item) => item.exerciseId !== id) })),
          })),
        });
        return true;
      },

      addExercise: (exerciseId) => { get().addExercises([exerciseId]); },

      addExercises: (exerciseIds) => {
        const { active, workouts, customExercises } = get();
        if (!active) return 0;
        const additions = [...new Set(exerciseIds)].map((id) => findExercise(id, customExercises))
          .filter(isLoggableExercise).map((ex) => freeExercise(ex, workouts));
        if (additions.length) set({ active: { ...active, exercises: [...active.exercises, ...additions] } });
        return additions.length;
      },

      addPlanExercises: (planId, workoutId, exerciseIds) => {
        const { plans, customExercises } = get();
        const plan = plans.find((p) => p.id === planId);
        const workout = plan?.workouts.find((w) => w.id === workoutId);
        if (!workout) return 0;
        const existing = new Set(workout.items.map((item) => item.exerciseId));
        const keys = new Set(workout.items.map((item) => item.key));
        let next = workout.items.length + 1;
        const items: RoutineItem[] = [];
        for (const id of new Set(exerciseIds)) {
          const ex = findExercise(id, customExercises);
          if (existing.has(id) || !isLoggableExercise(ex)) continue;
          while (keys.has(String(next))) next++;
          items.push({
            key: String(next++), exerciseId: id, sets: 3, repsMin: ex.isolation ? 10 : 8,
            repsMax: ex.isolation ? 15 : 12, rir: '2', restSec: defaultRest(ex), cue: ex.dose ?? '',
            ...(ex.perSide && { perSide: true }),
          });
        }
        if (items.length) {
          const updated = { ...workout, items: [...workout.items, ...items] };
          set({ plans: plans.map((p) => p === plan ? { ...p, workouts: p.workouts.map((w) => w === workout ? updated : w) } : p) });
        }
        return items.length;
      },

      removeExercise: (workoutExerciseId) => {
        const { active } = get();
        if (!active) return;
        set({ active: { ...active, exercises: active.exercises.filter((e) => e.id !== workoutExerciseId) } });
      },

      swapExercise: (workoutExerciseId, exerciseId) => {
        const { workouts, customExercises } = get();
        const ex = findExercise(exerciseId, customExercises);
        if (!isLoggableExercise(ex)) return;
        const last = lastPerformance(exerciseId, workouts);
        const weight = ex.tracking === 'weight_reps' ? (last?.sets[0]?.weight ?? null) : null;
        set({
          active: mapExercise(get().active, workoutExerciseId, (e) => ({
            ...e,
            exerciseId,
            pain: null,
            sets: e.sets.map((s) => (s.done ? s : { ...s, weight, reps: null, rir: null })),
          })),
        });
      },

      setPain: (workoutExerciseId, pain) =>
        set({ active: mapExercise(get().active, workoutExerciseId, (e) => ({ ...e, pain })) }),

      setNote: (workoutExerciseId, note) =>
        set({ active: mapExercise(get().active, workoutExerciseId, (e) => ({ ...e, note })) }),

      addSet: (workoutExerciseId) =>
        set({
          active: mapExercise(get().active, workoutExerciseId, (e) => {
            const prev = e.sets[e.sets.length - 1];
            return { ...e, sets: [...e.sets, newSet(prev?.weight ?? null)] };
          }),
        }),

      insertWarmups: (workoutExerciseId, sets) =>
        set({
          active: mapExercise(get().active, workoutExerciseId, (e) => ({
            ...e,
            sets: [
              ...sets.map((s) => ({ ...newSet(s.weight), type: 'warmup' as const, reps: s.reps })),
              ...e.sets.filter((s) => s.type !== 'warmup' || s.done),
            ],
          })),
        }),

      removeSet: (workoutExerciseId, setId) =>
        set({
          active: mapExercise(get().active, workoutExerciseId, (e) => ({
            ...e,
            sets: e.sets.filter((s) => s.id !== setId),
          })),
        }),

      updateSet: (workoutExerciseId, setId, patch) =>
        set({ active: mapSet(get().active, workoutExerciseId, setId, (s) => ({ ...s, ...patch })) }),

      toggleSetType: (workoutExerciseId, setId) =>
        set({
          active: mapSet(get().active, workoutExerciseId, setId, (s) => ({
            ...s,
            type: s.type === 'normal' ? 'warmup' : 'normal',
          })),
        }),

      completeSet: (workoutExerciseId, setId, fill) => {
        const ex = get().active?.exercises.find((e) => e.id === workoutExerciseId);
        set({
          active: mapSet(get().active, workoutExerciseId, setId, (s) => ({
            ...s,
            weight: s.weight ?? fill.weight,
            reps: s.reps ?? fill.reps,
            done: true,
          })),
        });
        return ex?.restSec ?? 90;
      },

      uncompleteSet: (workoutExerciseId, setId) =>
        set({ active: mapSet(get().active, workoutExerciseId, setId, (s) => ({ ...s, done: false })) }),

      toggleWarmup: (index) => {
        const cur = get().warmupChecked;
        set({ warmupChecked: cur.includes(index) ? cur.filter((i) => i !== index) : [...cur, index] });
      },

      toggleCooldownStep: (index) => set({ cooldownChecked: toggleIndex(get().cooldownChecked, index) }),

      startSport: (opts) => {
        const start = resolveSportStart(get().plans, opts);
        if (!start) return false;
        const activeSport: ActiveSport = {
          id: uid(),
          sport: start.def.id,
          name: start.name,
          ...(start.plan ? { planId: start.plan.id, planName: start.plan.name } : {}),
          ...(start.session ? { sessionId: start.session.id } : {}),
          warmup: start.warmup,
          cooldown: start.cooldown,
          openedAt: Date.now(),
          stage: 'warmup',
          warmupChecked: [],
          cooldownChecked: [],
          draft: {},
        };
        set({ activeSport });
        return true;
      },

      toggleSportStep: (list, index) => {
        const a = get().activeSport;
        if (!a) return;
        const key = list === 'warmup' ? 'warmupChecked' : 'cooldownChecked';
        set({ activeSport: { ...a, [key]: toggleIndex(a[key], index) } });
      },

      startPlaying: (opts) => {
        const a = get().activeSport;
        if (!a || a.stage !== 'warmup') return;
        // The clock is worked out from this time, never counted, so it survives the phone locking
        // and the web app reloading. The store saves it at once.
        set({ activeSport: { ...a, stage: 'playing', playStartedAt: Date.now(), warmupDone: !opts?.skippedWarmup } });
      },

      finishPlaying: () => {
        const a = get().activeSport;
        if (!a || a.stage !== 'playing') return;
        const playEndedAt = Date.now();
        const minutes = Math.max(1, minutesBetween(a.playStartedAt ?? a.openedAt, playEndedAt));
        set({ activeSport: { ...a, stage: 'log', playEndedAt, draft: { ...a.draft, minutes } } });
      },

      resumePlaying: () => {
        const a = get().activeSport;
        if (!a || a.stage !== 'log') return;
        const { playEndedAt: _ended, ...rest } = a;
        void _ended;
        set({ activeSport: { ...rest, stage: 'playing' } });
      },

      updateSportDraft: (patch) => {
        const a = get().activeSport;
        if (a) set({ activeSport: { ...a, draft: { ...a.draft, ...patch } } });
      },

      goToCooldown: () => {
        const a = get().activeSport;
        if (a && a.stage === 'log') set({ activeSport: { ...a, stage: 'cooldown' } });
      },

      saveSport: (opts) => {
        const { activeSport: a, workouts } = get();
        if (!a || (a.stage !== 'log' && a.stage !== 'cooldown')) return null;
        const { minutes, effort, match, pain, distanceKm, note } = a.draft;
        const record = buildSportRecord({
          id: a.id,
          sport: a.sport,
          name: a.name,
          startedAt: a.openedAt,
          finishedAt: Math.max(a.openedAt, Date.now()),
          minutes,
          effort,
          match,
          pain,
          distanceKm,
          note,
          warmupDone: a.warmupDone,
          cooldownDone: a.stage === 'cooldown' && !opts?.skippedCooldown,
          plan: activeSportLink(a, pickPlanData(get())),
        });
        if (!record) return null;
        set({ workouts: insertNewestFirst(workouts, record), activeSport: null });
        return record.id;
      },

      discardSport: () => set({ activeSport: null }),

      logPastSport: (entry) => {
        const { workouts, plans, activePlanId, planState } = get();
        const startedAt = localTime(entry.date, entry.time);
        if (startedAt == null) return null;
        const start = resolveSportStart(plans, { sport: entry.sport, planId: entry.planId, sessionId: entry.sessionId });
        if (!start) return null;
        const record = buildSportRecord({
          id: uid(),
          sport: start.def.id,
          name: start.name,
          startedAt,
          finishedAt: startedAt + entry.minutes * 60_000,
          minutes: entry.minutes,
          effort: entry.effort,
          match: entry.match,
          pain: entry.pain,
          distanceKm: entry.distanceKm,
          note: entry.note,
          warmupDone: entry.warmupDone,
          cooldownDone: entry.cooldownDone,
          loggedLater: true,
          plan: start.plan
            ? sportPlanLink(start.plan, planState[start.plan.id], entry.date, start.plan.id === activePlanId, start.session?.id)
            : undefined,
        });
        if (!record) return null;
        set({ workouts: insertNewestFirst(workouts, record) });
        return record.id;
      },

      startRest: (seconds, label) => set({ rest: { endsAt: Date.now() + seconds * 1000, duration: seconds, label } }),

      adjustRest: (deltaSec) => {
        const { rest } = get();
        if (!rest) return;
        const endsAt = Math.max(Date.now(), rest.endsAt + deltaSec * 1000);
        set({ rest: { ...rest, endsAt, duration: Math.max(1, rest.duration + deltaSec) } });
      },

      clearRest: () => set({ rest: null }),

      deleteWorkout: (id) => set({ workouts: get().workouts.filter((w) => w.id !== id) }),

      logBody: (entry) => {
        const others = get().body.filter((b) => b.date !== entry.date);
        const existing = get().body.find((b) => b.date === entry.date);
        const merged: BodyEntry = {
          date: entry.date,
          weight: entry.weight ?? existing?.weight,
          waist: entry.waist ?? existing?.waist,
        };
        set({ body: [...others, merged].sort((a, b) => (a.date < b.date ? -1 : 1)) });
      },

      deleteBody: (date) => set({ body: get().body.filter((b) => b.date !== date) }),

      updateSettings: (patch) => {
        const { settings, planState } = get();
        const next: Partial<Saved> = { settings: { ...settings, ...patch } };
        // The old field stays one more release; Court-Ready's start follows it.
        if (typeof patch.programStart === 'string') {
          next.planState = {
            ...planState,
            'court-ready': { ...planState['court-ready'], start: patch.programStart },
          };
        }
        set(next);
      },

      setPlanStart: (planId, startISO) => {
        const { settings, planState } = get();
        const next: Partial<Saved> = {
          planState: { ...planState, [planId]: { ...planState[planId], start: startISO } },
        };
        if (planId === 'court-ready') next.settings = { ...settings, programStart: startISO };
        set(next);
      },

      activatePlan: (planId, start) => {
        const { settings, plans, activePlanId, planState } = get();
        const next = activatePlanData({ plans, activePlanId, planState }, planId, start, todayISO());
        if (!next) return false;
        // The old field follows Court-Ready's start (section 11: expand, then contract).
        set({
          activePlanId: next.activePlanId,
          planState: next.planState,
          settings: syncProgramStart(settings, next.planState),
        });
        return true;
      },

      deletePlan: (planId, useInstead) => {
        const { settings, plans, activePlanId, planState } = get();
        const next = deletePlanData({ plans, activePlanId, planState }, planId, useInstead, todayISO());
        if (!next) return false;
        // Continuing Court-Ready in place of the deleted plan gives it a new start; the old field follows.
        set({ ...next, settings: syncProgramStart(settings, next.planState) });
        return true;
      },

      restoreExamples: () => {
        const { plans, planState, settings } = get();
        const add = missingExamples(plans);
        if (add.length === 0) return 0;
        const next: Partial<Saved> = { plans: [...plans, ...add] };
        // Court-Ready comes back at the start the old field still holds. It is not the active plan
        // (it was missing), and without leftAtWeek it goes on from that start, as "Continue" does.
        const cr = planState['court-ready'];
        const start = settings.programStart;
        if (
          add.some((p) => p.id === 'court-ready') &&
          (!cr || typeof cr.start !== 'string') &&
          typeof start === 'string' &&
          isISODate(start)
        ) {
          next.planState = { ...planState, 'court-ready': { ...(cr ?? {}), start } };
        }
        set(next);
        return add.length;
      },

      exportData: () => {
        // Sport sessions travel inside `workouts`. Sessions in progress (gym or sport) are never exported.
        const { settings, workouts, body, plans, activePlanId, planState, customExercises } = get();
        const data: ExportData = {
          app: 'court-ready',
          version: DATA_VERSION,
          exportedAt: new Date().toISOString(),
          customExercises,
          settings,
          workouts,
          body,
          plans,
          activePlanId,
          planState,
        };
        return JSON.stringify(data);
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json) as Partial<ExportData>;
          if (data.app !== 'court-ready' || !Array.isArray(data.workouts) || !Array.isArray(data.body)) {
            return { ok: false, error: 'This doesn’t look like a Hybrid backup.' };
          }
          const version = typeof data.version === 'number' ? data.version : 1;
          if (isNewerData(version)) {
            return {
              ok: false,
              error: 'This backup comes from a newer version of the app. Update the app, then import it again.',
            };
          }
          const current = migrate(
            {
              settings: data.settings,
              workouts: data.workouts,
              body: data.body,
              plans: data.plans,
              customExercises: data.customExercises,
              activePlanId: data.activePlanId,
              planState: data.planState,
            },
            version,
          ) as unknown as Pick<Saved, 'settings' | 'workouts' | 'body'> & {
            plans?: unknown;
            customExercises?: unknown;
            activePlanId?: unknown;
            planState?: unknown;
          };
          const customExercises = readCustomExercises(current.customExercises);
          if (!Array.isArray(current.customExercises) || current.customExercises.length !== customExercises.length) {
            return { ok: false, error: 'The custom exercise list in this backup could not be read.' };
          }
          // Import replaces the Library, but the current gym session stays on the phone. Retain the
          // definitions it still needs as archived entries if they are absent from this backup.
          const before = get();
          const activeIds = new Set(before.active?.exercises.map((exercise) => exercise.exerciseId));
          for (const ex of before.customExercises) {
            if (activeIds.has(ex.id) && !findExercise(ex.id, customExercises)) customExercises.push({ ...ex, archived: true });
          }
          // The phone now holds exactly what the file holds, so it counts as backed up when the file was made.
          const exportedAt = typeof data.exportedAt === 'string' ? Date.parse(data.exportedAt) : NaN;
          const settings: Settings = {
            ...defaultSettings(),
            ...current.settings,
            lastExportAt: Number.isFinite(exportedAt) ? exportedAt : null,
          };
          // Broken plan data never refuses a file: it is made usable, and the workouts import.
          const planData = normalizePlanData(current, settings.programStart, todayISO());
          // Every record has an exercises list (a sport session's is empty), and history is newest first.
          const workouts = current.workouts.map((w): Workout => {
            const record = w as unknown;
            if (record === null || typeof record !== 'object' || Array.isArray(record)) return w;
            return Array.isArray((record as Partial<Workout>).exercises) ? w : { ...w, exercises: [] };
          });
          set({
            // A file whose old programStart differs from Court-Ready's start gets Court-Ready's.
            settings: syncProgramStart(settings, planData.planState),
            workouts: workouts.sort((a, b) => b.startedAt - a.startedAt),
            customExercises,
            body: current.body,
            ...planData,
          });
          return { ok: true, workouts: current.workouts.length };
        } catch {
          return { ok: false, error: 'Couldn’t read that text. Paste the whole export.' };
        }
      },

      restoreSafetyCopy: async () => {
        const copy = await readSafetyCopy();
        if (!copy) return { ok: false, error: 'There is no earlier copy on this phone.' };
        const saved = migrate(copy.state, copy.version) as unknown as Partial<Saved>;
        if (!Array.isArray(saved.workouts) || !Array.isArray(saved.body)) {
          return { ok: false, error: 'The earlier copy can’t be read.' };
        }
        const settings: Settings = { ...defaultSettings(), ...saved.settings };
        // The plans as the upgrade made them from that copy: no plan change made since survives.
        const planData = normalizePlanData(saved, settings.programStart, todayISO());
        set({
          settings: syncProgramStart(settings, planData.planState),
          workouts: saved.workouts,
          body: saved.body,
          customExercises: readCustomExercises(saved.customExercises),
          active: saved.active ?? null,
          warmupChecked: saved.warmupChecked ?? [],
          cooldownChecked: isNumberList(saved.cooldownChecked) ? saved.cooldownChecked : [],
          activeSport: isActiveSportShaped(saved.activeSport) ? saved.activeSport : null,
          rest: null,
          ...planData,
        });
        return { ok: true, workouts: saved.workouts.length };
      },

      resetAll: () =>
        set({
          ...defaultData(),
          workouts: [],
          active: null,
          warmupChecked: [],
          cooldownChecked: [],
          activeSport: null,
          body: [],
          rest: null,
        }),
    }),
    {
      name: STORE_KEY,
      version: DATA_VERSION,
      storage: createJSONStorage(() => AsyncStorage),
      // An app update that changes the data's shape arrives here once, with what the phone had saved.
      migrate: async (persisted, version) => {
        if (version < DATA_VERSION) await keepSafetyCopy(persisted, version);
        return migrate(persisted, version) as unknown as Saved;
      },
      // A setting added later gets its default instead of being missing from older saved data, and
      // saved plan data is made usable (see normalizePlanData), and the old programStart follows
      // Court-Ready's start. A sport session in progress this app can't carry on with is dropped.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<Saved>;
        const isSaved = persisted != null && typeof persisted === 'object';
        const merged = { ...current.settings, ...saved.settings };
        const planData = isSaved ? normalizePlanData(saved, merged.programStart, todayISO()) : pickPlanData(current);
        const settings = syncProgramStart(merged, planData.planState);
        const sport = isSaved
          ? {
              activeSport: isActiveSportShaped(saved.activeSport) ? saved.activeSport : null,
              cooldownChecked: isNumberList(saved.cooldownChecked) ? saved.cooldownChecked : [],
            }
          : { activeSport: current.activeSport, cooldownChecked: current.cooldownChecked };
        const customExercises = isSaved ? readCustomExercises(saved.customExercises) : current.customExercises;
        return { ...current, ...saved, settings, ...planData, ...sport, customExercises };
      },
      partialize: (s): Saved => ({
        settings: s.settings,
        workouts: s.workouts,
        active: s.active,
        warmupChecked: s.warmupChecked,
        cooldownChecked: s.cooldownChecked,
        activeSport: s.activeSport,
        body: s.body,
        rest: s.rest,
        plans: s.plans,
        customExercises: s.customExercises,
        activePlanId: s.activePlanId,
        planState: s.planState,
      }),
    },
  ),
);

const subscribeHydration = (onChange: () => void) => useStore.persist.onFinishHydration(onChange);
const isHydrated = () => useStore.persist.hasHydrated();

/** True once saved data has been loaded from the phone. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribeHydration, isHydrated, isHydrated);
}
