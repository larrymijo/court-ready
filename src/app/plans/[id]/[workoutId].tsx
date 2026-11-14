import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ItemBadge } from '@/components/ItemBadge';
import { BOTTOM_BAR_SPACE, BottomBar, Button, Card, ListRow, Row, RowBadge, Screen, Tag, ToggleRow, Txt } from '@/components/ui';
import { EXERCISE_BY_ID } from '@/data/exercises';
import { WARMUPS } from '@/data/guide';
import { todayISO } from '@/lib/dates';
import { formatClock, formatKg } from '@/lib/format';
import { findWorkout, prescribeItem, workoutHardSets } from '@/lib/plans';
import { planFacts, plannedDaysText } from '@/lib/planView';
import { PHASES, repsText } from '@/lib/program';
import { lastPerformance, suggestNext } from '@/lib/progression';
import { startPlanWorkoutFlow } from '@/lib/startWorkout';
import { workoutPosition } from '@/store/planData';
import { useStore } from '@/store/useStore';
import { C, S } from '@/theme';

/** One gym workout of a saved plan: what it prescribes in the plan's current phase. */
export default function WorkoutPage() {
  const { id, workoutId } = useLocalSearchParams<{ id: string; workoutId: string }>();
  const plan = useStore((s) => s.plans.find((p) => p.id === id));
  const state = useStore((s) => (id ? s.planState[id] : undefined));
  const workouts = useStore((s) => s.workouts);
  const [gameMode, setGameMode] = useState(false);
  const found = plan && workoutId ? findWorkout(plan, workoutId) : undefined;
  if (!plan || !found) return null;

  // Exercises this app does not know are left out, as when the workout is started.
  const workout = { ...found, items: found.items.filter((i) => EXERCISE_BY_ID[i.exerciseId]) };
  const pos = workoutPosition(plan, state, todayISO());
  const rhythm = planFacts(plan).hasRhythm;
  const gm = !!workout.gameMode && gameMode;
  const sets = workoutHardSets(workout, (x) => EXERCISE_BY_ID[x], { phase: pos.phase, gameMode: gm });
  const days = plannedDaysText(plan, workout.id);
  const warmup = WARMUPS[workout.warmup as 'upper' | 'lower'];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Stack.Screen options={{ title: workout.name }} />
      <Screen edgesTop={false} bottomPad={BOTTOM_BAR_SPACE}>
        <View style={{ gap: S.sm }}>
          <View style={{ gap: 2 }}>
            {days ? <Txt v="label">{days}</Txt> : null}
            <Txt v="title">{workout.title ?? workout.name}</Txt>
          </View>
          <Row gap={6} style={{ flexWrap: 'wrap' }}>
            {rhythm ? <Tag label={`Week ${pos.week} · ${PHASES[pos.phase].name}`} /> : null}
            <Tag label={`${sets} sets`} />
            <Tag label={`about ${workout.minutes} min`} />
            {workout.optional ? <Tag label="Optional" /> : null}
          </Row>
          {workout.intro ? <Txt color={C.textMuted}>{workout.intro}</Txt> : null}
          {rhythm ? <Txt v="small">{PHASES[pos.phase].rule}</Txt> : null}
        </View>

        {workout.gameMode ? (
          <Card>
            <ToggleRow
              title="Game mode"
              subtitle="Volleyball tomorrow? 2 sets per exercise, stop at RIR 3, skip the split squats."
              value={gameMode}
              onChange={setGameMode}
            />
          </Card>
        ) : null}

        {warmup ? (
          <Card variant="list">
            <ListRow
              leading={<RowBadge icon="flame-outline" />}
              title={warmup.title}
              subtitle={warmup.steps.map((s) => s.text.split(' — ')[0]).join(' · ')}
              subtitleLines={2}
              chevron
              onPress={() => router.push('/guide/warmups')}
            />
          </Card>
        ) : null}

        {workout.items.map((item, i) => {
          const ex = EXERCISE_BY_ID[item.exerciseId];
          const p = prescribeItem(item, ex, workout, { phase: pos.phase, gameMode: gm });
          const last = lastPerformance(item.exerciseId, workouts);
          const sug = suggestNext(ex, p, last);
          const groupHeader =
            item.group && item.group !== workout.items[i - 1]?.group ? workout.groups[item.group] : null;
          const addWeight = sug.kind === 'increase' && pos.phase !== 'deload';
          return (
            <View key={item.key} style={{ gap: S.sm }}>
              {groupHeader ? (
                <Txt v="small" color={C.text} style={{ fontWeight: '600', paddingHorizontal: S.xs, marginTop: S.xs }}>
                  {groupHeader}
                </Txt>
              ) : null}
              <Card
                style={p.skip ? { opacity: 0.45 } : null}
                onPress={() => router.push(`/exercise/${ex.id}`)}
                accessibilityLabel={`${ex.name}: how to do it`}>
                <Row gap={S.md} align="flex-start">
                  <ItemBadge label={item.key} superset={!!item.group} />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Txt v="h2">{ex.name}</Txt>
                    <Txt v="small" color={C.text} style={{ fontWeight: '600' }}>
                      {p.skip
                        ? 'Skipped in game mode'
                        : `${p.sets} × ${repsText(p, item.perSide)} · RIR ${p.rir} · rest ${formatClock(item.restSec)}`}
                    </Txt>
                    <Txt v="small">{item.cue}</Txt>
                    {!p.skip ? (
                      <Txt v="caption" color={addWeight ? C.text : undefined}>
                        {pos.phase === 'deload' && last
                          ? `Deload: keep ${formatKg(Math.max(...last.sets.map((s) => s.weight ?? 0)))} kg, easy reps.`
                          : sug.message}
                      </Txt>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={C.textFaint} style={{ marginTop: 3 }} />
                </Row>
              </Card>
            </View>
          );
        })}
        {workout.shortOnTime ? <Txt v="small">{workout.shortOnTime}</Txt> : null}
        <Button
          variant="ghost"
          title="Pain above 3 of 10, or sharp: stop and swap. See the pain rules"
          iconRight="chevron-forward"
          onPress={() => router.push('/guide/pain')}
        />
      </Screen>
      <BottomBar>
        <Button
          title={`Start ${workout.name}${gm ? ' (game mode)' : ''}`}
          icon="play"
          onPress={() => startPlanWorkoutFlow(plan.id, workout.id, { gameMode: gm })}
        />
      </BottomBar>
    </View>
  );
}
