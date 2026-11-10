import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatClock, formatElapsed } from '@/lib/format';
import { useNow } from '@/lib/useNow';
import { useStore } from '@/store/useStore';
import { C, R, S, T } from '@/theme';

/** "Workout in progress" bar that floats above the tab bar. Tap it to go back to the workout. */
export function WorkoutBanner({ bottom }: { bottom: number }) {
  const active = useStore((s) => s.active);
  const rest = useStore((s) => s.rest);
  const now = useNow(1000, !!active);
  if (!active) return null;
  const done = active.exercises.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);
  const total = active.exercises.reduce((n, e) => n + e.sets.length, 0);
  const restLeft = rest ? Math.max(0, (rest.endsAt - now) / 1000) : 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Resume ${active.name}`}
      onPress={() => router.push('/workout')}
      style={({ pressed }) => [styles.banner, { bottom: bottom + S.sm }, pressed && { opacity: 0.85 }]}>
      <View style={styles.dot} />
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={styles.title} numberOfLines={1}>
          {active.name}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {formatElapsed(now - active.startedAt)} · {done} of {total} sets
          {restLeft > 0 ? ` · rest ${formatClock(restLeft)}` : ''}
        </Text>
      </View>
      <Text style={styles.resume}>Resume</Text>
      <Ionicons name="chevron-up" size={18} color={C.text} />
    </Pressable>
  );
}

/** Height a screen keeps free at the bottom while a floating bar is showing. */
export const FLOATING_BAR_SPACE = 76;

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: S.md,
    right: S.md,
    minHeight: 60,
    backgroundColor: C.control,
    borderRadius: R.card,
    paddingHorizontal: S.lg,
    paddingVertical: S.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    // It floats over cards, so a thin outline keeps its edge readable without a shadow.
    borderWidth: 1,
    borderColor: C.outline,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.text },
  title: { ...T.body, fontWeight: '600', color: C.text },
  sub: { ...T.secondary, color: C.textMuted },
  resume: { ...T.pill, color: C.text },
});
