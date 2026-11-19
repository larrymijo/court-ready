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
  {
    id: 'hip_thrust',
    name: 'Barbell hip thrust',
    muscles: 'Glutes and hamstrings',
    primary: 'glutes',
    secondary: ['hamstrings'],
    equipment: 'barbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['weighted_glute_bridge', 'cable_pull_through'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Sit with your upper back against a secured bench and a padded bar over your hips. Plant both feet and hold the bar steady.',
          'Drive through your feet until your thighs and torso line up. Keep your ribs down, pause, then lower your hips under control.',
        ],
      },
    ],
  },
  {
    id: 'weighted_glute_bridge',
    name: 'Dumbbell glute bridge',
    muscles: 'Glutes and hamstrings',
    primary: 'glutes',
    secondary: ['hamstrings'],
    equipment: 'dumbbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2,
    kind: 'standard',
    swaps: ['hip_thrust', 'cable_pull_through'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Lie on your back with knees bent and feet flat. Hold a dumbbell steady across your hips, with padding underneath for comfort.',
          'Lift your hips until your shoulders, hips and knees line up. Pause there and lower your hips back to the floor.',
        ],
      },
    ],
  },
  {
    id: 'cable_pull_through',
    name: 'Cable pull-through',
    muscles: 'Glutes and hamstrings',
    primary: 'glutes',
    secondary: ['hamstrings'],
    equipment: 'cable',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['hip_thrust', 'rdl'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Face away from a low pulley with the rope between your legs. Walk forward until the cable is taut.',
          'Soften your knees and move your hips back, letting your hands follow the cable. Push your feet into the floor and stand tall as your hips move forward.',
        ],
      },
    ],
  },
  {
    id: 'cable_kickback',
    name: 'Cable glute kickback',
    muscles: 'Glutes',
    primary: 'glutes',
    equipment: 'cable',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    perSide: true,
    swaps: ['weighted_glute_bridge'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Fasten an ankle cuff to a low cable, face the machine and hold its frame for balance.',
          'Keep your hips square and move the cuffed leg back a short distance. Pause, return slowly and finish the set before switching sides.',
        ],
      },
    ],
  },
  {
    id: 'hip_abduction',
    name: 'Hip abduction machine',
    muscles: 'Outer hips and glute medius',
    primary: 'glutes',
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
          'Sit with the pads against the outside of your thighs. Set a comfortable starting width and keep your pelvis against the seat.',
          'Press your thighs apart, pause briefly, then let them come together under control.',
        ],
      },
    ],
  },
  {
    id: 'kettlebell_swing',
    name: 'Two-hand kettlebell swing',
    muscles: 'Glutes, hamstrings and core',
    primary: 'glutes',
    secondary: ['hamstrings', 'core'],
    equipment: 'kettlebell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 4,
    kind: 'standard',
    swaps: ['cable_pull_through', 'rdl'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Place the bell a short step in front of you. Hinge at the hips, grip it with both hands and hike it back high between your thighs.',
          'Extend your hips briskly and let the bell float forward to about chest height. Hinge again as it swings back. After the last backswing, guide it onto the floor ahead of you.',
        ],
      },
    ],
  },
];
