// The sport session actions of the store (data version 4), and the gym cool-down ticks. Made-up data only.
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Plan, Workout } from '@/lib/types';
import { workoutPosition } from '@/store/planData';
import { useStore } from '@/store/useStore';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const MIN = 60_000;
/** Wednesday of week 4 of a Court-Ready that started on Monday 19 Oct 2026, 18:00. */
const CR_START = '2026-10-19';
const NOW = new Date(2026, 10, 11, 18, 0).getTime();

const state = () => useStore.getState();
const cr = () => state().plans.find((p) => p.id === 'court-ready') as Plan;

/** A made-up plan with a sport session that sets its own checklists. */
const CLUB_PLAN: Plan = {
  id: 'mine',
  name: 'My plan',
  workouts: [],
  sports: [
    { id: 'club', sport: 'football', name: 'Club practice', warmup: 'game', cooldown: 'football-cooldown' },
    { id: 'run', sport: 'running', name: 'Long run' },
  ],
  week: Array.from({ length: 7 }, () => ({ sessions: [] })),
  progression: 'maintain',
};

function gymRecord(id: string, startedAt: number): Workout {
  return {
    id,
    name: id,
    startedAt,
    finishedAt: startedAt + 60 * MIN,
    exercises: [
      {
        id: `${id}-e`,
        exerciseId: 'benchpress',
        restSec: 120,
        sets: [{ id: `${id}-s`, type: 'normal', weight: 60, reps: 8, rir: 2, done: true }],
        pain: null,
        note: '',
      },
    ],
    prs: [],
  };
}

/** What the version 3 app needs to read a sport record as a workout after a rollback. */
function expectReadableByOlderApp(w: Workout) {
  expect(typeof w.id).toBe('string');
  expect(typeof w.name).toBe('string');
  expect(w.name.length).toBeGreaterThan(0);
  expect(typeof w.startedAt).toBe('number');
  expect(typeof w.finishedAt).toBe('number');
  expect(w.exercises).toEqual([]);
  expect(w.prs).toEqual([]);
  expect(w.kind).toBe('sport');
}

/** Starts a session and plays it for `minutes`, ending at the log sheet. */
function playFor(minutes: number, opts: Parameters<ReturnType<typeof state>['startSport']>[0] = { sport: 'volleyball' }) {
  expect(state().startSport(opts)).toBe(true);
  jest.setSystemTime(NOW + 10 * MIN);
  state().startPlaying();
  jest.setSystemTime(NOW + (10 + minutes) * MIN);
  state().finishPlaying();
}

beforeEach(async () => {
  jest.useFakeTimers({ now: NOW });
  await AsyncStorage.clear();
  state().resetAll();
  useStore.setState({
    settings: { ...state().settings, programStart: CR_START },
    planState: { 'court-ready': { start: CR_START } },
  });
});
afterEach(() => {
  jest.useRealTimers();
});

