import { Pressable, StyleSheet, Text, View } from 'react-native';

import { C, R, SIZE, T, TONE } from '@/theme';

const ROWS = [
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10],
];

/** 1 to 10 in two rows of five, so every number is a full-size target. Tap the chosen one again to clear it. */
export function EffortPicker({ value, onChange }: { value: number | undefined; onChange: (v: number | undefined) => void }) {
  return (
    <View style={styles.wrap}>
      {ROWS.map((row) => (
        <View key={row[0]} style={styles.row}>
          {row.map((i) => {
            const on = value === i;
            return (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityLabel={`Effort ${i}`}
                accessibilityState={{ selected: on }}
                onPress={() => onChange(on ? undefined : i)}
                style={[styles.cell, on && { backgroundColor: TONE.strong.bg }]}>
                <Text style={[styles.num, on && { color: C.onAccent }]}>{i}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  row: { flexDirection: 'row', gap: 6 },
  cell: {
    flex: 1,
    height: SIZE.touch,
    borderRadius: R.small,
    backgroundColor: C.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  num: { ...T.body, fontWeight: '600', color: C.text },
});
