// The built-in example plans, in the order the plan list shows them. Saved plans are always fresh
// deep copies: editing a saved plan must never reach these constants, and the reverse.
import { COURT_READY_PLAN } from '@/data/plan-templates/court-ready';
import { DEFINITION_PLAN } from '@/data/plan-templates/definition';
import { MUSCLE_MASS_PLAN } from '@/data/plan-templates/muscle-mass';
import type { ExamplePlanId, Plan } from '@/lib/types';

/** The example ids (also their plan ids), in list order. */
export const EXAMPLE_PLAN_IDS: readonly ExamplePlanId[] = ['court-ready', 'muscle-mass', 'definition'];

const EXAMPLES: Record<ExamplePlanId, Plan> = {
  'court-ready': COURT_READY_PLAN,
  'muscle-mass': MUSCLE_MASS_PLAN,
  definition: DEFINITION_PLAN,
};

function copy(plan: Plan): Plan {
  return JSON.parse(JSON.stringify(plan)) as Plan;
}

/** Fresh copies of the three examples, in list order. */
export function examplePlans(): Plan[] {
  return EXAMPLE_PLAN_IDS.map((id) => copy(EXAMPLES[id]));
}

/** A fresh copy of one example, or undefined if the id is not an example. */
export function examplePlan(id: string): Plan | undefined {
  return Object.prototype.hasOwnProperty.call(EXAMPLES, id) ? copy(EXAMPLES[id as ExamplePlanId]) : undefined;
}
