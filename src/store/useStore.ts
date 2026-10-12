import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { EXERCISE_BY_ID, getExercise } from '@/data/exercises';
import { getRoutine } from '@/data/routines';
import { mondayOfISO, todayISO } from '@/lib/dates';
import { uid } from '@/lib/id';
import { prescribe, programPosition } from '@/lib/program';
import { lastPerformance, suggestNext } from '@/lib/progression';
import { detectPRs } from '@/lib/stats';
import type {
  BodyEntry,
  RoutineId,
  Settings,
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from '@/lib/types';

export interface RestState {
  endsAt: number;
  duration: number;
  label: string;
}

export interface ExportData {
  app: 'court-ready';
  version: 1;
  exportedAt: string;
  settings: Settings;
  workouts: Workout[];
  body: BodyEntry[];
}

interface State {
  settings: Settings;
  /** Finished workouts, newest first. */
  workouts: Workout[];
  active: Workout | null;
  warmupChecked: number[];
  body: BodyEntry[];
  rest: RestState | null;

  startRoutine: (routineId: RoutineId, opts?: { gameMode?: boolean }) => void;
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
  updateSettings: (patch: Partial<Settings>) => void;
  exportData: () => string;
  importData: (json: string) => { ok: true; workouts: number } | { ok: false; error: string };
  resetAll: () => void;
}

function defaultSettings(): Settings {
  return {
    programStart: mondayOfISO(todayISO()),
    restTimer: true,
    vibrate: true,
    keepAwake: true,
  };
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

function buildRoutineWorkout(
  routineId: RoutineId,
  gameMode: boolean,
  settings: Settings,
  workouts: Workout[],
): Workout {
  const routine = getRoutine(routineId);
  const pos = programPosition(settings.programStart, todayISO());
  const exercises: WorkoutExercise[] = [];
  for (const item of routine.items) {
    const ex = getExercise(item.exerciseId);
    const p = prescribe(item, ex, { phase: pos.phase, routineId, gameMode });
    if (p.skip) continue;
    const last = lastPerformance(item.exerciseId, workouts);
    let weight: number | null = null;
    if (ex.tracking === 'weight_reps') {
      const lastTop = last ? Math.max(...last.sets.map((s) => s.weight ?? 0)) : null;
      // Deloads keep the same weights; otherwise follow double progression.
      weight = pos.phase === 'deload' ? lastTop : (suggestNext(ex, p, last).weight ?? lastTop);
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
  return {
    id: uid(),
    name: gameMode ? `${routine.name} (game mode)` : routine.name,
    routineId,
    startedAt: Date.now(),
    week: pos.week,
    phase: pos.phase,
    gameMode,
    exercises,
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
      settings: defaultSettings(),
      workouts: [],
      active: null,
      warmupChecked: [],
      body: [],
      rest: null,

      startRoutine: (routineId, opts) => {
        const { settings, workouts } = get();
        set({
          active: buildRoutineWorkout(routineId, !!opts?.gameMode, settings, workouts),
          warmupChecked: [],
          rest: null,
        });
      },

      startEmpty: () => {
        const pos = programPosition(get().settings.programStart, todayISO());
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

      updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

      exportData: () => {
        const { settings, workouts, body } = get();
        const data: ExportData = {
          app: 'court-ready',
          version: 1,
          exportedAt: new Date().toISOString(),
          settings,
          workouts,
          body,
        };
        return JSON.stringify(data);
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json) as Partial<ExportData>;
          if (data.app !== 'court-ready' || !Array.isArray(data.workouts) || !Array.isArray(data.body)) {
            return { ok: false, error: 'This doesn’t look like a Court-Ready export.' };
          }
          set({
            settings: { ...defaultSettings(), ...data.settings },
            workouts: [...data.workouts].sort((a, b) => b.startedAt - a.startedAt),
            body: data.body,
          });
          return { ok: true, workouts: data.workouts.length };
        } catch {
          return { ok: false, error: 'Couldn’t read that text. Paste the whole export.' };
        }
      },

      resetAll: () =>
        set({ settings: defaultSettings(), workouts: [], active: null, warmupChecked: [], body: [], rest: null }),
    }),
    {
      name: 'court-ready',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        settings: s.settings,
        workouts: s.workouts,
        active: s.active,
        warmupChecked: s.warmupChecked,
        body: s.body,
        rest: s.rest,
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
