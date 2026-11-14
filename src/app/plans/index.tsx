import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { PlanTags } from '@/components/plan/PlanTags';
import { Button, Card, ListRow, Screen, SectionTitle, Txt } from '@/components/ui';
import { todayISO } from '@/lib/dates';
import { planListLine, planStanding } from '@/lib/planView';
import { notify } from '@/lib/platform';
import { useStore } from '@/store/useStore';
import { C, S } from '@/theme';

export default function PlansScreen() {
  const plans = useStore((s) => s.plans);
  const activePlanId = useStore((s) => s.activePlanId);
  const planState = useStore((s) => s.planState);
  const restoreExamples = useStore((s) => s.restoreExamples);
  const today = todayISO();

  const restore = () => {
    const n = restoreExamples();
    if (n === 0) notify('Examples', 'All the examples are already there.');
    else notify('Examples restored', n === 1 ? '1 example came back.' : `${n} examples came back.`);
  };

  return (
    <Screen edgesTop={false}>
      <SectionTitle title="Your plans" />
      <Card variant="list">
        {plans.map((plan, i) => {
          const inUse = plan.id === activePlanId;
          const standing = planStanding(plan, planState[plan.id], inUse, today);
          return (
            <View
              key={plan.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: i < plans.length - 1 ? 1 : 0,
                borderBottomColor: C.hairline,
              }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${plan.name}${inUse ? ', in use' : ''}${plan.example ? ', example' : ''}: see the plan`}
                onPress={() => router.push(`/plans/${plan.id}`)}
                style={({ pressed }) => [
                  { flex: 1, flexDirection: 'row', alignItems: 'center', gap: S.md, minHeight: 76, paddingVertical: S.md },
                  pressed && { opacity: 0.6 },
                ]}>
                <View style={{ flex: 1, gap: 5 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm, flexWrap: 'wrap' }}>
                    <Txt v="h2">{plan.name}</Txt>
                    <PlanTags plan={plan} inUse={inUse} />
                  </View>
                  <Txt v="small">{planListLine(plan, standing)}</Txt>
                </View>
                <Ionicons name="chevron-forward" size={18} color={C.textFaint} />
              </Pressable>
            </View>
          );
        })}
      </Card>
      <Txt v="caption" style={{ paddingHorizontal: S.xs }}>
        Tap a plan to see its week and workouts. Switching plans keeps your history, and each plan keeps its place.
      </Txt>

      <Card variant="list">
        <ListRow
          title="Restore examples"
          subtitle="Adds back an example you deleted"
          trailing={<Button size="pill" variant="outline" title="Restore" onPress={restore} />}
        />
      </Card>
    </Screen>
  );
}
