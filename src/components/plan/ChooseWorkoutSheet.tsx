import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Check, Sheet, Txt } from '@/components/ui';
import { DAY_LONG } from '@/data/schedule';
import { chooseWorkoutView, type ChooseWorkoutItem } from '@/lib/planView';
import type { Plan, Workout } from '@/lib/types';
import { C, S } from '@/theme';

/** "Back and chest" -> "back and chest", but "PR day" stays. */
function lower(s: string): string {
  return s.length > 1 && s[1] === s[1].toLowerCase() ? s[0].toLowerCase() + s.slice(1) : s;
}

function lineFor(item: ChooseWorkoutItem, where: 'today' | 'week' | 'other'): string {
  if (where === 'other') return `${item.exerciseCount} exercises · ${item.minutes} min`;
  const day = item.plannedWeekday != null ? DAY_LONG[item.plannedWeekday] : undefined;
  if (item.done && where === 'week') {
    return `Done on ${item.doneOnWeekday != null ? DAY_LONG[item.doneOnWeekday] : (day ?? 'this week')}`;
  }
  const parts: string[] = [];
  if (item.optional) parts.push('Optional');
  if (where === 'week' && day) parts.push(day);
  if (!item.optional && item.focus) parts.push(where === 'week' ? lower(item.focus) : item.focus);
  parts.push(`${item.minutes} min`);
  return parts.join(' · ');
}

/**
 * "Choose another workout": starts any gym workout of any saved plan, or an empty workout. It never
 * changes the plan in use.
 */
export function ChooseWorkoutSheet({
  visible,
  plans,
  activePlanId,
  workouts,
  today,
  onStart,
  onStartEmpty,
  onClose,
}: {
  visible: boolean;
  plans: readonly Plan[];
  activePlanId: string;
  workouts: readonly Workout[];
  today: string;
  onStart: (planId: string, workoutId: string) => void;
  onStartEmpty: () => void;
  onClose: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const view = chooseWorkoutView(plans, activePlanId, workouts, today);
  const active = plans.find((p) => p.id === activePlanId);
  const rest: (ChooseWorkoutItem & { other?: boolean })[] = [...view.restOfWeek, ...view.otherInPlan.map((i) => ({ ...i, other: true }))];

  const row = (item: ChooseWorkoutItem & { other?: boolean }, where: 'today' | 'week' | 'other', opts: { divider: boolean; planName?: string; nested?: boolean; primary?: boolean }) => (
    <View key={`${item.planId}-${item.workoutId}-${item.plannedWeekday ?? 'x'}`} style={[styles.row, opts.divider && styles.divider, opts.nested && { paddingLeft: S.lg }]}>
      {opts.nested ? null : (
        <View style={[styles.badge, item.done && where === 'week' && { backgroundColor: C.text }]}>
          {item.done && where === 'week' ? (
            <Check done size={32} />
          ) : item.optional ? (
            <Ionicons name="add" size={18} color={C.textMuted} />
          ) : (
            <View style={styles.dot} />
          )}
        </View>
      )}
      <View style={styles.text}>
        <Txt v="h2" style={opts.nested ? { fontSize: 15 } : undefined}>
          {item.name}
        </Txt>
        <Txt v="small">{lineFor(item, where)}</Txt>
      </View>
      <Button
        size="pill"
        variant={opts.primary ? 'primary' : 'outline'}
        title="Start"
        accessibilityLabel={`Start ${item.name}${item.done && where === 'week' ? ' again' : ''}${opts.planName ? ` from ${opts.planName}` : ''}`}
        onPress={() => onStart(item.planId, item.workoutId)}
      />
    </View>
  );

  return (
    <Sheet
      visible={visible}
      title="Choose a workout"
      subtitle="Your plan stays as it is. Today’s session waits for you."
      onClose={onClose}>
      {view.today.length > 0 ? (
        <>
          <Txt v="label" style={styles.section}>
            Today
          </Txt>
          {view.today.map((item, i) => row(item, 'today', { divider: i < view.today.length - 1, primary: !item.optional && !item.done }))}
        </>
      ) : null}

      {rest.length > 0 ? (
        <>
          <Txt v="label" style={styles.section}>
            Rest of this week{active ? ` · ${active.name}` : ''}
          </Txt>
          {rest.map((item, i) => row(item, item.other ? 'other' : 'week', { divider: i < rest.length - 1 }))}
        </>
      ) : null}

      {view.otherPlans.length > 0 ? (
        <>
          <Txt v="label" style={styles.section}>
            Your other plans
          </Txt>
          {view.otherPlans.map((p) => {
            const expanded = open === p.planId;
            return (
              <View key={p.planId}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  accessibilityLabel={`${p.planName}: ${expanded ? 'hide' : 'show'} its workouts`}
                  onPress={() => setOpen(expanded ? null : p.planId)}
                  style={[styles.planRow, !expanded && styles.divider]}>
                  <View style={styles.text}>
                    <Txt v="h2">{p.planName}</Txt>
                    <Txt v="small">{p.workouts.map((w) => w.name).join(', ')}</Txt>
                  </View>
                  <View style={styles.chevron}>
                    <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={C.textFaint} />
                  </View>
                </Pressable>
                {expanded
                  ? p.workouts.map((w, i) =>
                      row(w, 'other', { divider: i === p.workouts.length - 1, nested: true, planName: p.planName }),
                    )
                  : null}
              </View>
            );
          })}
        </>
      ) : null}

      <View style={[styles.row, { marginTop: S.md }]}>
        <View style={styles.badge}>
          <Ionicons name="create-outline" size={18} color={C.textMuted} />
        </View>
        <View style={styles.text}>
          <Txt v="h2">Empty workout</Txt>
          <Txt v="small">Pick exercises as you go</Txt>
        </View>
        <Button size="pill" variant="outline" title="Start" accessibilityLabel="Start an empty workout" onPress={onStartEmpty} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 14, marginBottom: 6 },
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: S.md },
  divider: { borderBottomWidth: 1, borderBottomColor: C.hairline },
  badge: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.control, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.text },
  text: { flex: 1, minWidth: 0, gap: 2 },
  planRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: S.md },
  chevron: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
