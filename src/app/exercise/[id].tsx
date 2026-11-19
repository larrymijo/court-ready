import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { LineChart } from '@/components/LineChart';
import { Bullet, Button, Card, Chip, EmptyState, Row, Screen, Segmented, StatTile, Tag, Txt } from '@/components/ui';
import { painTone } from '@/components/workout/PainPicker';
import { exerciseLabel, findExercise, getExercise } from '@/lib/exerciseCatalog';
import { formatDate, formatKg, formatSet } from '@/lib/format';
import { exerciseUsage } from '@/lib/planView';
import { confirm } from '@/lib/platform';
import { repsText } from '@/lib/program';
import { exerciseBests, exerciseSeries, isWorkingSet } from '@/lib/stats';
import type { ExerciseDef } from '@/lib/types';
import { useStore } from '@/store/useStore';
import { C, S } from '@/theme';

type Tab = 'how' | 'history' | 'records';

function exerciseCategory(exercise: ExerciseDef, custom: boolean, inPlan: boolean): string {
  if (custom) return exercise.archived ? 'Removed from Library' : 'Your exercise';
  if (exercise.kind === 'care') return 'Shoulder care';
  if (exercise.kind === 'drill') return 'Warm-up drill';
  if (exercise.kind === 'stretch') return 'Stretch';
  if (exercise.swapOption) return 'Swap option';
  return inPlan ? 'In your plan' : 'Exercise';
}

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const customExercises = useStore((s) => s.customExercises);
  const removeCustomExercise = useStore((s) => s.removeCustomExercise);
  const custom = customExercises.find((exercise) => exercise.id === id);
  const ex = useMemo(() => getExercise(id, customExercises), [id, customExercises]);
  const missing = !findExercise(id, customExercises);
  const workouts = useStore((s) => s.workouts);
  const plan = useStore((s) => s.plans.find((p) => p.id === s.activePlanId));
  const [tab, setTab] = useState<Tab>('how');

  const sessions = useMemo(
    () =>
      workouts
        .filter((w) => w.exercises.some((e) => e.exerciseId === id))
        .map((w) => ({
          w,
          sets: w.exercises.filter((e) => e.exerciseId === id).flatMap((e) => e.sets.filter(isWorkingSet)),
          pain: w.exercises.find((e) => e.exerciseId === id)?.pain ?? null,
        }))
        .filter((s) => s.sets.length > 0),
    [workouts, id],
  );
  const series = useMemo(() => exerciseSeries(id, workouts, ex), [ex, workouts, id]);
  const bests = useMemo(() => exerciseBests(id, workouts, undefined, ex), [ex, workouts, id]);

  const usedIn = exerciseUsage(plan, ex.id);
  const weight = missing ? series.some((s) => s.topWeight > 0) : ex.tracking === 'weight_reps';
  const showEstimatedMax = weight && ex.estimate1RM !== false;
  // A drill or a stretch is read, never lifted or logged: how-to only, no lift tag, tabs or tempo line.
  const readOnly = ex.kind === 'drill' || ex.kind === 'stretch';
  const showSections = !!custom || missing;
  const remove = async () => {
    const ok = await confirm(
      `Remove ${ex.name}?`,
      'This removes the exercise from the Library and future plan workouts. Your current workout, history and records are kept.',
      'Remove',
      true,
    );
    if (ok && removeCustomExercise(id)) {
      if (router.canGoBack()) router.back();
      else router.replace('/library');
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: '' }} />
      <Screen edgesTop={false}>
        <View style={{ gap: S.sm }}>
          <View style={{ gap: 2 }}>
            <Txt v="label">{exerciseCategory(ex, !!custom, usedIn.length > 0)}</Txt>
            <Txt v="title" accessibilityRole="header">{ex.name}</Txt>
          </View>
          {missing ? null : <Txt color={C.textMuted}>{custom ? exerciseLabel(ex.primary) : ex.muscles}</Txt>}
          {custom && ex.secondary?.length ? (
            <Txt v="small">Also works {ex.secondary.map(exerciseLabel).join(', ').toLowerCase()}</Txt>
          ) : null}
          {missing ? null : (
            <Row gap={6} style={{ flexWrap: 'wrap' }}>
              <Tag label={exerciseLabel(ex.equipment)} />
              {custom ? <Tag label={weight ? `Weight and reps · ${formatKg(ex.increment)} kg steps` : 'Reps only'} /> : null}
              {!custom && !readOnly ? <Tag label={ex.isolation ? 'Isolation' : 'Big lift'} /> : null}
              {ex.dose ? <Tag label={ex.dose} /> : null}
            </Row>
          )}
        </View>

        {usedIn.length > 0 ? (
          <Row gap={S.sm} style={{ flexWrap: 'wrap' }}>
            {usedIn.map(({ workout, item }) => (
              <Chip
                key={workout.id + item.key}
                label={`${workout.name} · ${item.sets} × ${repsText(item, item.perSide)}`}
                accessibilityLabel={`Open ${workout.name}`}
                style={{ flexShrink: 1 }}
                onPress={() => router.push(`/plans/${plan?.id}/${workout.id}`)}
              />
            ))}
          </Row>
        ) : null}

        {readOnly || showSections ? null : (
          <Segmented<Tab>
            value={tab}
            onChange={setTab}
            options={[
              { value: 'how', label: 'How to' },
              { value: 'history', label: `History${sessions.length ? ` (${sessions.length})` : ''}` },
              { value: 'records', label: 'Records' },
            ]}
          />
        )}

        {readOnly || showSections || tab === 'how' ? (
          <>
            {ex.warning ? (
              <Card>
                <Row gap={S.md} align="flex-start">
                  <Ionicons name="alert-circle-outline" size={22} color={C.text} style={{ marginTop: 1 }} />
                  <Txt style={{ flex: 1, fontWeight: '600' }}>{ex.warning}</Txt>
                </Row>
              </Card>
            ) : null}
            {ex.sections.map((sec) => (
              <Card key={sec.label}>
                <Txt v="label">{sec.label}</Txt>
                <View style={{ gap: S.sm }}>
                  {sec.items.map((it, i) => (
                    <Bullet key={i}>
                      <Txt>{it}</Txt>
                    </Bullet>
                  ))}
                </View>
              </Card>
            ))}
            {ex.swaps.length ? (
              <Card>
                <Txt v="label">Swaps</Txt>
                <Row gap={S.sm} style={{ flexWrap: 'wrap' }}>
                  {ex.swaps
                    .map((s) => getExercise(s, customExercises))
                    .map((s) => (
                      <Chip key={s.id} label={s.name} style={{ flexShrink: 1 }} onPress={() => router.push(`/exercise/${s.id}`)} />
                    ))}
                </Row>
              </Card>
            ) : null}
            {readOnly || showSections ? null : (
              <Button
                variant="ghost"
                title="Technique guide"
                iconRight="chevron-forward"
                onPress={() => router.push('/guide/technique')}
              />
            )}
          </>
        ) : null}

        {showSections ? <Txt v="h1" accessibilityRole="header">History</Txt> : null}
        {!readOnly && (showSections || tab === 'history') ? (
          sessions.length === 0 ? (
            <EmptyState icon="barbell-outline" title="Not logged yet" body="Your sets for this exercise will show here." />
          ) : (
            sessions.map(({ w, sets, pain }) => (
              <Card key={w.id} onPress={() => router.push(`/history/${w.id}`)}>
                <Row style={{ justifyContent: 'space-between' }} gap={S.md}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt v="h2">{formatDate(w.startedAt)}</Txt>
                    <Txt v="small" numberOfLines={1}>
                      {w.name}
                    </Txt>
                  </View>
                  {pain != null ? <Tag label={`Pain ${pain}`} tone={painTone(pain)} /> : null}
                </Row>
                <Txt>
                  {sets
                    .map((s) => {
                      if (!missing) return formatSet(ex, s.weight, s.reps, true);
                      return s.weight == null ? `${s.reps ?? 0} reps` : `${formatKg(s.weight)} kg × ${s.reps ?? 0}`;
                    })
                    .join('   ·   ')}
                </Txt>
              </Card>
            ))
          )
        ) : null}

        {showSections && series.length ? <Txt v="h1" accessibilityRole="header">Records</Txt> : null}
        {!readOnly && (showSections ? series.length > 0 : tab === 'records') ? (
          series.length === 0 ? (
            <EmptyState icon="trophy-outline" title="No records yet" body="Log this exercise and your bests and progress chart show up here." />
          ) : (
            <>
              <Row gap={S.sm} align="stretch">
                {weight ? (
                  <>
                    <StatTile label="Heaviest" value={`${formatKg(bests.weight?.value ?? 0)} kg`} />
                    {showEstimatedMax ? <StatTile label="Best est. 1RM" value={`${formatKg(Math.round((bests.e1rm?.value ?? 0) * 10) / 10)} kg`} /> : null}
                    <StatTile label="Best set" value={`${Math.round(bests.volume?.value ?? 0)} kg`} caption="weight × reps" />
                  </>
                ) : (
                  <StatTile label="Most reps in a set" value={String(bests.reps?.value ?? 0)} />
                )}
              </Row>
              {showEstimatedMax || !weight ? (
                <Card>
                  <Txt v="label">{weight ? 'Estimated 1RM' : 'Best set (reps)'}</Txt>
                  <LineChart
                    points={series.map((p) => ({ x: p.date, y: weight ? p.bestE1rm : p.bestReps }))}
                    formatY={(v) => (weight ? `${formatKg(Math.round(v * 10) / 10)}` : String(Math.round(v)))}
                  />
                  {weight ? (
                    <Txt v="caption">Estimated from your best set each session (weight × reps). Going up means getting stronger.</Txt>
                  ) : null}
                </Card>
              ) : null}
              {weight ? (
                <Card>
                  <Txt v="label">Top weight</Txt>
                  <LineChart points={series.map((p) => ({ x: p.date, y: p.topWeight }))} formatY={(v) => formatKg(Math.round(v * 10) / 10)} />
                </Card>
              ) : null}
            </>
          )
        ) : null}
        {custom && !custom.archived ? <Button title="Remove exercise" variant="danger" onPress={remove} /> : null}
      </Screen>
    </>
  );
}
