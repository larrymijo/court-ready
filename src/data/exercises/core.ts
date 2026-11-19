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
    kind: 'main',
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
    kind: 'main',
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
    kind: 'alternative',
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
    kind: 'alternative',
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
];