describe('startSport', () => {
  it("opens a plan's sport session at its warm-up, with the sport's checklists", () => {
    expect(state().startSport({ sport: 'volleyball', planId: 'court-ready', sessionId: 'volleyball' })).toBe(true);
    expect(state().activeSport).toEqual({
      id: expect.any(String),
      sport: 'volleyball',
      name: 'Volleyball',
      planId: 'court-ready',
      planName: 'Court-Ready',
      sessionId: 'volleyball',
      warmup: 'game',
      cooldown: 'after-playing',
      openedAt: NOW,
      stage: 'warmup',
      warmupChecked: [],
      cooldownChecked: [],
      draft: {},
    });
  });

  it("takes the plan session's checklists and name when it sets them, and a name given over both", () => {
    useStore.setState({ plans: [...state().plans, CLUB_PLAN] });
    expect(state().startSport({ sport: 'football', planId: 'mine', sessionId: 'club' })).toBe(true);
    expect(state().activeSport).toMatchObject({ name: 'Club practice', warmup: 'game', cooldown: 'football-cooldown', planName: 'My plan' });
    expect(state().startSport({ sport: 'running', planId: 'mine', sessionId: 'run', name: ' Easy 5k ' })).toBe(true);
    expect(state().activeSport).toMatchObject({ name: 'Easy 5k', warmup: 'running-warmup', cooldown: 'running-cooldown' });
  });

  it("opens a sport without a plan with the sport's own name and checklists", () => {
    expect(state().startSport({ sport: 'basketball' })).toBe(true);
    const a = state().activeSport!;
    expect(a).toMatchObject({ sport: 'basketball', name: 'Basketball', warmup: 'game-basketball', cooldown: 'after-playing' });
    expect(a).not.toHaveProperty('planId');
    expect(a).not.toHaveProperty('sessionId');
  });

  it('a plan without a session links the plan only', () => {
    expect(state().startSport({ sport: 'football', planId: 'court-ready' })).toBe(true);
    expect(state().activeSport).toMatchObject({ planId: 'court-ready', planName: 'Court-Ready', warmup: 'football-warmup' });
    expect(state().activeSport).not.toHaveProperty('sessionId');
  });

  it('refuses what it cannot start, and changes nothing', () => {
    state().startSport({ sport: 'running' });
    const before = state().activeSport;
    expect(state().startSport({ sport: 'curling' as never })).toBe(false);
    expect(state().startSport({ sport: 'volleyball', planId: 'gone' })).toBe(false);
    expect(state().startSport({ sport: 'volleyball', sessionId: 'volleyball' })).toBe(false);
    expect(state().startSport({ sport: 'volleyball', planId: 'court-ready', sessionId: 'gone' })).toBe(false);
    expect(state().startSport({ sport: 'football', planId: 'court-ready', sessionId: 'volleyball' })).toBe(false);
    expect(state().activeSport).toBe(before);
  });

  it('runs next to a gym workout in progress, and neither touches the other', () => {
    expect(state().startPlanWorkout('court-ready', 'uppera')).toBe(true);
    state().toggleWarmup(0);
    state().toggleCooldownStep(1);
    const gym = state().active;
    expect(state().startSport({ sport: 'volleyball' })).toBe(true);
    expect(state().active).toBe(gym);
    expect(state().warmupChecked).toEqual([0]);
    expect(state().cooldownChecked).toEqual([1]);

    state().discardSport();
    expect(state().active).toBe(gym);
    state().startSport({ sport: 'running' });
    state().discardWorkout();
    expect(state().activeSport?.sport).toBe('running');
  });
});

describe('toggleSportStep', () => {
  it('ticks and unticks warm-up and cool-down steps', () => {
    state().startSport({ sport: 'volleyball' });
    state().toggleSportStep('warmup', 0);
    state().toggleSportStep('warmup', 2);
    state().toggleSportStep('cooldown', 1);
    expect(state().activeSport).toMatchObject({ warmupChecked: [0, 2], cooldownChecked: [1] });
    state().toggleSportStep('warmup', 0);
    expect(state().activeSport?.warmupChecked).toEqual([2]);
    expect(state().cooldownChecked).toEqual([]);
  });

  it('does nothing without a session', () => {
    state().toggleSportStep('warmup', 0);
    expect(state().activeSport).toBeNull();
  });
});

describe('startPlaying', () => {
  it('starts the clock and saves it at once', async () => {
    state().startSport({ sport: 'volleyball' });
    jest.setSystemTime(NOW + 12 * MIN);
    state().startPlaying();
    expect(state().activeSport).toMatchObject({ stage: 'playing', playStartedAt: NOW + 12 * MIN, warmupDone: true });
    const stored = JSON.parse((await AsyncStorage.getItem('court-ready')) ?? '{}');
    expect(stored.state.activeSport).toMatchObject({ stage: 'playing', playStartedAt: NOW + 12 * MIN });
  });

  it('marks a skipped warm-up', () => {
    state().startSport({ sport: 'volleyball' });
    state().startPlaying({ skippedWarmup: true });
    expect(state().activeSport?.warmupDone).toBe(false);
  });

  it('only starts from the warm-up, so a second tap keeps the first time', () => {
    state().startPlaying();
    expect(state().activeSport).toBeNull();
    state().startSport({ sport: 'volleyball' });
    state().startPlaying();
    jest.setSystemTime(NOW + 5 * MIN);
    state().startPlaying({ skippedWarmup: true });
    expect(state().activeSport).toMatchObject({ playStartedAt: NOW, warmupDone: true });
  });
});

