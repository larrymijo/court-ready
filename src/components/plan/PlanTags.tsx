import { View } from 'react-native';

import { Tag } from '@/components/ui';
import type { Plan } from '@/lib/types';

/** "In use" (white) and "Example" (outlined): what a plan is, in words. */
export function PlanTags({ plan, inUse }: { plan: Plan; inUse: boolean }) {
  if (!inUse && !plan.example) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {inUse ? <Tag label="In use" tone="strong" /> : null}
      {plan.example ? <Tag label="Example" /> : null}
    </View>
  );
}
