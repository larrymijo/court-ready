import type { ExerciseDef } from '@/lib/types';

export const chestExercises: ExerciseDef[] = [
  {
    id: 'incline',
    name: 'Low-incline dumbbell press',
    muscles: 'Chest (especially the upper chest), front shoulders, triceps',
    primary: 'chest',
    secondary: ['shoulders', 'triceps'],
    equipment: 'dumbbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2,
    kind: 'standard',
    swaps: ['alt_inclinemachine', 'pushup'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Set the bench to 15–30° (one or two notches up). Steeper turns it into a shoulder exercise.',
          'Sit with the dumbbells on your thighs. Lie back and use your knees to help bring them up to your chest.',
          'Feet flat. Pull your shoulder blades back and down (“into your back pockets”) and keep them there. Small arch in your lower back, butt stays on the bench.',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'Palms face forward and slightly in (about 45°). Elbows about 45° from your body — never a “T”.',
          'Lower in 2–3 s until the dumbbells are beside your chest and you feel a stretch. Pause ½ second. No bounce.',
          'Press up and slightly in, ending above your upper chest. Don’t clank the dumbbells together.',
          'Breathe in on the way down, out as you press.',
        ],
      },
      {
        label: 'AVOID',
        items: [
          'Shoulders rolling forward or shrugging up at the top.',
          'Dropping the dumbbells out to the sides after the set. Bring them to your chest, then rock up to sitting.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: [
          'Lower the bench angle, turn your palms more toward each other, tuck your elbows a bit more, or stop 3–5 cm higher.',
          'Still pinching? Use an incline machine press.',
        ],
      },
    ],
  },
  {
    id: 'cablefly',
    name: 'Cable fly (chest height)',
    muscles: 'Chest',
    primary: 'chest',
    equipment: 'cable',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['alt_pecdeck'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Both pulleys at about shoulder height. Take the handles and one step forward, one foot in front of the other.',
          'Chest up, shoulder blades back. Keep a soft bend in your elbows that never changes.',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'Bring your hands together in a wide arc, like hugging a big tree. Meet in front of your lower chest and squeeze for 1 s.',
          'Open slowly (2–3 s) until you feel a stretch across your chest, with your hands about in line with your body.',
          'Pec deck works the same way. Set the seat so the handles are at mid-chest height.',
        ],
      },
      {
        label: 'AVOID',
        items: [
          'Bending and straightening your elbows — that turns it into a press.',
          'Letting your arms drift far behind your body, or your shoulders roll forward.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Make the stretch smaller: stop with your hands a little in front of your body.'],
      },
    ],
  },
  {
    id: 'flatpress',
    name: 'Flat dumbbell press (neutral grip)',
    muscles: 'Chest, front shoulders, triceps',
    primary: 'chest',
    secondary: ['shoulders', 'triceps'],
    equipment: 'dumbbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2,
    kind: 'standard',
    swaps: ['alt_machinepress', 'alt_floorpress', 'pushup'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Same set-up as the incline press, on a flat bench.',
          'Palms facing each other, or turned up to 45°. This is the most shoulder-friendly way to press.',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'Elbows 30–45° from your body. Lower in 2–3 s to chest level and pause.',
          'Press up and slightly together.',
          'Machine chest press: set the seat so the handles line up with mid-chest. Use neutral handles if it has them. Shoulder blades back against the pad.',
        ],
      },
      {
        label: 'AVOID',
        items: ['Elbows flaring out, or shoulders rolling forward at the top.'],
      },
      {
        label: 'IF IT HURTS',
        items: ['Use the machine, or a dumbbell floor press — lying on the floor limits how deep you go.'],
      },
    ],
  },
  {
    id: 'lowhighfly',
    name: 'Low-to-high cable fly',
    muscles: 'Upper chest — the part that usually looks underdeveloped',
    primary: 'chest',
    secondary: ['shoulders'],
    equipment: 'cable',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['alt_pecdeck'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Both pulleys at the lowest setting. Stand in the middle, one foot forward, handles by your sides, palms facing forward.',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'Sweep your hands up and in, like scooping, until they meet in front of your upper chest. Keep a soft elbow bend that never changes. Squeeze 1 s.',
          'Lower in 2–3 s until you feel a stretch in your upper chest, hands slightly behind your body.',
        ],
      },
      {
        label: 'AVOID',
        items: ['Shrugging, or turning it into a front raise. You should feel your chest, not just your shoulders.'],
      },
      {
        label: 'IF IT HURTS',
        items: ['Use a smaller range at the bottom, or the pec deck.'],
      },
    ],
  },
  {
    id: 'pushup',
    name: 'Push-up (with “plus”)',
    muscles: 'Chest, triceps, serratus (the muscle that holds your shoulder blade to your ribs)',
    primary: 'chest',
    secondary: ['triceps'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'standard',
    swaps: ['alt_machinepress'],
    sections: [
      {
        label: 'SETUP',
        items: ['Hands slightly wider than your shoulders. Body in a straight line: squeeze your glutes and abs.'],
      },
      {
        label: 'DO IT',
        items: [
          'Lower in 2 s until your chest is 2–3 cm from the floor. Elbows about 45° from your body.',
          'Push the floor away. At the top, push a little more so your upper back rounds slightly — that’s the “plus”.',
          'Easier: hands on a bench. Harder: hands on dumbbells (deeper), or a weight plate on your back.',
        ],
      },
      {
        label: 'AVOID',
        items: ['Hips sagging, head poking forward, elbows flaring into a “T”.'],
      },
      {
        label: 'WHY',
        items: [
          'Your shoulder blades can move freely, which makes push-ups one of the most shoulder-friendly presses there is.',
        ],
      },
    ],
  },
  {
    id: 'alt_inclinemachine',
    name: 'Incline machine press',
    muscles: 'Chest (upper chest), front shoulders, triceps',
    primary: 'chest',
    secondary: ['shoulders', 'triceps'],
    equipment: 'machine',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swapOption: true,
    swaps: ['incline'],
    sections: [
      {
        label: 'DO IT',
        items: [
          'Set the seat so the handles start level with your upper chest.',
          'Shoulder blades back against the pad, elbows about 45° from your body.',
          "Lower in 2–3 s to a comfortable stretch, then press smoothly. Don't slam into lockout.",
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Use a shorter range, or neutral handles if the machine has them.'],
      },
    ],
  },
  {
    id: 'alt_machinepress',
    name: 'Machine chest press',
    muscles: 'Chest, front shoulders, triceps',
    primary: 'chest',
    secondary: ['shoulders', 'triceps'],
    equipment: 'machine',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swapOption: true,
    swaps: ['pushup', 'flatpress'],
    sections: [
      {
        label: 'DO IT',
        items: [
          'Set the seat so the handles line up with mid-chest. Use neutral handles if it has them.',
          'Shoulder blades back against the pad, elbows 30–45° from your body.',
          'Lower in 2–3 s, pause in the stretch, press up smoothly.',
        ],
      },
    ],
  },
  {
    id: 'alt_floorpress',
    name: 'Dumbbell floor press',
    muscles: 'Chest, triceps',
    primary: 'chest',
    secondary: ['triceps'],
    equipment: 'dumbbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2,
    kind: 'standard',
    swapOption: true,
    swaps: ['flatpress'],
    sections: [
      {
        label: 'DO IT',
        items: [
          'Lie on the floor, knees bent, dumbbells above your chest, palms facing each other.',
          'Lower until your upper arms touch the floor, pause, then press.',
          'The floor limits how deep you go, which is easier on a sore shoulder.',
        ],
      },
    ],
  },
  {
    id: 'alt_pecdeck',
    name: 'Pec deck',
    muscles: 'Chest',
    primary: 'chest',
    equipment: 'machine',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swapOption: true,
    swaps: ['cablefly'],
    sections: [
      {
        label: 'DO IT',
        items: [
          'Set the seat so the handles are at mid-chest height.',
          'Bring the handles together in a wide arc with a soft elbow bend that never changes. Squeeze 1 s.',
          'Open slowly (2–3 s) until you feel a stretch, hands about in line with your body.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Make the stretch smaller: stop with your hands a little in front of your body.'],
      },
    ],
  },
  {
    id: 'benchpress',
    name: 'Barbell bench press',
    muscles: 'Chest, front shoulders, triceps',
    primary: 'chest',
    secondary: ['shoulders', 'triceps'],
    equipment: 'barbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['flatpress', 'alt_machinepress'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Lie with your eyes under the bar. Feet flat on the floor, shoulder blades pulled back and down, small arch in your lower back, butt on the bench.',
          'Grip a little wider than your shoulders, wrists straight over your forearms. Unrack with straight arms.',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'Lower the bar in 2–3 s to the lower half of your chest, elbows about 45° from your body.',
          'Pause for a moment, then press up and slightly back toward your eyes.',
          'Breathe in on the way down, out as you press.',
        ],
      },
      {
        label: 'AVOID',
        items: [
          'Bouncing the bar off your chest, or lifting your butt off the bench.',
          'Elbows flaring out to a “T”, or shoulders rolling forward at the top.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: [
          'Take a slightly wider or narrower grip, tuck your elbows more, or stop 3–5 cm above your chest.',
          'Still pinching? Use dumbbells or a machine press instead.',
        ],
      },
    ],
    warning: 'Heavy sets need a spotter, or safety bars set just below where the bar touches your chest, so they catch it if a rep fails. With neither, stop well short of failure and leave the collars off so you can tip the plates off.',
  },
  {
    id: 's_chest',
    name: 'Chest stretch',
    muscles: 'Chest and front of the shoulders',
    primary: 'chest',
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
          'Stand in a doorway with your forearm on the frame, elbow at about shoulder height.',
          'Step through slowly until you feel a stretch across your chest. Keep your shoulder down.',
          'Hold, then switch arms.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Pinching at the front of the shoulder: lower your elbow.'],
      },
    ],
  },
  {
    id: 'incline_barbell_bench_press',
    name: 'Incline barbell bench press',
    muscles: 'Upper chest, front shoulders, triceps',
    primary: 'chest',
    secondary: ['shoulders', 'triceps'],
    equipment: 'barbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['incline', 'alt_inclinemachine'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Set a bench to a low incline inside the rack. Plant your feet and take a grip that keeps your wrists over your elbows at the bottom.',
          'Unrack the bar over your shoulders. Bring it down to your upper chest with your shoulder blades against the bench, then press back up.',
        ],
      },
    ],
  },
  {
    id: 'decline_barbell_bench_press',
    name: 'Decline barbell bench press',
    muscles: 'Chest, front shoulders, triceps',
    primary: 'chest',
    secondary: ['shoulders', 'triceps'],
    equipment: 'barbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['benchpress', 'alt_machinepress'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Use a decline bench with leg pads and have a spotter help with the handoff. Hook your legs under the pads before taking the bar.',
          'Hold the bar over your shoulders, lower it toward the bottom of your chest, then press up. Keep the bar stacked over your wrists and your upper back on the pad.',
        ],
      },
    ],
  },
  {
    id: 'dumbbell_bench_press',
    name: 'Dumbbell bench press (overhand grip)',
    muscles: 'Chest, front shoulders, triceps',
    primary: 'chest',
    secondary: ['shoulders', 'triceps'],
    equipment: 'dumbbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2,
    kind: 'standard',
    swaps: ['flatpress', 'alt_machinepress'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Lie on a flat bench with your feet planted. Hold one dumbbell above each shoulder with palms facing your feet.',
          'Lower the weights to either side of your chest with your forearms upright. Press them back up and finish with your wrists over your shoulders.',
        ],
      },
    ],
  },
  {
    id: 'dumbbell_fly',
    name: 'Flat dumbbell fly',
    muscles: 'Chest and front shoulders',
    primary: 'chest',
    secondary: ['shoulders'],
    equipment: 'dumbbell',
    isolation: true,
    tracking: 'weight_reps',
    increment: 1,
    kind: 'standard',
    swaps: ['cablefly', 'alt_pecdeck'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Lie on a flat bench with light dumbbells above your chest, palms facing each other. Soften both elbows.',
          'Keeping that elbow angle, open your arms in a wide arc to a comfortable chest stretch. Bring the weights together along the same arc.',
        ],
      },
    ],
  },
  {
    id: 'incline_dumbbell_fly',
    name: 'Incline dumbbell fly',
    muscles: 'Upper chest and front shoulders',
    primary: 'chest',
    secondary: ['shoulders'],
    equipment: 'dumbbell',
    isolation: true,
    tracking: 'weight_reps',
    increment: 1,
    kind: 'standard',
    swaps: ['lowhighfly', 'dumbbell_fly'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Set the bench to a low incline. Rest your head on the pad and hold the dumbbells over your upper chest with palms facing in.',
          'Keep a slight bend in your elbows as you open your arms to the sides. Reverse the arc when you feel a gentle stretch across your chest.',
        ],
      },
    ],
  },
  {
    id: 'chest_dip',
    name: 'Chest dip (forward lean)',
    muscles: 'Chest, triceps, front shoulders',
    primary: 'chest',
    secondary: ['triceps', 'shoulders'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['alt_machinepress', 'pushup'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Support yourself on parallel bars. Lean your chest slightly forward and keep that angle as you bend your elbows.',
          'Lower only as far as your shoulders feel comfortable, then press into both bars to rise. Use the assist machine if you cannot control the descent.',
        ],
      },
    ],
  },
  {
    id: 'smith_bench_press',
    name: 'Smith machine bench press',
    muscles: 'Chest, front shoulders, triceps',
    primary: 'chest',
    secondary: ['shoulders', 'triceps'],
    equipment: 'machine',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['benchpress', 'alt_machinepress'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Center a flat bench under the Smith bar. With the empty bar, check that the path reaches your chest with upright forearms and set the safety stops.',
          'Plant your feet and release the hooks. Lower the bar with control, press up along the rails, then rehook the bar at the end of the set.',
        ],
      },
    ],
  },
  {
    id: 'dumbbell_pullover',
    name: 'Dumbbell pullover',
    muscles: 'Chest and lats',
    primary: 'chest',
    secondary: ['back'],
    equipment: 'dumbbell',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2,
    kind: 'standard',
    swaps: ['straight_arm_pulldown', 'cablefly'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Lie along a flat bench with both feet planted. Hold one fixed-head dumbbell securely in both hands over your chest.',
          'Keep your ribs down and your elbows slightly bent. Take the weight back over your head only as far as your upper back stays on the bench, then bring it back over your chest.',
        ],
      },
    ],
  },
];