describe('finishPlaying', () => {
  it('stops the clock and fills in the minutes played', () => {
    playFor(83);
    expect(state().activeSport).toMatchObject({
      stage: 'log',
      playStartedAt: NOW + 10 * MIN,
      playEndedAt: NOW + 93 * MIN,
      draft: { minutes: 83 },
    });
  });

  it('gives at least 1 minute', () => {
    state().startSport({ sport: 'volleyball' });
    state().startPlaying();
    jest.setSystemTime(NOW + 10_000);
    state().finishPlaying();
    expect(state().activeSport?.draft.minutes).toBe(1);
  });

  it('only finishes while playing', () => {
    state().startSport({ sport: 'volleyball' });
    state().finishPlaying();
    expect(state().activeSport?.stage).toBe('warmup');
    expect(state().activeSport).not.toHaveProperty('playEndedAt');
  });

  it('keeps the clock when the store reloads between Start playing and Finish', async () => {
    state().startSport({ sport: 'volleyball', planId: 'court-ready', sessionId: 'volleyball' });
    jest.setSystemTime(NOW + 10 * MIN);
    state().startPlaying();
    const saved = await AsyncStorage.getItem('court-ready');

    // The phone locks and the web app reloads: what was in memory is gone, storage stays.
    useStore.setState({ activeSport: null });
    await AsyncStorage.setItem('court-ready', saved!);
    jest.setSystemTime(NOW + 85 * MIN);
    await useStore.persist.rehydrate();
    expect(state().activeSport).toMatchObject({ stage: 'playing', playStartedAt: NOW + 10 * MIN, sessionId: 'volleyball' });

    jest.setSystemTime(NOW + 100 * MIN + 20_000);
    state().finishPlaying();
    expect(state().activeSport?.draft.minutes).toBe(90);
    state().goToCooldown();
    const id = state().saveSport();
    expect(state().workouts[0]).toMatchObject({ id, startedAt: NOW, minutes: 90, warmupDone: true, cooldownDone: true });
  });
});

describe('updateSportDraft and goToCooldown', () => {
  it('fill in the log sheet and move on to the cool-down', () => {
    playFor(60);
    state().updateSportDraft({ effort: 7, match: true });
    state().updateSportDraft({ minutes: 55, note: 'Two sets' });
    expect(state().activeSport?.draft).toEqual({ minutes: 55, effort: 7, match: true, note: 'Two sets' });
    state().goToCooldown();
    expect(state().activeSport?.stage).toBe('cooldown');
  });

  it('go to the cool-down only from the log sheet', () => {
    state().startSport({ sport: 'volleyball' });
    state().goToCooldown();
    expect(state().activeSport?.stage).toBe('warmup');
    state().updateSportDraft({ effort: 3 });
    expect(state().activeSport?.draft).toEqual({ effort: 3 });
  });
});

