import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, type IconName } from '@/components/ui';
import { C, R, S, T } from '@/theme';

/**
 * The top of a sport session screen: the button that leaves (or steps back), the sport's name with
 * the plan and day under it, and the four steps of the session with the current one lit.
 */
export function SessionHeader({
  title,
  subtitle,
  left,
  labels,
  stageIndex,
}: {
  title: string;
  subtitle: string;
  left: { icon: IconName; label: string; onPress: () => void };
  /** The four step names, in order. */
  labels: string[];
  /** 0 to 3: the step the session is at. */
  stageIndex: number;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View>
      <View style={[styles.bar, { marginTop: insets.top }]}>
        <View style={styles.side}>
          <IconButton plain icon={left.icon} size={24} label={left.label} onPress={left.onPress} />
        </View>
        <View style={styles.middle}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <View style={styles.side} />
      </View>
      <View style={styles.steps} accessibilityRole="list" accessibilityLabel="Session steps">
        {labels.map((label, i) => (
          <View
            key={label}
            style={styles.step}
            accessibilityRole="text"
            accessibilityLabel={`Step ${i + 1} of ${labels.length}: ${label.toLowerCase()}${i === stageIndex ? ', now' : ''}`}>
            <View style={[styles.stepBar, i <= stageIndex && styles.stepBarOn]} />
            <Text style={[styles.stepLabel, i === stageIndex && { color: C.text }]}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { minHeight: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: S.sm },
  // Equal sides keep the title in the middle of the screen.
  side: { flex: 1, alignItems: 'flex-start' },
  middle: { alignItems: 'center', gap: 1, flexShrink: 1 },
  title: { ...T.button, color: C.text },
  subtitle: { fontSize: 12, lineHeight: 16, color: C.textFaint, fontVariant: ['tabular-nums'] },
  steps: { flexDirection: 'row', gap: 6, marginHorizontal: S.gutter, marginTop: 10 },
  step: { flex: 1, gap: 6 },
  stepBar: { height: 3, borderRadius: R.pill, backgroundColor: C.track },
  stepBarOn: { backgroundColor: C.text },
  stepLabel: { fontSize: 11, lineHeight: 14, fontWeight: '600', letterSpacing: 0.66, color: C.textFaint },
});
