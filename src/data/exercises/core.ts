import type { ExerciseDef } from '@/lib/types';

export const coreExercises: ExerciseDef[] = [
  {
    id: 'pallof',
    name: 'Pallof press',
    muscles: 'Core (anti-rotation) — the stability you use to jump, land and hit',
    primary: 'core',
    equipment: 'cable',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    perSide: true,
    swaps: ['alt_deadbug', 'alt_sideplank'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Cable at chest height. Stand side-on to the machine and hold the handle at your chest with both hands. Step out until the cable pulls you.',
          'Feet shoulder-width, knees soft, abs tight.',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'Press the handle straight out in front of you. Don’t let the cable twist you. Hold 2–3 s.',
          'Bring it back to your chest. Do all reps, then switch sides.',
        ],
      },
    ],
  },
  {
    id: 'crunch',
    name: 'Cable crunch',
    muscles: 'Abs',
    primary: 'core',
    equipment: 'cable',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['alt_deadbug'],
    sections: [
      {
        label: 'SETUP',
        items: ['Kneel facing a high pulley, holding the rope beside your head.'],
      },
      {
        label: 'DO IT',
        items: [
          'Curl your ribs down toward your hips — round your spine. Breathe out and hold 1 s.',
          'Your hips stay still: the movement comes from your abs, not from sitting back.',
          'Return slowly until your abs stretch.',
        ],
      },
      {
        label: 'OPTIONS',
        items: [
          'Dead bug instead: lie on your back, arms up, knees bent at 90°. Press your lower back into the floor, then slowly straighten the opposite arm and leg. 8 per side.',
        ],
      },
    ],
  },
  {
    id: 'alt_deadbug',
    name: 'Dead bug',
    muscles: 'Core',
    primary: 'core',
    equipment: 'bodyweight',
    isolation: true,
    tracking: 'reps',
    increment: 0,
    kind: 'standard',
    swapOption: true,
    perSide: true,
    swaps: ['crunch', 'pallof'],
    sections: [
      {
        label: 'DO IT',
        items: [
          'Lie on your back, arms straight up, knees bent at 90° over your hips.',
          'Press your lower back into the floor.',
          'Slowly straighten the opposite arm and leg, then return. 8 per side.',
        ],
      },
    ],
  },
  {
    id: 'alt_sideplank',
    name: 'Side plank',
    muscles: 'Core (obliques)',
    primary: 'core',
    equipment: 'bodyweight',
    isolation: true,
    tracking: 'reps',
    increment: 0,
    kind: 'standard',
    swapOption: true,
    perSide: true,
    swaps: ['pallof'],
    sections: [
      {
        label: 'DO IT',
        items: [
          'On your forearm, elbow under your shoulder, body in a straight line.',
          'Lift your hips and hold 20–40 s per side. Log the seconds as reps.',
        ],
      },
    ],
  },
  {
    id: 'forearm_plank',
    name: 'Forearm plank',
    muscles: 'Abs and obliques',
    primary: 'core',
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'standard',
    dose: '1 rep = one 10 s hold',
    swaps: ['alt_deadbug', 'alt_sideplank'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Place your elbows under your shoulders and step your feet back. Brace your abs and squeeze your glutes so your hips stay level.',
          'Breathe steadily for a 10-second hold, then lower your knees to reset. Count each completed hold as one rep.',
        ],
      },
    ],
  },
  {
    id: 'floor_crunch',
    name: 'Floor crunch',
    muscles: 'Abs',
    primary: 'core',
    equipment: 'bodyweight',
    isolation: true,
    tracking: 'reps',
    increment: 0,
    kind: 'standard',
    swaps: ['crunch', 'alt_deadbug'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Lie on your back with knees bent, feet flat and hands across your chest.',
          'Exhale and curl your ribs toward your pelvis until your shoulder blades lift. Pause and lower slowly.',
        ],
      },
    ],
  },
  {
    id: 'hanging_leg_raise',
    name: 'Hanging leg raise',
    muscles: 'Abs and hip flexors',
    primary: 'core',
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'standard',
    swaps: ['hanging_knee_raise', 'alt_deadbug'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Hang from a pull-up bar with your shoulders engaged. Steady your body before each lift.',
          'With your legs nearly straight, lift them forward and curl your pelvis toward your ribs. Lower slowly and let any swing settle.',
        ],
      },
    ],
  },
  {
    id: 'hanging_knee_raise',
    name: 'Hanging knee raise',
    muscles: 'Abs and hip flexors',
    primary: 'core',
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'standard',
    swaps: ['alt_deadbug', 'hanging_leg_raise'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Hang from a bar with your arms straight and your body still. Bend your knees.',
          'Lift your knees toward your chest, rounding your pelvis up slightly at the top. Lower them under control.',
        ],
      },
    ],
  },
  {
    id: 'russian_twist',
    name: 'Russian twist',
    muscles: 'Obliques and abs',
    primary: 'core',
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'standard',
    swaps: ['pallof'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Sit with knees bent, heels on the floor and hands together. Lean back slightly while keeping your chest lifted.',
          'Turn your rib cage to one side, then to the other. Keep your hips steady. Count a turn to both sides as one rep.',
        ],
      },
    ],
  },
  {
    id: 'ab_wheel_rollout',
    name: 'Kneeling ab wheel rollout',
    muscles: 'Abs, lats and shoulders',
    primary: 'core',
    secondary: ['back', 'shoulders'],
    equipment: 'ab_wheel',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'standard',
    swaps: ['forearm_plank', 'alt_deadbug'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Kneel on a mat with the wheel below your shoulders. Brace your abs and squeeze your glutes.',
          'Roll forward only as far as you can keep your lower back steady. Press down through the handles and roll back to your starting position.',
        ],
      },
    ],
  },
  {
    id: 'mountain_climber',
    name: 'Mountain climber',
    muscles: 'Core, hip flexors and shoulders',
    primary: 'core',
    secondary: ['shoulders'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'standard',
    swaps: ['alt_deadbug', 'forearm_plank'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Start in a high plank with hands below shoulders and feet hip-width apart.',
          'Bring one knee toward your chest and extend it back. Alternate knees without letting your hips bounce. A left and a right knee drive together count as one rep.',
        ],
      },
    ],
  },
  {
    id: 'bicycle_crunch',
    name: 'Bicycle crunch',
    muscles: 'Abs and obliques',
    primary: 'core',
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'standard',
    swaps: ['floor_crunch', 'alt_deadbug'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Lie on your back with legs raised and knees bent. Rest your fingertips beside your head and lift your shoulders slightly.',
          'Turn one shoulder toward the opposite knee as you straighten the other leg. Switch smoothly. Count a turn to each side as one rep.',
        ],
      },
    ],
  },
];
