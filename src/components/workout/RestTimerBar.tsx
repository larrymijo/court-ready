import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProgressBar } from '@/components/ui';
import { formatClock } from '@/lib/format';
import { restDoneFeedback } from '@/lib/platform';
import { useNow } from '@/lib/useNow';
import { useStore } from '@/store/useStore';
import { C, R, S, SIZE, T } from '@/theme';

/** Height the workout list keeps free at the bottom while the bar is showing. */
export const REST_BAR_SPACE = 104;

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
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, S.md) }]}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.time} accessibilityLabel={`${formatClock(left)} of rest left`}>
            {formatClock(left)}
          </Text>
          <Text style={styles.label} numberOfLines={1}>
            Rest · {rest.label}
          </Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="15 seconds less rest" onPress={() => adjustRest(-15)} style={styles.btn}>
          <Text style={styles.btnText}>−15</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="15 seconds more rest" onPress={() => adjustRest(15)} style={styles.btn}>
          <Text style={styles.btnText}>+15</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Skip the rest" onPress={clearRest} style={[styles.btn, styles.skip]}>
          <Text style={[styles.btnText, { color: C.onAccent }]}>Skip</Text>
        </Pressable>
      </View>
      <ProgressBar value={1 - left / rest.duration} height={3} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.control,
    borderTopLeftRadius: R.hero,
    borderTopRightRadius: R.hero,
    paddingTop: S.md,
    paddingHorizontal: S.gutter,
    gap: S.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  time: { ...T.hero, color: C.text },
  label: { ...T.secondary, color: C.textMuted },
  btn: {
    minWidth: 52,
    height: SIZE.touch,
    borderRadius: R.small,
    backgroundColor: C.track,
    paddingHorizontal: S.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skip: { backgroundColor: C.text },
  btnText: { ...T.pill, color: C.text },
});
