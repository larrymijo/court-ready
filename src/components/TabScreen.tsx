import type { ReactNode } from 'react';

import { Screen } from '@/components/ui';
import { useUpdateNoticeVisible } from '@/components/UpdateNotice';
import { FLOATING_BAR_SPACE } from '@/components/WorkoutBanner';
import { useStore } from '@/store/useStore';
import { S } from '@/theme';

/** A tab's page. Leaves room at the bottom while the workout or update bar floats above the tab bar. */
export function TabScreen({ children }: { children: ReactNode }) {
  const workoutOpen = useStore((s) => s.active != null);
  const updateNotice = useUpdateNoticeVisible();
  const floating = workoutOpen || updateNotice;
  return (
    <Screen edgesBottom={false} bottomPad={S.xl + (floating ? FLOATING_BAR_SPACE : 0)}>
      {children}
    </Screen>
  );
}
