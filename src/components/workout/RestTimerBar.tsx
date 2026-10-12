import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProgressBar } from '@/components/ui';
import { formatClock } from '@/lib/format';
import { restDoneFeedback } from '@/lib/platform';
import { useNow } from '@/lib/useNow';
import { useStore } from '@/store/useStore';
import { C, R, S } from '@/theme';

/** Countdown that starts when you tick a set. Buzzes at zero. */
export function RestTimerBar() {
  const rest = useStore((s) => s.rest);
  const vibrate = useStore((s) => s.settings.vibrate);
  const adjustRest = useStore((s) => s.adjustRest);
  const clearRest = useStore((s) => s.clearRest);
  const insets = useSafeAreaInsets();
  const now = useNow(250, !!rest);
  const left = rest ? (rest.endsAt - now) / 1000 : 0;
  const finished = !!rest && left <= 0;

  useEffect(() => {
    if (finished) {
      restDoneFeedback(vibrate);
      clearRest();
    }
  }, [finished, vibrate, clearRest]);

  if (!rest || finished) return null;

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + S.sm }]}>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={styles.time}>{formatClock(left)}</Text>
        <Text style={styles.label} numberOfLines={1}>
          Rest · {rest.label}
        </Text>
        <ProgressBar value={1 - left / rest.duration} color={C.accent} height={4} />
      </View>
      <Pressable onPress={() => adjustRest(-15)} style={styles.btn} hitSlop={4}>
        <Text style={styles.btnText}>−15</Text>
      </Pressable>
      <Pressable onPress={() => adjustRest(15)} style={styles.btn} hitSlop={4}>
        <Text style={styles.btnText}>+15</Text>
      </Pressable>
      <Pressable onPress={clearRest} style={[styles.btn, { backgroundColor: C.accent }]} hitSlop={4}>
        <Text style={[styles.btnText, { color: '#fff' }]}>Skip</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.surface2,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    paddingTop: S.md,
    paddingHorizontal: S.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    borderTopWidth: 1,
    borderColor: C.border,
  },
  time: { color: C.text, fontSize: 26, lineHeight: 30, fontWeight: '800', fontVariant: ['tabular-nums'] },
  label: { color: C.muted, fontSize: 12 },
  btn: { backgroundColor: C.surface3, borderRadius: R.sm, paddingHorizontal: 12, paddingVertical: 10 },
  btnText: { color: C.text, fontWeight: '800', fontSize: 14 },
});
