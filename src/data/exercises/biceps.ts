import type { ExerciseDef } from '@/lib/types';

export const bicepsExercises: ExerciseDef[] = [
  {
    id: 'curl',
    name: 'Dumbbell curl',
    muscles: 'Biceps, forearms',
    primary: 'biceps',
    equipment: 'dumbbell',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2,
    kind: 'main',
    swaps: ['alt_cablecurl', 'hammer'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Stand tall, dumbbells at your sides, elbows by your sides. (An EZ-bar is fine too — not a straight bar.)',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'Curl up without letting your elbows travel forward much. Squeeze at the top.',
          'Lower in 2–3 s until your arms are almost straight. No snapping at the bottom.',
          'Let your wrists turn to whatever angle feels best.',
        ],
      },
      {
        label: 'AVOID',
        items: [
          'Swinging your back to move the weight.',
          'Heavy, fast half reps — the classic way to hurt your elbows.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: [
          'Pain on the inside of the elbow: a hammer grip (palms facing each other) is often more comfortable.',
          'Pain on the outside: avoid palms-down curls, go lighter and do 12–15 reps.',
        ],
      },
    ],
  },
  {
    id: 'hammer',
    name: 'Hammer curl',
    muscles: 'Biceps, brachialis, forearms',
    primary: 'biceps',
    equipment: 'dumbbell',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2,
    kind: 'main',
    swaps: ['alt_ropecurl', 'curl'],
    sections: [
      {
        label: 'SETUP',
        items: ['Dumbbells at your sides, palms facing each other. Or a rope on a low cable.'],
      },
      {
        label: 'DO IT',
        items: [
          'Curl up with your palms facing each other and your elbows by your sides.',
          'Lower in 2–3 s.',
          'Many people with sore elbows find this the most comfortable curl.',
        ],
      },
      {
        label: 'AVOID',
        items: ['Swinging, or letting the dumbbells crash down.'],
      },
    ],
  },
  {
    id: 'alt_cablecurl',
    name: 'Cable curl',
    muscles: 'Biceps, forearms',
    primary: 'biceps',
    equipment: 'cable',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'alternative',
    swaps: ['curl'],
    sections: [
      {
        label: 'DO IT',
        items: [
          'Low pulley with an EZ or straight handle, elbows by your sides.',
          'Curl up and squeeze, then lower in 2–3 s until your arms are almost straight.',
        ],
      },
    ],
  },
  {
    id: 'alt_ropecurl',
    name: 'Rope cable curl',
    muscles: 'Biceps, brachialis, forearms',
    primary: 'biceps',
    equipment: 'cable',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'alternative',
    swaps: ['hammer'],
    sections: [
      {
        label: 'DO IT',
        items: [
          'Rope on a low pulley, palms facing each other.',
          'Elbows stay by your sides. Curl up, squeeze, lower in 2–3 s.',
        ],
      },
    ],
  },
];
