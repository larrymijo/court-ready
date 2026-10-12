import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Row, Txt } from '@/components/ui';
import { WARMUPS } from '@/data/guide';
import { useStore } from '@/store/useStore';
import { C, R, S } from '@/theme';

export function WarmupCard({ kind }: { kind: 'upper' | 'lower' }) {
  const checked = useStore((s) => s.warmupChecked);
  const toggle = useStore((s) => s.toggleWarmup);
  const w = WARMUPS[kind];
  const allDone = checked.length >= w.steps.length;
  const [open, setOpen] = useState(!allDone);

  return (
    <View style={styles.card}>
      <Pressable onPress={() => setOpen(!open)}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Row gap={S.sm}>
            <Ionicons name={allDone ? 'checkmark-circle' : 'flame-outline'} size={20} color={allDone ? C.green : C.orange} />
            <Txt v="h2">{w.title}</Txt>
          </Row>
          <Row gap={S.sm}>
            <Txt v="small">
              {Math.min(checked.length, w.steps.length)}/{w.steps.length}
            </Txt>
            <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={C.faint} />
          </Row>
        </Row>
      </Pressable>
      {open
        ? w.steps.map((step, i) => {
            const on = checked.includes(i);
            return (
              <Row key={i} gap={S.md}>
                <Pressable onPress={() => toggle(i)} hitSlop={8} style={[styles.box, on && styles.boxOn]}>
                  {on ? <Ionicons name="checkmark" size={16} color="#06150D" /> : null}
                </Pressable>
                <Pressable style={{ flex: 1 }} onPress={() => toggle(i)}>
                  <Text style={[styles.text, on && styles.textOn]}>{step.text}</Text>
                </Pressable>
                {step.exerciseId ? (
                  <Pressable onPress={() => router.push(`/exercise/${step.exerciseId}`)} hitSlop={8}>
                    <Ionicons name="information-circle-outline" size={20} color={C.faint} />
                  </Pressable>
                ) : null}
              </Row>
            );
          })
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    padding: S.md,
    gap: S.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.border,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: C.faint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: C.green, borderColor: C.green },
  text: { color: C.text, fontSize: 15 },
  textOn: { color: C.muted, textDecorationLine: 'line-through' },
});
