import { describe, expect, it } from '@jest/globals';

import type { Workout } from '@/lib/types';
import { CHECKLISTS } from '@/data/checklists';
import { sportDef } from '@/data/sports';
import {
  checklistKindLabel,
  checklistMeta,
  matchTag,
  prepMark,
  sportFigures,
  sportLogsText,
  sportPlanText,
  sportRecordName,
  sportStats,
  sportSummary,
  sportWhenText,
  weekKindCounts,
} from '@/lib/sportView';

const MIN = 60_000;
const T = new Date(2026, 10, 10, 18, 32).getTime();

describe('sportRecordName', () => {
  it('uses the record name, then the sport, then a plain fallback', () => {
    expect(sportRecordName({ name: ' Beach volleyball ', sport: 'volleyball' })).toBe('Beach volleyball');
    expect(sportRecordName({ name: '', sport: 'running' })).toBe('Running');
    expect(sportRecordName({ name: '', sport: 'curling' as never })).toBe('Sport session');
    expect(sportRecordName({ name: 'Curling', sport: 'curling' as never })).toBe('Curling');
  });
});

describe('matchTag', () => {
  it('says match, practice, or nothing', () => {
    expect(matchTag({ match: true })).toBe('Match');
    expect(matchTag({ match: false })).toBe('Practice');
    expect(matchTag({})).toBeNull();
  });
});

describe('sportFigures and sportSummary', () => {
  it('reads like the artboard: minutes and effort', () => {
    expect(sportFigures({ minutes: 62, effort: 7 })).toEqual(['62 min', 'effort 7']);
    expect(sportSummary({ match: true, minutes: 62, effort: 7 })).toBe('Match · 62 min · effort 7');
    expect(sportSummary({ match: false, minutes: 90 })).toBe('Practice · 90 min');
  });

  it('adds distance and pace for a run', () => {
    expect(sportSummary({ minutes: 44, effort: 6, distanceKm: 8 })).toBe('44 min · effort 6 · 8 km · 5:30 /km');
  });

  it('shows distance without pace when the minutes are missing, and nothing for a bare record', () => {
    expect(sportFigures({ distanceKm: 5 })).toEqual(['5 km']);
    expect(sportSummary({})).toBe('');
    expect(sportFigures({ minutes: 0, effort: undefined, distanceKm: 0 })).toEqual([]);
  });

  it('never mentions sets or kilograms', () => {
    expect(sportSummary({ match: true, minutes: 62, effort: 7, distanceKm: 3 })).not.toMatch(/set|kg/);
  });
});

describe('sportWhenText', () => {
  const clock = (ms: number) => {
    const d = new Date(ms);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  it('gives the date and the start and end time of a timed session', () => {
    expect(sportWhenText({ startedAt: T, finishedAt: T + 62 * MIN })).toBe(
      `Tue 10 Nov 2026 · ${clock(T)} to ${clock(T + 62 * MIN)}`,
    );
  });

  it('gives only the start for a session logged later or without a usable end', () => {
    expect(sportWhenText({ startedAt: T, finishedAt: T + 62 * MIN, loggedLater: true })).toBe(`Tue 10 Nov 2026 · ${clock(T)}`);
    expect(sportWhenText({ startedAt: T })).toBe(`Tue 10 Nov 2026 · ${clock(T)}`);
    expect(sportWhenText({ startedAt: T, finishedAt: T })).toBe(`Tue 10 Nov 2026 · ${clock(T)}`);
  });
});

describe('sportPlanText', () => {
  it('joins the plan name and the week, and copes with either missing', () => {
    expect(sportPlanText({ planName: 'Court-Ready', week: 4 })).toBe('Court-Ready · Week 4');
    expect(sportPlanText({ planName: 'Court-Ready' })).toBe('Court-Ready');
    expect(sportPlanText({ week: 4 })).toBe('Week 4');
    expect(sportPlanText({})).toBe('');
  });
});

describe('sportStats', () => {
  it('lists the figures a record has and marks pain of 4 or more', () => {
    const stats = sportStats({ minutes: 62, effort: 7, pain: 4 });
    expect(stats.map((s) => s.key)).toEqual(['time', 'effort', 'pain']);
    expect(stats.find((s) => s.key === 'pain')).toMatchObject({ value: '4', caption: 'of 10', danger: true });
    expect(stats.find((s) => s.key === 'effort')?.danger).toBeUndefined();
  });

  it('keeps pain 0 to 3 plain and drops a pain that was not rated', () => {
    expect(sportStats({ pain: 3 }).find((s) => s.key === 'pain')?.danger).toBe(false);
    expect(sportStats({ pain: 0 }).find((s) => s.key === 'pain')?.value).toBe('0');
    expect(sportStats({ pain: null }).length).toBe(0);
    expect(sportStats({})).toEqual([]);
  });

  it('adds distance and pace for a run', () => {
    const stats = sportStats({ minutes: 44, distanceKm: 8, effort: 6 });
    expect(stats.map((s) => s.key)).toEqual(['time', 'distance', 'pace', 'effort']);
    expect(stats.find((s) => s.key === 'pace')).toMatchObject({ value: '5:30', caption: 'min per km' });
  });
});

describe('prepMark', () => {
  it('shows nothing for a missing field', () => {
    expect(prepMark(true)).toBe('Done');
    expect(prepMark(false)).toBe('Skipped');
    expect(prepMark(undefined)).toBeNull();
  });
});

describe('sportLogsText', () => {
  it('says what each sport logs', () => {
    expect(sportLogsText(sportDef('volleyball')!)).toMatch(/match or practice/);
    expect(sportLogsText(sportDef('running')!)).toMatch(/^Distance/);
    expect(sportLogsText(sportDef('running')!)).not.toMatch(/match/);
  });
});

describe('checklist texts', () => {
  it('describes every checklist', () => {
    expect(CHECKLISTS).toHaveLength(11);
    for (const c of CHECKLISTS) {
      expect(checklistMeta(c)).toBe(`${c.steps.length} ${c.steps.length === 1 ? 'step' : 'steps'} · ${c.minutes} min`);
      expect(checklistKindLabel(c)).toBe(c.kind === 'warmup' ? 'Warm-up' : 'Cool-down');
    }
  });
});

describe('weekKindCounts', () => {
  const mk = (id: string, day: number, kind?: 'sport', finished = true) =>
    ({
      id,
      name: id,
      kind,
      startedAt: new Date(2026, 10, day, 18).getTime(),
      finishedAt: finished ? new Date(2026, 10, day, 19).getTime() : undefined,
      exercises: [],
    }) as Workout;

  it('counts gym and sport apart, within the week, finished only', () => {
    const list = [mk('a', 9), mk('b', 10, 'sport'), mk('c', 11), mk('d', 12, 'sport', false), mk('e', 17), mk('f', 8)];
    expect(weekKindCounts(list, '2026-11-09')).toEqual({ gym: 2, sport: 1 });
    expect(weekKindCounts([], '2026-11-09')).toEqual({ gym: 0, sport: 0 });
  });
});
