import type { ReactNode } from 'react';

import { Screen } from '@/components/ui';
import { useUpdateNoticeVisible } from '@/components/UpdateNotice';
import { FLOATING_BAR_SPACE } from '@/components/WorkoutBanner';
import { useStore } from '@/store/useStore';
import { S } from '@/theme';

/** Space for the workout or update notice floating above the tab bar. */
export function useTabBottomPadding() {
  const workoutOpen = useStore((s) => s.active != null);
  const updateNotice = useUpdateNoticeVisible();
  return S.xl + (workoutOpen || updateNotice ? FLOATING_BAR_SPACE : 0);
}

export function TabScreen({ children }: { children: ReactNode }) {
  const bottomPad = useTabBottomPadding();
  return (
    <Screen edgesBottom={false} bottomPad={bottomPad}>
      {children}
    </Screen>
  );
}
