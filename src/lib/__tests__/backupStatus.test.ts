import { describe, expect, it } from '@jest/globals';

import { BACKUP_REMINDER_DAYS, backupStatus, daysAgoText } from '@/lib/backupStatus';
import { formatDataSize } from '@/lib/format';

const DAY = 24 * 60 * 60 * 1000;
const now = new Date(2026, 10, 10, 12).getTime();

function finished(daysAgo: number) {
  const finishedAt = now - daysAgo * DAY;
  return { startedAt: finishedAt - 60 * 60 * 1000, finishedAt };
}

describe('backupStatus', () => {
  it('has nothing to back up before the first workout', () => {
    expect(backupStatus([], null, now)).toEqual({ unsaved: 0, remind: false });
  });

  it('counts every workout when no backup was ever made', () => {
    expect(backupStatus([finished(1), finished(3)], null, now)).toEqual({ unsaved: 2, remind: false });
  });

  it('reminds once the oldest unsaved workout is two weeks old', () => {
    expect(backupStatus([finished(BACKUP_REMINDER_DAYS - 1)], null, now).remind).toBe(false);
    expect(backupStatus([finished(1), finished(BACKUP_REMINDER_DAYS)], null, now)).toEqual({ unsaved: 2, remind: true });
  });

  it('only counts workouts finished after the last backup', () => {
    const lastExportAt = now - 5 * DAY;
    expect(backupStatus([finished(2), finished(20), finished(40)], lastExportAt, now)).toEqual({ unsaved: 1, remind: false });
  });

  it('stays quiet when everything is in the last backup, however old it is', () => {
    expect(backupStatus([finished(60), finished(90)], now - 30 * DAY, now)).toEqual({ unsaved: 0, remind: false });
  });
});

describe('daysAgoText', () => {
  it('speaks in calendar days', () => {
    expect(daysAgoText(now - 60 * 1000, now)).toBe('today');
    expect(daysAgoText(new Date(2026, 10, 9, 23, 30).getTime(), now)).toBe('yesterday');
    expect(daysAgoText(now - 12 * DAY, now)).toBe('12 days ago');
  });
});

describe('formatDataSize', () => {
  it('picks a readable unit', () => {
    expect(formatDataSize(300)).toBe('under 1 KB');
    expect(formatDataSize(135_000)).toBe('132 KB');
    expect(formatDataSize(1_500_000)).toBe('1.4 MB');
  });
});
