// Warm-ups and cool-downs as data (docs/polish-plan.md, sections 7 and 10, phase 4). Each is a
// checklist of steps to tick or skip; a step that is a drill or a stretch links to its exercise.
// Not saved data, but plans and finished sessions point to these ids, so an id never changes once
// it has shipped.
//
// The ones marked DRAFT are new, general guidance, and wait for the owner to approve them.
import type { Checklist } from '@/lib/types';

export const CHECKLISTS: Checklist[] = [
  // --- Warm-ups -------------------------------------------------------------------------------

  // The in-workout warm-ups, word for word.
  {
    id: 'upper',
    title: 'Upper warm-up · 8 min',
    minutes: 8,
    kind: 'warmup',
    steps: [
      { text: 'Easy cardio 3–5 min (rower, bike, fast walk)' },
      { text: 'Band external rotation — 15 per side', exerciseIds: ['c_er'] },
      { text: 'Band pull-apart — 15', exerciseIds: ['c_pullapart'] },
      { text: 'Scapular push-up — 10', exerciseIds: ['c_scappush'] },
      { text: 'Wall slide — 8', exerciseIds: ['c_wallslide'] },
    ],
  },
  {
    id: 'lower',
    title: 'Lower warm-up · 8 min',
    minutes: 8,
    kind: 'warmup',
    steps: [
      { text: 'Easy bike 3–5 min' },
      { text: 'Bodyweight squat — 10', exerciseIds: ['d_squat'] },
      { text: 'Glute bridge — 10', exerciseIds: ['d_bridge'] },
      { text: 'Leg swings — 10 + 10 each leg', exerciseIds: ['d_legswings'] },
      { text: 'Hop and stick — 5 per leg, hold 2 s', exerciseIds: ['d_hopstick'] },
    ],
  },

  // The game warm-up from the guide, word for word.
  {
    id: 'game',
    title: 'Game warm-up · 8 min',
    minutes: 8,
    kind: 'warmup',
    steps: [
      { text: 'Jog, skips, side shuffles — 3 min.', exerciseIds: ['d_jog', 'd_skips', 'd_shuffle'] },
      { text: 'Leg swings and walking lunges with a twist — 1 min.', exerciseIds: ['d_legswings', 'd_lungetwist'] },
      {
        text: 'Band external rotation 12 per side + band pull-apart 15 (no band: big arm circles).',
        exerciseIds: ['c_er', 'c_pullapart'],
      },
      { text: 'Scapular push-up — 10', exerciseIds: ['c_scappush'] },
      { text: 'Jumps: 5 at half effort, 5 at three-quarters, 3 at full effort.', exerciseIds: ['d_jumpbuild'] },
      { text: 'Volleyball: build your hitting and serving from half to full power over about 5 minutes.' },
    ],
  },

  // DRAFT: not approved by the owner yet
  {
    id: 'game-basketball',
    title: 'Basketball warm-up · 8 min',
    minutes: 8,
    kind: 'warmup',
    steps: [
      { text: 'Jog, skips, side shuffles — 3 min.', exerciseIds: ['d_jog', 'd_skips', 'd_shuffle'] },
      { text: 'Leg swings and walking lunges with a twist — 1 min.', exerciseIds: ['d_legswings', 'd_lungetwist'] },
      {
        text: 'Band external rotation 12 per side + band pull-apart 15 (no band: big arm circles).',
        exerciseIds: ['c_er', 'c_pullapart'],
      },
      { text: 'Scapular push-up — 10', exerciseIds: ['c_scappush'] },
      { text: 'Jumps: 5 at half effort, 5 at three-quarters, 3 at full effort.', exerciseIds: ['d_jumpbuild'] },
      {
        text: 'Layups and shots: start easy and build to game speed over about 5 minutes.',
        exerciseIds: ['d_layups'],
      },
    ],
  },

  // DRAFT: not approved by the owner yet
  {
    id: 'football-warmup',
    title: 'Football warm-up · 10 min',
    minutes: 10,
    kind: 'warmup',
    steps: [
      { text: 'Easy jog — 3 min.', exerciseIds: ['d_jog'] },
      { text: 'Leg swings — 10 forward-back and 10 side-to-side, each leg', exerciseIds: ['d_legswings'] },
      { text: 'Walking lunges — 8 per leg', exerciseIds: ['d_walklunge'] },
      { text: 'Side shuffles and carioca — 2 × 10 m each', exerciseIds: ['d_shuffle', 'd_carioca'] },
      { text: 'Skips — 2 × 15 m', exerciseIds: ['d_skips'] },
      { text: 'Three short accelerations — 20 m each, from easy to quick', exerciseIds: ['d_accel'] },
      { text: 'Passing over growing distances — about 2 min', exerciseIds: ['d_passing'] },
    ],
  },

  // DRAFT: not approved by the owner yet
  {
    id: 'running-warmup',
    title: 'Running warm-up · 8 min',
    minutes: 8,
    kind: 'warmup',
    steps: [
      { text: 'Brisk walk or easy jog — 3–5 min', exerciseIds: ['d_jog'] },
      { text: 'Leg swings — 10 forward-back and 10 side-to-side, each leg', exerciseIds: ['d_legswings'] },
      { text: 'Walking lunges — 8 per leg', exerciseIds: ['d_walklunge'] },
      { text: 'Skips — 2 × 15 m', exerciseIds: ['d_skips'] },
      { text: 'Strides — 3 or 4 of 15–20 s, easy walk back between', exerciseIds: ['d_strides'] },
    ],
  },

  // --- Cool-downs -----------------------------------------------------------------------------

  // The after-playing routine from the guide, word for word.
  {
    id: 'after-playing',
    title: 'After playing · 3 min',
    minutes: 3,
    kind: 'cooldown',
    steps: [
      { text: 'Cross-body stretch — 2 × 30 s on your hitting arm', exerciseIds: ['c_crossbody'] },
      { text: 'Open book — 8 per side', exerciseIds: ['c_openbook'] },
      { text: 'Calf stretch against a wall — 30 s per leg', exerciseIds: ['s_calf'] },
    ],
  },

  // DRAFT: not approved by the owner yet
  {
    id: 'football-cooldown',
    title: 'Football cool-down · 5 min',
    minutes: 5,
    kind: 'cooldown',
    steps: [
      { text: 'Calf stretch — 30 s per leg', exerciseIds: ['s_calf'] },
      { text: 'Hamstring stretch — 30 s per leg', exerciseIds: ['s_hamstring'] },
      { text: 'Quad stretch — 30 s per leg', exerciseIds: ['s_quad'] },
      { text: 'Hip flexor stretch — 30 s per side', exerciseIds: ['s_hipflexor'] },
      { text: 'Groin stretch — 30 s', exerciseIds: ['s_groin'] },
    ],
  },

  // DRAFT: not approved by the owner yet
  {
    id: 'running-cooldown',
    title: 'Running cool-down · 5 min',
    minutes: 5,
    kind: 'cooldown',
    steps: [
      { text: 'Easy walk — 2 min' },
      { text: 'Calf stretch — 30 s per leg', exerciseIds: ['s_calf'] },
      { text: 'Hamstring stretch — 30 s per leg', exerciseIds: ['s_hamstring'] },
      { text: 'Quad stretch — 30 s per leg', exerciseIds: ['s_quad'] },
      { text: 'Hip flexor stretch — 30 s per side', exerciseIds: ['s_hipflexor'] },
      { text: 'Glute stretch — 30 s per side', exerciseIds: ['s_glute'] },
    ],
  },

  // DRAFT: not approved by the owner yet
  {
    id: 'cool-upper',
    title: 'Upper cool-down · 3 min',
    minutes: 3,
    kind: 'cooldown',
    steps: [
      { text: 'Chest stretch — 30 s per arm', exerciseIds: ['s_chest'] },
      { text: 'Lat stretch — 30 s per side', exerciseIds: ['s_lat'] },
      { text: 'Triceps stretch — 30 s per arm', exerciseIds: ['s_triceps'] },
      { text: 'Cross-body stretch — 30 s per arm', exerciseIds: ['c_crossbody'] },
    ],
  },

  // DRAFT: not approved by the owner yet
  {
    id: 'cool-lower',
    title: 'Lower cool-down · 4 min',
    minutes: 4,
    kind: 'cooldown',
    steps: [
      { text: 'Quad stretch — 30 s per leg', exerciseIds: ['s_quad'] },
      { text: 'Hamstring stretch — 30 s per leg', exerciseIds: ['s_hamstring'] },
      { text: 'Hip flexor stretch — 30 s per side', exerciseIds: ['s_hipflexor'] },
      { text: 'Calf stretch — 30 s per leg', exerciseIds: ['s_calf'] },
    ],
  },
];

export const CHECKLIST_BY_ID: Record<string, Checklist> = Object.fromEntries(CHECKLISTS.map((c) => [c.id, c]));

/** The checklist with this id, or undefined for an id this version does not know. */
export function checklist(id: string): Checklist | undefined {
  return Object.prototype.hasOwnProperty.call(CHECKLIST_BY_ID, id) ? CHECKLIST_BY_ID[id] : undefined;
}