describe('saveSport', () => {
  it("saves the session with the plan's week and phase, as a gym workout gets them, and closes it", () => {
    expect(state().startPlanWorkout('court-ready', 'lower')).toBe(true);
    const gym = state().active!;
    playFor(90, { sport: 'volleyball', planId: 'court-ready', sessionId: 'volleyball' });
    state().updateSportDraft({ effort: 8, match: true, pain: 2, note: ' Club night ' });
    state().toggleSportStep('cooldown', 0);
    state().goToCooldown();
    jest.setSystemTime(NOW + 115 * MIN);
    const id = state().saveSport();

    expect(id).toEqual(expect.any(String));
    expect(state().activeSport).toBeNull();
    expect(state().active).toBe(gym);
    expect(state().workouts).toEqual([
      {
        id,
        name: 'Volleyball',
        kind: 'sport',
        sport: 'volleyball',
        planId: 'court-ready',
        planName: 'Court-Ready',
        sessionId: 'volleyball',
        startedAt: NOW,
        finishedAt: NOW + 115 * MIN,
        week: gym.week,
        phase: gym.phase,
        exercises: [],
        prs: [],
        minutes: 90,
        effort: 8,
        match: true,
        pain: 2,
        note: 'Club night',
        warmupDone: true,
        cooldownDone: true,
      },
    ]);
    expect(gym.week).toBe(4);
    expectReadableByOlderApp(state().workouts[0]);
  });

  it('marks a skipped cool-down, and a save straight from the log sheet', () => {
    playFor(30);
    state().goToCooldown();
    state().saveSport({ skippedCooldown: true });
    expect(state().workouts[0].cooldownDone).toBe(false);

    playFor(30);
    state().saveSport();
    expect(state().workouts[0].cooldownDone).toBe(false);
  });

  it('keeps the plan name from the start, and the link without a week when the plan was deleted since', () => {
    useStore.setState({ plans: [...state().plans, CLUB_PLAN] });
    playFor(45, { sport: 'football', planId: 'mine', sessionId: 'club' });
    useStore.setState({ plans: state().plans.map((p) => (p.id === 'mine' ? { ...p, name: 'Renamed' } : p)) });
    state().saveSport();
    expect(state().workouts[0]).toMatchObject({ planId: 'mine', planName: 'My plan', sessionId: 'club', week: 1 });

    playFor(45, { sport: 'football', planId: 'mine', sessionId: 'club' });
    useStore.setState({ plans: state().plans.filter((p) => p.id !== 'mine') });
    state().saveSport();
    expect(state().workouts[0]).toMatchObject({ planId: 'mine', planName: 'Renamed', sessionId: 'club' });
    expect(state().workouts[0]).not.toHaveProperty('week');
  });

  it('returns null and changes nothing when the log breaks the rules', () => {
    const history = [gymRecord('old', NOW - 86_400_000)];
    useStore.setState({ workouts: history });
    playFor(30);
    for (const patch of [{ minutes: 0 }, { minutes: 601 }, { minutes: 30, effort: 11 }, { pain: 12 }, { distanceKm: 3 }]) {
      state().updateSportDraft({ minutes: 30, effort: undefined, pain: undefined, distanceKm: undefined, ...patch });
      const before = state().activeSport;
      expect(state().saveSport()).toBeNull();
      expect(state().activeSport).toBe(before);
      expect(state().workouts).toBe(history);
    }
  });

  it('saves nothing before the log sheet', () => {
    state().startSport({ sport: 'volleyball' });
    state().updateSportDraft({ minutes: 30 });
    expect(state().saveSport()).toBeNull();
    state().startPlaying();
    expect(state().saveSport()).toBeNull();
    expect(state().workouts).toEqual([]);
  });

  it('keeps history newest first when a gym workout started later is saved before it', () => {
    state().startSport({ sport: 'running' });
    jest.setSystemTime(NOW + 5 * MIN);
    state().startPlaying();
    const later = gymRecord('later', NOW + 20 * MIN);
    const earlier = gymRecord('earlier', NOW - 86_400_000);
    useStore.setState({ workouts: [later, earlier] });
    jest.setSystemTime(NOW + 40 * MIN);
    state().finishPlaying();
    state().updateSportDraft({ distanceKm: 6 });
    const id = state().saveSport();
    expect(state().workouts.map((w) => w.id)).toEqual(['later', id, 'earlier']);
    expect(state().workouts[1]).toMatchObject({ sport: 'running', distanceKm: 6, minutes: 35 });
  });
});

