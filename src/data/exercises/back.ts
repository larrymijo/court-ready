import type { ExerciseDef } from '@/lib/types';

export const backExercises: ExerciseDef[] = [
  {
    id: 'csrow',
    name: 'Chest-supported dumbbell row',
    muscles: 'Upper back, lats, rear shoulders, biceps',
    primary: 'back',
    secondary: ['shoulders', 'biceps'],
    equipment: 'dumbbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2,
    kind: 'standard',
    swaps: ['alt_machinerow', 'alt_dbrow'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Bench at 30–45°. Lie face down with your chest on the pad and your chin just over the top. Feet on the floor.',
          'Let the dumbbells hang straight down, palms facing each other.',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'Pull your shoulder blades back first, then drive your elbows back toward your hips.',
          'Squeeze for 1 s at the top.',
          'Lower in 2 s and let your shoulder blades spread apart at the bottom for a full stretch.',
        ],
      },
      {
        label: 'AVOID',
        items: ['Lifting your chest off the pad to swing the weight up.', 'Shrugging up toward your ears.'],
      },
      {
        label: 'IF IT HURTS',
        items: [
          'Grip or elbow pain: use lifting straps and don’t squeeze the handles harder than you need to.',
          'Or use a machine row with neutral handles.',
        ],
      },
    ],
  },
  {
    id: 'pulldown',
    name: 'Neutral-grip lat pulldown',
    muscles: 'Lats, upper back, biceps',
    primary: 'back',
    secondary: ['biceps'],
    equipment: 'cable',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['alt_assistedpullup', 'pullup'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Use a V-handle or a bar with parallel handles (palms facing each other).',
          'Lock your thighs under the pad. Lean back a little (10–15°), chest up.',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'First pull your shoulders down, away from your ears. Then drive your elbows down to your sides.',
          'Pull until the handle reaches your upper chest. Squeeze 1 s.',
          'Let it rise in 2–3 s until your arms are straight and you feel your lats stretch.',
        ],
      },
      {
        label: 'AVOID',
        items: ['Swinging your body to move the weight.', 'Pulling behind your neck — never.'],
      },
      {
        label: 'IF IT HURTS',
        items: ['Try wider neutral handles, or a one-arm cable pulldown so your shoulder can find its own path.'],
      },
    ],
  },
  {
    id: 'pullup',
    name: 'Neutral-grip pull-up',
    muscles: 'Lats, upper back, biceps',
    primary: 'back',
    secondary: ['biceps'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['pulldown', 'alt_assistedpullup'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Parallel handles, palms facing each other. Hang with straight arms and your shoulders slightly pulled down — not totally loose.',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'Pull your shoulder blades down, then drive your elbows down to your ribs.',
          'Pull until your chin is over the handles.',
          'Lower in 2–3 s to a full hang.',
        ],
      },
      {
        label: 'AVOID',
        items: ['Kicking, swinging or half reps.'],
      },
      {
        label: 'OPTIONS',
        items: [
          'Can’t do 6 clean reps? Use the assisted machine or a band — or do lat pulldowns.',
          'More than 10 easy reps? Add weight with a dip belt or a dumbbell between your feet.',
          'If hanging hurts your shoulder, do lat pulldowns instead.',
        ],
      },
    ],
  },
  {
    id: 'cablerow',
    name: 'Seated cable row',
    muscles: 'Mid back, lats, rear shoulders, biceps',
    primary: 'back',
    secondary: ['biceps'],
    equipment: 'cable',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['alt_machinerow', 'alt_dbrow'],
    sections: [
      {
        label: 'SETUP',
        items: ['Close V-handle (palms facing each other). Sit tall, knees slightly bent, chest up.'],
      },
      {
        label: 'DO IT',
        items: [
          'Row the handle to your belly button with your elbows close to your body. Squeeze your shoulder blades together for 1 s.',
          'Let your arms go straight and your shoulder blades spread forward. A small forward lean is fine.',
        ],
      },
      {
        label: 'AVOID',
        items: ['Rocking back and forth to move a heavy weight.', 'Shrugging your shoulders up.'],
      },
      {
        label: 'IF IT HURTS',
        items: ['Use straps, or swap to a machine row with a chest pad.'],
      },
    ],
  },
  {
    id: 'alt_machinerow',
    name: 'Machine row',
    muscles: 'Upper back, lats, rear shoulders, biceps',
    primary: 'back',
    secondary: ['shoulders', 'biceps'],
    equipment: 'machine',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swapOption: true,
    swaps: ['csrow', 'cablerow'],
    sections: [
      {
        label: 'DO IT',
        items: [
          'Chest against the pad, neutral handles (palms facing each other).',
          'Pull your shoulder blades back first, then drive your elbows back. Squeeze 1 s.',
          'Let your shoulder blades spread forward at the end of every rep.',
        ],
      },
    ],
  },
  {
    id: 'alt_dbrow',
    name: 'One-arm dumbbell row',
    muscles: 'Lats, upper back, biceps',
    primary: 'back',
    secondary: ['biceps'],
    equipment: 'dumbbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2,
    kind: 'standard',
    swapOption: true,
    swaps: ['csrow'],
    sections: [
      {
        label: 'DO IT',
        items: [
          'One hand and the same-side knee on a bench, back flat.',
          'Row the dumbbell toward your hip with your elbow close to your body. Squeeze 1 s.',
          'Lower in 2 s to a full stretch. Use straps if your grip or elbow complains.',
        ],
      },
    ],
  },
  {
    id: 'alt_assistedpullup',
    name: 'Assisted pull-up',
    muscles: 'Lats, upper back, biceps',
    primary: 'back',
    secondary: ['biceps'],
    equipment: 'machine',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swapOption: true,
    swaps: ['pullup', 'pulldown'],
    sections: [
      {
        label: 'DO IT',
        items: [
          'Use the assisted machine or a band, palms facing each other.',
          'Same technique as the neutral-grip pull-up: full hang, shoulders down first, chin over the handles.',
          'Log the assistance as the weight, and use less of it over time.',
        ],
      },
    ],
  },
  {
    id: 'latpulldown',
    name: 'Lat pulldown',
    muscles: 'Lats, upper back, biceps',
    primary: 'back',
    secondary: ['biceps'],
    equipment: 'cable',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['pulldown', 'alt_assistedpullup', 'pullup'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Hold the bar a little wider than your shoulders. Sit with your thighs snug under the pads.',
          'Lean back slightly and lift your chest.',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'Pull your shoulders down first, then bring your elbows down toward your sides.',
          'Pull the bar to your upper chest and squeeze for 1 s.',
          'Let the bar back up in 2–3 s until your arms are straight and you feel a stretch in your lats.',
        ],
      },
      {
        label: 'AVOID',
        items: [
          'Swinging back to yank the bar down.',
          'Pulling the bar behind your neck.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: [
          'Elbow or grip pain: use straps, or try the neutral-grip pulldown.',
          'Shoulder pinching: don’t reach all the way up at the top.',
        ],
      },
    ],
  },
  {
    id: 's_lat',
    name: 'Lat stretch',
    muscles: 'Side of the back, under the arm',
    primary: 'back',
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
          'Hold a post or a rack with one hand at about head height. Sit your hips back and let your chest drop.',
          'Feel the stretch down the side of your back and under your arm. Hold, then switch sides.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Pinching in the shoulder: raise your hand a little.'],
      },
    ],
  },
  {
    id: 'overhand_pull_up',
    name: 'Pull-up (overhand grip)',
    muscles: 'Lats, upper back, biceps',
    primary: 'back',
    secondary: ['biceps'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['pullup', 'latpulldown'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Hold the bar with palms facing away and hands a little wider than your shoulders. Start with straight arms and quiet legs.',
          'Draw your elbows down toward your sides and lift your chin past the bar without reaching your neck forward. Lower until your arms straighten again.',
        ],
      },
    ],
  },
  {
    id: 'chin_up',
    name: 'Chin-up (underhand grip)',
    muscles: 'Lats and biceps',
    primary: 'back',
    secondary: ['biceps'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['pullup', 'close_grip_lat_pulldown'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Hang from a straight bar with palms facing you and hands about shoulder-width apart. Let your elbows straighten.',
          'Pull your elbows toward your ribs to raise your chin past the bar. Pause, then lower yourself with your legs still.',
        ],
      },
    ],
  },
  {
    id: 'close_grip_lat_pulldown',
    name: 'Close-grip lat pulldown (overhand)',
    muscles: 'Lats and biceps',
    primary: 'back',
    secondary: ['biceps'],
    equipment: 'cable',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['pulldown', 'latpulldown'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Sit securely under the thigh pad. Take the straight bar with palms forward and hands just inside shoulder width. Lean back slightly to give the bar a clear path.',
          'Bring your elbows down close to your sides until the bar approaches your upper chest. Return it slowly until your arms straighten.',
        ],
      },
    ],
  },
  {
    id: 'barbell_row',
    name: 'Bent-over barbell row',
    muscles: 'Lats, upper back, rear shoulders and biceps',
    primary: 'back',
    secondary: ['shoulders', 'biceps'],
    equipment: 'barbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['csrow', 'cablerow'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Stand with the bar in an overhand grip. Soften your knees and hinge at the hips until the bar hangs under your shoulders.',
          'Keep your torso angle steady as you row the bar toward your lower ribs. Lower it to straight arms before the next rep.',
        ],
      },
    ],
  },
  {
    id: 't_bar_row',
    name: 'T-bar row',
    muscles: 'Lats, upper back and biceps',
    primary: 'back',
    secondary: ['biceps'],
    equipment: 'barbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['cablerow', 'csrow'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Secure the unloaded end of a barbell in a landmine and fit a row handle behind the plates. Straddle the bar, hinge at the hips and take the handle.',
          'Hold your back steady and bring the handle toward your lower ribs. Lower the plates smoothly until your arms straighten.',
        ],
      },
    ],
  },
  {
    id: 'straight_arm_pulldown',
    name: 'Straight-arm cable pulldown',
    muscles: 'Lats',
    primary: 'back',
    equipment: 'cable',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['dumbbell_pullover', 'latpulldown'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Face a high pulley with a straight bar. Step back, hinge slightly and reach forward with a small bend in both elbows.',
          'Keep that bend as you sweep the bar toward your thighs. Let it travel up and forward again while your torso stays still.',
        ],
      },
    ],
  },
  {
    id: 'inverted_row',
    name: 'Inverted row',
    muscles: 'Upper back, lats, biceps and core',
    primary: 'back',
    secondary: ['biceps', 'core'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'standard',
    swaps: ['cablerow', 'csrow'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Use a fixed horizontal bar or a securely locked Smith bar. Lie beneath it, grip slightly wider than your shoulders and plant your heels.',
          'Hold a straight line from shoulders to heels and pull your chest toward the bar. Lower to straight arms. Bend your knees or raise the bar to make the row easier.',
        ],
      },
    ],
  },
  {
    id: 'conventional_deadlift',
    name: 'Conventional barbell deadlift',
    muscles: 'Back extensors, glutes, hamstrings and quads',
    primary: 'back',
    secondary: ['glutes', 'hamstrings', 'quads'],
    equipment: 'barbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['barbellrdl', 'rack_pull'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Stand with the bar over midfoot. Hinge and bend your knees to grip just outside your shins. Brace your trunk and take the slack out of the bar.',
          'Push the floor away and keep the bar close as you stand tall. Move your hips back to guide the bar past your knees, then bend your knees to return it to the floor.',
        ],
      },
    ],
  },
  {
    id: 'rack_pull',
    name: 'Barbell rack pull',
    muscles: 'Back extensors, upper back, glutes and hamstrings',
    primary: 'back',
    secondary: ['glutes', 'hamstrings'],
    equipment: 'barbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['conventional_deadlift', 'barbellrdl'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Set both rack safeties to the same height just below your knees. Stand close to the bar, hinge at your hips and grip outside your legs.',
          'Brace and stand tall with the bar against your thighs. Hinge back and settle the bar on both safeties before starting the next rep.',
        ],
      },
    ],
  },
  {
    id: 'barbell_shrug',
    name: 'Barbell shrug',
    muscles: 'Upper trapezius',
    primary: 'back',
    equipment: 'barbell',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['dumbbell_shrug'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Stand tall with a barbell in front of your thighs. Hold it just outside your legs with palms facing you and let your arms hang straight.',
          'Raise your shoulders toward your ears, pause, then lower them along the same path. Keep the rest of your body still.',
        ],
      },
    ],
  },
  {
    id: 'dumbbell_shrug',
    name: 'Dumbbell shrug',
    muscles: 'Upper trapezius',
    primary: 'back',
    equipment: 'dumbbell',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2,
    kind: 'standard',
    swaps: ['barbell_shrug'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Stand with a dumbbell at each side and palms facing your legs. Let your arms hang and look straight ahead.',
          'Lift both shoulders straight up while the weights hang beside you. Pause at the top, then lower fully before the next rep.',
        ],
      },
    ],
  },
];
