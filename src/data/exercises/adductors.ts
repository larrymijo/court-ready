import type { ExerciseDef } from '@/lib/types';

export const adductorsExercises: ExerciseDef[] = [
  {
    id: 'hip_adduction',
    name: 'Hip adduction machine',
    muscles: 'Inner thighs (adductors)',
    primary: 'adductors',
    equipment: 'machine',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Sit with the pads against the inside of your thighs and choose a comfortable starting width. Rest your back against the seat.',
          'Draw your thighs together smoothly, pause, then open them slowly to the starting position.',
        ],
      },
    ],
  },
];
