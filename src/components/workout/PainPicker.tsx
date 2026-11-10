import { Pressable, StyleSheet, Text, View } from 'react-native';

import { C, R, SIZE, T, TONE } from '@/theme';

/** From the guide's pain rules: 0–2 train as planned, 3 careful, 4 or more stop. Only 4+ is red. */
export function painTone(pain: number | null): 'plain' | 'danger' {
  return pain != null && pain >= 4 ? 'danger' : 'plain';
}

const ROWS = [
  [0, 1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10],
];

/** 0–10 pain scale. Two rows, so every number is a full-size target. */
export function PainPicker({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  return (
    <View style={styles.wrap}>
      {ROWS.map((row) => (
        <View key={row[0]} style={styles.row}>
          {row.map((i) => {
            const on = value === i;
            const stop = i >= 4;
            return (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityLabel={`Pain ${i}`}
                accessibilityState={{ selected: on }}
                onPress={() => onChange(on ? null : i)}
                style={[styles.cell, on && { backgroundColor: stop ? C.danger : TONE.strong.bg }]}>
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
