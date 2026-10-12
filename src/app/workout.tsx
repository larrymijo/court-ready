import Ionicons from '@expo/vector-icons/Ionicons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip, Row, Txt } from '@/components/ui';
import { RestTimerBar } from '@/components/workout/RestTimerBar';
import { WarmupCard } from '@/components/workout/WarmupCard';
import { WorkoutExerciseCard } from '@/components/workout/WorkoutExerciseCard';
import { getRoutine } from '@/data/routines';
import { formatElapsed, formatVolume } from '@/lib/format';
import { confirm, successFeedback } from '@/lib/platform';
import { PHASES } from '@/lib/program';
import { workoutVolume } from '@/lib/stats';
import { useNow } from '@/lib/useNow';
import { useStore } from '@/store/useStore';
import { C, R, S } from '@/theme';

export default function WorkoutScreen() {
  const active = useStore((s) => s.active);
  const keepAwake = useStore((s) => s.settings.keepAwake);
  const finishWorkout = useStore((s) => s.finishWorkout);
  const discardWorkout = useStore((s) => s.discardWorkout);
  const renameWorkout = useStore((s) => s.renameWorkout);
  const rest = useStore((s) => s.rest);
  const insets = useSafeAreaInsets();
  const now = useNow(1000, !!active);
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    if (!keepAwake || !active) return;
    activateKeepAwakeAsync('workout').catch(() => {});
    return () => {
      deactivateKeepAwake('workout').catch(() => {});
    };
  }, [keepAwake, active]);

  if (!active) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top + S.xl }]}>
        <Txt v="h1">No workout in progress</Txt>
        <Button title="Back" variant="secondary" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      </View>
    );
  }

  const routine = active.routineId ? getRoutine(active.routineId) : null;
  const sets = active.exercises.flatMap((e) => e.sets);
  const doneSets = sets.filter((s) => s.done).length;
  const volume = workoutVolume({ ...active, exercises: active.exercises });

  const onFinish = async () => {
    const logged = active.exercises.some((e) => e.sets.some((s) => s.done && (s.reps ?? 0) > 0));
    if (!logged) {
      const discard = await confirm(
        'Nothing logged yet',
        'Tick at least one set to save this workout. Discard it instead?',
        'Discard',
        true,
      );
      if (discard) {
        discardWorkout();
        router.back();
      }
      return;
    }
    const open = sets.length - doneSets;
    if (open > 0) {
      const ok = await confirm(
        'Finish workout?',
        `${open} set${open === 1 ? ' isn’t' : 's aren’t'} ticked and won’t be saved.`,
        'Finish',
      );
      if (!ok) return;
    }
    const id = finishWorkout();
    if (id) {
      successFeedback();
      router.replace(`/history/${id}?new=1`);
    }
  };

  const onDiscard = async () => {
    if (await confirm('Discard workout?', 'Everything you logged in this workout will be deleted.', 'Discard', true)) {
      discardWorkout();
      router.back();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[styles.header, { paddingTop: insets.top + S.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.headerBtn} accessibilityLabel="Minimise workout">
          <Ionicons name="chevron-down" size={24} color={C.text} />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.timer}>{formatElapsed(now - active.startedAt)}</Text>
          <Text style={styles.headerSub}>
            {doneSets}/{sets.length} sets · {formatVolume(volume)}
          </Text>
        </View>
        <Pressable onPress={onFinish} style={styles.finish} accessibilityRole="button">
          <Text style={styles.finishText}>Finish</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: S.md, gap: S.md, paddingBottom: (rest ? 140 : 60) + insets.bottom }}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        <View style={{ gap: 6 }}>
          {editingName ? (
            <TextInput
              autoFocus
              value={active.name}
              onChangeText={renameWorkout}
              onBlur={() => setEditingName(false)}
              style={styles.nameInput}
              returnKeyType="done"
            />
          ) : (
            <Pressable onPress={() => setEditingName(true)}>
              <Txt v="title">{active.name}</Txt>
            </Pressable>
          )}
          <Row gap={S.sm} style={{ flexWrap: 'wrap' }}>
            {active.week ? (
              <Chip
                label={`Week ${active.week} · ${active.phase ? PHASES[active.phase].name : ''}`}
                tone={active.phase === 'push' ? 'orange' : active.phase === 'deload' ? 'ok' : 'info'}
              />
            ) : null}
            {active.gameMode ? <Chip label="Game mode" tone="orange" /> : null}
          </Row>
          {active.phase ? <Txt v="small">{PHASES[active.phase].rule}</Txt> : null}
        </View>

        {routine ? <WarmupCard kind={routine.warmup} /> : null}

        {active.exercises.map((we, i) => {
          const header =
            we.group && we.group !== active.exercises[i - 1]?.group && routine ? routine.groups[we.group] : null;
          return (
            <View key={we.id} style={{ gap: S.sm }}>
              {header ? (
                <Txt v="small" color={C.orange} style={{ fontWeight: '700' }}>
                  {header}
                </Txt>
              ) : null}
              <WorkoutExerciseCard we={we} workout={active} isFirst={i === 0} phase={active.phase} />
            </View>
          );
        })}

        {active.exercises.length === 0 ? (
          <View style={styles.emptyList}>
            <Ionicons name="barbell-outline" size={32} color={C.faint} />
            <Txt v="small">Add your first exercise.</Txt>
          </View>
        ) : null}

        {routine?.shortOnTime ? <Txt v="tiny">{routine.shortOnTime}</Txt> : null}

        <Button title="Add exercise" icon="add" variant="secondary" onPress={() => router.push('/exercises?pick=1')} />
        <Button title="Discard workout" variant="danger" onPress={onDiscard} />
      </ScrollView>

      <RestTimerBar />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: S.md,
    paddingBottom: S.sm,
    gap: S.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
    backgroundColor: C.bg,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  timer: { color: C.text, fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
  headerSub: { color: C.muted, fontSize: 12, fontVariant: ['tabular-nums'] },
  finish: { backgroundColor: C.green, borderRadius: R.sm, paddingHorizontal: 16, paddingVertical: 10 },
  finishText: { color: '#06150D', fontWeight: '800', fontSize: 15 },
  nameInput: {
    color: C.text,
    fontSize: 28,
    fontWeight: '800',
    borderBottomWidth: 1,
    borderBottomColor: C.accent,
    paddingVertical: 2,
  },
  empty: { flex: 1, backgroundColor: C.bg, alignItems: 'center', gap: S.lg, padding: S.xl },
  emptyList: { alignItems: 'center', gap: S.sm, paddingVertical: S.xl },
});