describe('discardSport', () => {
  it('drops the session in progress and saves nothing', () => {
    playFor(20);
    state().discardSport();
    expect(state().activeSport).toBeNull();
    expect(state().workouts).toEqual([]);
  });
});

describe('logPastSport', () => {
  it('saves a session entered afterwards at its local date and time, in date order', () => {
    const newer = gymRecord('newer', new Date(2026, 10, 10, 18).getTime());
    const older = gymRecord('older', new Date(2026, 10, 2, 18).getTime());
    useStore.setState({ workouts: [newer, older] });
    const id = state().logPastSport({
      sport: 'running',
      date: '2026-11-05',
      time: '07:30',
      minutes: 32,
      effort: 6,
      distanceKm: 6.4,
      pain: null,
      note: 'Canal loop',
      warmupDone: true,
      cooldownDone: false,
    });
    const startedAt = new Date(2026, 10, 5, 7, 30).getTime();
    expect(state().workouts.map((w) => w.id)).toEqual(['newer', id, 'older']);
    expect(state().workouts[1]).toEqual({
      id,
      name: 'Running',
      kind: 'sport',
      sport: 'running',
      startedAt,
      finishedAt: startedAt + 32 * MIN,
      exercises: [],
      prs: [],
      minutes: 32,
      effort: 6,
      distanceKm: 6.4,
      note: 'Canal loop',
      warmupDone: true,
      cooldownDone: false,
      loggedLater: true,
    });
    expectReadableByOlderApp(state().workouts[1]);
  });

  it("gets the plan's week and phase on that date", () => {
    const id = state().logPastSport({
      sport: 'basketball',
      date: '2026-10-30',
      time: '19:00',
      minutes: 60,
      match: false,
      planId: 'court-ready',
      sessionId: 'basketball',
    });
    const pos = workoutPosition(cr(), state().planState['court-ready'], '2026-10-30');
    expect(pos.week).toBe(2);
    expect(state().workouts.find((w) => w.id === id)).toMatchObject({
      name: 'Basketball',
      planId: 'court-ready',
      planName: 'Court-Ready',
      sessionId: 'basketball',
      week: pos.week,
      phase: pos.phase,
      match: false,
      loggedLater: true,
    });
  });

  it('returns null and changes nothing when it cannot be saved', () => {
    const history = [gymRecord('old', NOW - 86_400_000)];
    useStore.setState({ workouts: history });
    const ok = { sport: 'volleyball' as const, date: '2026-11-08', time: '10:00', minutes: 60 };
    for (const entry of [
      { ...ok, date: '2026-02-30' },
      { ...ok, date: 'yesterday' },
      { ...ok, time: '24:00' },
      { ...ok, time: '7.30' },
      { ...ok, minutes: 0 },
      { ...ok, minutes: Number.NaN },
      { ...ok, effort: 0 },
      { ...ok, distanceKm: 4 },
      { ...ok, sport: 'running' as const, match: true },
      { ...ok, planId: 'gone' },
      { ...ok, sessionId: 'volleyball' },
      { ...ok, planId: 'court-ready', sessionId: 'basketball' },
    ]) {
      expect(state().logPastSport(entry)).toBeNull();
      expect(state().workouts).toBe(history);
    }
  });
});

describe('deleteWorkout', () => {
  it('deletes a sport session from history', () => {
    useStore.setState({ workouts: [gymRecord('gym', NOW - 86_400_000)] });
    const id = state().logPastSport({ sport: 'football', date: '2026-11-09', time: '20:00', minutes: 75, match: true })!;
    expect(state().workouts).toHaveLength(2);
    state().deleteWorkout(id);
    expect(state().workouts.map((w) => w.id)).toEqual(['gym']);
  });
});

