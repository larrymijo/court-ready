import type { ExerciseDef } from '@/lib/types';

export const hamstringsExercises: ExerciseDef[] = [
  {
    id: 'rdl',
    name: 'Dumbbell Romanian deadlift',
    muscles: 'Hamstrings, glutes, lower back',
    primary: 'hamstrings',
    secondary: ['glutes'],
    equipment: 'dumbbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2,
    kind: 'standard',
    swaps: ['alt_backext'],
    sections: [
      {
        label: 'SETUP',
        items: ['Stand tall with dumbbells in front of your thighs, feet hip-width apart, knees slightly bent.'],
      },
      {
        label: 'DO IT',
        items: [
          'Push your hips back, like closing a car door with your butt. Keep your back flat and the dumbbells close to your legs.',
          'Lower in 3 s until you feel a strong stretch in your hamstrings — usually around mid-shin.',
          'Drive your hips forward to stand tall and squeeze your glutes. Don’t lean back at the top.',
        ],
      },
      {
        label: 'AVOID',
        items: [
          'Rounding your lower back to reach lower.',
          'Bending your knees more and more until it becomes a squat.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Lower back: shorten the range. Grip or elbows: use straps.'],
      },
    ],
  },
  {
    id: 'legcurl',
    name: 'Seated leg curl',
    muscles: 'Hamstrings',
    primary: 'hamstrings',
    equipment: 'machine',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['alt_lyinglegcurl'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Line your knees up with the machine’s pivot point. Pad just above your heels, thigh pad tight.',
          'Seated beats lying: it trains the hamstrings in a longer stretch, which builds more muscle.',
        ],
      },
      {
        label: 'DO IT',
        items: ['Curl your heels down and back. Squeeze 1 s.', 'Return in 3 s until your legs are almost straight.'],
      },
      {
        label: 'AVOID',
        items: ['Lifting your hips or jerking the weight.'],
      },
      {
        label: 'OPTIONS',
        items: ['No seated machine: lying leg curl, keeping your hips pressed into the pad.'],
      },
    ],
  },
  {
    id: 'alt_backext',
    name: '45° back extension',
    muscles: 'Hamstrings, glutes, lower back',
    primary: 'hamstrings',
    secondary: ['glutes'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swapOption: true,
    swaps: ['rdl'],
    sections: [
      {
        label: 'DO IT',
        items: [
          'Hips on the pad, feet locked in.',
          'Hinge down with a flat back until you feel a hamstring stretch.',
          'Squeeze your glutes to come up to a straight line, without arching back. Hold a plate for load.',
        ],
      },
    ],
  },
  {
    id: 'alt_lyinglegcurl',
    name: 'Lying leg curl',
    muscles: 'Hamstrings',
    primary: 'hamstrings',
    equipment: 'machine',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swapOption: true,
    swaps: ['legcurl'],
    sections: [
      {
        label: 'DO IT',
        items: [
          'Knees just past the edge of the pad, hips pressed into it.',
          'Curl your heels up, squeeze 1 s, and return in 3 s.',
        ],
      },
    ],
  },
  {
    id: 'barbellrdl',
    name: 'Barbell Romanian deadlift',
    muscles: 'Hamstrings, glutes, lower back',
    primary: 'hamstrings',
    secondary: ['glutes'],
    equipment: 'barbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['rdl', 'alt_backext'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Stand tall holding the bar in front of your thighs, hands just outside your legs. Feet hip-width apart, knees slightly bent.',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'Push your hips back, like closing a car door with your butt. Keep your back flat and the bar close to your legs.',
          'Lower in 3 s until you feel a strong stretch in your hamstrings — usually just below the knees.',
          'Drive your hips forward to stand tall and squeeze your glutes. Don’t lean back at the top.',
        ],
      },
      {
        label: 'AVOID',
        items: [
          'Rounding your lower back to reach lower.',
          'Bending your knees more and more until it becomes a squat.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Lower back: shorten the range, or use dumbbells. Grip: use straps.'],
      },
    ],
    warning: 'Stop the set if your lower back rounds. Lower the bar to the floor between sets instead of dropping it.',
  },
  {
    id: 's_hamstring',
    name: 'Hamstring stretch',
    muscles: 'Back of the thigh',
    primary: 'hamstrings',
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'stretch',
    dose: '30 s per leg',
    perSide: true,
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Sit on the floor with one leg straight and the other foot against the inner thigh. Or stand and rest one heel on a low step.',
          'Keeping your back long, lean forward from the hips until you feel a stretch behind the thigh.',
          'Hold, then switch legs.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Pain behind the knee or a pulling at the sit bone: ease off.'],
      },
    ],
  },
  {
    id: 'good_morning',
    name: 'Barbell good morning',
    muscles: 'Hamstrings, glutes and spinal erectors',
    primary: 'hamstrings',
    secondary: ['glutes', 'back'],
    equipment: 'barbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'standard',
    swaps: ['barbellrdl', 'alt_backext'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Rest a light bar across your upper back and stand with a small bend in your knees. Brace before each rep.',
          'Move your hips back and tip your torso forward as one unit. When you reach the end of your hip hinge, drive your hips forward to stand.',
        ],
      },
    ],
  },
  {
    id: 'glute_ham_raise',
    name: 'Glute-ham raise',
    muscles: 'Hamstrings and glutes',
    primary: 'hamstrings',
    secondary: ['glutes'],
    equipment: 'machine',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'standard',
    swaps: ['legcurl', 'alt_lyinglegcurl'],
    sections: [
      {
        label: 'HOW',
        items: [
          'Adjust the glute-ham developer so your feet are secure and your knees are supported by the pad. Start upright with your hips extended.',
          'Slowly extend your knees to lower your torso toward horizontal. Bend your knees to pull yourself upright, keeping your shoulders, hips and knees in line.',
        ],
      },
    ],
  },
];
