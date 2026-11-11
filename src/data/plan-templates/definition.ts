// Example plan: Upper and Lower, each twice a week (docs/polish-plan.md, section 6).
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

export const DEFINITION_PLAN: Plan = {
  id: 'definition',
  name: 'Definition',
  example: 'definition',
  progression: 'maintain',
  sports: [],
  workouts: [
    {
      id: 'def-upper',
      name: 'Upper',
      focus: 'Chest, back, shoulders, arms',
      minutes: 55,
      warmup: 'upper',
      groups: {},
      items: [
        item('1', 'benchpress', 3, 6, 10, 150, 'Shoulder blades pinned, elbows about 45°, 3 s down.'),
        item('2', 'latpulldown', 3, 8, 12, 120, 'Chest up. Shoulders down first, then elbows to your sides.'),
        item('3', 'incline', 3, 8, 12, 120, 'Bench 15–30°. Shoulder blades pinned, elbows about 45°, 3 s down.'),
        item('4', 'cablerow', 3, 8, 12, 120, 'Handle to your belly button. Squeeze 1 s.'),
        item('5', 'lateral', 3, 12, 20, 60, '30° in front of your body. Stop at shoulder height.'),
        item('6', 'curl', 2, 10, 15, 60, 'Elbows still, 3 s down, pain-free grip.'),
        item('7', 'pushdown', 2, 10, 15, 60, 'Elbows pinned to your sides. Smooth lockout.'),
      ],
    },
    {
      id: 'def-lower',
      name: 'Lower',
      focus: 'Quads, hamstrings, glutes, calves, core',
      minutes: 50,
      warmup: 'lower',
      groups: {},
      items: [
        item('1', 'backsquat', 3, 6, 10, 150, 'Brace, sit down between your knees, chest up.'),
        item('2', 'barbellrdl', 3, 8, 10, 120, 'Hips back, flat back, feel the hamstring stretch.'),
        item('3', 'legpress', 3, 10, 12, 120, 'Brace, 3 s down, hips stay on the pad.'),
        item('4', 'legcurl', 3, 10, 15, 90, 'Squeeze 1 s, 3 s on the way back.'),
        item('5', 'calf', 3, 10, 15, 60, '2 s pause in the bottom stretch. No bouncing.'),
        item('6', 'crunch', 3, 10, 15, 60, 'Ribs to hips. Hips stay still.'),
      ],
    },
  ],
  // Monday first. A rest day has no sessions.
  week: [
    { sessions: [{ ref: { kind: 'gym', workoutId: 'def-upper' } }] },
    { sessions: [{ ref: { kind: 'gym', workoutId: 'def-lower' } }] },
    { sessions: [] },
    { sessions: [{ ref: { kind: 'gym', workoutId: 'def-upper' } }] },
    { sessions: [{ ref: { kind: 'gym', workoutId: 'def-lower' } }] },
    { sessions: [] },
    { sessions: [] },
  ],
};