describe('the gym cool-down', () => {
  function tickOneSet() {
    const ex = state().active!.exercises[0];
    state().completeSet(ex.id, ex.sets[0].id, { weight: 20, reps: 8 });
  }

  it('ticks and unticks steps', () => {
    state().startPlanWorkout('court-ready', 'uppera');
    state().toggleCooldownStep(0);
    state().toggleCooldownStep(3);
    state().toggleCooldownStep(0);
    expect(state().cooldownChecked).toEqual([3]);
  });

  it('is reset wherever the warm-up ticks are', () => {
    const tick = () => {
      state().toggleWarmup(1);
      state().toggleCooldownStep(1);
    };
    const expectReset = () => {
      expect(state().warmupChecked).toEqual([]);
      expect(state().cooldownChecked).toEqual([]);
    };
    tick();
    state().startRoutine('lower');
    expectReset();
    tick();
    state().startPlanWorkout('court-ready', 'uppera');
    expectReset();
    tick();
    state().startEmpty();
    expectReset();
    tick();
    state().discardWorkout();
    expectReset();
    state().startPlanWorkout('court-ready', 'uppera');
    tick();
    tickOneSet();
    expect(state().finishWorkout()).toEqual(expect.any(String));
    expectReset();
    tick();
    state().resetAll();
    expectReset();
    expect(state().activeSport).toBeNull();
  });

  it('finishWorkout writes the warm-up and cool-down marks when given', () => {
    state().startPlanWorkout('court-ready', 'uppera');
    tickOneSet();
    state().finishWorkout({ warmupDone: true, cooldownDone: false });
    expect(state().workouts[0]).toMatchObject({ warmupDone: true, cooldownDone: false });

    state().startPlanWorkout('court-ready', 'uppera');
    tickOneSet();
    state().finishWorkout({ cooldownDone: true });
    expect(state().workouts[0].cooldownDone).toBe(true);
    expect(state().workouts[0]).not.toHaveProperty('warmupDone');
  });

  it('finishWorkout without them works as before', () => {
    useStore.setState({ workouts: [gymRecord('old', NOW - 86_400_000)] });
    state().startPlanWorkout('court-ready', 'uppera');
    const active = state().active!;
    tickOneSet();
    jest.setSystemTime(NOW + 50 * MIN);
    const id = state().finishWorkout();
    const w = state().workouts[0];
    expect(id).toBe(active.id);
    expect(state().workouts.map((x) => x.id)).toEqual([active.id, 'old']);
    expect(w).not.toHaveProperty('warmupDone');
    expect(w).not.toHaveProperty('cooldownDone');
    expect(w).not.toHaveProperty('kind');
    expect(w).toMatchObject({ planId: 'court-ready', sessionId: 'uppera', routineId: 'uppera', finishedAt: NOW + 50 * MIN });
    expect(w.exercises).toHaveLength(1);
    expect(state().active).toBeNull();
    // With nothing ticked there is nothing to save.
    state().startEmpty();
    expect(state().finishWorkout({ warmupDone: true })).toBeNull();
    expect(state().workouts).toHaveLength(2);
  });

  it('saves the ticks on the phone', async () => {
    state().toggleCooldownStep(2);
    const stored = JSON.parse((await AsyncStorage.getItem('court-ready')) ?? '{}');
    expect(stored.state.cooldownChecked).toEqual([2]);
    expect(stored.state).toHaveProperty('activeSport', null);
  });
});

describe('every sport record the store builds', () => {
  it('can be read by the app before it: id, name, numeric times, no sets', () => {
    playFor(40, { sport: 'football' });
    state().saveSport();
    playFor(40, { sport: 'running' });
    state().goToCooldown();
    state().saveSport({ skippedCooldown: true });
    state().logPastSport({ sport: 'basketball', date: '2026-11-01', time: '9:05', minutes: 50 });
    state().logPastSport({ sport: 'volleyball', date: '2026-11-02', time: '18:00', minutes: 120, planId: 'court-ready', sessionId: 'volleyball' });
    expect(state().workouts).toHaveLength(4);
    state().workouts.forEach(expectReadableByOlderApp);
  });
});
