import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChecklistMovementPreviews } from '@/components/MovementLoop';
import { Check, IconButton, Txt } from '@/components/ui';
import { checklist } from '@/data/checklists';
import { findExercise } from '@/lib/exerciseCatalog';
import { useStore } from '@/store/useStore';
import { C, R, S, SIZE, T } from '@/theme';

/** The warm-up checklist at the top of a workout. Folds away once every step is ticked. */
export function WarmupCard({ kind }: { kind: 'upper' | 'lower' }) {
  const checked = useStore((s) => s.warmupChecked);
  const toggle = useStore((s) => s.toggleWarmup);
  const w = checklist(kind)!;
  const allDone = checked.length >= w.steps.length;
  const [open, setOpen] = useState(!allDone);

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
        style={styles.header}>
        {allDone ? <Check done size={24} /> : <Ionicons name="flame-outline" size={22} color={C.textMuted} />}
        <Txt v="h2" style={{ flex: 1 }} numberOfLines={1}>
          {w.title}
        </Txt>
        <Txt v="small">
          {Math.min(checked.length, w.steps.length)} of {w.steps.length}
        </Txt>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={C.textFaint} />
      </Pressable>
      {open
        ? w.steps.map((step, i) => {
            const on = checked.includes(i);
            const howTo = step.exerciseIds?.map((id) => findExercise(id)).find((ex) => ex !== undefined);
            return (
              <View key={i}>
                <View style={styles.step}>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                    accessibilityLabel={step.text}
                    onPress={() => toggle(i)}
                    style={styles.stepMain}>
                    <Check done={on} size={24} />
                    <Text style={[styles.text, on && styles.textOn]}>{step.text}</Text>
                  </Pressable>
                  {howTo ? (
                    <IconButton
                      plain
                      icon="information-circle-outline"
                      color={C.textFaint}
                      label={`How to do ${howTo.name}`}
                      onPress={() => router.push(`/exercise/${howTo.id}`)}
                    />
                  ) : null}
                </View>
                <ChecklistMovementPreviews ids={step.exerciseIds} />
              </View>
            );
          })
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.surface, borderRadius: R.card, paddingHorizontal: S.lg, paddingVertical: S.xs },
  header: { flexDirection: 'row', alignItems: 'center', gap: S.md, minHeight: SIZE.button },
  step: { flexDirection: 'row', alignItems: 'center', gap: S.xs, marginRight: -S.sm },
  stepMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: S.md, minHeight: SIZE.touch, paddingVertical: 6 },
  text: { ...T.body, flex: 1, color: C.text },
  textOn: { color: C.textFaint, textDecorationLine: 'line-through' },
});
