import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';

import { ItemBadge } from '@/components/ItemBadge';
import { Button, Card, Chip, Divider, Row, Screen, SectionTitle, Stat, Txt } from '@/components/ui';
import { EXERCISE_BY_ID } from '@/data/exercises';
import { formatDateLong, formatDuration, formatKg, formatSet, formatTime, formatVolume, setLabels } from '@/lib/format';
import { confirm } from '@/lib/platform';
import { PHASES } from '@/lib/program';
import { workoutDurationMs, workoutSetCount, workoutVolume } from '@/lib/stats';
import type { PR } from '@/lib/types';
import { useStore } from '@/store/useStore';
import { C, S } from '@/theme';

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
    <>
      <Stack.Screen options={{ title: isNew ? 'Workout complete' : workout.name }} />
      <Screen edgesTop={false} bottomPad={40}>
        {isNew ? (
          <Card tone="ok" style={{ alignItems: 'center', paddingVertical: S.xl }}>
            <Ionicons name="trophy" size={40} color={C.green} />
            <Txt v="h1">Nice work!</Txt>
            <Txt v="small" color={C.text} style={{ textAlign: 'center' }}>
              {workout.prs?.length
                ? `You set ${workout.prs.length} personal record${workout.prs.length === 1 ? '' : 's'}.`
                : 'Logged. Beat these numbers next time.'}
            </Txt>
          </Card>
        ) : null}
        <Txt v="title">{workout.name}</Txt>
        <Txt v="small">
          {formatDateLong(workout.startedAt)} · {formatTime(workout.startedAt)}
        </Txt>
        <Row gap={S.sm}>
          {workout.week ? (
            <Chip label={`Week ${workout.week}${workout.phase ? ` · ${PHASES[workout.phase].name}` : ''}`} tone="info" />
          ) : null}
          {workout.gameMode ? <Chip label="Game mode" tone="orange" /> : null}
        </Row>
        <Card>
          <Row gap={S.md}>
            <Stat value={formatDuration(workoutDurationMs(workout))} label="duration" />
            <Stat value={formatVolume(workoutVolume(workout))} label="volume" />
            <Stat value={String(workoutSetCount(workout))} label="sets" />
          </Row>
        </Card>

        {workout.prs?.length ? (
          <>
            <SectionTitle title="Personal records" />
            <Card tone="warn">
              {workout.prs.map((pr, i) => (
                <Row key={i} gap={S.sm} align="flex-start">
                  <Ionicons name="trophy" size={16} color={C.amber} style={{ marginTop: 3 }} />
                  <View style={{ flex: 1 }}>
                    <Txt style={{ fontWeight: '700' }}>{EXERCISE_BY_ID[pr.exerciseId]?.name}</Txt>
                    <Txt v="small" color={C.text}>
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
              <Pressable onPress={() => router.push(`/exercise/${e.exerciseId}`)}>
                <Row gap={S.md}>
                  {e.itemKey ? <ItemBadge label={e.itemKey} superset={!!e.group} /> : null}
                  <Txt v="h2" color={C.accent} style={{ flex: 1 }}>
                    {ex?.name ?? e.exerciseId}
                  </Txt>
                  {e.pain != null ? (
                    <Chip label={`Pain ${e.pain}/10`} tone={e.pain <= 2 ? 'ok' : e.pain === 3 ? 'warn' : 'bad'} />
                  ) : null}
                </Row>
              </Pressable>
              <Divider />
              {e.sets.map((s, i) => {
                const label = labels[i];
                return (
                  <Row key={s.id} style={{ justifyContent: 'space-between' }}>
                    <Txt v="small" color={s.type === 'warmup' ? C.amber : C.muted} style={{ width: 28, fontWeight: '700' }}>
                      {label}
                    </Txt>
                    <Txt style={{ flex: 1, fontVariant: ['tabular-nums'] }}>
                      {ex ? formatSet(ex, s.weight, s.reps) : `${s.reps}`}
                    </Txt>
                    {s.rir != null ? <Txt v="small">RIR {s.rir}</Txt> : null}
                  </Row>
                );
              })}
              {e.note ? (
                <Txt v="small" style={{ fontStyle: 'italic' }}>
                  “{e.note}”
                </Txt>
              ) : null}
            </Card>
          );
        })}

        {isNew ? <Button title="Done" onPress={() => router.replace('/')} /> : null}
        <Button title="Delete workout" variant="danger" icon="trash-outline" onPress={onDelete} />
      </Screen>
    </>
  );
}
