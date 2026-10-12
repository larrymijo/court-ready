import type { RoutineId } from '@/lib/types';

export type DayPlan =
  | { kind: 'gym'; routineId: RoutineId; label: string; tile: [string, string] }
  | { kind: 'sport'; label: string; tile: [string, string] }
  | { kind: 'maybe'; label: string; tile: [string, string] };

/** Monday-first weekly plan from the guide ("Your week"). `tile` is the two-line label in the week strip. */
export const WEEK_PLAN: DayPlan[] = [
  { kind: 'gym', routineId: 'uppera', label: 'Upper A', tile: ['Upper', 'A'] },
  { kind: 'sport', label: 'Volleyball', tile: ['Volley', 'ball'] },
  { kind: 'gym', routineId: 'lower', label: 'Lower', tile: ['Lower', '+ core'] },
  { kind: 'maybe', label: 'Volleyball?', tile: ['Volley?', 'or bonus'] },
  { kind: 'sport', label: 'Basketball', tile: ['Basket', 'ball'] },
  { kind: 'gym', routineId: 'upperb', label: 'Upper B', tile: ['Upper', 'B'] },
  { kind: 'maybe', label: 'Volleyball?', tile: ['Volley?', 'or rest'] },
];

export const DAY_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
export const DAY_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** "Adapt it to your week" table from the guide. */
export const ADAPT_RULES: { week: string; doThis: string }[] = [
  { week: 'Only Tue + Fri', doThis: 'All 3 sessions. Optional: add the Bonus on Thursday or Sunday.' },
  { week: '+ Sunday volleyball', doThis: 'All 3 sessions as written. No Bonus.' },
  {
    week: '+ Thursday volleyball',
    doThis: 'Wednesday Lower in game mode. Or, if Sunday is free: Upper B on Wednesday and Lower on Saturday.',
  },
  {
    week: 'Thu + Sun volleyball',
    doThis: 'Upper A and Upper B as written. Lower in game mode — or skip it if you feel beaten up.',
  },
  {
    week: 'Big match or tournament',
    doThis: 'No Lower in the 2 days before it. The day before: rest, or a light session (half the sets, RIR 3).',
  },
];

/** Daily targets from the 20-day fat-loss food plan. */
export const DAILY_TARGETS = {
  kcal: 2100,
  kcalRestDay: 1900,
  proteinG: 165,
  carbsG: 250,
  fatG: 45,
  steps: 10000,
  stepsGameDay: 7000,
  waterL: '2.5–3',
  sleepH: '7–9',
};
