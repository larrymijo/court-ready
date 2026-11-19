import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Check, IconButton, Sheet, Txt } from '@/components/ui';
import { findExercise, getExercise } from '@/lib/exerciseCatalog';
import type { Checklist, ChecklistStep } from '@/lib/types';
import { C, R, S, SIZE, T } from '@/theme';

/** The drills or stretches a step links to that this app has. */
function linkedIds(step: ChecklistStep): string[] {
  return (step.exerciseIds ?? []).filter((id) => findExercise(id));
}

/** The step's words before the first dash or dot: "Cross-body stretch" for the how-to's label. */
function shortName(step: ChecklistStep): string {
  return step.text.split(' — ')[0].split(' · ')[0];
}

/**
 * A warm-up or cool-down to tick, step by step: the sport session's warm-up and cool-down and the
 * gym cool-down. A step that links to a drill or a stretch has a how-to button at its end; with
 * one drill it opens its page, with several it first asks which one.
 */
export function ChecklistCard({
  checklist,
  checked,
  onToggle,
  headerRight,
}: {
  checklist: Checklist;
  /** Indexes of the ticked steps. */
  checked: readonly number[];
  onToggle: (index: number) => void;
  /** Something at the end of the title row, such as a Skip button. */
  headerRight?: ReactNode;
}) {
  const [choosing, setChoosing] = useState<ChecklistStep | null>(null);
  const total = checklist.steps.length;
  const count = checklist.steps.filter((_, i) => checked.includes(i)).length;

  const openHowTo = (step: ChecklistStep) => {
    const ids = linkedIds(step);
    if (ids.length === 1) router.push(`/exercise/${ids[0]}`);
    else if (ids.length > 1) setChoosing(step);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Txt v="bar" style={{ flex: 1 }} accessibilityRole="header">
          {checklist.title}
        </Txt>
        <Txt v="small">
          {count} of {total}
        </Txt>
        {headerRight}
      </View>
      {checklist.steps.map((step, i) => {
        const on = checked.includes(i);
        const linked = linkedIds(step).length > 0;
        return (
          <View key={i} style={styles.step}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={step.text}
              onPress={() => onToggle(i)}
              style={styles.stepMain}>
              <Check done={on} size={24} />
              <Text style={[styles.text, on && styles.textOn]}>{step.text}</Text>
            </Pressable>
            {linked ? (
              <IconButton
                plain
                icon="information-circle-outline"
                color={C.textFaint}
                label={`How to do it: ${shortName(step)}`}
                onPress={() => openHowTo(step)}
              />
            ) : (
              <View style={styles.noLink} />
            )}
          </View>
        );
      })}
      <Sheet
        visible={choosing !== null}
        title="How to do it"
        subtitle={choosing ? shortName(choosing) : undefined}
        actions={(choosing ? linkedIds(choosing) : []).map((id) => ({
          label: getExercise(id).name,
          icon: 'information-circle-outline' as const,
          onPress: () => router.push(`/exercise/${id}`),
        }))}
        onClose={() => setChoosing(null)}
        closeLabel="Close"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: R.card,
    paddingTop: S.xs,
    paddingBottom: S.sm,
    paddingLeft: S.lg,
    paddingRight: S.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: S.md, minHeight: 52, paddingRight: S.sm },
  step: { flexDirection: 'row', alignItems: 'center', gap: S.xs },
  stepMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: S.md, minHeight: SIZE.touch, paddingVertical: 6 },
  noLink: { width: SIZE.touch, flexShrink: 0 },
  text: { ...T.body, flex: 1, color: C.text },
  textOn: { color: C.textFaint, textDecorationLine: 'line-through' },
});
