import type { ExerciseDef } from '@/lib/types';

export const tricepsExercises: ExerciseDef[] = [
  {
    id: 'pushdown',
    name: 'Rope pushdown',
    muscles: 'Triceps',
    primary: 'triceps',
    equipment: 'cable',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'main',
    swaps: ['alt_vbarpushdown'],
    sections: [
      {
        label: 'SETUP',
        items: ['High pulley with a rope. Elbows at your sides, slight forward lean, shoulders down.'],
      },
      {
        label: 'DO IT',
        items: [
          'Push down until your arms are straight, pulling the rope ends apart at the bottom. Hold 1 s.',
          'Let your hands come back up to chest height in 2 s. Your elbows stay still.',
        ],
      },
      {
        label: 'AVOID',
        items: [
          'Elbows drifting forward, or leaning over the rope to push with your bodyweight.',
          'Slamming into the lockout.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Go lighter and do 15–20 reps, or work one arm at a time with a single handle.'],
      },
    ],
  },
  {
    id: 'ohext',
    name: 'Overhead cable triceps extension',
    muscles: 'Triceps — especially the long head, a big part of the back of your arm',
    primary: 'triceps',
    equipment: 'cable',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'main',
    warning: 'Only if your shoulder AND elbow are pain-free. Otherwise, do rope pushdowns.',
    swaps: ['pushdown'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Rope on a low-to-middle pulley. Face away, rope behind your head, one foot forward, slight forward lean.',
          'Elbows point forward, about shoulder-width apart.',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'Straighten your arms forward and up. Squeeze 1 s.',
          'Lower slowly until you feel a deep stretch in your triceps.',
        ],
      },
      {
        label: 'AVOID',
        items: ['Elbows flaring wide. Arching your lower back.'],
      },
      {
        label: 'WHY',
        items: ['Training the triceps in this stretched position builds more muscle than pushdowns alone.'],
      },
    ],
  },
  {
    id: 'alt_vbarpushdown',
    name: 'V-bar pushdown',
    muscles: 'Triceps',
    primary: 'triceps',
    equipment: 'cable',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'alternative',
    swaps: ['pushdown'],
    sections: [
      {
        label: 'DO IT',
        items: [
          'High pulley with a V-bar. Elbows pinned to your sides, slight forward lean.',
          'Push down to straight arms with a smooth lockout, then let the bar come up in 2 s.',
        ],
      },
    ],
  },
  {
    id: 's_triceps',
    name: 'Triceps stretch',
    muscles: 'Back of the upper arm',
    primary: 'triceps',
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'stretch',
    dose: '30 s per arm',
    perSide: true,
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Raise one arm and bend the elbow so your hand reaches down your back.',
          'Use your other hand to press gently on the elbow until you feel a stretch.',
          'Hold, then switch arms.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Pain in the shoulder: don’t go as far.'],
      },
    ],
  },
];
