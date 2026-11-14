import { Redirect, useLocalSearchParams } from 'expo-router';

import { useStore } from '@/store/useStore';

/**
 * The old address of a workout page (/routine/uppera). Sends on to the same workout in a saved
 * plan: Court-Ready first (those ids were Court-Ready's), then the plan in use, then any.
 */
export default function OldRoutineLink() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const plans = useStore((s) => s.plans);
  const activePlanId = useStore((s) => s.activePlanId);
  const has = (planId: string) => plans.find((p) => p.id === planId)?.workouts.some((w) => w.id === id);
  const planId = ['court-ready', activePlanId].find((p) => has(p)) ?? plans.find((p) => has(p.id))?.id;
  if (!planId) return <Redirect href="/plans" />;
  return <Redirect href={`/plans/${planId}/${id}`} />;
}
