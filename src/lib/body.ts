import { mondayOfISO } from '@/lib/dates';
import { formatKg } from '@/lib/format';
import type { BodyEntry } from '@/lib/types';

export interface WeekAverage {
  weekStart: string;
  weight: number | null;
  waist: number | null;
  count: number;
}

function avg(xs: number[]): number | null {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

/** Weekly (Monday-start) averages of bodyweight and waist, oldest first. */
export function weeklyAverages(entries: BodyEntry[]): WeekAverage[] {
  const byWeek = new Map<string, BodyEntry[]>();
  for (const e of entries) {
    const k = mondayOfISO(e.date);
    byWeek.set(k, [...(byWeek.get(k) ?? []), e]);
  }
  return [...byWeek.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([weekStart, list]) => {
      const weights = list.map((e) => e.weight).filter((w): w is number => w != null);
      const waists = list.map((e) => e.waist).filter((w): w is number => w != null);
      return { weekStart, weight: avg(weights), waist: avg(waists), count: weights.length };
    });
}

export interface Advice {
  tone: 'ok' | 'warn' | 'info';
  title: string;
  detail: string;
  change: number;
}

/**
 * The food plan's weekly check-in: compares weekly averages. A week with fewer than 3
 * weigh-ins is too noisy, so while the current week is still filling up we compare the
 * two weeks before it instead.
 */
export function weeklyAdvice(entries: BodyEntry[]): Advice | null {
  const weeks = weeklyAverages(entries).filter((w) => w.weight != null);
  if (weeks.length < 2) return null;
  let cur = weeks[weeks.length - 1];
  let prev = weeks[weeks.length - 2];
  let when = 'this week';
  if (cur.count < 3 && weeks.length >= 3) {
    cur = weeks[weeks.length - 2];
    prev = weeks[weeks.length - 3];
    when = 'last week';
  }
  const change = Math.round(((cur.weight as number) - (prev.weight as number)) * 10) / 10;
  const abs = formatKg(Math.abs(change));
  const waistDown = cur.waist != null && prev.waist != null && cur.waist < prev.waist;

  if (change <= -1) {
    return {
      tone: 'warn',
      title: `Down ${abs} kg ${when}`,
      detail: 'That’s fast. If you feel flat in games, add 150–200 kcal a day: an extra banana and a knäckebröd.',
      change,
    };
  }
  if (change <= -0.5) {
    return { tone: 'ok', title: `Down ${abs} kg ${when}`, detail: 'Perfect: change nothing.', change };
  }
  if (change <= -0.3) {
    return {
      tone: 'ok',
      title: `Down ${abs} kg ${when}`,
      detail: 'On track. Keep your steps up and keep going.',
      change,
    };
  }
  if (waistDown) {
    return {
      tone: 'ok',
      title: 'Same weight, smaller waist',
      detail: 'You’re losing fat and gaining muscle: keep going.',
      change,
    };
  }
  return {
    tone: 'warn',
    title: change > 0 ? `Up ${abs} kg ${when}` : `Down only ${abs} kg ${when}`,
    detail: 'Check your steps and weigh your food for a few days, then cut 150 kcal (drop the peanut butter and knäckebröd).',
    change,
  };
}
