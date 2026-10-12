import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatClock, formatElapsed } from '@/lib/format';
import { useNow } from '@/lib/useNow';
import { useStore } from '@/store/useStore';
import { C, R, S } from '@/theme';

/** "Workout in progress" bar that floats above the tab bar, like Hevy. */
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
      onPress={() => router.push('/workout')}
      style={({ pressed }) => [styles.banner, { bottom: bottom + S.sm }, pressed && { opacity: 0.85 }]}>
      <View style={styles.dot} />
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>
          {active.name}
        </Text>
        <Text style={styles.sub}>
          {formatElapsed(now - active.startedAt)} · {done}/{total} sets
          {restLeft > 0 ? ` · Rest ${formatClock(restLeft)}` : ''}
        </Text>
      </View>
      <Text style={styles.resume}>Resume</Text>
      <Ionicons name="chevron-up" size={18} color={C.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: S.md,
    right: S.md,
    backgroundColor: C.surface2,
    borderRadius: R.lg,
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.green },
  title: { color: C.text, fontWeight: '700', fontSize: 15 },
  sub: { color: C.muted, fontSize: 12, marginTop: 1, fontVariant: ['tabular-nums'] },
  resume: { color: C.accent, fontWeight: '700', fontSize: 14 },
});
