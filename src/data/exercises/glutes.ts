import type { ExerciseDef } from '@/lib/types';

export const glutesExercises: ExerciseDef[] = [
  {
    id: 'd_shuffle',
    name: 'Side shuffle',
    muscles: 'Hips, glutes, quads — side-to-side movement',
    primary: 'glutes',
    secondary: ['quads'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'drill',
    dose: '2 × 10 m',
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Stand with your knees slightly bent, feet about shoulder-width apart. Step to the side with the lead foot, then bring the other foot in without crossing them.',
          'Keep your hips low and your chest up. Face the same way the whole time, then switch direction.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Knee pain: stand a little taller and take smaller steps.'],
      },
    ],
  },
  {
    id: 'd_bridge',
    name: 'Glute bridge',
    muscles: 'Glutes, hamstrings',
    primary: 'glutes',
    secondary: ['hamstrings'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'drill',
    dose: '10',
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Lie on your back with your knees bent and feet flat on the floor.',
          'Push through your heels to lift your hips until your body makes a straight line from shoulders to knees.',
          'Squeeze your glutes at the top, then lower slowly.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Lower-back pain: lift only part of the way and keep your ribs down.'],
      },
    ],
  },
  {
    id: 's_glute',
    name: 'Glute stretch',
    muscles: 'Buttock and outer hip',
    primary: 'glutes',
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
          'Lie on your back with your knees bent. Cross one ankle over the opposite knee.',
          'Pull the lower thigh toward your chest until you feel a stretch in the buttock of the crossed leg.',
          'Hold, then switch sides.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Knee pain: ease off, or keep the crossed foot flexed.'],
      },
    ],
  },
];
