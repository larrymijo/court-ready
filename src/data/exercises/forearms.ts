import type { ExerciseDef } from '@/lib/types';

export const forearmsExercises: ExerciseDef[] = [
  {
    id: 'wrist_curl',
    name: 'Seated dumbbell wrist curl',
    muscles: 'Forearm flexors',
    primary: 'forearms',
    equipment: 'dumbbell',
    isolation: true,
    tracking: 'weight_reps',
    increment: 1,
    kind: 'standard',
    perSide: true,
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Sit with one forearm supported on your thigh, palm upward. Hold a dumbbell with your wrist just past your knee.',
          'Lower your hand slowly, then curl your palm toward your forearm. Keep your elbow and forearm still and repeat on the other side.',
        ],
      },
    ],
  },
  {
    id: 'farmers_walk',
    name: 'Farmer’s walk',
    muscles: 'Grip, upper back and core',
    primary: 'forearms',
    secondary: ['back', 'core'],
    equipment: 'dumbbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2,
    kind: 'standard',
    dose: '1 rep = one 10 m carry',
    estimate1RM: false,
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Set out a clear 10-metre lane. Pick up two equally weighted dumbbells, stand tall and carry them at your sides with steady steps.',
          'Count each completed length as one rep. Log the weight of one dumbbell. Set the weights down with a hip hinge.',
        ],
      },
    ],
  },
];
