import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { EXERCISE_BY_ID, getExercise } from '@/data/exercises';
import { examplePlan, examplePlans } from '@/data/plan-templates';
import { STORE_KEY } from '@/lib/channel';
import { mondayOfISO, todayISO } from '@/lib/dates';
import { uid } from '@/lib/id';
import { lastPerformance } from '@/lib/progression';
import { detectPRs } from '@/lib/stats';
import type {
  BodyEntry,
  Plan,
  PlanState,
  RoutineId,
  Settings,
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from '@/lib/types';
import { DATA_VERSION, isNewerData, migrate } from '@/store/migrations';
import {
  activatePlanData,
  buildPlanWorkout,
  deletePlanData,
  missingExamples,
  normalizePlanData,
  workoutPosition,
  type PlanData,
} from '@/store/planData';
import { keepSafetyCopy, readSafetyCopy } from '@/store/safetyCopy';

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
  activePlanId: string;
  planState: Record<string, PlanState>;
}

interface State {
  settings: Settings;
  /** Finished workouts, newest first. */
  workouts: Workout[];
  active: Workout | null;
  warmupChecked: number[];
  body: BodyEntry[];
  rest: RestState | null;
  /** Saved plans: the examples and, later, your own. There is always at least one. */
  plans: Plan[];
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
  finishWorkout: () => string | null;
  renameWorkout: (name: string) => void;

  addExercise: (exerciseId: string) => void;
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

