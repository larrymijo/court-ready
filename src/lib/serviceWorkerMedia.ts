import { checklist } from '@/data/checklists';
import { sportDef } from '@/data/sports';
import { planExerciseIds } from '@/lib/planView';
import type { Checklist, Plan } from '@/lib/types';
import { cooldownOf, warmupKindOf } from '@/lib/workoutPlan';

/** Gym exercises and checklist movements in the active plan take priority over other saved plans. */
export function planMediaOrder(plans: readonly Plan[], activePlanId: string): string[] {
  const ids = new Set<string>();
  const addChecklist = (list: Checklist | undefined) => {
    for (const step of list?.steps ?? []) {
      for (const id of step.exerciseIds ?? []) ids.add(id);
    }
  };
  const active = plans.find((plan) => plan.id === activePlanId);
  const ordered = active ? [active, ...plans.filter((plan) => plan !== active)] : plans;
  for (const plan of ordered) {
    for (const id of planExerciseIds(plan)) ids.add(id);
    for (const workout of plan.workouts) {
      const warmup = warmupKindOf(workout);
      if (warmup) addChecklist(checklist(warmup));
      addChecklist(cooldownOf(workout));
    }
    for (const session of plan.sports) {
      const sport = sportDef(session.sport);
      if (!sport) continue;
      addChecklist(checklist(session.warmup ?? sport.warmup));
      addChecklist(checklist(session.cooldown ?? sport.cooldown));
    }
  }
  return [...ids];
}
