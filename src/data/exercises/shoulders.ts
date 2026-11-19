import type { ExerciseDef } from '@/lib/types';

export const shouldersExercises: ExerciseDef[] = [
  {
    id: 'lateral',
    name: 'Lateral raise (cable or dumbbell)',
    muscles: 'Side shoulders — the part that makes your shoulders look wide',
    primary: 'shoulders',
    equipment: 'dumbbell',
    isolation: true,
    tracking: 'weight_reps',
    increment: 1,
    kind: 'main',
    swaps: [],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Stand tall with a slight forward lean, dumbbells at your sides. Cable version: low pulley, handle across the front of your body.',
          'Go light. 15 clean reps beat 8 swinging reps.',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'Raise your arms out to the sides and a little forward (about 30° in front of your body). Elbows slightly bent; lead with the elbows.',
          'Stop at shoulder height. Keep your thumbs level or slightly up.',
          'Lower in 2–3 s.',
        ],
      },
      {
        label: 'AVOID',
        items: [
          'Swinging, shrugging, or raising above shoulder height.',
          'Turning your thumbs down (“pouring a jug”) — it pinches the shoulder.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: [
          'Stop 10–15 cm below shoulder height — it still works well. Cables are usually more comfortable than dumbbells.',
        ],
      },
    ],
  },
  {
    id: 'facepull',
    name: 'Face pull',
    muscles: 'Rear shoulders, rotator cuff, upper back — your shoulder-health exercise',
    primary: 'shoulders',
    secondary: ['back'],
    equipment: 'cable',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'main',
    swaps: ['alt_bandfacepull', 'revpec'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Rope at about forehead height. Hold the ends with your thumbs pointing toward you. Step back, one foot in front.',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'Pull the rope toward your eyes and pull the ends apart. Elbows stay around shoulder height.',
          'Finish with your hands beside your ears and your knuckles pointing back, like a “double biceps” pose. Hold 1 s.',
          'Return slowly.',
        ],
      },
      {
        label: 'AVOID',
        items: [
          'Leaning back to move a heavy weight. This is a light, controlled exercise.',
          'Pulling to your chin or neck without the turn at the end.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Lower the rope to chest height and use less weight.'],
      },
    ],
  },
  {
    id: 'revpec',
    name: 'Reverse pec deck',
    muscles: 'Rear shoulders, upper back',
    primary: 'shoulders',
    secondary: ['back'],
    equipment: 'machine',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'main',
    swaps: ['alt_reardeltfly', 'c_pullapart'],
    sections: [
      {
        label: 'SETUP',
        items: ['Sit facing the pad with the handles at shoulder height. Palms facing each other or down.'],
      },
      {
        label: 'DO IT',
        items: [
          'Sweep your arms out and back in a wide arc until they’re in line with your body.',
          'Think “reach your hands out wide”, not “squeeze your shoulder blades”.',
          'Return in 2 s.',
        ],
      },
      {
        label: 'AVOID',
        items: ['Going heavy and turning it into a row.'],
      },
      {
        label: 'OPTIONS',
        items: ['No machine: cable rear-delt fly, or a light bent-over dumbbell reverse fly.'],
      },
    ],
  },
  {
    id: 'c_er',
    name: 'Band external rotation',
    muscles: 'Rotator cuff',
    primary: 'shoulders',
    equipment: 'band',
    isolation: true,
    tracking: 'reps',
    increment: 0,
    kind: 'care',
    dose: '15 per side',
    perSide: true,
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Band at elbow height. Stand side-on, with a rolled towel between your elbow and your side, elbow bent 90°.',
          'Rotate your forearm outward, away from your belly, as far as is comfortable. 2 s out, 3 s back.',
          'Your elbow stays on the towel. You should feel the back of the shoulder working — never pinching.',
        ],
      },
    ],
  },
  {
    id: 'c_pullapart',
    name: 'Band pull-apart',
    muscles: 'Rear shoulders, upper back',
    primary: 'shoulders',
    equipment: 'band',
    isolation: true,
    tracking: 'reps',
    increment: 0,
    kind: 'care',
    dose: '15',
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Hold a light band in front of you at shoulder height, arms straight, hands shoulder-width apart.',
          'Pull the band apart until it touches your chest, squeezing your shoulder blades together. Return in 2 s.',
        ],
      },
    ],
  },
  {
    id: 'c_scappush',
    name: 'Scapular push-up',
    muscles: 'Serratus — keeps the shoulder blade stable',
    primary: 'shoulders',
    equipment: 'bodyweight',
    isolation: true,
    tracking: 'reps',
    increment: 0,
    kind: 'care',
    dose: '10',
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Push-up position, arms straight. Let your chest sink between your shoulder blades (they move together).',
          'Then push the floor away to spread them as far apart as you can. Your arms never bend.',
          'Easier: on your knees, or against a wall.',
        ],
      },
    ],
  },
  {
    id: 'c_wallslide',
    name: 'Wall slide',
    muscles: 'Lower traps, serratus',
    primary: 'shoulders',
    equipment: 'bodyweight',
    isolation: true,
    tracking: 'reps',
    increment: 0,
    kind: 'care',
    dose: '8–10',
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Forearms on a wall, elbows at shoulder height, little fingers toward the wall.',
          'Press gently into the wall and slide your arms up into a “Y” as far as is comfortable, without shrugging.',
          'At the top, lift your hands 1 cm off the wall for a second. Slide back down.',
        ],
      },
    ],
  },
  {
    id: 'c_proney',
    name: 'Prone Y raise',
    muscles: 'Lower traps',
    primary: 'shoulders',
    equipment: 'bodyweight',
    isolation: true,
    tracking: 'reps',
    increment: 0,
    kind: 'care',
    dose: '10',
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Lie face down on a bench set to 30–45°, arms hanging, thumbs up.',
          'Raise your arms in a “Y” (slightly wider than your head) until they’re in line with your body. Hold 2 s.',
          'Very light: 0–2 kg. Stop below any pinch.',
        ],
      },
    ],
  },
  {
    id: 'alt_bandfacepull',
    name: 'Band face pull',
    muscles: 'Rear shoulders, rotator cuff, upper back',
    primary: 'shoulders',
    secondary: ['back'],
    equipment: 'band',
    isolation: true,
    tracking: 'reps',
    increment: 0,
    kind: 'alternative',
    swaps: ['facepull'],
    sections: [
      {
        label: 'DO IT',
        items: [
          'Anchor a band at forehead height and hold the ends, thumbs toward you.',
          'Pull toward your eyes and pull your hands apart, finishing in a “double biceps” pose. Hold 1 s.',
          'Slow and controlled on the way back.',
        ],
      },
    ],
  },
  {
    id: 'alt_reardeltfly',
    name: 'Cable rear-delt fly',
    muscles: 'Rear shoulders, upper back',
    primary: 'shoulders',
    secondary: ['back'],
    equipment: 'cable',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'alternative',
    swaps: ['revpec'],
    sections: [
      {
        label: 'DO IT',
        items: [
          'Cables crossed at shoulder height, arms straight out in front of you.',
          "Sweep your arms out and back in a wide arc until they're in line with your body. Think “reach wide”, not “squeeze”.",
          'Return in 2 s.',
        ],
      },
    ],
  },
  {
    id: 'shoulderpress',
    name: 'Dumbbell shoulder press',
    muscles: 'Shoulders (mostly the front), triceps',
    primary: 'shoulders',
    secondary: ['triceps'],
    equipment: 'dumbbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2,
    kind: 'main',
    swaps: ['alt_inclinemachine'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Sit on a bench with the back set to 80–90°. Rest the dumbbells on your thighs, then bring them up to shoulder height.',
          'Feet flat, ribs down, shoulder blades against the pad.',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'Start with your palms facing forward or slightly in, elbows a little in front of your body.',
          'Press up until your arms are almost straight, with the dumbbells above your shoulders.',
          'Lower in 2–3 s until your upper arms are about level with the floor.',
        ],
      },
      {
        label: 'AVOID',
        items: [
          'Arching your lower back to push the weight up.',
          'Shrugging your shoulders up toward your ears.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: [
          'Turn your palms toward each other, lower the bench a notch, or stop a little higher.',
          'Still pinching? Use the incline machine press instead, or leave the press out for today.',
        ],
      },
    ],
  },
  {
    id: 'd_armcircles',
    name: 'Arm circles',
    muscles: 'Shoulders — loosens the shoulder joint',
    primary: 'shoulders',
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'drill',
    dose: '10 each way',
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Stand tall with your arms out to the sides.',
          'Make small circles, then bigger ones, 10 forward and 10 backward.',
          'Keep your shoulders down and relaxed.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Pinching in the shoulder: keep the circles small and below shoulder height.'],
      },
    ],
  },
];
