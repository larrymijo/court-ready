import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChecklistCard } from '@/components/ChecklistCard';
import { SessionBar } from '@/components/sport/SessionBar';
import { Button, Card, Check, IconButton, ProgressBar, Row, Txt } from '@/components/ui';
import { useExerciseLookup } from '@/store/useExerciseLookup';
import { formatElapsed } from '@/lib/format';
import { useNow } from '@/lib/useNow';
import type { Checklist, Workout } from '@/lib/types';
import { useStore } from '@/store/useStore';
import { C, S, T } from '@/theme';

/**
 * The end of a gym workout that has a cool-down: after Finish, the checklist to tick or skip, then
 * the workout is saved. `onFinish(true)` is "finished through the cool-down", `onFinish(false)` is
 * "skipped it". The ticks are the store's `cooldownChecked`, so they survive a reload.
 */
export function GymCooldown({
  workout,
  cooldown,
  onFinish,
  onBack,
}: {
  workout: Workout;
  cooldown: Checklist;
  onFinish: (cooldownDone: boolean) => void;
  /** Back to the sets. */
  onBack: () => void;
}) {
  const checked = useStore((s) => s.cooldownChecked);
  const lookup = useExerciseLookup();
  const toggle = useStore((s) => s.toggleCooldownStep);
  const insets = useSafeAreaInsets();
  const now = useNow(1000, true);

  const sets = workout.exercises.flatMap((e) => e.sets);
  const doneSets = sets.filter((s) => s.done).length;
  const allDone = doneSets === sets.length;
  const last = workout.exercises[workout.exercises.length - 1];
  const lastDone = last ? last.sets.filter((s) => s.done).length : 0;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[styles.header, { paddingTop: insets.top + 2 }]}>
        <View style={styles.side}>
          <IconButton plain icon="chevron-down" size={24} label="Minimise workout" onPress={() => router.back()} />
        </View>
        <View style={styles.middle}>
          <Text style={styles.timer}>{formatElapsed(now - workout.startedAt)}</Text>
          <Text style={styles.sub}>
            {doneSets} of {sets.length} sets
          </Text>
        </View>
        <View style={styles.side} />
      </View>
      <View style={styles.progress}>
        <ProgressBar value={sets.length ? doneSets / sets.length : 0} height={3} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={{ gap: 2 }}>
          <Txt v="label" numberOfLines={1}>
            {workout.name} · {allDone ? 'all sets done' : `${doneSets} of ${sets.length} sets done`}
          </Txt>
          <Txt v="h1" accessibilityRole="header">
            Cool down, then finish
          </Txt>
        </View>

        {last ? (
          <Card style={{ paddingVertical: S.md }}>
            <Row gap={S.md}>
              <Check done={last.sets.length > 0 && lastDone === last.sets.length} size={24} />
              <View style={{ flex: 1 }}>
                <Txt v="body" numberOfLines={1}>
                  Exercise {workout.exercises.length} of {workout.exercises.length} · {lookup.get(last.exerciseId).name}
                </Txt>
                <Txt v="small">
                  {lastDone} {lastDone === 1 ? 'set' : 'sets'} done
                </Txt>
              </View>
            </Row>
          </Card>
        ) : null}

        <ChecklistCard
          checklist={cooldown}
          checked={checked}
          onToggle={toggle}
          headerRight={<Button title="Skip" variant="ghost" accessibilityLabel="Skip the cool-down and finish" onPress={() => onFinish(false)} />}
        />
        <Button title="Back to the sets" variant="ghost" onPress={onBack} />
      </ScrollView>

      <SessionBar>
        <Button title="Finish workout" icon="checkmark" onPress={() => onFinish(true)} />
      </SessionBar>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingLeft: S.sm, paddingRight: S.md, paddingBottom: 2, gap: S.sm, backgroundColor: C.bg },
  side: { flex: 1, alignItems: 'flex-start' },
  middle: { alignItems: 'center', gap: 1 },
  timer: { ...T.button, color: C.text },
  sub: { fontSize: 12, lineHeight: 16, color: C.textFaint, fontVariant: ['tabular-nums'] },
  progress: { paddingHorizontal: S.gutter, paddingTop: S.sm },
  body: { paddingTop: S.gutter, paddingHorizontal: S.gutter, paddingBottom: S.lg, gap: S.md },
});
