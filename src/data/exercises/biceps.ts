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
    kind: 'standard',
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
    kind: 'standard',
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
    kind: 'standard',
    swapOption: true,
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
    kind: 'standard',
    swapOption: true,
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
  {
    id: 'barbell_curl',
    name: 'Standing barbell curl',
    muscles: 'Biceps and forearms',
    primary: 'biceps',
    secondary: ['forearms'],
    equipment: 'barbell',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['curl', 'ez_bar_curl'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Stand with an underhand grip on the bar, hands about shoulder width apart. Let it hang in front of your thighs.',
          'Bend your elbows to curl the bar up while your upper arms stay beside your ribs. Lower to straight arms with your wrists in line with your forearms.',
        ],
      },
    ],
  },
  {
    id: 'ez_bar_curl',
    name: 'EZ-bar curl',
    muscles: 'Biceps and forearms',
    primary: 'biceps',
    secondary: ['forearms'],
    equipment: 'barbell',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['barbell_curl', 'alt_cablecurl'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Hold the angled grips of an EZ bar so your palms turn slightly inward. Stand with the bar at your thighs and elbows close to your body.',
          'Curl the bar up without leaning back. Lower through the same arc until your elbows straighten.',
        ],
      },
    ],
  },
  {
    id: 'incline_dumbbell_curl',
    name: 'Incline dumbbell curl',
    muscles: 'Biceps',
    primary: 'biceps',
    equipment: 'dumbbell',
    isolation: true,
    tracking: 'weight_reps',
    increment: 1,
    kind: 'standard',
    swaps: ['curl', 'alt_cablecurl'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Sit on an incline bench with your head and back supported. Let a dumbbell hang from each hand at your sides with palms facing forward.',
          'Curl the weights while your upper arms hang still. Lower slowly until your arms are long again, keeping your back against the pad.',
        ],
      },
    ],
  },
  {
    id: 'preacher_curl',
    name: 'EZ-bar preacher curl',
    muscles: 'Biceps and forearms',
    primary: 'biceps',
    secondary: ['forearms'],
    equipment: 'barbell',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['concentration_curl', 'alt_cablecurl'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Adjust the preacher seat until the tops of your upper arms rest securely on the pad. Take an underhand grip on the angled parts of the EZ bar.',
          'Curl toward your shoulders while keeping your upper arms in contact with the pad. Lower slowly to a comfortable stretch before the next curl.',
        ],
      },
    ],
  },
  {
    id: 'concentration_curl',
    name: 'Dumbbell concentration curl',
    muscles: 'Biceps',
    primary: 'biceps',
    equipment: 'dumbbell',
    isolation: true,
    tracking: 'weight_reps',
    increment: 1,
    kind: 'standard',
    perSide: true,
    swaps: ['curl', 'preacher_curl'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Sit on a bench with your feet apart. Hold a dumbbell in one hand and brace the back of that upper arm against your inner thigh.',
          'Turn your palm up, curl the weight toward your shoulder and lower slowly. Finish the reps on one side before switching arms.',
        ],
      },
    ],
  },
];
