import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { C, S } from '@/theme';

/**
 * The actions at the bottom of a sport screen, pinned in thumb reach above the home indicator: a
 * 56 px primary button, and under it a quiet 44 px one.
 */
export function SessionBar({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, S.lg) }]}>{children}</View>;
}

const styles = StyleSheet.create({
  bar: { paddingTop: 10, paddingHorizontal: S.gutter, backgroundColor: C.bg, gap: S.xs },
});
