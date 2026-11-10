import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ItemBadge } from '@/components/ItemBadge';
import { Button, Check, Chip, IconButton, Row, Sheet, Txt, fieldStyle, type SheetAction } from '@/components/ui';
import { PainPicker, painTone } from '@/components/workout/PainPicker';
import { SetHeader, SetRow, type SetGuess } from '@/components/workout/SetRow';
import { EXERCISE_BY_ID, getExercise } from '@/data/exercises';
import { getRoutine } from '@/data/routines';
import { formatClock, formatKg, setLabels } from '@/lib/format';
import { repsText } from '@/lib/program';
import { lastPerformance, rampUpSets, suggestNext, type PerformedSet } from '@/lib/progression';
import type { PhaseId, Workout, WorkoutExercise, WorkoutSet } from '@/lib/types';
import { useStore } from '@/store/useStore';
import { C, R, S, T } from '@/theme';

export function WorkoutExerciseCard({
  we,
  workout,
  isFirst,
  phase,
}: {
  we: WorkoutExercise;
  workout: Workout;
  isFirst: boolean;
  phase?: PhaseId;
}) {
  const ex = getExercise(we.exerciseId);
  const workouts = useStore((s) => s.workouts);
  const settings = useStore((s) => s.settings);
  const updateSet = useStore((s) => s.updateSet);
  const completeSet = useStore((s) => s.completeSet);
  const uncompleteSet = useStore((s) => s.uncompleteSet);
  const toggleSetType = useStore((s) => s.toggleSetType);
  const removeSet = useStore((s) => s.removeSet);
  const addSet = useStore((s) => s.addSet);
  const insertWarmups = useStore((s) => s.insertWarmups);
  const setPain = useStore((s) => s.setPain);
  const setNote = useStore((s) => s.setNote);
  const removeExercise = useStore((s) => s.removeExercise);
  const swapExercise = useStore((s) => s.swapExercise);
  const startRest = useStore((s) => s.startRest);

  const [menu, setMenu] = useState(false);
  const [swapMenu, setSwapMenu] = useState(false);
  const [painOpen, setPainOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(we.note.length > 0);

  const last = useMemo(() => lastPerformance(we.exerciseId, workouts), [we.exerciseId, workouts]);
  const weight = ex.tracking === 'weight_reps';
  const target = we.target;
  const suggestion = target ? suggestNext(ex, target, last) : null;
  const routineItem = workout.routineId
    ? getRoutine(workout.routineId).items.find((i) => i.key === we.itemKey && i.exerciseId === we.exerciseId)
    : undefined;
  const cue = routineItem?.cue;
  const doneCount = we.sets.filter((s) => s.done).length;
  const workingWeight = we.sets.find((s) => s.type === 'normal')?.weight ?? null;
  const ramp = isFirst && weight && workingWeight ? rampUpSets(workingWeight, ex.increment || 1) : [];
  const hasWarmups = we.sets.some((s) => s.type === 'warmup');

  const repsPlaceholder = target ? (target.repsMin === target.repsMax ? `${target.repsMin}` : `${target.repsMin}-${target.repsMax}`) : '';

  // Per set: its label, the same set from last time, and the latest weight/reps typed in the sets
  // above it today (warm-ups and working sets tracked separately), so an empty field can follow
  // what you're actually lifting right now.
  const labels = setLabels(we.sets);
  const prevs: (PerformedSet | undefined)[] = [];
  const above: SetGuess[] = [];
  const seen: Record<WorkoutSet['type'], SetGuess> = {
    normal: { weight: null, reps: null },
    warmup: { weight: null, reps: null },
  };
  for (let i = 0; i < we.sets.length; i++) {
    const s = we.sets[i];
    prevs.push(s.type === 'normal' ? last?.sets[Number(labels[i]) - 1] : undefined);
    above.push({ ...seen[s.type] });
    if (s.weight != null) seen[s.type].weight = s.weight;
    if (s.reps != null) seen[s.type].reps = s.reps;
  }

  const actions: SheetAction[] = [
    { label: 'How to do it', icon: 'book-outline', onPress: () => router.push(`/exercise/${ex.id}`) },
    { label: 'Swap exercise', icon: 'swap-horizontal', onPress: () => setTimeout(() => setSwapMenu(true), 250) },
    { label: noteOpen ? 'Hide note' : 'Add a note', icon: 'create-outline', onPress: () => setNoteOpen(!noteOpen) },
    { label: 'Rate pain (0–10)', icon: 'medkit-outline', onPress: () => setPainOpen(true) },
    { label: 'Remove exercise', icon: 'trash-outline', destructive: true, onPress: () => removeExercise(we.id) },
  ];
  const swapActions: SheetAction[] = [
    ...ex.swaps
      .map((id) => EXERCISE_BY_ID[id])
      .filter(Boolean)
      .map((s) => ({ label: s.name, hint: s.muscles, icon: 'swap-horizontal' as const, onPress: () => swapExercise(we.id, s.id) })),
    { label: 'Browse all exercises', icon: 'search-outline', onPress: () => router.push(`/exercises?swap=${we.id}`) },
  ];

  const pain = we.pain;
  const addWeight = suggestion?.kind === 'increase' && phase !== 'deload';

  return (
    <View style={styles.card}>
      <Row gap={S.md} align="flex-start">
        {we.itemKey ? (
          <View style={styles.badge}>
            <ItemBadge label={we.itemKey} superset={!!we.group} />
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${ex.name}: how to do it`}
          style={styles.heading}
          onPress={() => router.push(`/exercise/${ex.id}`)}>
          <Text style={styles.name}>{ex.name}</Text>
          {target ? (
            <Text style={styles.target}>
              {target.sets} × {repsText(target, ex.perSide)} · RIR {target.rir} · rest {formatClock(we.restSec)}
            </Text>
          ) : (
            <Text style={styles.target}>Rest {formatClock(we.restSec)}</Text>
          )}
        </Pressable>
        <IconButton icon="ellipsis-horizontal" size={20} label={`Options for ${ex.name}`} onPress={() => setMenu(true)} />
      </Row>

      {cue ? (
        <Txt v="small">
          <Text style={styles.cueLabel}>Key: </Text>
          {cue}
        </Txt>
      ) : null}
      {suggestion ? (
        <Txt v="small" color={addWeight ? C.text : C.textFaint} style={addWeight ? { fontWeight: '600' } : null}>
          {phase === 'deload' && last
            ? `Deload week: same weight as last time, stop at RIR 3–4.`
            : suggestion.message}
        </Txt>
      ) : null}

      <Row gap={S.sm} style={{ flexWrap: 'wrap' }}>
        <Chip
          icon="medkit-outline"
          label={pain == null ? 'Pain: –' : `Pain: ${pain}/10`}
          tone={painTone(pain)}
          accessibilityLabel={pain == null ? 'Rate pain' : `Pain ${pain} of 10. Tap to change.`}
          onPress={() => setPainOpen(!painOpen)}
        />
        {ramp.length > 0 && !hasWarmups && doneCount === 0 ? (
          <Chip
            icon="trending-up"
            label={`Ramp-up: ${ramp.map((r) => `${formatKg(r.weight)}×${r.reps}`).join(' · ')}`}
            accessibilityLabel="Add ramp-up warm-up sets"
            style={{ flexShrink: 1 }}
            onPress={() => insertWarmups(we.id, ramp)}
          />
        ) : null}
      </Row>

      {painOpen ? (
        <View style={{ gap: S.sm }}>
          <PainPicker value={pain} onChange={(v) => setPain(we.id, v)} />
          <Txt v="caption">0–2 train as planned · 3 dull ache: OK, don’t add weight · 4+ or sharp: stop and swap</Txt>
        </View>
      ) : null}

      {pain != null && pain >= 4 ? (
        <View style={styles.alert}>
          <Txt v="h2" color={C.danger}>
            Stop this exercise today
          </Txt>
          <Txt v="small" color={C.text}>
            Pain 4+ or sharp means stop. Next time use less weight, a shorter range, or a swap. If it keeps happening for 2–3
            sessions, see a physio.
          </Txt>
          <Row gap={S.sm} style={{ flexWrap: 'wrap' }}>
            {ex.swaps
              .map((id) => EXERCISE_BY_ID[id])
              .filter(Boolean)
              .slice(0, 3)
              .map((s) => (
                <Chip key={s.id} icon="swap-horizontal" label={s.name} style={{ flexShrink: 1 }} onPress={() => swapExercise(we.id, s.id)} />
              ))}
            <Chip label="Pain rules" onPress={() => router.push('/guide/pain')} />
          </Row>
        </View>
      ) : null}

      <View style={styles.sets}>
        <SetHeader weight={weight} />
        {we.sets.map((s, i) => {
          return (
            <SetRow
              key={s.id}
              set={s}
              label={labels[i]}
              prev={prevs[i]}
              above={above[i]}
              weight={weight}
              bodyweight={ex.equipment === 'bodyweight'}
              repsPlaceholder={repsPlaceholder}
              onChange={(patch) => updateSet(we.id, s.id, patch)}
              onToggleType={() => toggleSetType(we.id, s.id)}
              onRemove={() => removeSet(we.id, s.id)}
              onUncomplete={() => uncompleteSet(we.id, s.id)}
              onComplete={(fill) => {
                const rest = completeSet(we.id, s.id, fill);
                if (settings.restTimer && s.type === 'normal') startRest(rest, ex.name);
              }}
            />
          );
        })}
      </View>
      <Button small variant="secondary" icon="add" title="Add set" onPress={() => addSet(we.id)} />

      {noteOpen ? (
        <TextInput
          value={we.note}
          onChangeText={(t) => setNote(we.id, t)}
          placeholder="Note (seat height, grip, how it felt…)"
          placeholderTextColor={C.textFaint}
          accessibilityLabel={`Note for ${ex.name}`}
          multiline
          style={fieldStyle}
        />
      ) : null}

      {doneCount > 0 && doneCount === we.sets.length ? (
        <Row gap={S.sm}>
          <Check done size={16} />
          <Txt v="small" color={C.text}>
            All sets done
          </Txt>
        </Row>
      ) : null}

      <Sheet visible={menu} title={ex.name} actions={actions} onClose={() => setMenu(false)} />
      <Sheet visible={swapMenu} title={`Swap ${ex.name}`} actions={swapActions} onClose={() => setSwapMenu(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.surface, borderRadius: R.card, padding: S.lg, gap: S.md },
  // Lines the round badge up with the first line of the exercise name.
  badge: { marginTop: 8 },
  heading: { flex: 1, minHeight: 44, justifyContent: 'center', gap: 2 },
  name: { ...T.button, color: C.text },
  target: { ...T.secondary, color: C.textMuted },
  cueLabel: { fontWeight: '600', color: C.text },
  // Pain 4+ is the one place besides delete where the app uses red.
  alert: { borderWidth: 1, borderColor: C.danger, borderRadius: R.control, padding: S.md, gap: S.sm },
  sets: { gap: 6 },
});
