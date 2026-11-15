// Generated from the "Court-Ready Muscle" training guide.
// Technique text matches the guide; edit here to change what the app shows.
import type { ExerciseDef } from '@/lib/types';

export const EXERCISES: ExerciseDef[] = [
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
    kind: 'main',
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
    id: 'csrow',
    name: 'Chest-supported dumbbell row',
    muscles: 'Upper back, lats, rear shoulders, biceps',
    primary: 'back',
    secondary: ['shoulders', 'biceps'],
    equipment: 'dumbbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2,
    kind: 'main',
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
    id: 'cablefly',
    name: 'Cable fly (chest height)',
    muscles: 'Chest',
    primary: 'chest',
    equipment: 'cable',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'main',
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
    id: 'pulldown',
    name: 'Neutral-grip lat pulldown',
    muscles: 'Lats, upper back, biceps',
    primary: 'back',
    secondary: ['biceps'],
    equipment: 'cable',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'main',
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
    id: 'pushdown',
    name: 'Rope pushdown',
    muscles: 'Triceps',
    primary: 'triceps',
    equipment: 'cable',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'main',
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
    id: 'legpress',
    name: 'Leg press or hack squat',
    muscles: 'Quads, glutes',
    primary: 'quads',
    secondary: ['glutes'],
    equipment: 'machine',
    isolation: false,
    tracking: 'weight_reps',
    increment: 5,
    kind: 'main',
    swaps: ['alt_gobletsquat'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Leg press: back and hips flat on the pad. Feet shoulder-width in the middle of the platform, toes slightly out.',
          'Hack squat: shoulders under the pads, feet in the middle of the platform.',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'Take a big breath into your belly and brace before each rep.',
          'Lower in 2–3 s with your knees moving in line with your toes. Go as deep as you can while your hips and lower back stay on the pad — usually knees at 90° or deeper.',
          'Push through your whole foot. Stop just before your knees lock.',
        ],
      },
      {
        label: 'AVOID',
        items: [
          'Hips curling off the pad at the bottom — that rounds your lower back.',
          'Knees caving inward, or bouncing off the bottom.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: [
          'Knees: put your feet a little higher on the platform and use a slightly shorter range.',
          'No machine? Heel-elevated goblet squat: hold a dumbbell at your chest, heels on a small plate.',
        ],
      },
      {
        label: 'WHY NOT BARBELL SQUATS?',
        items: [
          'Holding a bar on your back forces sore shoulders and elbows into a tight position. Machines let you load your legs hard without that.',
        ],
      },
    ],
  },
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
    kind: 'main',
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
    id: 'bss',
    name: 'Bulgarian split squat',
    muscles: 'Quads, glutes — one leg at a time, great for jumping',
    primary: 'quads',
    secondary: ['glutes'],
    equipment: 'dumbbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2,
    kind: 'main',
    perSide: true,
    swaps: ['alt_reverselunge'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Put the top of your back foot on a bench. Front foot a big step forward.',
          'Dumbbells at your sides. Learn it with bodyweight first, holding onto something for balance.',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'Drop your back knee straight down until it’s just above the floor.',
          'Push up through the middle of your front foot.',
          'Do all reps on your weaker leg first, then the same number on the other leg.',
          'Upright body = more quads. Small forward lean = more glutes.',
        ],
      },
      {
        label: 'AVOID',
        items: ['Front knee caving inward.', 'Pushing off with the back leg — it’s only there for balance.'],
      },
      {
        label: 'IF IT HURTS',
        items: ['Knee: do reverse lunges instead (step back, then return).'],
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
    kind: 'main',
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
    id: 'calf',
    name: 'Standing calf raise',
    muscles: 'Calves and Achilles tendons — they take a hit from every jump and landing',
    primary: 'calves',
    equipment: 'machine',
    isolation: true,
    tracking: 'weight_reps',
    increment: 5,
    kind: 'main',
    swaps: ['alt_lpcalf'],
    sections: [
      {
        label: 'SETUP',
        items: ['Balls of your feet on the edge of a step or the machine platform. Knees straight but not locked.'],
      },
      {
        label: 'DO IT',
        items: [
          'Lower your heels as far as you can. Pause 2 s at the bottom — no bounce.',
          'Rise as high as you can onto your big toes. Squeeze 1 s.',
        ],
      },
      {
        label: 'AVOID',
        items: ['Fast, bouncy reps — the tendon does the work instead of the muscle.'],
      },
      {
        label: 'OPTIONS',
        items: ['No machine: one leg at a time on a step, holding a dumbbell.'],
      },
    ],
  },
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
    id: 'flatpress',
    name: 'Flat dumbbell press (neutral grip)',
    muscles: 'Chest, front shoulders, triceps',
    primary: 'chest',
    secondary: ['shoulders', 'triceps'],
    equipment: 'dumbbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2,
    kind: 'main',
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
    id: 'pullup',
    name: 'Neutral-grip pull-up',
    muscles: 'Lats, upper back, biceps',
    primary: 'back',
    secondary: ['biceps'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'main',
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
    kind: 'main',
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
    id: 'lowhighfly',
    name: 'Low-to-high cable fly',
    muscles: 'Upper chest — the part that usually looks underdeveloped',
    primary: 'chest',
    secondary: ['shoulders'],
    equipment: 'cable',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'main',
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
    kind: 'main',
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
    id: 'ohext',
    name: 'Overhead cable triceps extension',
    muscles: 'Triceps — especially the long head, a big part of the back of your arm',
    primary: 'triceps',
    equipment: 'cable',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'main',
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
    id: 'c_crossbody',
    name: 'Cross-body stretch',
    muscles: 'Back of the shoulder (often stiff in hitters)',
    primary: 'mobility',
    equipment: 'bodyweight',
    isolation: true,
    tracking: 'reps',
    increment: 0,
    kind: 'care',
    dose: '2–3 × 30 s',
    perSide: true,
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Bring your hitting arm across your chest at shoulder height. Gently pull it closer with your other hand on the elbow.',
          'Keep the shoulder down, away from your ear. Feel the stretch in the back of the shoulder.',
          'Stop if you feel pinching on top of the shoulder.',
        ],
      },
    ],
  },
  {
    id: 'c_openbook',
    name: 'Open book',
    muscles: 'Upper-back rotation — helps your arm move freely overhead',
    primary: 'mobility',
    equipment: 'bodyweight',
    isolation: true,
    tracking: 'reps',
    increment: 0,
    kind: 'care',
    dose: '8 per side',
    perSide: true,
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Lie on your side, knees bent and stacked, arms straight out in front.',
          'Open your top arm like a book, turning your upper back until your hand points to the other side. Follow your hand with your eyes; knees stay together.',
          'Hold 2 s, then return.',
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
    kind: 'alternative',
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
    kind: 'alternative',
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
    kind: 'alternative',
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
    kind: 'alternative',
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
    id: 'alt_machinerow',
    name: 'Machine row',
    muscles: 'Upper back, lats, rear shoulders, biceps',
    primary: 'back',
    secondary: ['shoulders', 'biceps'],
    equipment: 'machine',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'alternative',
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
    kind: 'alternative',
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
    kind: 'alternative',
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
  {
    id: 'alt_vbarpushdown',
    name: 'V-bar pushdown',
    muscles: 'Triceps',
    primary: 'triceps',
    equipment: 'cable',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'alternative',
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
    id: 'alt_gobletsquat',
    name: 'Heel-elevated goblet squat',
    muscles: 'Quads, glutes',
    primary: 'quads',
    secondary: ['glutes'],
    equipment: 'dumbbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2,
    kind: 'alternative',
    swaps: ['legpress'],
    sections: [
      {
        label: 'DO IT',
        items: [
          'Hold a dumbbell upright at your chest, heels on a small plate.',
          'Sit straight down between your knees, chest up, knees moving over your toes.',
          'Stand up through your whole foot. Lower in 2–3 s.',
        ],
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
    kind: 'alternative',
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
    id: 'alt_reverselunge',
    name: 'Reverse lunge',
    muscles: 'Quads, glutes',
    primary: 'quads',
    secondary: ['glutes'],
    equipment: 'dumbbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2,
    kind: 'alternative',
    perSide: true,
    swaps: ['bss'],
    sections: [
      {
        label: 'DO IT',
        items: [
          'Dumbbells at your sides. Step one foot back.',
          'Drop the back knee toward the floor, front knee over the middle of your foot.',
          'Push through the front foot to return. Do all reps on one leg, then the other.',
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
    kind: 'alternative',
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
    id: 'alt_lpcalf',
    name: 'Leg-press calf raise',
    muscles: 'Calves',
    primary: 'calves',
    equipment: 'machine',
    isolation: true,
    tracking: 'weight_reps',
    increment: 5,
    kind: 'alternative',
    swaps: ['calf'],
    sections: [
      {
        label: 'DO IT',
        items: [
          'Balls of your feet on the bottom edge of the platform, knees straight but not locked.',
          'Lower your heels as far as you can and pause 2 s. Then press up high onto your big toes.',
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
  // Added for the Muscle Mass Building and Definition example plans (phase 3).
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
    kind: 'main',
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
    id: 'latpulldown',
    name: 'Lat pulldown',
    muscles: 'Lats, upper back, biceps',
    primary: 'back',
    secondary: ['biceps'],
    equipment: 'cable',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'main',
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
    id: 'backsquat',
    name: 'Barbell back squat',
    muscles: 'Quads, glutes, lower back',
    primary: 'quads',
    secondary: ['glutes'],
    equipment: 'barbell',
    isolation: false,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'main',
    swaps: ['legpress', 'alt_gobletsquat'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Set the bar in the rack at about chest height, with safety arms just below the bottom of your squat.',
          'Get under the bar so it rests on your upper back, not on your neck. Hands just outside your shoulders. Stand up to unrack and take two small steps back.',
          'Feet about shoulder-width apart, toes turned slightly out.',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'Take a big breath into your belly and brace before each rep.',
          'Sit down and slightly back, knees moving in line with your toes. Go as deep as you can while your back stays flat.',
          'Push through your whole foot to stand up. Keep your chest up.',
        ],
      },
      {
        label: 'AVOID',
        items: [
          'Knees caving inward, or heels lifting off the floor.',
          'Rounding your lower back at the bottom, or bouncing out of the hole.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: [
          'Shoulders or elbows: take a wider grip, or use the leg press.',
          'Knees: use a shorter range, or try the heel-elevated goblet squat.',
        ],
      },
    ],
    warning: 'Always use the safety arms. If you get stuck, lower the bar onto them instead of fighting it.',
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
    kind: 'main',
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
    id: 'legext',
    name: 'Leg extension',
    muscles: 'Quads',
    primary: 'quads',
    equipment: 'machine',
    isolation: true,
    tracking: 'weight_reps',
    increment: 2.5,
    kind: 'main',
    swaps: ['legpress', 'alt_gobletsquat'],
    sections: [
      {
        label: 'SETUP',
        items: [
          'Set the seat so your knees line up with the machine’s pivot and your back is flat against the pad.',
          'The pad rests on your lower shins, just above your ankles.',
        ],
      },
      {
        label: 'DO IT',
        items: [
          'Straighten your legs and squeeze your quads for 1 s at the top.',
          'Lower in 2–3 s until your knees are bent at about 90°.',
        ],
      },
      {
        label: 'AVOID',
        items: ['Swinging the weight up, or lifting your hips off the seat.', 'Locking your knees hard at the top.'],
      },
      {
        label: 'IF IT HURTS',
        items: ['Knee pain: use lighter weight and skip the last few degrees at the top, or do leg presses instead.'],
      },
    ],
  },
  // Warm-up drills and cool-down stretches (phase 4). Checklists link to them; they never go in a workout.
  {
    id: 'd_jog',
    name: 'Easy jog',
    muscles: 'Whole body — raises your heart rate and warms the legs',
    primary: 'quads',
    secondary: ['calves', 'glutes'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'drill',
    dose: '2–3 min',
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Jog at a pace where you could still hold a conversation.',
          'Stay tall, arms relaxed, and land softly under your hips.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Pain in a joint: slow to a walk and stop if it doesn’t ease.'],
      },
    ],
  },
  {
    id: 'd_skips',
    name: 'Skips',
    muscles: 'Calves, quads, hips — gets the legs bouncy',
    primary: 'calves',
    secondary: ['quads'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'drill',
    dose: '2 × 15 m',
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Skip forward with a small, springy hop on each step. Drive the opposite arm and knee up together.',
          'Stay light on the balls of your feet and keep the hops low at first.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Calf or Achilles pain: do fewer, lower skips, or walk instead.'],
      },
    ],
  },
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
    id: 'd_carioca',
    name: 'Carioca',
    muscles: 'Hips and trunk — crossover steps to the side',
    primary: 'mobility',
    secondary: ['glutes'],
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
          'Move sideways: cross the trailing foot in front, step the lead foot out, then cross the trailing foot behind.',
          'Let your hips and shoulders twist a little as you go. Keep your arms loose.',
          'Start slowly, then build speed. Do both directions.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Dizzy or unsteady: slow down and do fewer steps.'],
      },
    ],
  },
  {
    id: 'd_legswings',
    name: 'Leg swings',
    muscles: 'Hips, hamstrings, groin — loosens the hip joint',
    primary: 'mobility',
    secondary: ['hamstrings', 'glutes'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'drill',
    dose: '10 + 10 per leg',
    perSide: true,
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Stand tall and hold a wall or a post for balance.',
          'Swing one leg forward and back, 10 times, in a smooth, relaxed arc. Then face the wall and swing that leg side to side, 10 times.',
          'Start small and let the swings grow a little each time. Keep your upper body still.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Pain in the hip or groin: keep the swings small, or skip them.'],
      },
    ],
  },
  {
    id: 'd_walklunge',
    name: 'Walking lunge',
    muscles: 'Quads, glutes, hips',
    primary: 'quads',
    secondary: ['glutes'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'drill',
    dose: '8 per leg',
    perSide: true,
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Step forward into a long stride. Lower until both knees are bent to about 90°, with your front knee over your toes.',
          'Push through the front foot and step into the next lunge with the other leg.',
          'Keep your chest tall and your steps steady.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Knee pain: take a shorter step and lower only part of the way.'],
      },
    ],
  },
  {
    id: 'd_lungetwist',
    name: 'Lunge with a twist',
    muscles: 'Hips, glutes, upper back — a lunge with a turn',
    primary: 'mobility',
    secondary: ['quads', 'glutes'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'drill',
    dose: '5 per side',
    perSide: true,
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Step into a lunge. Keep your hips facing forward.',
          'Turn your chest and arms over the front leg, as far as is comfortable.',
          'Turn back, push through the front foot and step into the next lunge.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Back or knee pain: skip the twist and do plain lunges.'],
      },
    ],
  },
  {
    id: 'd_accel',
    name: 'Accelerations',
    muscles: 'Legs — short runs that build from easy to quick',
    primary: 'quads',
    secondary: ['hamstrings', 'calves'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'drill',
    dose: '3 × 20 m',
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Start with an easy run and build your speed gradually over the distance. By the end you are running fast but still smooth, not at a sprint.',
          'Walk back to the start to recover between runs.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Any sharp pain in a leg: stop. Keep them smooth rather than all-out.'],
      },
    ],
  },
  {
    id: 'd_strides',
    name: 'Strides',
    muscles: 'Legs — relaxed, quick runs for a run warm-up',
    primary: 'quads',
    secondary: ['hamstrings', 'calves'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'drill',
    dose: '3 × 15–20 s',
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Run at a quick but relaxed pace, about 80–90% of your top speed, with a smooth, quick stride.',
          'Walk or jog easily until you feel ready to go again. Do 3 or 4.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Sharp pain in a calf or hamstring: stop and walk it off.'],
      },
    ],
  },
  {
    id: 'd_passing',
    name: 'Passing',
    muscles: 'Legs and coordination — passing a ball back and forth',
    primary: 'quads',
    secondary: ['calves'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'drill',
    dose: '2–3 min',
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Pass a ball with a partner or against a wall, starting close together.',
          'Move further apart every minute or so and use a little more power each time.',
        ],
      },
    ],
  },
  {
    id: 'd_layups',
    name: 'Layups and shots',
    muscles: 'Legs, shoulders and coordination — basketball',
    primary: 'quads',
    secondary: ['calves', 'shoulders'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'drill',
    dose: '2–3 min',
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Start with easy layups and close shots. Build up to full speed and your usual shots over a few minutes.',
          'Land softly on both feet.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Ankle or knee pain: slow down and take lower jumps.'],
      },
    ],
  },
  {
    id: 'd_jumpbuild',
    name: 'Jump build-up',
    muscles: 'Legs — jumps that build from half effort to full',
    primary: 'quads',
    secondary: ['calves', 'glutes'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'drill',
    dose: '5 + 5 + 3',
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Do 5 jumps at half effort, 5 at three-quarters, then 3 at full effort.',
          'Land softly with your knees bent, then reset between jumps.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Pain in a knee, ankle or the Achilles: stop, or stay at the lower effort.'],
      },
    ],
  },
  {
    id: 'd_highknees',
    name: 'High knees',
    muscles: 'Hip flexors, calves, quads',
    primary: 'quads',
    secondary: ['calves'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'drill',
    dose: '2 × 15 m',
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Run on the spot or forward, lifting each knee to about hip height.',
          'Pump your arms, stay tall and land on the balls of your feet.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Pain at the front of the hip: lift your knees lower.'],
      },
    ],
  },
  {
    id: 'd_squat',
    name: 'Bodyweight squat',
    muscles: 'Quads, glutes',
    primary: 'quads',
    secondary: ['glutes'],
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
          'Stand with your feet about shoulder-width apart, toes turned out a little.',
          'Sit your hips back and down as far as you comfortably can, keeping your heels on the floor and your chest up.',
          'Push through your whole foot to stand up.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Knee pain: squat to a shallower depth.'],
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
    id: 'd_hopstick',
    name: 'Hop and stick',
    muscles: 'Legs — landing control for the knees and ankles',
    primary: 'quads',
    secondary: ['glutes', 'calves'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'drill',
    dose: '5 per leg, hold 2 s',
    perSide: true,
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Do a small hop forward or up off one leg.',
          'Land softly on that same leg with your knee bent and over your toes. Hold still for 2 s.',
          'Keep your hips level and your knee from falling inward.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Knee or ankle pain: make the hop smaller, or just balance on one leg.'],
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
  {
    id: 'd_inchworm',
    name: 'Inchworm',
    muscles: 'Hamstrings, core, shoulders — a walk-out from standing',
    primary: 'mobility',
    secondary: ['hamstrings', 'core', 'shoulders'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'drill',
    dose: '5',
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Stand tall, then bend forward and put your hands on the floor. Bend your knees a little if you need to.',
          'Walk your hands forward until you are in a push-up position. Keep your body in a straight line.',
          'Walk your feet toward your hands in small steps, then stand up.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Wrist or lower-back pain: take a shorter walk-out.'],
      },
    ],
  },
  {
    id: 'd_wgs',
    name: 'World’s greatest stretch',
    muscles: 'Hips, hamstrings, upper back — a stretch that moves through several joints',
    primary: 'mobility',
    secondary: ['hamstrings', 'glutes'],
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'drill',
    dose: '3 per side',
    perSide: true,
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Step into a long lunge. Put both hands on the floor inside your front foot.',
          'Turn your chest toward the front knee and reach that arm up toward the ceiling. Look up at your hand.',
          'Lower the hand, then step back and switch sides.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Pain in the knee or hip: take a shorter lunge and don’t turn as far.'],
      },
    ],
  },
  {
    id: 's_calf',
    name: 'Calf stretch',
    muscles: 'Calves',
    primary: 'calves',
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
          'Stand facing a wall and put your hands on it. Step one foot back, with the leg straight and the heel down.',
          'Lean toward the wall until you feel a stretch in the calf of the back leg.',
          'Hold, then switch legs. To reach the lower calf, bend the back knee a little.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Pain at the heel or Achilles: ease off, and stop if it stays.'],
      },
    ],
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
    id: 's_quad',
    name: 'Quad stretch',
    muscles: 'Front of the thigh',
    primary: 'quads',
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
          'Stand tall, holding a wall for balance. Bend one knee and hold that foot behind you.',
          'Keep your knees close together and your hips pushed slightly forward.',
          'Hold, then switch legs.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Knee pain: don’t pull the heel in as far.'],
      },
    ],
  },
  {
    id: 's_hipflexor',
    name: 'Hip flexor stretch',
    muscles: 'Front of the hip',
    primary: 'mobility',
    secondary: ['quads'],
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
          'Kneel on one knee, with the other foot in front. Pad your knee with a mat or towel.',
          'Tuck your pelvis under and shift your weight forward until you feel a stretch at the front of the back hip.',
          'Keep your chest tall. Hold, then switch sides.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Pain in the knee or a pinch at the front of the hip: ease off.'],
      },
    ],
  },
  {
    id: 's_groin',
    name: 'Groin stretch',
    muscles: 'Inner thigh',
    primary: 'mobility',
    equipment: 'bodyweight',
    isolation: false,
    tracking: 'reps',
    increment: 0,
    kind: 'stretch',
    dose: '30 s',
    swaps: [],
    sections: [
      {
        label: 'HOW',
        items: [
          'Sit with the soles of your feet together and your knees out to the sides.',
          'Hold your feet, sit tall and let your knees drop toward the floor. Lean forward a little for more stretch.',
        ],
      },
      {
        label: 'IF IT HURTS',
        items: ['Pain in the groin: ease off, and don’t push the knees down.'],
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
];

export const EXERCISE_BY_ID: Record<string, ExerciseDef> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

export function getExercise(id: string): ExerciseDef {
  const ex = EXERCISE_BY_ID[id];
  if (!ex) throw new Error(`Unknown exercise: ${id}`);
  return ex;
}
