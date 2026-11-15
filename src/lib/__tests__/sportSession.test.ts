import { describe, expect, it } from '@jest/globals';

import { sportDef } from '@/data/sports';
import {
  buildSportRecord,
  insertNewestFirst,
  minutesBetween,
  paceMinPerKm,
  sportEntryErrors,
  type SportRecordInput,
} from '@/lib/sportSession';
import type { Workout } from '@/lib/types';

const MIN = 60_000;
const T = new Date(2026, 10, 14, 18, 0).getTime();

const volleyball = sportDef('volleyball')!;
const running = sportDef('running')!;

const input = (over: Partial<SportRecordInput> = {}): SportRecordInput => ({
  id: 'r1',
  sport: 'volleyball',
  name: 'Volleyball',
  startedAt: T,
  finishedAt: T + 100 * MIN,
  minutes: 90,
  ...over,
});

describe('minutesBetween', () => {
  it('gives whole minutes, rounded', () => {
    expect(minutesBetween(T, T + 90 * MIN)).toBe(90);
    expect(minutesBetween(T, T + 90 * MIN + 29_000)).toBe(90);
    expect(minutesBetween(T, T + 90 * MIN + 31_000)).toBe(91);
    expect(minutesBetween(T, T + 20_000)).toBe(0);
  });

  it('gives 0 for times that make no sense', () => {
    expect(minutesBetween(T, T - MIN)).toBe(0);
    expect(minutesBetween(T, T)).toBe(0);
    expect(minutesBetween(Number.NaN, T)).toBe(0);
    expect(minutesBetween(T, Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe('paceMinPerKm', () => {
  it('is minutes per km', () => {
    expect(paceMinPerKm(5, 25)).toBe(5);
    expect(paceMinPerKm(4, 22)).toBe(5.5);
  });

  it('is null without a distance and minutes above 0', () => {
    expect(paceMinPerKm(undefined, 25)).toBeNull();
    expect(paceMinPerKm(5, undefined)).toBeNull();
    expect(paceMinPerKm(0, 25)).toBeNull();
    expect(paceMinPerKm(5, 0)).toBeNull();
    expect(paceMinPerKm(-1, 25)).toBeNull();
    expect(paceMinPerKm(Number.NaN, 25)).toBeNull();
    expect(paceMinPerKm(null, 25)).toBeNull();
  });
});

describe('sportEntryErrors', () => {
  it('accepts a full entry for a sport that logs a match, and one for a run', () => {
    expect(sportEntryErrors({ minutes: 90, effort: 7, match: true, pain: 3, note: 'x' }, volleyball)).toEqual([]);
    expect(sportEntryErrors({ minutes: 30, effort: 6, distanceKm: 5.2, pain: null }, running)).toEqual([]);
    expect(sportEntryErrors({ minutes: 1 }, volleyball)).toEqual([]);
    expect(sportEntryErrors({ minutes: 600, effort: 1, pain: 0 }, volleyball)).toEqual([]);
    expect(sportEntryErrors({ minutes: 60, effort: 10, pain: 10 }, volleyball)).toEqual([]);
  });

  it('wants whole minutes from 1 to 600', () => {
    for (const minutes of [undefined, 0, -5, 601, 12.5, Number.NaN]) {
      expect(sportEntryErrors({ minutes }, volleyball)).toEqual(['minutes']);
    }
  });

  it('wants an effort, if given, as a whole number from 1 to 10', () => {
    for (const effort of [0, 11, 6.5, Number.NaN]) {
      expect(sportEntryErrors({ minutes: 60, effort }, volleyball)).toEqual(['effort']);
    }
  });

  it('wants pain from 0 to 10, or null', () => {
    for (const pain of [-1, 11, Number.NaN]) {
      expect(sportEntryErrors({ minutes: 60, pain }, volleyball)).toEqual(['pain']);
    }
    expect(sportEntryErrors({ minutes: 60, pain: null }, volleyball)).toEqual([]);
  });

  it('takes a distance above 0, and only for a sport that logs it', () => {
    expect(sportEntryErrors({ minutes: 60, distanceKm: 3 }, volleyball)).toEqual(['distanceKm']);
    expect(sportEntryErrors({ minutes: 60, distanceKm: 0 }, running)).toEqual(['distanceKm']);
    expect(sportEntryErrors({ minutes: 60, distanceKm: -2 }, running)).toEqual(['distanceKm']);
  });

  it('takes match or practice only for a sport that logs it', () => {
    expect(sportEntryErrors({ minutes: 30, match: false }, running)).toEqual(['match']);
    expect(sportEntryErrors({ minutes: 30, match: true }, running)).toEqual(['match']);
    expect(sportEntryErrors({ minutes: 30, match: false }, volleyball)).toEqual([]);
  });

  it('names every field that is wrong', () => {
    expect(sportEntryErrors({ minutes: 0, effort: 0, pain: 12, distanceKm: 1, match: true }, running)).toEqual([
      'minutes',
      'effort',
      'pain',
      'match',
    ]);
  });
});

describe('buildSportRecord', () => {
  it('builds a workout of kind sport with no sets', () => {
    expect(buildSportRecord(input({ effort: 7, match: true, pain: 2, note: '  Club night ', warmupDone: true, cooldownDone: false }))).toEqual({
      id: 'r1',
      name: 'Volleyball',
      kind: 'sport',
      sport: 'volleyball',
      startedAt: T,
      finishedAt: T + 100 * MIN,
      exercises: [],
      prs: [],
      minutes: 90,
      effort: 7,
      match: true,
      pain: 2,
      note: 'Club night',
      warmupDone: true,
      cooldownDone: false,
    });
  });

  it('leaves out what was not given, a blank note and a pain that was not rated', () => {
    const r = buildSportRecord(input({ note: '   ', pain: null }))!;
    expect(Object.keys(r)).toEqual(['id', 'name', 'kind', 'sport', 'startedAt', 'finishedAt', 'exercises', 'prs', 'minutes']);
  });

  it('gets the plan fields, week and phase of a plan session', () => {
    const r = buildSportRecord(
      input({ plan: { planId: 'court-ready', planName: 'Court-Ready', sessionId: 'volleyball', week: 6, phase: 'build' } }),
    )!;
    expect(r).toMatchObject({ planId: 'court-ready', planName: 'Court-Ready', sessionId: 'volleyball', week: 6, phase: 'build' });
    expect(r.routineId).toBeUndefined();
    const noSession = buildSportRecord(input({ plan: { planId: 'mine', planName: 'Mine' } }))!;
    expect(noSession).toMatchObject({ planId: 'mine', planName: 'Mine' });
    expect(noSession).not.toHaveProperty('sessionId');
    expect(noSession).not.toHaveProperty('week');
  });

  it('keeps a distance for a run and marks a session logged later', () => {
    const r = buildSportRecord(input({ sport: 'running', name: '', distanceKm: 5.2, minutes: 28, loggedLater: true }))!;
    expect(r).toMatchObject({ name: 'Running', sport: 'running', distanceKm: 5.2, minutes: 28, loggedLater: true });
    expect(buildSportRecord(input({ loggedLater: false }))).not.toHaveProperty('loggedLater');
  });

  it('is null when the rules fail, the sport is unknown, or the times are wrong', () => {
    expect(buildSportRecord(input({ minutes: 0 }))).toBeNull();
    expect(buildSportRecord(input({ distanceKm: 3 }))).toBeNull();
    expect(buildSportRecord(input({ sport: 'curling' as never }))).toBeNull();
    expect(buildSportRecord(input({ startedAt: Number.NaN }))).toBeNull();
    expect(buildSportRecord(input({ finishedAt: T - 1 }))).toBeNull();
  });
});

describe('insertNewestFirst', () => {
  const w = (id: string, startedAt: number): Workout => ({ id, name: id, startedAt, finishedAt: startedAt + 1, exercises: [] });
  const history = [w('c', 30), w('b', 20), w('a', 10)];

  it('puts a record in its place by start time', () => {
    expect(insertNewestFirst(history, w('new', 40)).map((x) => x.id)).toEqual(['new', 'c', 'b', 'a']);
    expect(insertNewestFirst(history, w('new', 25)).map((x) => x.id)).toEqual(['c', 'new', 'b', 'a']);
    expect(insertNewestFirst(history, w('new', 5)).map((x) => x.id)).toEqual(['c', 'b', 'a', 'new']);
    expect(insertNewestFirst([], w('new', 5)).map((x) => x.id)).toEqual(['new']);
  });

  it('puts it before a record that started at the same time, and leaves the list given alone', () => {
    expect(insertNewestFirst(history, w('new', 20)).map((x) => x.id)).toEqual(['c', 'new', 'b', 'a']);
    expect(history.map((x) => x.id)).toEqual(['c', 'b', 'a']);
  });
});
