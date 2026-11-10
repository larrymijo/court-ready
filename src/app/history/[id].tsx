import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ItemBadge } from '@/components/ItemBadge';
import { BOTTOM_BAR_SPACE, BottomBar, Button, Card, Divider, Row, Screen, SectionTitle, StatTile, Tag, Txt } from '@/components/ui';
import { painTone } from '@/components/workout/PainPicker';
import { EXERCISE_BY_ID } from '@/data/exercises';
import { formatDateLong, formatDuration, formatKg, formatSet, formatTime, formatVolume, plural, setLabels } from '@/lib/format';
import { confirm } from '@/lib/platform';
import { PHASES } from '@/lib/program';
import { workoutDurationMs, workoutSetCount, workoutVolume } from '@/lib/stats';
import type { PR } from '@/lib/types';
import { useStore } from '@/store/useStore';
import { C, S, T } from '@/theme';

const PR_LABEL: Record<PR['kind'], string> = {
  weight: 'Heaviest weight',
  e1rm: 'Best estimated 1RM',
  volume: 'Best set volume',
  reps: 'Most reps',
};

function prValue(pr: PR): string {
  if (pr.kind === 'reps') return `${pr.reps} reps`;
  if (pr.kind === 'e1rm') return `${formatKg(Math.round(pr.value * 10) / 10)} kg (${formatKg(pr.weight)} × ${pr.reps})`;
  if (pr.kind === 'volume') return `${formatKg(pr.weight)} kg × ${pr.reps}`;
  return `${formatKg(pr.weight)} kg × ${pr.reps}`;
}

export default function WorkoutDetailScreen() {
  const { id, new: isNew } = useLocalSearchParams<{ id: string; new?: string }>();
  const workout = useStore((s) => s.workouts.find((w) => w.id === id));
  const deleteWorkout = useStore((s) => s.deleteWorkout);
  if (!workout) {
    return (
      <Screen edgesTop={false}>
        <Txt>Workout not found.</Txt>
      </Screen>
    );
  }

  const onDelete = async () => {
    if (await confirm('Delete workout?', 'This removes it from your history and charts.', 'Delete', true)) {
      deleteWorkout(workout.id);
      router.back();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Stack.Screen options={{ title: isNew ? 'Workout complete' : workout.name }} />
      <Screen edgesTop={false} bottomPad={isNew ? BOTTOM_BAR_SPACE : S.xl}>
        {isNew ? (
          <Card variant="hero" style={{ alignItems: 'center' }}>
            <Ionicons name="trophy-outline" size={36} color={C.text} />
            <View style={{ gap: 4, alignItems: 'center' }}>
              <Txt v="hero">Nice work</Txt>
              <Txt color={C.textMuted} style={{ textAlign: 'center' }}>
                {workout.prs?.length
                  ? `You set ${plural(workout.prs.length, 'personal record')}.`
                  : 'Logged. Beat these numbers next time.'}
              </Txt>
            </View>
          </Card>
        ) : null}

        <View style={{ gap: S.sm }}>
          <View style={{ gap: 2 }}>
            <Txt v="title">{workout.name}</Txt>
            <Txt color={C.textMuted}>
              {formatDateLong(workout.startedAt)} · {formatTime(workout.startedAt)}
            </Txt>
          </View>
          {workout.week || workout.gameMode ? (
            <Row gap={6} style={{ flexWrap: 'wrap' }}>
              {workout.week ? <Tag label={`Week ${workout.week}${workout.phase ? ` · ${PHASES[workout.phase].name}` : ''}`} /> : null}
              {workout.gameMode ? <Tag label="Game mode" /> : null}
            </Row>
          ) : null}
        </View>

        <Row gap={S.sm} align="stretch">
          <StatTile label="Duration" value={formatDuration(workoutDurationMs(workout))} />
          <StatTile label="Volume" value={formatVolume(workoutVolume(workout))} />
          <StatTile label="Sets" value={String(workoutSetCount(workout))} />
        </Row>

        {workout.prs?.length ? (
          <>
            <SectionTitle title="Personal records" />
            <Card>
              {workout.prs.map((pr, i) => (
                <Row key={i} gap={S.md} align="flex-start">
                  <Tag label="PR" style={{ marginTop: 1 }} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt v="h2">{EXERCISE_BY_ID[pr.exerciseId]?.name}</Txt>
                    <Txt v="small">
                      {PR_LABEL[pr.kind]}: {prValue(pr)}
                    </Txt>
                  </View>
                </Row>
              ))}
            </Card>
          </>
        ) : null}

        <SectionTitle title="Exercises" />
        {workout.exercises.map((e) => {
          const ex = EXERCISE_BY_ID[e.exerciseId];
          const labels = setLabels(e.sets);
          return (
            <Card key={e.id}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${ex?.name ?? e.exerciseId}: open the exercise`}
                onPress={() => router.push(`/exercise/${e.exerciseId}`)}
                style={styles.exercise}>
                {e.itemKey ? <ItemBadge label={e.itemKey} superset={!!e.group} /> : null}
                <Txt v="h2" style={{ flex: 1 }}>
                  {ex?.name ?? e.exerciseId}
                </Txt>
                {e.pain != null ? <Tag label={`Pain ${e.pain}/10`} tone={painTone(e.pain)} /> : null}
                <Ionicons name="chevron-forward" size={18} color={C.textFaint} />
              </Pressable>
              <Divider />
              <View style={{ gap: S.sm }}>
                {e.sets.map((s, i) => (
                  <Row key={s.id} gap={S.md}>
                    <View style={styles.setBadge}>
                      <Text style={styles.setBadgeText}>{labels[i]}</Text>
                    </View>
                    <Txt style={{ flex: 1 }}>{ex ? formatSet(ex, s.weight, s.reps) : `${s.reps}`}</Txt>
                    {s.rir != null ? <Txt v="small">RIR {s.rir}</Txt> : null}
                  </Row>
                ))}
              </View>
              {e.note ? (
                <Txt v="small" style={{ fontStyle: 'italic' }}>
                  “{e.note}”
                </Txt>
              ) : null}
            </Card>
          );
        })}

        <Button title="Delete workout" variant="danger" icon="trash-outline" onPress={onDelete} />
      </Screen>
      {isNew ? (
        <BottomBar>
          <Button title="Done" onPress={() => router.replace('/')} />
        </BottomBar>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // Pulled into the card's padding so the tap target is 44 px without making the card taller.
  exercise: { flexDirection: 'row', alignItems: 'center', gap: S.md, minHeight: 44, marginVertical: -6 },
  setBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setBadgeText: { ...T.secondary, fontSize: 12, lineHeight: 16, fontWeight: '600', color: C.textMuted },
});
