// Draft exercise metadata from a local checkout of yuhonas/free-exercise-db.
// Example: node scripts/build-library.mjs ../free-exercise-db/dist/exercises.json Barbell_Curl Chin-Up
// Review the movement, choose the permanent Hybrid id, and write the technique and logging defaults
// before adding an entry to src/data/exercises. Source-specific equipment may need a manual match.
import { readFileSync } from 'node:fs';

const muscleAliases = new Map([
  ['abdominals', 'core'], ['abductors', 'glutes'], ['quadriceps', 'quads'],
  ['lats', 'back'], ['lower back', 'back'], ['middle back', 'back'], ['traps', 'back'],
]);
const equipmentAliases = new Map([
  ['body only', 'bodyweight'], ['bands', 'band'], ['kettlebells', 'kettlebell'],
  ['e-z curl bar', 'barbell'],
]);

function draft(entry) {
  const muscles = [...new Set([...entry.primaryMuscles, ...entry.secondaryMuscles]
    .map((muscle) => muscleAliases.get(muscle) ?? muscle))];
  const [primary, ...secondary] = muscles;
  return {
    sourceId: entry.id,
    name: entry.name,
    primary,
    secondary,
    equipment: equipmentAliases.get(entry.equipment) ?? entry.equipment,
    isolation: entry.mechanic === null ? null : entry.mechanic === 'isolation',
  };
}

const [file, ...ids] = process.argv.slice(2);
try {
  if (!file || !ids.length) {
    throw new Error('Usage: node scripts/build-library.mjs <exercises.json> <source-id> [source-id ...]');
  }
  const entries = JSON.parse(readFileSync(file, 'utf8'));
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const drafts = ids.map((id) => {
    const entry = byId.get(id);
    if (!entry) throw new Error(`Unknown exercise in the reference: ${id}`);
    return draft(entry);
  });
  console.log(JSON.stringify(drafts, null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
