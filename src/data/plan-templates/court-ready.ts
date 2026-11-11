// Court-Ready as a plan: built from today's routines, week and targets so the two can't drift.
// The upgrade to data version 3 saves a copy of this on the phone; ids here never change,
// because history points to them.
import { ROUTINES } from '@/data/routines';
import { DAILY_TARGETS, WEEK_PLAN } from '@/data/schedule';
import { phaseForWeek } from '@/lib/program';
import type { GymWorkout, Plan, PlanDay, Routine, SessionRef, SportSession } from '@/lib/types';

/** What Today says on the days you might play (Thursday and Sunday), word for word. */
const MAYBE_DAY_NOTE =
  'If you play, do the game warm-up and rest from the gym. If this week is only Tuesday and Friday, you can do the optional Bonus session, or just rest.';

const SPORTS: SportSession[] = [
  { id: 'volleyball', sport: 'volleyball', name: 'Volleyball' },
  { id: 'basketball', sport: 'basketball', name: 'Basketball' },
];

function toWorkout(routine: Routine): GymWorkout {
  // `day` goes: the week says when a workout is planned now.
  const { day: _day, ...rest } = routine;
  const workout: GymWorkout = { ...rest };
  if (routine.id === 'bonus') workout.cycleRule = 'deloadOnly';
  if (routine.id === 'lower') workout.gameMode = true;
  return workout;
}

const gym = (workoutId: string): SessionRef => ({ kind: 'gym', workoutId });
const sport = (sessionId: string): SessionRef => ({ kind: 'sport', sessionId });

function sportIdFor(label: string): string {
  const found = SPORTS.find((s) => s.name === label);
  if (!found) throw new Error(`Court-Ready week names an unknown sport: ${label}`);
  return found.id;
}

// The "maybe" days of WEEK_PLAN: volleyball some weeks, and on Thursday the optional Bonus.
const MAYBE_DAYS: Record<number, PlanDay> = {
  3: {
    sessions: [
      { ref: sport('volleyball'), optional: true },
      { ref: gym('bonus'), optional: true },
    ],
    note: MAYBE_DAY_NOTE,
  },
  6: { sessions: [{ ref: sport('volleyball'), optional: true }], note: MAYBE_DAY_NOTE },
};

const WEEK: PlanDay[] = WEEK_PLAN.map((d, i) => {
  if (d.kind === 'gym') return { sessions: [{ ref: gym(d.routineId) }] };
  if (d.kind === 'sport') return { sessions: [{ ref: sport(sportIdFor(d.label)) }] };
  const maybe = MAYBE_DAYS[i];
  if (!maybe) throw new Error(`Court-Ready week has no sessions for day ${i}`);
  return maybe;
});

const CYCLE_WEEKS = 12;

const plan: Plan = {
  id: 'court-ready',
  name: 'Court-Ready',
  example: 'court-ready',
  workouts: ROUTINES.map(toWorkout),
  sports: SPORTS,
  week: WEEK,
  cycle: {
    phases: Array.from({ length: CYCLE_WEEKS }, (_, i) => phaseForWeek(i + 1)),
    // After week 12 the guide starts again at week 3.
    repeatFrom: 3,
  },
  progression: 'progress',
  targets: {
    kcal: DAILY_TARGETS.kcal,
    kcalRestDay: DAILY_TARGETS.kcalRestDay,
    proteinG: DAILY_TARGETS.proteinG,
    steps: DAILY_TARGETS.steps,
    stepsSportDay: DAILY_TARGETS.stepsGameDay,
  },
  // The guide pages written for this plan. The others are general and stay for every plan.
  articles: ['how', 'week', 'weeks12', 'chest', 'food', 'life', 'cheat'],
};

/**
 * The Court-Ready example plan. A deep copy, so editing a saved plan can never reach ROUTINES,
 * and plain JSON, so it survives being saved and loaded unchanged.
 */
export const COURT_READY_PLAN: Plan = JSON.parse(JSON.stringify(plan)) as Plan;
