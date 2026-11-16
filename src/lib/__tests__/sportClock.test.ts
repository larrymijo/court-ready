import { describe, expect, it } from '@jest/globals';

import { sportDef } from '@/data/sports';
import {
  clockHHMM,
  clockRangeText,
  playElapsedMs,
  sportDayLabel,
  sportStageIndex,
  sportStepLabels,
  sportSubtitle,
  startTimeMs,
} from '@/lib/sportClock';

const AT = new Date(2026, 10, 10, 8, 5).getTime(); // Tuesday 10 Nov 2026, 08:05 local

describe('playElapsedMs', () => {
  it('is the time since the clock started, however long the phone slept', () => {
    expect(playElapsedMs(1_000, 61_000)).toBe(60_000);
    expect(playElapsedMs(1_000, 1_000 + 3 * 3_600_000)).toBe(3 * 3_600_000);
  });

  it('is 0 before the start, without a start or for times that make no sense', () => {
    expect(playElapsedMs(5_000, 1_000)).toBe(0);
    expect(playElapsedMs(undefined, 1_000)).toBe(0);
    expect(playElapsedMs(Number.NaN, 1_000)).toBe(0);
    expect(playElapsedMs(1_000, Number.NaN)).toBe(0);
  });
});

describe('step bar', () => {
  it('places each stage', () => {
    expect(sportStageIndex('warmup')).toBe(0);
    expect(sportStageIndex('playing')).toBe(1);
    expect(sportStageIndex('log')).toBe(2);
    expect(sportStageIndex('cooldown')).toBe(3);
  });

  it('says RUN for a sport that logs distance', () => {
    expect(sportStepLabels(sportDef('running'))).toEqual(['WARM-UP', 'RUN', 'LOG', 'COOL-DOWN']);
    expect(sportStepLabels(sportDef('volleyball'))).toEqual(['WARM-UP', 'PLAY', 'LOG', 'COOL-DOWN']);
  });
});

describe('texts', () => {
  it('writes the time of day with two digits', () => {
    expect(clockHHMM(AT)).toBe('08:05');
  });

  it('writes the day and the header line', () => {
    expect(sportDayLabel(AT)).toBe('Tuesday 10 Nov');
    expect(sportSubtitle('Court-Ready', AT)).toBe('Court-Ready · Tuesday 10 Nov');
    expect(sportSubtitle(undefined, AT)).toBe('Tuesday 10 Nov');
  });

  it('writes where the minutes came from', () => {
    expect(clockRangeText(AT, AT + 55 * 60_000)).toBe('From the clock · 08:05 to 09:00');
    expect(clockRangeText(AT, undefined)).toBeNull();
  });
});

describe('startTimeMs', () => {
  it('is the local time of that date and time', () => {
    expect(startTimeMs('2026-11-10', '18:30')).toBe(new Date(2026, 10, 10, 18, 30).getTime());
    expect(startTimeMs('2026-11-10', '8:05')).toBe(new Date(2026, 10, 10, 8, 5).getTime());
  });

  it('is null for a date or a time that is not real', () => {
    expect(startTimeMs('2026-02-30', '18:30')).toBeNull();
    expect(startTimeMs('10 Nov', '18:30')).toBeNull();
    expect(startTimeMs('2026-11-10', '24:00')).toBeNull();
    expect(startTimeMs('2026-11-10', '18:60')).toBeNull();
    expect(startTimeMs('2026-11-10', '')).toBeNull();
  });
});
