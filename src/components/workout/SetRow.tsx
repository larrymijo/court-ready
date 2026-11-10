import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { NumInput } from '@/components/NumInput';
import { Check } from '@/components/ui';
import { formatKg, formatSet } from '@/lib/format';
import { confirm, tapFeedback } from '@/lib/platform';
import type { PerformedSet } from '@/lib/progression';
import type { WorkoutSet } from '@/lib/types';
import { C, R, SIZE, T } from '@/theme';

/** Column widths. Everything you tap is a full 44 px wide; "previous" takes what is left. */
export const COL = { set: SIZE.touch, prev: 56, kg: 64, reps: 56, rir: SIZE.touch, check: SIZE.touch };

export function SetHeader({ weight }: { weight: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.head, { width: COL.set }]}>Set</Text>
      <Text style={[styles.head, { flex: 1, minWidth: COL.prev }]}>Previous</Text>
      {weight ? <Text style={[styles.head, { width: COL.kg }]}>kg</Text> : null}
      <Text style={[styles.head, { width: COL.reps }]}>Reps</Text>
      <Text style={[styles.head, { width: COL.rir }]}>RIR</Text>
      <View style={{ width: COL.check, alignItems: 'center' }}>
        <Ionicons name="checkmark" size={14} color={C.textFaint} />
      </View>
    </View>
  );
}

function prevText(prev: PerformedSet | undefined, weight: boolean, bodyweight: boolean): string {
  if (!prev || prev.reps == null) return '—';
  return formatSet({ tracking: weight ? 'weight_reps' : 'reps', equipment: bodyweight ? 'bodyweight' : 'other' }, prev.weight, prev.reps, true);
}

export interface SetGuess {
  weight: number | null;
  reps: number | null;
}

export function SetRow({
  set,
  label,
  prev,
  above,
  weight,
  bodyweight = false,
  repsPlaceholder,
  onChange,
  onToggleType,
  onRemove,
  onComplete,
  onUncomplete,
}: {
  set: WorkoutSet;
  label: string;
  /** Same set from the last time this exercise was done. */
  prev?: PerformedSet;
  /** Latest values typed in the sets above this one today (same set type). */
  above?: SetGuess;
  weight: boolean;
  bodyweight?: boolean;
  repsPlaceholder: string;
  onChange: (patch: Partial<WorkoutSet>) => void;
  onToggleType: () => void;
  onRemove: () => void;
  onComplete: (fill: SetGuess) => void;
  onUncomplete: () => void;
}) {
  const [missing, setMissing] = useState(false);
  const warm = set.type === 'warmup';

  // What an empty field means when you tick the set. The grey placeholder shows exactly this,
  // so what you see is what gets logged. Weight follows today's sets first (you rarely change
  // the load mid-exercise); reps follow last time's same set first (reps usually drop set to set).
  const weightGuess = weight ? (above?.weight ?? prev?.weight ?? null) : null;
  const repsGuess = prev?.reps ?? above?.reps ?? null;

  const tick = () => {
    if (set.done) {
      onUncomplete();
      return;
    }
    const reps = set.reps ?? repsGuess;
    if (reps == null) {
      setMissing(true);
      setTimeout(() => setMissing(false), 1500);
      return;
    }
    tapFeedback();
    onComplete({ weight: weight ? (set.weight ?? weightGuess) : null, reps });
  };

  const cycleRir = () => {
    const order: (number | null)[] = [null, 0, 1, 2, 3, 4];
    const i = order.indexOf(set.rir);
    onChange({ rir: order[(i + 1) % order.length] });
  };

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={warm ? 'Warm-up set. Tap to make it a working set, hold to remove it.' : `Set ${label}. Tap to make it a warm-up, hold to remove it.`}
        onPress={onToggleType}
        onLongPress={async () => {
          if (await confirm('Remove set?', 'This set will be deleted.', 'Remove', true)) onRemove();
        }}
        style={styles.target}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{warm ? 'W' : label}</Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={prev ? `Use last time's numbers: ${prevText(prev, weight, bodyweight)}` : 'No previous set'}
        style={styles.prevCell}
        disabled={!prev || set.done}
        onPress={() => onChange({ weight: weight ? (prev?.weight ?? null) : null, reps: prev?.reps ?? null })}>
        <Text style={styles.prev} numberOfLines={1}>
          {prevText(prev, weight, bodyweight)}
        </Text>
      </Pressable>
      {weight ? (
        <View style={{ width: COL.kg, paddingHorizontal: 3 }}>
          <NumInput
            value={set.weight}
            onChange={(v) => onChange({ weight: v })}
            placeholder={weightGuess != null && weightGuess > 0 ? formatKg(weightGuess) : bodyweight ? 'BW' : 'kg'}
            done={set.done}
            accessibilityLabel={`Set ${label} weight`}
          />
        </View>
      ) : null}
      <View style={{ width: COL.reps, paddingHorizontal: 3 }}>
        <NumInput
          value={set.reps}
          onChange={(v) => onChange({ reps: v == null ? null : Math.round(v) })}
          placeholder={repsGuess != null ? String(repsGuess) : repsPlaceholder}
          decimal={false}
          done={set.done}
          style={missing ? styles.missing : undefined}
          accessibilityLabel={`Set ${label} reps`}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Reps in reserve for set ${label}: ${set.rir ?? 'not set'}. Tap to change.`}
        onPress={cycleRir}
        style={styles.target}>
        <View style={[styles.rir, set.done && { backgroundColor: 'transparent' }]}>
          <Text style={[styles.rirText, set.rir != null && { color: C.text }]}>{set.rir ?? '–'}</Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: set.done }}
        accessibilityLabel={`Complete set ${label}`}
        onPress={tick}
        style={styles.target}>
        <Check done={set.done} size={28} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // The row reaches 8 px into the card's padding on both sides, so the first and last columns can
  // be full-size targets while the badge and the check still line up with the card's content.
  row: { flexDirection: 'row', alignItems: 'center', marginHorizontal: -8 },
  head: { ...T.smallest, fontWeight: '600', letterSpacing: 0.66, textTransform: 'uppercase', color: C.textFaint, textAlign: 'center' },
  target: { width: SIZE.touch, height: SIZE.touch, alignItems: 'center', justifyContent: 'center' },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 12, lineHeight: 16, fontWeight: '600', color: C.textMuted, fontVariant: ['tabular-nums'] },
  prevCell: { flex: 1, minWidth: COL.prev, height: SIZE.touch, justifyContent: 'center' },
  prev: { ...T.secondary, color: C.textMuted, textAlign: 'center' },
  rir: { width: 38, height: SIZE.touch, borderRadius: R.small, backgroundColor: C.control, alignItems: 'center', justifyContent: 'center' },
  rirText: { ...T.rowTitle, color: C.textFaint },
  // An empty reps field when you tick the set: the field lights up so you see what is missing.
  missing: { borderWidth: 1.5, borderColor: C.text },
});
