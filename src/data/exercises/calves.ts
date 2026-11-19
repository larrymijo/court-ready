import type { ExerciseDef } from '@/lib/types';

export const calvesExercises: ExerciseDef[] = [
  {
    id: 'calf',
    name: 'Standing calf raise',
    muscles: 'Calves and Achilles tendons — they take a hit from every jump and landing',
    primary: 'calves',
    equipment: 'machine',
    isolation: true,
    tracking: 'weight_reps',
    increment: 5,
    kind: 'standard',
    swaps: ['alt_lpcalf'],
    sections: [
      {
        label: 'SETUP',
        items: ['Balls of your feet on the edge of a step or the machine platform. Knees straight but not locked.'],
      },
      {
        label: 'DO IT',
        items: [
          'Lower your heels as far as you can. Pause 2 s at the bottom — no bounce.',
          'Rise as high as you can onto your big toes. Squeeze 1 s.',
        ],
      },
      {
        label: 'AVOID',
        items: ['Fast, bouncy reps — the tendon does the work instead of the muscle.'],
      },
      {
        label: 'OPTIONS',
        items: ['No machine: one leg at a time on a step, holding a dumbbell.'],
      },
    ],
  },
  {
    id: 'alt_lpcalf',
    name: 'Leg-press calf raise',
    muscles: 'Calves',
    primary: 'calves',
    equipment: 'machine',
    isolation: true,
    tracking: 'weight_reps',
    increment: 5,
    kind: 'standard',
    swapOption: true,
    swaps: ['calf'],
    sections: [
      {
        label: 'DO IT',
        items: [
          'Balls of your feet on the bottom edge of the platform, knees straight but not locked.',
          'Lower your heels as far as you can and pause 2 s. Then press up high onto your big toes.',
        ],
      },
    ],
  },
  {
    id: 'd_skips',
    name: 'Skips',
    muscles: 'Calves, quads, hips — gets the legs bouncy',
    primary: 'calves',
    secondary: ['quads'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'drill',
    dose: '2 × 15 m',
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Skip forward with a small, springy hop on each step. Drive the opposite arm and knee up together.',
          'Stay light on the balls of your feet and keep the hops low at first.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Calf or Achilles pain: do fewer, lower skips, or walk instead.'],
      },
    ],
  },
  {
    id: 's_calf',
    name: 'Calf stretch',
    muscles: 'Calves',
    primary: 'calves',
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'stretch',
    dose: '30 s per leg',
    perSide: true,
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Stand facing a wall and put your hands on it. Step one foot back, with the leg straight and the heel down.',
          'Lean toward the wall until you feel a stretch in the calf of the back leg.',
          'Hold, then switch legs. To reach the lower calf, bend the back knee a little.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Pain at the heel or Achilles: ease off, and stop if it stays.'],
      },
    ],
  },
  {
    id: 'seated_calf_raise',
    name: 'Seated calf raise',
    muscles: 'Calves (especially soleus)',
    primary: 'calves',
    equipment: 'machine',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['calf', 'alt_lpcalf'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Put the balls of your feet on the ledge and adjust the thigh pad to sit just above your knees. Lift the pad and release the stop.',
          'Lower your heels slowly, then rise onto your toes. Pause at the top of each rep and return the stop before getting out.',
        ],
      },
    ],
  },
];
