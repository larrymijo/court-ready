import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { LineChart } from '@/components/LineChart';
import { Bullet, Button, Card, Chip, EmptyState, Row, Screen, Segmented, StatTile, Tag, Txt } from '@/components/ui';
import { painTone } from '@/components/workout/PainPicker';
import { EXERCISE_BY_ID } from '@/data/exercises';
import { ROUTINES } from '@/data/routines';
import { formatDate, formatKg, formatSet } from '@/lib/format';
import { repsText } from '@/lib/program';
import { exerciseBests, exerciseSeries, isWorkingSet } from '@/lib/stats';
import { useStore } from '@/store/useStore';
import { C, S } from '@/theme';

type Tab = 'how' | 'history' | 'records';

/** "dumbbell" → "Dumbbell" */
function capitalise(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ex = EXERCISE_BY_ID[id];
  const workouts = useStore((s) => s.workouts);
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
  const series = useMemo(() => exerciseSeries(id, workouts), [workouts, id]);
  const bests = useMemo(() => exerciseBests(id, workouts), [workouts, id]);

  if (!ex) {
    return (
      <Screen edgesTop={false}>
        <Txt>Exercise not found.</Txt>
      </Screen>
    );
  }

  const usedIn = ROUTINES.flatMap((r) =>
    r.items.filter((i) => i.exerciseId === ex.id).map((i) => ({ routine: r, item: i })),
  );
  const weight = ex.tracking === 'weight_reps';

  return (
    <>
      <Stack.Screen options={{ title: '' }} />
      <Screen edgesTop={false}>
        <View style={{ gap: S.sm }}>
          <View style={{ gap: 2 }}>
            <Txt v="label">{ex.kind === 'care' ? 'Shoulder care' : ex.kind === 'alternative' ? 'Swap option' : 'In your plan'}</Txt>
            <Txt v="title">{ex.name}</Txt>
          </View>
          <Txt color={C.textMuted}>{ex.muscles}</Txt>
          <Row gap={6} style={{ flexWrap: 'wrap' }}>
            <Tag label={capitalise(ex.equipment)} />
            <Tag label={ex.isolation ? 'Isolation' : 'Big lift'} />
            {ex.dose ? <Tag label={ex.dose} /> : null}
          </Row>
        </View>

        {usedIn.length > 0 ? (
          <Row gap={S.sm} style={{ flexWrap: 'wrap' }}>
            {usedIn.map(({ routine, item }) => (
              <Chip
                key={routine.id + item.key}
                label={`${routine.name} · ${item.sets} × ${repsText(item, item.perSide)}`}
                accessibilityLabel={`Open ${routine.name}`}
                style={{ flexShrink: 1 }}
                onPress={() => router.push(`/routine/${routine.id}`)}
              />
            ))}
          </Row>
        ) : null}

        <Segmented<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'how', label: 'How to' },
            { value: 'history', label: `History${sessions.length ? ` (${sessions.length})` : ''}` },
            { value: 'records', label: 'Records' },
          ]}
        />

        {tab === 'how' ? (
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
                    .map((s) => EXERCISE_BY_ID[s])
                    .filter(Boolean)
                    .map((s) => (
                      <Chip key={s.id} label={s.name} style={{ flexShrink: 1 }} onPress={() => router.push(`/exercise/${s.id}`)} />
                    ))}
                </Row>
              </Card>
            ) : null}
            <Button
              variant="ghost"
              title="Every rep: 2–3 s down, a short pause in the stretch, controlled up. See the rules"
              iconRight="chevron-forward"
              onPress={() => router.push('/guide/technique')}
            />
          </>
        ) : null}

        {tab === 'history' ? (
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
                    .map((s) => formatSet(ex, s.weight, s.reps, true))
                    .join('   ·   ')}
                </Txt>
              </Card>
            ))
          )
        ) : null}

        {tab === 'records' ? (
          series.length === 0 ? (
            <EmptyState icon="trophy-outline" title="No records yet" body="Log this exercise and your bests and progress chart show up here." />
          ) : (
            <>
              <Row gap={S.sm} align="stretch">
                {weight ? (
                  <>
                    <StatTile label="Heaviest" value={`${formatKg(bests.weight?.value ?? 0)} kg`} />
                    <StatTile label="Best est. 1RM" value={`${formatKg(Math.round((bests.e1rm?.value ?? 0) * 10) / 10)} kg`} />
                    <StatTile label="Best set" value={`${Math.round(bests.volume?.value ?? 0)} kg`} caption="weight × reps" />
                  </>
                ) : (
                  <StatTile label="Most reps in a set" value={String(bests.reps?.value ?? 0)} />
                )}
              </Row>
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
              {weight ? (
                <Card>
                  <Txt v="label">Top weight</Txt>
                  <LineChart points={series.map((p) => ({ x: p.date, y: p.topWeight }))} formatY={(v) => formatKg(Math.round(v * 10) / 10)} />
                </Card>
              ) : null}
            </>
          )
        ) : null}
      </Screen>
    </>
  );
}
