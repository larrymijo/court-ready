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
    kind: 'standard',
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
    kind: 'standard',
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
    kind: 'standard',
    swapOption: true,
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
  {
    id: 'ez_bar_skull_crusher',
    name: 'EZ-bar skull crusher',
    muscles: 'Triceps',
    primary: 'triceps',
    equipment: 'barbell',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['ohext', 'pushdown'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Lie on a flat bench with an EZ bar held above your shoulders. Grip its angled handles and point your elbows toward the ceiling.',
          'Bend your elbows to guide the bar just behind the top of your head. Keeping your upper arms steady, straighten your elbows to lift it again.',
        ],
      },
    ],
  },
  {
    id: 'dumbbell_overhead_triceps_extension',
    name: 'Dumbbell overhead triceps extension',
    muscles: 'Triceps',
    primary: 'triceps',
    equipment: 'dumbbell',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2,
    kind: 'standard',
    swaps: ['ohext', 'pushdown'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Sit upright with one fixed-head dumbbell held overhead in both hands. Support the inside of the top head with your palms.',
          'Point your elbows upward and bend them to lower the weight behind your head. Straighten your elbows to lift it while keeping your ribs down.',
        ],
      },
    ],
  },
  {
    id: 'close_grip_bench_press',
    name: 'Close-grip barbell bench press',
    muscles: 'Triceps, chest and front shoulders',
    primary: 'triceps',
    secondary: ['chest', 'shoulders'],
    equipment: 'barbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['benchpress', 'triceps_dip'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Lie on a flat bench and take the bar with hands about shoulder width apart. Plant your feet and hold the bar over your shoulders.',
          'Keep your elbows close to your sides and lower the bar toward your lower chest. Press up with your wrists stacked over your elbows.',
        ],
      },
    ],
  },
  {
    id: 'bench_dip',
    name: 'Bench dip',
    muscles: 'Triceps, chest and front shoulders',
    primary: 'triceps',
    secondary: ['chest', 'shoulders'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'standard',
    swaps: ['pushdown', 'triceps_kickback'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Sit on the edge of a stable bench. Place your hands beside your hips, bend your knees and plant your feet before sliding your hips just off the edge.',
          'Keep your hips close to the bench. Bend your elbows through a comfortable range, then push through your hands to straighten your arms.',
        ],
      },
    ],
  },
  {
    id: 'triceps_dip',
    name: 'Triceps dip (upright)',
    muscles: 'Triceps, chest and front shoulders',
    primary: 'triceps',
    secondary: ['chest', 'shoulders'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['close_grip_bench_press', 'pushdown'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Support yourself on parallel bars with your torso upright and your feet clear of the floor. Start with your arms straight.',
          'Lower by bending your elbows back close to your sides. Stay within a comfortable shoulder range, then press down through both hands to rise again.',
        ],
      },
    ],
  },
  {
    id: 'triceps_kickback',
    name: 'One-arm dumbbell triceps kickback',
    muscles: 'Triceps',
    primary: 'triceps',
    equipment: 'dumbbell',
    isolation: true,
    tracking: 'weight_reps',
    increment: 1,
    kind: 'standard',
    perSide: true,
    swaps: ['pushdown', 'alt_vbarpushdown'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Support one hand on a bench and hinge forward. Hold a light dumbbell in the other hand, draw the upper arm beside your torso and bend the elbow.',
          'Keep your upper arm still and straighten the elbow to move the weight behind you. Bend the elbow slowly, then repeat on the other arm.',
        ],
      },
    ],
  },
];
