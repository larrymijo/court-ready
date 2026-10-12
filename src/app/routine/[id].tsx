import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ItemBadge } from '@/components/ItemBadge';
import { Button, Card, Chip, Row, Screen, ToggleRow, Txt } from '@/components/ui';
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
  const insets = useSafeAreaInsets();
  const [gameMode, setGameMode] = useState(false);
  if (!routine) return null;
  const pos = programPosition(settings.programStart, todayISO());
  const gm = routine.id === 'lower' && gameMode;
  const sets = hardSetCount(routine, getExercise, { phase: pos.phase, gameMode: gm });

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Stack.Screen options={{ title: routine.name }} />
      <Screen edgesTop={false} bottomPad={100}>
        <Txt v="label">{routine.day}</Txt>
        <Txt v="title">{routine.title}</Txt>
        <Row gap={S.sm}>
          <Chip label={`Week ${pos.week} · ${PHASES[pos.phase].name}`} tone={pos.phase === 'push' ? 'orange' : pos.phase === 'deload' ? 'ok' : 'info'} />
          <Chip label={`${sets} sets`} />
          <Chip label={`~${routine.minutes} min`} />
        </Row>
        <Txt v="small">{routine.intro}</Txt>
        <Txt v="small" color={C.text}>
          {PHASES[pos.phase].rule}
        </Txt>
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

        <Card onPress={() => router.push('/guide/warmups')}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt v="h2">{WARMUPS[routine.warmup].title}</Txt>
            <Ionicons name="chevron-forward" size={18} color={C.faint} />
          </Row>
          <Txt v="small">{WARMUPS[routine.warmup].steps.map((s) => s.text.split(' — ')[0]).join(' · ')}</Txt>
        </Card>

        {routine.items.map((item, i) => {
          const ex = getExercise(item.exerciseId);
          const p = prescribe(item, ex, { phase: pos.phase, routineId: routine.id, gameMode: gm });
          const last = lastPerformance(item.exerciseId, workouts);
          const sug = suggestNext(ex, p, last);
          const groupHeader =
            item.group && item.group !== routine.items[i - 1]?.group ? routine.groups[item.group] : null;
          return (
            <View key={item.key} style={{ gap: S.sm }}>
              {groupHeader ? (
                <Txt v="small" color={C.orange} style={{ fontWeight: '700', marginTop: S.xs }}>
                  {groupHeader}
                </Txt>
              ) : null}
              <Card style={p.skip ? { opacity: 0.45 } : null} onPress={() => router.push(`/exercise/${ex.id}`)}>
                <Row gap={S.md} align="flex-start">
                  <ItemBadge label={item.key} superset={!!item.group} />
                  <View style={{ flex: 1, gap: 3 }}>
                    <Txt v="h2">{ex.name}</Txt>
                    <Txt v="small" color={C.accent} style={{ fontWeight: '700' }}>
                      {p.skip
                        ? 'Skipped in game mode'
                        : `${p.sets} × ${repsText(p, item.perSide)} · RIR ${p.rir} · Rest ${formatClock(item.restSec)}`}
                    </Txt>
                    <Txt v="small" color={C.text}>
                      {item.cue}
                    </Txt>
                    {!p.skip ? (
                      <Txt v="tiny" color={sug.kind === 'increase' ? C.green : C.muted}>
                        {pos.phase === 'deload' && last
                          ? `Deload: keep ${formatKg(Math.max(...last.sets.map((s) => s.weight ?? 0)))} kg, easy reps.`
                          : sug.message}
                      </Txt>
                    ) : null}
                  </View>
                  <Ionicons name="information-circle-outline" size={20} color={C.faint} />
                </Row>
              </Card>
            </View>
          );
        })}
        {routine.shortOnTime ? <Txt v="small">{routine.shortOnTime}</Txt> : null}
        <Pressable onPress={() => router.push('/guide/pain')}>
          <Txt v="tiny" style={{ textAlign: 'center' }}>
            Pain above 3/10 or sharp → stop that exercise and use the swap. Tap for the pain rules.
          </Txt>
        </Pressable>
      </Screen>
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: S.lg,
          paddingBottom: insets.bottom + S.md,
          backgroundColor: C.bg,
          borderTopWidth: 1,
          borderTopColor: C.border,
        }}>
        <Button title={`Start ${routine.name}${gm ? ' (game mode)' : ''}`} icon="play" onPress={() => startRoutineFlow(routine.id, { gameMode: gm })} />
      </View>
    </View>
  );
}
