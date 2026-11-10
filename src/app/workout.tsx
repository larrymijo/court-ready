import Ionicons from '@expo/vector-icons/Ionicons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, IconButton, ProgressBar, Row, Tag, Txt } from '@/components/ui';
import { REST_BAR_SPACE, RestTimerBar } from '@/components/workout/RestTimerBar';
import { WarmupCard } from '@/components/workout/WarmupCard';
import { WorkoutExerciseCard } from '@/components/workout/WorkoutExerciseCard';
import { getRoutine } from '@/data/routines';
import { formatElapsed, formatVolume } from '@/lib/format';
import { confirm, successFeedback } from '@/lib/platform';
import { PHASES } from '@/lib/program';
import { workoutVolume } from '@/lib/stats';
import { useNow } from '@/lib/useNow';
import { useStore } from '@/store/useStore';
import { C, S, T } from '@/theme';

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
      <View style={[styles.header, { paddingTop: insets.top + 2 }]}>
        <View style={styles.headerSide}>
          <IconButton plain icon="chevron-down" size={24} label="Minimise workout" onPress={() => router.back()} />
        </View>
        <View style={styles.headerMiddle}>
          <Text style={styles.timer}>{formatElapsed(now - active.startedAt)}</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {doneSets} of {sets.length} sets · {formatVolume(volume)}
          </Text>
        </View>
        <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>
          <Button size="pill" variant="outline" title="Finish" onPress={onFinish} />
        </View>
      </View>
      <View style={styles.progress}>
        <ProgressBar value={sets.length ? doneSets / sets.length : 0} height={3} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: S.gutter,
          paddingHorizontal: S.gutter,
          gap: S.lg,
          paddingBottom: (rest ? REST_BAR_SPACE + S.xl : S.xl) + insets.bottom,
        }}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        <View style={{ gap: S.sm }}>
          {editingName ? (
            <TextInput
              autoFocus
              value={active.name}
              onChangeText={renameWorkout}
              onBlur={() => setEditingName(false)}
              accessibilityLabel="Workout name"
              style={styles.nameInput}
              enterKeyHint="done"
            />
          ) : (
            <Pressable accessibilityRole="button" accessibilityLabel={`${active.name}. Tap to rename.`} onPress={() => setEditingName(true)} style={styles.name}>
              <Txt v="hero">{active.name}</Txt>
            </Pressable>
          )}
          {active.week || active.gameMode ? (
            <Row gap={6} style={{ flexWrap: 'wrap' }}>
              {active.week ? <Tag label={`Week ${active.week}${active.phase ? ` · ${PHASES[active.phase].name}` : ''}`} /> : null}
              {active.gameMode ? <Tag label="Game mode" /> : null}
            </Row>
          ) : null}
          {active.phase ? <Txt v="small">{PHASES[active.phase].rule}</Txt> : null}
        </View>

        {routine ? <WarmupCard kind={routine.warmup} /> : null}

        {active.exercises.map((we, i) => {
          const header =
            we.group && we.group !== active.exercises[i - 1]?.group && routine ? routine.groups[we.group] : null;
          return (
            <View key={we.id} style={{ gap: S.sm }}>
              {header ? (
                <Txt v="small" color={C.text} style={{ fontWeight: '600', paddingHorizontal: S.xs }}>
                  {header}
                </Txt>
              ) : null}
              <WorkoutExerciseCard we={we} workout={active} isFirst={i === 0} phase={active.phase} />
            </View>
          );
        })}

        {active.exercises.length === 0 ? (
          <View style={styles.emptyList}>
            <Ionicons name="barbell-outline" size={28} color={C.textFaint} />
            <Txt v="small">Add your first exercise.</Txt>
          </View>
        ) : null}

        {routine?.shortOnTime ? <Txt v="caption">{routine.shortOnTime}</Txt> : null}

        <Button title="Add exercise" icon="add" variant="outline" onPress={() => router.push('/exercises?pick=1')} />
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
    paddingLeft: S.sm,
    paddingRight: S.md,
    paddingBottom: 2,
    gap: S.sm,
    backgroundColor: C.bg,
  },
  // Equal sides keep the timer in the middle of the screen.
  headerSide: { flex: 1 },
  headerMiddle: { alignItems: 'center', gap: 1 },
  timer: { ...T.button, color: C.text },
  headerSub: { fontSize: 12, lineHeight: 16, color: C.textFaint, fontVariant: ['tabular-nums'] },
  progress: { paddingHorizontal: S.gutter, paddingTop: S.sm },
  name: { minHeight: 44, justifyContent: 'center' },
  nameInput: {
    ...T.hero,
    color: C.text,
    borderBottomWidth: 1,
    borderBottomColor: C.text,
    minHeight: 44,
    paddingVertical: 2,
  },
  empty: { flex: 1, backgroundColor: C.bg, alignItems: 'center', gap: S.lg, padding: S.xl },
  emptyList: { alignItems: 'center', gap: S.sm, paddingVertical: S.xl },
});
