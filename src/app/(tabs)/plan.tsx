import { router } from 'expo-router';

import { RoutineRows } from '@/components/RoutineRows';
import { TabScreen } from '@/components/TabScreen';
import { Button, Card, ListRow, PageHeader, RowBadge, SectionTitle, Txt } from '@/components/ui';
import { todayISO } from '@/lib/dates';
import { plural } from '@/lib/format';
import { PHASES, planForDate, programPosition } from '@/lib/program';
import { startRoutineFlow } from '@/lib/startWorkout';
import { useNow } from '@/lib/useNow';
import { useStore } from '@/store/useStore';

export default function PlanScreen() {
  const settings = useStore((s) => s.settings);
  const workouts = useStore((s) => s.workouts);
  // Keeps "today" right when the app stays open past midnight.
  const now = useNow(60_000);
  const nowDate = new Date(now);
  const pos = programPosition(settings.programStart, todayISO(nowDate));
  const plan = planForDate(nowDate);

  return (
    <TabScreen>
      <PageHeader
        subtitle={
          pos.started
            ? `Court-Ready · Week ${pos.week} · ${PHASES[pos.phase].name}`
            : `Court-Ready · starts in ${plural(pos.daysUntilStart, 'day')}`
        }
        title="Plan"
      />

      <SectionTitle title="Start any day" />
      <Card variant="list">
        <RoutineRows
          todayRoutineId={plan.kind === 'gym' ? plan.routineId : undefined}
          details={{ phase: pos.phase, workouts }}
          onStart={(id) => startRoutineFlow(id)}
          onOpen={(id) => router.push(`/routine/${id}`)}
        />
      </Card>
      <Txt v="caption">
        Tap a session to see its exercises. Sets adjust to your week of the plan; change the start date in Settings.
      </Txt>

      <SectionTitle title="Or train freely" />
      <Card variant="list">
        <ListRow
          leading={<RowBadge icon="create-outline" />}
          title="Empty workout"
          subtitle="Pick exercises as you go"
          onPress={() => startRoutineFlow(null)}
          trailing={
            <Button
              size="pill"
              variant="outline"
              title="Start"
              accessibilityLabel="Start an empty workout"
              onPress={() => startRoutineFlow(null)}
            />
          }
        />
      </Card>
    </TabScreen>
  );
}
