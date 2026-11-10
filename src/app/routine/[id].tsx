import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ItemBadge } from '@/components/ItemBadge';
import { BOTTOM_BAR_SPACE, BottomBar, Button, Card, ListRow, Row, RowBadge, Screen, Tag, ToggleRow, Txt } from '@/components/ui';
import { getExercise } from '@/data/exercises';
import { WARMUPS } from '@/data/guide';
import { ROUTINE_BY_ID } from '@/data/routines';
import { todayISO } from '@/lib/dates';
import { formatClock, formatKg } from '@/lib/format';
import { hardSetCount, PHASES, prescribe, programPosition, repsText } from '@/lib/program';
import { lastPerformance, suggestNext } from '@/lib/progression';
import { startRoutineFlow } from '@/lib/startWorkout';
import type { RoutineId } from '@/lib/types';
import { useStore } from '@/store/useStore';
import { C, S } from '@/theme';

export default function RoutineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const routine = ROUTINE_BY_ID[id as RoutineId];
  const settings = useStore((s) => s.settings);
  const workouts = useStore((s) => s.workouts);
  const [gameMode, setGameMode] = useState(false);
  if (!routine) return null;
  const pos = programPosition(settings.programStart, todayISO());
  const gm = routine.id === 'lower' && gameMode;
  const sets = hardSetCount(routine, getExercise, { phase: pos.phase, gameMode: gm });

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Stack.Screen options={{ title: routine.name }} />
      <Screen edgesTop={false} bottomPad={BOTTOM_BAR_SPACE}>
        <View style={{ gap: S.sm }}>
          <View style={{ gap: 2 }}>
            <Txt v="label">{routine.day}</Txt>
            <Txt v="title">{routine.title}</Txt>
          </View>
          <Row gap={6} style={{ flexWrap: 'wrap' }}>
            <Tag label={`Week ${pos.week} · ${PHASES[pos.phase].name}`} />
            <Tag label={`${sets} sets`} />
            <Tag label={`about ${routine.minutes} min`} />
            {routine.optional ? <Tag label="Optional" /> : null}
          </Row>
          <Txt color={C.textMuted}>{routine.intro}</Txt>
          <Txt v="small">{PHASES[pos.phase].rule}</Txt>
        </View>

        {routine.id === 'lower' ? (
          <Card>
            <ToggleRow
              title="Game mode"
              subtitle="Volleyball tomorrow? 2 sets per exercise, stop at RIR 3, skip the split squats."
              value={gameMode}
              onChange={setGameMode}
            />
          </Card>
        ) : null}

        <Card variant="list">
          <ListRow
            leading={<RowBadge icon="flame-outline" />}
            title={WARMUPS[routine.warmup].title}
            subtitle={WARMUPS[routine.warmup].steps.map((s) => s.text.split(' — ')[0]).join(' · ')}
            subtitleLines={2}
            chevron
            onPress={() => router.push('/guide/warmups')}
          />
        </Card>

        {routine.items.map((item, i) => {
          const ex = getExercise(item.exerciseId);
          const p = prescribe(item, ex, { phase: pos.phase, routineId: routine.id, gameMode: gm });
          const last = lastPerformance(item.exerciseId, workouts);
          const sug = suggestNext(ex, p, last);
          const groupHeader =
            item.group && item.group !== routine.items[i - 1]?.group ? routine.groups[item.group] : null;
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
        {routine.shortOnTime ? <Txt v="small">{routine.shortOnTime}</Txt> : null}
        <Button
          variant="ghost"
          title="Pain above 3 of 10, or sharp: stop and swap. See the pain rules"
          iconRight="chevron-forward"
          onPress={() => router.push('/guide/pain')}
        />
      </Screen>
      <BottomBar>
        <Button title={`Start ${routine.name}${gm ? ' (game mode)' : ''}`} icon="play" onPress={() => startRoutineFlow(routine.id, { gameMode: gm })} />
      </BottomBar>
    </View>
  );
}
