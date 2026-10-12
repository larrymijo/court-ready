import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { LineChart } from '@/components/LineChart';
import { Bullet, Card, Chip, EmptyState, Row, Screen, Segmented, Stat, Txt } from '@/components/ui';
import { EXERCISE_BY_ID } from '@/data/exercises';
import { ROUTINES } from '@/data/routines';
import { formatDate, formatKg, formatSet } from '@/lib/format';
import { repsText } from '@/lib/program';
import { exerciseBests, exerciseSeries, isWorkingSet } from '@/lib/stats';
import { useStore } from '@/store/useStore';
import { C, S } from '@/theme';

type Tab = 'how' | 'history' | 'records';

const LABEL_COLOR: Record<string, string> = {
  SETUP: C.accent,
  'DO IT': C.accent,
  HOW: C.accent,
  AVOID: C.red,
  'IF IT HURTS': C.amber,
  OPTIONS: C.muted,
  WHY: C.green,
  'WHY NOT BARBELL SQUATS?': C.green,
};

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
      <Screen edgesTop={false} bottomPad={40}>
        <Txt v="label">{ex.kind === 'care' ? 'Shoulder care' : ex.kind === 'alternative' ? 'Swap option' : 'In your plan'}</Txt>
        <Txt v="title">{ex.name}</Txt>
        <Txt v="small">{ex.muscles}</Txt>
        <Row gap={S.sm} style={{ flexWrap: 'wrap' }}>
          <Chip label={ex.equipment} />
          {ex.isolation ? <Chip label="Isolation" tone="info" /> : <Chip label="Big lift" tone="info" />}
          {ex.dose ? <Chip label={ex.dose} tone="ok" /> : null}
          {usedIn.map(({ routine, item }) => (
            <Chip
              key={routine.id + item.key}
              label={`${routine.name} · ${item.sets} × ${repsText(item, item.perSide)}`}
              tone="orange"
              onPress={() => router.push(`/routine/${routine.id}`)}
            />
          ))}
        </Row>

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
              <Card tone="warn">
                <Txt style={{ fontWeight: '700' }} color={C.amber}>
                  {ex.warning}
                </Txt>
              </Card>
            ) : null}
            {ex.sections.map((sec) => (
              <Card key={sec.label}>
                <Txt v="label" color={LABEL_COLOR[sec.label] ?? C.muted}>
                  {sec.label}
                </Txt>
                {sec.items.map((it, i) => (
                  <Bullet key={i} color={LABEL_COLOR[sec.label] ?? C.muted}>
                    <Txt>{it}</Txt>
                  </Bullet>
                ))}
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
                      <Chip key={s.id} label={s.name} tone="info" onPress={() => router.push(`/exercise/${s.id}`)} />
                    ))}
                </Row>
              </Card>
            ) : null}
            <Pressable onPress={() => router.push('/guide/technique')}>
              <Txt v="tiny" style={{ textAlign: 'center' }}>
                Every rep: 2–3 s down, short pause in the stretch, controlled up. Tap for the rules.
              </Txt>
            </Pressable>
          </>
        ) : null}

        {tab === 'history' ? (
          sessions.length === 0 ? (
            <EmptyState icon="barbell-outline" title="Not logged yet" body="Your sets for this exercise will show here." />
          ) : (
            sessions.map(({ w, sets, pain }) => (
              <Card key={w.id} onPress={() => router.push(`/history/${w.id}`)}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Txt v="h2">{formatDate(w.startedAt)}</Txt>
                  <Row gap={S.sm}>
                    {pain != null ? (
                      <Chip label={`Pain ${pain}`} tone={pain <= 2 ? 'ok' : pain === 3 ? 'warn' : 'bad'} />
                    ) : null}
                    <Txt v="small">{w.name}</Txt>
                  </Row>
                </Row>
                <Txt style={{ fontVariant: ['tabular-nums'] }}>
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
              <Card>
                <Row gap={S.md}>
                  {weight ? (
                    <>
                      <Stat value={`${formatKg(bests.weight?.value ?? 0)} kg`} label="heaviest" />
                      <Stat value={`${formatKg(Math.round((bests.e1rm?.value ?? 0) * 10) / 10)} kg`} label="best est. 1RM" />
                      <Stat value={`${Math.round(bests.volume?.value ?? 0)} kg`} label="best set volume" />
                    </>
                  ) : (
                    <Stat value={String(bests.reps?.value ?? 0)} label="most reps in a set" />
                  )}
                </Row>
              </Card>
              <Card>
                <Txt v="label">{weight ? 'Estimated 1RM' : 'Best set (reps)'}</Txt>
                <LineChart
                  points={series.map((p) => ({ x: p.date, y: weight ? p.bestE1rm : p.bestReps }))}
                  formatY={(v) => (weight ? `${formatKg(Math.round(v * 10) / 10)}` : String(Math.round(v)))}
                />
                {weight ? (
                  <Txt v="tiny">Estimated from your best set each session (weight × reps). Going up = getting stronger.</Txt>
                ) : null}
              </Card>
              {weight ? (
                <Card>
                  <Txt v="label">Top weight</Txt>
                  <LineChart points={series.map((p) => ({ x: p.date, y: p.topWeight }))} color={C.orange} formatY={(v) => formatKg(Math.round(v * 10) / 10)} />
                </Card>
              ) : null}
            </>
          )
        ) : null}
        <View style={{ height: S.md }} />
      </Screen>
    </>
  );
}
