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
];

export const EXERCISE_BY_ID: Record<string, ExerciseDef> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

export function getExercise(id: string): ExerciseDef {
  const ex = EXERCISE_BY_ID[id];
  if (!ex) throw new Error(`Unknown exercise: ${id}`);
  return ex;
}
