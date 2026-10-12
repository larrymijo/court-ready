import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, Chip, PageHeader, Row, Screen, SectionTitle, Txt } from '@/components/ui';
import { getExercise } from '@/data/exercises';
import { ROUTINES } from '@/data/routines';
import { todayISO } from '@/lib/dates';
import { formatDate } from '@/lib/format';
import { hardSetCount, PHASES, programPosition } from '@/lib/program';
import { startRoutineFlow } from '@/lib/startWorkout';
import { useStore } from '@/store/useStore';
import { C, S } from '@/theme';

export default function RoutinesScreen() {
  const settings = useStore((s) => s.settings);
  const workouts = useStore((s) => s.workouts);
  const active = useStore((s) => s.active);
  const pos = programPosition(settings.programStart, todayISO());

  return (
    <Screen bottomPad={active ? 170 : 110}>
      <PageHeader subtitle={`Week ${pos.week} · ${PHASES[pos.phase].name}`} title="Routines" />

      <Card onPress={() => startRoutineFlow(null)}>
        <Row gap={S.md}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="add" size={24} color={C.text} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt v="h2">Start an empty workout</Txt>
            <Txt v="small">Pick exercises as you go.</Txt>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.faint} />
        </Row>
      </Card>

      <SectionTitle title="Your plan" />
      {ROUTINES.map((r) => {
        const sets = hardSetCount(r, getExercise, { phase: pos.phase });
        const last = workouts.find((w) => w.routineId === r.id);
        const names = r.items.filter((i) => getExercise(i.exerciseId).kind !== 'care').map((i) => getExercise(i.exerciseId).name);
        return (
          <Card key={r.id} onPress={() => router.push(`/routine/${r.id}`)}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Txt v="label">{r.day}</Txt>
              {r.optional ? <Chip label="Optional" tone="orange" /> : null}
            </Row>
            <Txt v="h1">{r.title}</Txt>
            <Txt v="small" numberOfLines={2}>
              {names.join(' · ')}
            </Txt>
            <Row gap={S.md}>
              <Txt v="small" color={C.text}>
                {sets} sets
              </Txt>
              <Txt v="small" color={C.text}>
                ~{r.minutes} min
              </Txt>
              <Txt v="small">{last ? `Last: ${formatDate(last.startedAt)}` : 'Not done yet'}</Txt>
            </Row>
            <Row gap={S.sm} style={{ marginTop: S.xs }}>
              <Button flex title="Start" icon="play" onPress={() => startRoutineFlow(r.id)} />
              <Button title="Preview" variant="secondary" onPress={() => router.push(`/routine/${r.id}`)} />
            </Row>
          </Card>
        );
      })}
      <Txt v="tiny" style={{ textAlign: 'center' }}>
        Sets adjust to your week of the plan. Change the start date in Settings.
      </Txt>
    </Screen>
  );
}
