import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { View } from 'react-native';

import { WeekLegend, WeekList } from '@/components/plan/WeekList';
import { TabScreen } from '@/components/TabScreen';
import { Button, Card, ListRow, PageHeader, RowBadge, SectionTitle, Txt } from '@/components/ui';
import { todayISO } from '@/lib/dates';
import { plural } from '@/lib/format';
import { planFacts, planWeekView, positionText, sessionsPerWeekText } from '@/lib/planView';
import { startEmptyWorkoutFlow, startPlanWorkoutFlow, startSportFlow } from '@/lib/startWorkout';
import { useNow } from '@/lib/useNow';
import { useStore } from '@/store/useStore';
import { C, S } from '@/theme';

export default function PlanScreen() {
  const plans = useStore((s) => s.plans);
  const activePlanId = useStore((s) => s.activePlanId);
  const planState = useStore((s) => s.planState);
  const workouts = useStore((s) => s.workouts);
  // Keeps "today" right when the app stays open past midnight.
  const now = useNow(60_000);
  const today = todayISO(new Date(now));
  const plan = plans.find((p) => p.id === activePlanId) ?? plans[0];
  if (!plan) return null;
  const view = planWeekView(plan, planState[plan.id], workouts, today);
  const pos = view.position;
  const facts = planFacts(plan);
  const text = pos?.started ? positionText(plan, pos) : null;
  const subtitle = text
    ? `${text.week}${text.phase ? ` · ${text.phase}` : ''}`
    : pos
      ? `Starts in ${plural(pos.daysUntilStart, 'day')}`
      : undefined;

  return (
    <TabScreen>
      <PageHeader
        subtitle={subtitle}
        title="Plan"
        right={<Button size="pill" variant="secondary" title="Plans" iconRight="chevron-forward" onPress={() => router.push('/plans')} />}
      />

      <Card onPress={() => router.push(`/plans/${plan.id}`)} accessibilityLabel={`${plan.name}: see the plan`} style={{ minHeight: 72 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.md }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt v="h2">{plan.name}</Txt>
            <Txt v="small">Your plan · {sessionsPerWeekText(facts)}</Txt>
          </View>
          <Ionicons name="chevron-forward" size={20} color={C.textFaint} />
        </View>
      </Card>

      <View style={{ gap: 10 }}>
        <SectionTitle
          title="This week"
          right={
            view.sessionsPlannedAll > 0 ? (
              <Txt v="small">
                {view.sessionsDoneAll} of {plural(view.sessionsPlannedAll, 'session')} done
              </Txt>
            ) : undefined
          }
        />
        <WeekList
          days={view.days}
          onStart={(id) => startPlanWorkoutFlow(plan.id, id)}
          onStartSport={(s) => s.sport && startSportFlow({ sport: s.sport, planId: plan.id, sessionId: s.id })}
        />
        <WeekLegend />
      </View>

      <SectionTitle title="Or train freely" />
      <Card variant="list">
        <ListRow
          leading={<RowBadge icon="create-outline" />}
          title="Empty workout"
          subtitle="Pick exercises as you go"
          onPress={() => startEmptyWorkoutFlow()}
          trailing={
            <Button
              size="pill"
              variant="outline"
              title="Start"
              accessibilityLabel="Start an empty workout"
              onPress={() => startEmptyWorkoutFlow()}
            />
          }
        />
      </Card>
    </TabScreen>
  );
}
