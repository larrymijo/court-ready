import type { ExerciseDef } from '@/lib/types';

import { adductorsExercises } from './exercises/adductors';
import { backExercises } from './exercises/back';
import { bicepsExercises } from './exercises/biceps';
import { calvesExercises } from './exercises/calves';
import { chestExercises } from './exercises/chest';
import { coreExercises } from './exercises/core';
import { forearmsExercises } from './exercises/forearms';
import { glutesExercises } from './exercises/glutes';
import { hamstringsExercises } from './exercises/hamstrings';
import { mobilityExercises } from './exercises/mobility';
import { quadsExercises } from './exercises/quads';
import { shouldersExercises } from './exercises/shoulders';
import { tricepsExercises } from './exercises/triceps';

// Preserve the current Library and picker order while keeping definitions grouped by muscle.
const catalogOrder = [
  // Court-Ready gym exercises, shoulder care, and swaps.
  'incline', 'csrow', 'cablefly', 'pulldown', 'lateral', 'facepull', 'curl', 'pushdown', 'legpress', 'rdl',
  'bss', 'legcurl', 'calf', 'pallof', 'crunch', 'flatpress', 'pullup', 'cablerow', 'lowhighfly', 'pushup',
  'revpec', 'hammer', 'ohext', 'c_er', 'c_pullapart', 'c_scappush', 'c_wallslide', 'c_proney',
  'c_crossbody', 'c_openbook', 'alt_inclinemachine', 'alt_machinepress', 'alt_floorpress', 'alt_pecdeck',
  'alt_machinerow', 'alt_dbrow', 'alt_assistedpullup', 'alt_bandfacepull', 'alt_reardeltfly',
  'alt_cablecurl', 'alt_ropecurl', 'alt_vbarpushdown', 'alt_gobletsquat', 'alt_backext', 'alt_reverselunge',
  'alt_lyinglegcurl', 'alt_lpcalf', 'alt_deadbug', 'alt_sideplank',
  // Exercises added for the Muscle Mass Building and Definition plans.
  'benchpress', 'shoulderpress', 'latpulldown', 'backsquat', 'barbellrdl', 'legext',
  // Warm-up drills and cool-down stretches.
  'd_jog', 'd_skips', 'd_shuffle', 'd_carioca', 'd_legswings', 'd_walklunge', 'd_lungetwist', 'd_accel',
  'd_strides', 'd_passing', 'd_layups', 'd_jumpbuild', 'd_highknees', 'd_squat', 'd_bridge', 'd_hopstick',
  'd_armcircles', 'd_inchworm', 'd_wgs', 's_calf', 's_hamstring', 's_quad', 's_hipflexor', 's_groin',
  's_glute', 's_chest', 's_lat', 's_triceps',
];
const positionById = new Map(catalogOrder.map((id, index) => [id, index]));

export const EXERCISES: ExerciseDef[] = [
  ...adductorsExercises,
  ...backExercises,
  ...bicepsExercises,
  ...calvesExercises,
  ...chestExercises,
  ...coreExercises,
  ...forearmsExercises,
  ...glutesExercises,
  ...hamstringsExercises,
  ...mobilityExercises,
  ...quadsExercises,
  ...shouldersExercises,
  ...tricepsExercises,
].sort((a, b) => (positionById.get(a.id) ?? catalogOrder.length) - (positionById.get(b.id) ?? catalogOrder.length));

export const EXERCISE_BY_ID: Record<string, ExerciseDef> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

export function getExercise(id: string): ExerciseDef {
  const ex = EXERCISE_BY_ID[id];
  if (!ex) throw new Error(`Unknown exercise: ${id}`);
  return ex;
}
