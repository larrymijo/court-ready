// Example plan: Push, Pull, Legs, each twice a week (docs/polish-plan.md, section 6).
import type { Plan, RoutineItem } from '@/lib/types';

/** One table row as a plan item. Every item here aims to stop 1–2 reps before failure. */
function item(
  key: string,
  exerciseId: string,
  sets: number,
  repsMin: number,
  repsMax: number,
  restSec: number,
  cue: string,
): RoutineItem {
  return { key, exerciseId, sets, repsMin, repsMax, rir: '1–2', restSec, cue };
}

export const MUSCLE_MASS_PLAN: Plan = {
  id: 'muscle-mass',
  name: 'Muscle Mass Building',
  example: 'muscle-mass',
  progression: 'progress',
  lighterWeekEvery: 6,
  sports: [],
  workouts: [
    {
      id: 'mm-push',
      name: 'Push',
      focus: 'Chest, shoulders, triceps',
      minutes: 55,
      warmup: 'upper',
      groups: {},
      items: [
        item('1', 'benchpress', 4, 6, 10, 150, 'Shoulder blades pinned, elbows about 45°, 3 s down.'),
        item('2', 'incline', 3, 8, 12, 120, 'Bench 15–30°. Shoulder blades pinned, elbows about 45°, 3 s down.'),
        item('3', 'shoulderpress', 3, 8, 12, 120, 'Ribs down, no arching. Press up and slightly in.'),
        item('4', 'lateral', 4, 12, 20, 60, '30° in front of your body. Stop at shoulder height.'),
        item('5', 'cablefly', 3, 10, 15, 90, 'Hug a big tree. Fixed elbow bend, slow stretch.'),
        item('6', 'pushdown', 3, 10, 15, 75, 'Elbows pinned to your sides. Smooth lockout.'),
      ],
    },
    {
      id: 'mm-pull',
      name: 'Pull',
      focus: 'Back, rear shoulders, biceps',
      minutes: 55,
      warmup: 'upper',
      groups: {},
      items: [
        item('1', 'latpulldown', 4, 8, 12, 120, 'Chest up. Shoulders down first, then elbows to your sides.'),
        item('2', 'cablerow', 3, 8, 12, 120, 'Handle to your belly button. Squeeze 1 s.'),
        item('3', 'alt_dbrow', 3, 8, 12, 120, 'Back flat. Elbow to your hip, squeeze 1 s.'),
        item('4', 'facepull', 3, 12, 20, 75, 'Rope to your eyes. Finish in a “double biceps” pose.'),
        item('5', 'curl', 3, 8, 12, 75, 'Elbows still, 3 s down, pain-free grip.'),
        item('6', 'hammer', 3, 10, 15, 60, 'Palms facing each other, elbows by your sides.'),
      ],
    },
    {
      id: 'mm-legs',
      name: 'Legs',
      focus: 'Quads, hamstrings, glutes, calves',
      minutes: 55,
      warmup: 'lower',
      groups: {},
      items: [
        item('1', 'backsquat', 4, 6, 10, 150, 'Brace, sit down between your knees, chest up.'),
        item('2', 'barbellrdl', 3, 8, 10, 120, 'Hips back, flat back, feel the hamstring stretch.'),
        item('3', 'legpress', 3, 10, 12, 120, 'Brace, 3 s down, hips stay on the pad.'),
        item('4', 'legcurl', 3, 10, 15, 90, 'Squeeze 1 s, 3 s on the way back.'),
        item('5', 'legext', 3, 12, 15, 75, 'Squeeze 1 s at the top, 3 s down.'),
        item('6', 'calf', 4, 10, 15, 60, '2 s pause in the bottom stretch. No bouncing.'),
      ],
    },
  ],
  // Monday first. A rest day has no sessions.
  week: [
    { sessions: [{ ref: { kind: 'gym', workoutId: 'mm-push' } }] },
    { sessions: [{ ref: { kind: 'gym', workoutId: 'mm-pull' } }] },
    { sessions: [{ ref: { kind: 'gym', workoutId: 'mm-legs' } }] },
    { sessions: [{ ref: { kind: 'gym', workoutId: 'mm-push' } }] },
    { sessions: [{ ref: { kind: 'gym', workoutId: 'mm-pull' } }] },
    { sessions: [{ ref: { kind: 'gym', workoutId: 'mm-legs' } }] },
    { sessions: [] },
  ],
};
