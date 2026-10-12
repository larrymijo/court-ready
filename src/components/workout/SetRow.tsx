import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { NumInput } from '@/components/NumInput';
import { formatKg, formatSet } from '@/lib/format';
import { confirm, tapFeedback } from '@/lib/platform';
import type { PerformedSet } from '@/lib/progression';
import type { WorkoutSet } from '@/lib/types';
import { C, R } from '@/theme';

export const COL = { set: 30, prev: 70, kg: 62, reps: 60, rir: 38, check: 40 };

export function SetHeader({ weight }: { weight: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.head, { width: COL.set }]}>SET</Text>
      <Text style={[styles.head, { flex: 1, minWidth: COL.prev }]}>PREVIOUS</Text>
      {weight ? <Text style={[styles.head, { width: COL.kg }]}>KG</Text> : null}
      <Text style={[styles.head, { width: COL.reps }]}>REPS</Text>
      <Text style={[styles.head, { width: COL.rir }]}>RIR</Text>
      <View style={{ width: COL.check, alignItems: 'center' }}>
        <Ionicons name="checkmark" size={14} color={C.faint} />
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
    <View style={[styles.row, styles.setRow, set.done && styles.doneRow]}>
      <Pressable
        onPress={onToggleType}
        onLongPress={async () => {
          if (await confirm('Remove set?', 'This set will be deleted.', 'Remove', true)) onRemove();
        }}
        hitSlop={6}
        style={{ width: COL.set, alignItems: 'center' }}>
        <Text style={[styles.setLabel, warm && { color: C.amber }]}>{warm ? 'W' : label}</Text>
      </Pressable>
      <Pressable
        style={{ flex: 1, minWidth: COL.prev }}
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
          style={missing ? { borderWidth: 1.5, borderColor: C.red } : undefined}
          accessibilityLabel={`Set ${label} reps`}
        />
      </View>
      <Pressable onPress={cycleRir} style={{ width: COL.rir, alignItems: 'center' }} hitSlop={4}>
        <View style={[styles.rir, set.rir != null && { backgroundColor: C.accentSoft }]}>
          <Text style={[styles.rirText, set.rir != null && { color: C.accent }]}>{set.rir ?? '–'}</Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: set.done }}
        accessibilityLabel={`Complete set ${label}`}
        onPress={tick}
        hitSlop={6}
        style={{ width: COL.check, alignItems: 'center' }}>
        <View style={[styles.check, set.done && styles.checkOn]}>
          <Ionicons name="checkmark" size={20} color={set.done ? '#06150D' : C.faint} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  setRow: { paddingVertical: 4, borderRadius: R.sm },
  doneRow: { backgroundColor: 'rgba(52,199,123,0.10)' },
  head: { color: C.faint, fontSize: 10, fontWeight: '800', letterSpacing: 0.6, textAlign: 'center' },
  setLabel: { color: C.text, fontWeight: '800', fontSize: 15 },
  prev: { color: C.muted, fontSize: 13, textAlign: 'center', fontVariant: ['tabular-nums'] },
  rir: { width: 32, height: 32, borderRadius: 8, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  rirText: { color: C.faint, fontWeight: '700', fontSize: 14 },
  check: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: C.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: C.green },
});
