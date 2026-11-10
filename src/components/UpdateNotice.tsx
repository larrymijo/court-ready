import { StyleSheet, Text, View } from 'react-native';

import { Button, IconButton } from '@/components/ui';
import { dismissUpdate, reloadApp, useUpdateReady } from '@/lib/appUpdate';
import { useStore } from '@/store/useStore';
import { C, R, S, T } from '@/theme';

/** True while the "new version" bar is on screen. Never during a workout. */
export function useUpdateNoticeVisible(): boolean {
  const ready = useUpdateReady();
  const workoutOpen = useStore((s) => s.active != null);
  return ready && !workoutOpen;
}

/**
 * "New version ready · Reload", floating above the tab bar. The app never reloads by itself, and
 * the bar waits until no workout is open, so an update can't interrupt a session.
 */
export function UpdateNotice({ bottom }: { bottom: number }) {
  const visible = useUpdateNoticeVisible();
  if (!visible) return null;
  return (
    <View style={[styles.bar, { bottom: bottom + S.sm }]} accessibilityRole="alert">
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={styles.title}>New version ready</Text>
        <Text style={styles.sub}>Your data stays as it is.</Text>
      </View>
      <Button size="pill" title="Reload" onPress={reloadApp} />
      <IconButton plain icon="close" label="Later" color={C.textMuted} onPress={dismissUpdate} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: S.md,
    right: S.md,
    minHeight: 60,
    backgroundColor: C.control,
    borderRadius: R.card,
    paddingLeft: S.lg,
    paddingRight: S.xs,
    paddingVertical: S.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    borderWidth: 1,
    borderColor: C.outline,
  },
  title: { ...T.body, fontWeight: '600', color: C.text },
  sub: { ...T.secondary, color: C.textMuted },
});
