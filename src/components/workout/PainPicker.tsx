import { Pressable, StyleSheet, Text, View } from 'react-native';

import { C } from '@/theme';

export function painColor(p: number): string {
  if (p <= 2) return C.green;
  if (p === 3) return C.amber;
  return C.red;
}

/** 0–10 pain scale from the guide's pain rules. */
export function PainPicker({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: 11 }, (_, i) => {
        const on = value === i;
        const color = painColor(i);
        return (
          <Pressable
            key={i}
            accessibilityLabel={`Pain ${i}`}
            onPress={() => onChange(on ? null : i)}
            style={[styles.dot, { borderColor: color }, on && { backgroundColor: color }]}>
            <Text style={[styles.num, { color: on ? '#0B0D12' : color }]}>{i}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 3 },
  dot: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  num: { fontSize: 12, fontWeight: '800' },
});