  startRest: (seconds: number, label: string) => void;
  adjustRest: (deltaSec: number) => void;
  clearRest: () => void;

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
  /** Adds a fresh copy of each example whose id isn't saved, after the saved plans. Returns how many. */
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
  'settings' | 'workouts' | 'active' | 'warmupChecked' | 'body' | 'rest' | 'plans' | 'activePlanId' | 'planState'
>;

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
function defaultData(): Pick<Saved, 'settings' | 'plans' | 'activePlanId' | 'planState'> {
  const start = mondayOfISO(todayISO());
  return {
    settings: defaultSettings(start),
    plans: examplePlans(),
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

function defaultRest(exerciseId: string): number {
  const ex = EXERCISE_BY_ID[exerciseId];
  if (!ex) return 90;
  if (ex.kind === 'care') return 30;
  return ex.isolation ? 75 : 120;
}

function freeExercise(exerciseId: string, workouts: Workout[]): WorkoutExercise {
  const ex = getExercise(exerciseId);
  const last = lastPerformance(exerciseId, workouts);
  const weight = ex.tracking === 'weight_reps' ? (last?.sets[0]?.weight ?? null) : null;
  const count = Math.max(1, Math.min(last?.sets.length ?? 3, 5));
  return {
    id: uid(),
    exerciseId,
    restSec: defaultRest(exerciseId),
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
      body: [],
      rest: null,

      startRoutine: (routineId, opts) => {
        const { plans, planState, settings, workouts } = get();
        // Until the screens move to plans they show the week from settings.programStart, which the
        // store keeps equal to Court-Ready's start; it is the fallback if Court-Ready has no state.
        const state = planState['court-ready'] ?? { start: settings.programStart };
        const active = buildPlanWorkout(courtReadyPlan(plans), state, routineId, {
          gameMode: opts?.gameMode,
          history: workouts,
          today: todayISO(),
          now: Date.now(),
        });
        if (active) set({ active, warmupChecked: [], rest: null });
      },

      startPlanWorkout: (planId, workoutId, opts) => {
        const { plans, planState, workouts } = get();
        const plan = plans.find((p) => p.id === planId);
        if (!plan) return false;
        const active = buildPlanWorkout(plan, planState[planId], workoutId, {
          gameMode: opts?.gameMode,
          history: workouts,
          today: todayISO(),
          now: Date.now(),
        });
        if (!active) return false;
        set({ active, warmupChecked: [], rest: null });
        return true;
      },

      startEmpty: () => {
        const { plans, activePlanId, planState } = get();
        const plan = plans.find((p) => p.id === activePlanId) ?? courtReadyPlan(plans);
        const pos = workoutPosition(plan, planState[plan.id], todayISO());
        set({
          active: {
            id: uid(),
            name: 'Workout',
            startedAt: Date.now(),
            week: pos.week,
            phase: pos.phase,
            exercises: [],
          },
          warmupChecked: [],
          rest: null,
        });
      },

      discardWorkout: () => set({ active: null, rest: null, warmupChecked: [] }),

      finishWorkout: () => {
        const { active, workouts } = get();
        if (!active) return null;
        const exercises = active.exercises
          .map((e) => ({ ...e, sets: e.sets.filter((s) => s.done && (s.reps ?? 0) > 0) }))
          .filter((e) => e.sets.length > 0);
        if (exercises.length === 0) return null;
        const finished: Workout = { ...active, exercises, finishedAt: Date.now() };
        finished.prs = detectPRs(finished, workouts, (id) => EXERCISE_BY_ID[id]);
        set({ workouts: [finished, ...workouts], active: null, rest: null, warmupChecked: [] });
        return finished.id;
      },

      renameWorkout: (name) => {
        const { active } = get();
        if (active) set({ active: { ...active, name } });
      },

      addExercise: (exerciseId) => {
        const { active, workouts } = get();
        if (!active) return;
        set({ active: { ...active, exercises: [...active.exercises, freeExercise(exerciseId, workouts)] } });
      },

      removeExercise: (workoutExerciseId) => {
        const { active } = get();
        if (!active) return;
        set({ active: { ...active, exercises: active.exercises.filter((e) => e.id !== workoutExerciseId) } });
      },

      swapExercise: (workoutExerciseId, exerciseId) => {
        const { workouts } = get();
        const ex = getExercise(exerciseId);
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
        const patch: Partial<Saved> = { activePlanId: next.activePlanId, planState: next.planState };
        if (planId === 'court-ready') patch.settings = { ...settings, programStart: next.planState[planId].start };
        set(patch);
        return true;
      },

      deletePlan: (planId, useInstead) => {
        const { plans, activePlanId, planState } = get();
        const next = deletePlanData({ plans, activePlanId, planState }, planId, useInstead, todayISO());
        if (!next) return false;
        set(next);
        return true;
      },

      restoreExamples: () => {
        const add = missingExamples(get().plans);
        if (add.length > 0) set({ plans: [...get().plans, ...add] });
        return add.length;
      },

      exportData: () => {
        const { settings, workouts, body, plans, activePlanId, planState } = get();
        const data: ExportData = {
          app: 'court-ready',
          version: DATA_VERSION,
          exportedAt: new Date().toISOString(),
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
              activePlanId: data.activePlanId,
              planState: data.planState,
            },
            version,
          ) as unknown as Pick<Saved, 'settings' | 'workouts' | 'body'> & {
            plans?: unknown;
            activePlanId?: unknown;
            planState?: unknown;
          };
          // The phone now holds exactly what the file holds, so it counts as backed up when the file was made.
          const exportedAt = typeof data.exportedAt === 'string' ? Date.parse(data.exportedAt) : NaN;
          const settings: Settings = {
            ...defaultSettings(),
            ...current.settings,
            lastExportAt: Number.isFinite(exportedAt) ? exportedAt : null,
          };
          set({
            settings,
            workouts: [...current.workouts].sort((a, b) => b.startedAt - a.startedAt),
            body: current.body,
            // Broken plan data never refuses a file: it is made usable, and the workouts import.
            ...normalizePlanData(current, settings.programStart, todayISO()),
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
        set({
          settings,
          workouts: saved.workouts,
          body: saved.body,
          active: saved.active ?? null,
          warmupChecked: saved.warmupChecked ?? [],
          rest: null,
          // The plans as the upgrade made them from that copy: no plan change made since survives.
          ...normalizePlanData(saved, settings.programStart, todayISO()),
        });
        return { ok: true, workouts: saved.workouts.length };
      },

      resetAll: () =>
        set({ ...defaultData(), workouts: [], active: null, warmupChecked: [], body: [], rest: null }),
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
      // saved plan data is made usable (see normalizePlanData).
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<Saved>;
        const settings = { ...current.settings, ...saved.settings };
        const planData =
          persisted != null && typeof persisted === 'object'
            ? normalizePlanData(saved, settings.programStart, todayISO())
            : pickPlanData(current);
        return { ...current, ...saved, settings, ...planData };
      },
      partialize: (s): Saved => ({
        settings: s.settings,
        workouts: s.workouts,
        active: s.active,
        warmupChecked: s.warmupChecked,
        body: s.body,
        rest: s.rest,
        plans: s.plans,
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
