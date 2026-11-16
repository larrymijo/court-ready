import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { NumInput } from '@/components/NumInput';
import { C, R, SIZE, T } from '@/theme';

/**
 * A number you can change with minus and plus, or by tapping it and typing: minutes, kilometres.
 * Empty means "not entered" (undefined). Minus never goes below `min`; plus has no top, because a
 * value that is too large is shown as an error by the screen.
 */
export function NumberStepper({
  value,
  onChange,
  unit,
  step,
  min,
  decimal,
  decrementLabel,
  incrementLabel,
  accessibilityLabel,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  unit: string;
  step: number;
  /** What minus stops at. */
  min: number;
  decimal?: boolean;
  decrementLabel: string;
  incrementLabel: string;
  accessibilityLabel: string;
}) {
  const round = (n: number) => Math.round(n * 100) / 100;
  return (
    <View style={styles.box}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={decrementLabel}
        onPress={() => onChange(value === undefined ? min : Math.max(min, round(value - step)))}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Ionicons name="remove" size={22} color={C.text} />
      </Pressable>
      <View style={styles.middle}>
        <NumInput
          value={value ?? null}
          onChange={(v) => onChange(v === null ? undefined : v)}
          decimal={decimal}
          accessibilityLabel={accessibilityLabel}
          style={styles.input}
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={incrementLabel}
        onPress={() => onChange(round((value ?? 0) + step))}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Ionicons name="add" size={22} color={C.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 176,
    height: SIZE.control,
    paddingHorizontal: 4,
    borderRadius: R.control,
    backgroundColor: C.control,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  button: { width: SIZE.touch, height: SIZE.touch, borderRadius: R.small, alignItems: 'center', justifyContent: 'center' },
  pressed: { backgroundColor: C.track },
  middle: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2 },
  // The field is a full 44 px tall and wide: it is a tap target of its own.
  input: {
    ...T.heading,
    backgroundColor: 'transparent',
    height: SIZE.touch,
    minWidth: SIZE.touch,
    maxWidth: 60,
    paddingHorizontal: 0,
    color: C.text,
  },
  unit: { ...T.secondary, color: C.textMuted },
});
