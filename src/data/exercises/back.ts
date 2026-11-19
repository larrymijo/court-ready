import type { ExerciseDef } from '@/lib/types';

export const backExercises: ExerciseDef[] = [
  {
    id: 'csrow',
    name: 'Chest-supported dumbbell row',
    muscles: 'Upper back, lats, rear shoulders, biceps',
    primary: 'back',
    secondary: ['shoulders', 'biceps'],
    equipment: 'dumbbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2,
    kind: 'main',
    swaps: ['alt_machinerow', 'alt_dbrow'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Bench at 30–45°. Lie face down with your chest on the pad and your chin just over the top. Feet on the floor.',
          'Let the dumbbells hang straight down, palms facing each other.',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'Pull your shoulder blades back first, then drive your elbows back toward your hips.',
          'Squeeze for 1 s at the top.',
          'Lower in 2 s and let your shoulder blades spread apart at the bottom for a full stretch.',
        ],
      },
      {
        label: 'AVOID',
        items: ['Lifting your chest off the pad to swing the weight up.', 'Shrugging up toward your ears.'],
      },
      {
        label: 'IF IT HURTS',
        items: [
          'Grip or elbow pain: use lifting straps and don’t squeeze the handles harder than you need to.',
          'Or use a machine row with neutral handles.',
        ],
      },
    ],
  },
  {
    id: 'pulldown',
    name: 'Neutral-grip lat pulldown',
    muscles: 'Lats, upper back, biceps',
    primary: 'back',
    secondary: ['biceps'],
    equipment: 'cable',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'main',
    swaps: ['alt_assistedpullup', 'pullup'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Use a V-handle or a bar with parallel handles (palms facing each other).',
          'Lock your thighs under the pad. Lean back a little (10–15°), chest up.',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'First pull your shoulders down, away from your ears. Then drive your elbows down to your sides.',
          'Pull until the handle reaches your upper chest. Squeeze 1 s.',
          'Let it rise in 2–3 s until your arms are straight and you feel your lats stretch.',
        ],
      },
      {
        label: 'AVOID',
        items: ['Swinging your body to move the weight.', 'Pulling behind your neck — never.'],
      },
      {
        label: 'IF IT HURTS',
        items: ['Try wider neutral handles, or a one-arm cable pulldown so your shoulder can find its own path.'],
      },
    ],
  },
  {
    id: 'pullup',
    name: 'Neutral-grip pull-up',
    muscles: 'Lats, upper back, biceps',
    primary: 'back',
    secondary: ['biceps'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'main',
    swaps: ['pulldown', 'alt_assistedpullup'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Parallel handles, palms facing each other. Hang with straight arms and your shoulders slightly pulled down — not totally loose.',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'Pull your shoulder blades down, then drive your elbows down to your ribs.',
          'Pull until your chin is over the handles.',
          'Lower in 2–3 s to a full hang.',
        ],
      },
      {
        label: 'AVOID',
        items: ['Kicking, swinging or half reps.'],
      },
      {
        label: 'OPTIONS',
        items: [
          'Can’t do 6 clean reps? Use the assisted machine or a band — or do lat pulldowns.',
          'More than 10 easy reps? Add weight with a dip belt or a dumbbell between your feet.',
          'If hanging hurts your shoulder, do lat pulldowns instead.',
        ],
      },
    ],
  },
  {
    id: 'cablerow',
    name: 'Seated cable row',
    muscles: 'Mid back, lats, rear shoulders, biceps',
    primary: 'back',
    secondary: ['biceps'],
    equipment: 'cable',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'main',
    swaps: ['alt_machinerow', 'alt_dbrow'],
    sections: [
      {
        label: 'SETUP',
        items: ['Close V-handle (palms facing each other). Sit tall, knees slightly bent, chest up.'],
      },
      {
        label: 'DO IT',
        items: [
          'Row the handle to your belly button with your elbows close to your body. Squeeze your shoulder blades together for 1 s.',
          'Let your arms go straight and your shoulder blades spread forward. A small forward lean is fine.',
        ],
      },
      {
        label: 'AVOID',
        items: ['Rocking back and forth to move a heavy weight.', 'Shrugging your shoulders up.'],
      },
      {
        label: 'IF IT HURTS',
        items: ['Use straps, or swap to a machine row with a chest pad.'],
      },
    ],
  },
  {
    id: 'alt_machinerow',
    name: 'Machine row',
    muscles: 'Upper back, lats, rear shoulders, biceps',
    primary: 'back',
    secondary: ['shoulders', 'biceps'],
    equipment: 'machine',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'alternative',
    swaps: ['csrow', 'cablerow'],
    sections: [
      {
        label: 'DO IT',
        items: [
          'Chest against the pad, neutral handles (palms facing each other).',
          'Pull your shoulder blades back first, then drive your elbows back. Squeeze 1 s.',
          'Let your shoulder blades spread forward at the end of every rep.',
        ],
      },
    ],
  },
  {
    id: 'alt_dbrow',
    name: 'One-arm dumbbell row',
    muscles: 'Lats, upper back, biceps',
    primary: 'back',
    secondary: ['biceps'],
    equipment: 'dumbbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2,
    kind: 'alternative',
    swaps: ['csrow'],
    sections: [
      {
        label: 'DO IT',
        items: [
          'One hand and the same-side knee on a bench, back flat.',
          'Row the dumbbell toward your hip with your elbow close to your body. Squeeze 1 s.',
          'Lower in 2 s to a full stretch. Use straps if your grip or elbow complains.',
        ],
      },
    ],
  },
  {
    id: 'alt_assistedpullup',
    name: 'Assisted pull-up',
    muscles: 'Lats, upper back, biceps',
    primary: 'back',
    secondary: ['biceps'],
    equipment: 'machine',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'alternative',
    swaps: ['pullup', 'pulldown'],
    sections: [
      {
        label: 'DO IT',
        items: [
          'Use the assisted machine or a band, palms facing each other.',
          'Same technique as the neutral-grip pull-up: full hang, shoulders down first, chin over the handles.',
          'Log the assistance as the weight, and use less of it over time.',
        ],
      },
    ],
  },
  {
    id: 'latpulldown',
    name: 'Lat pulldown',
    muscles: 'Lats, upper back, biceps',
    primary: 'back',
    secondary: ['biceps'],
    equipment: 'cable',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'main',
    swaps: ['pulldown', 'alt_assistedpullup', 'pullup'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Hold the bar a little wider than your shoulders. Sit with your thighs snug under the pads.',
          'Lean back slightly and lift your chest.',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'Pull your shoulders down first, then bring your elbows down toward your sides.',
          'Pull the bar to your upper chest and squeeze for 1 s.',
          'Let the bar back up in 2–3 s until your arms are straight and you feel a stretch in your lats.',
        ],
      },
      {
        label: 'AVOID',
        items: [
          'Swinging back to yank the bar down.',
          'Pulling the bar behind your neck.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: [
          'Elbow or grip pain: use straps, or try the neutral-grip pulldown.',
          'Shoulder pinching: don’t reach all the way up at the top.',
        ],
      },
    ],
  },
  {
    id: 's_lat',
    name: 'Lat stretch',
    muscles: 'Side of the back, under the arm',
    primary: 'back',
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'stretch',
    dose: '30 s per side',
    perSide: true,
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Hold a post or a rack with one hand at about head height. Sit your hips back and let your chest drop.',
          'Feel the stretch down the side of your back and under your arm. Hold, then switch sides.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Pinching in the shoulder: raise your hand a little.'],
      },
    ],
  },
];
