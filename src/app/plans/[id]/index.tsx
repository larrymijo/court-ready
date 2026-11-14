import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { PlanTags } from '@/components/plan/PlanTags';
import {
  BOTTOM_BAR_SPACE,
  BottomBar,
  Button,
  Card,
  Divider,
  fieldStyle,
  Row,
  Screen,
  SectionTitle,
  Sheet,
  Stepper,
  Txt,
  type SheetAction,
} from '@/components/ui';
import { EXERCISE_BY_ID } from '@/data/exercises';
import { DAY_SHORT } from '@/data/schedule';
import { addDaysISO, isISODate, mondayOfISO, parseISODate, todayISO } from '@/lib/dates';
import { formatDateLong, formatShortDate, plural } from '@/lib/format';
import { daySessions, planPosition } from '@/lib/plans';
import { lighterWeekTile, planDescription, planFacts, planStanding, positionText, weekOfText } from '@/lib/planView';
import { confirm } from '@/lib/platform';
import { repsText } from '@/lib/program';
import { useStore } from '@/store/useStore';
import { C, S } from '@/theme';

type Ask = 'start' | 'continue' | 'delete' | null;

export default function PlanPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const plans = useStore((s) => s.plans);
  const activePlanId = useStore((s) => s.activePlanId);
  const planState = useStore((s) => s.planState);
  const activatePlan = useStore((s) => s.activatePlan);
  const deletePlan = useStore((s) => s.deletePlan);
  const [ask, setAsk] = useState<Ask>(null);
  const plan = plans.find((p) => p.id === id);
  if (!plan) return null;

  const today = todayISO();
  const inUse = plan.id === activePlanId;
  const facts = planFacts(plan);
  const standing = planStanding(plan, planState[plan.id], inUse, today);
  const thisMonday = mondayOfISO(today);
  const nextMonday = addDaysISO(thisMonday, 7);
  const dateText = (iso: string) => formatShortDate(parseISODate(iso).getTime());
  const lighter = lighterWeekTile(plan);
  const others = plans.filter((p) => p.id !== plan.id);

  const used = () => router.navigate('/plan');

  const useThisPlan = () => {
    if (standing.status === 'paused') {
      if (facts.hasRhythm) setAsk('continue');
      else if (activatePlan(plan.id, 'continue')) used();
    } else if (facts.hasRhythm) {
      setAsk('start');
    } else if (activatePlan(plan.id, 'continue')) {
      used();
    }
  };

  const startOn = (iso: string): void => {
    if (activatePlan(plan.id, iso)) used();
  };

  const startActions: SheetAction[] = [
    { label: 'This Monday', hint: dateText(thisMonday), onPress: () => startOn(thisMonday) },
    { label: 'Next Monday', hint: dateText(nextMonday), onPress: () => startOn(nextMonday) },
  ];
  const continueActions: SheetAction[] =
    standing.status === 'paused'
      ? [
          {
            label: `Continue at week ${standing.week}`,
            hint: 'Back to the week you left it in.',
            onPress: () => {
              if (activatePlan(plan.id, 'continue')) used();
            },
          },
          { label: 'Start again at week 1', hint: `From ${dateText(thisMonday)}.`, onPress: () => startOn(thisMonday) },
        ]
      : [];

  const del = async () => {
    if (others.length === 0) return;
    if (inUse) {
      setAsk('delete');
      return;
    }
    const ok = await confirm(`Delete “${plan.name}”?`, 'Your workout history stays. Only the plan is removed.', 'Delete', true);
    if (ok && deletePlan(plan.id)) router.replace('/plans');
  };

  const deleteActions: SheetAction[] = others.map((p) => ({
    label: p.name,
    hint: 'Delete this plan and use that one instead',
    onPress: () => {
      if (deletePlan(plan.id, p.id)) router.replace('/plans');
    },
  }));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Stack.Screen options={{ title: 'Plan' }} />
      <Screen edgesTop={false} bottomPad={inUse ? S.xl : BOTTOM_BAR_SPACE}>
        <View style={{ gap: 6 }}>
          <Row gap={10} style={{ flexWrap: 'wrap' }}>
            <Txt v="title" accessibilityRole="header">
              {plan.name}
            </Txt>
            <PlanTags plan={plan} inUse={inUse} />
          </Row>
          <Txt color={C.textMuted}>{planDescription(plan)}</Txt>
        </View>

        <Row gap={S.sm} align="stretch">
          <FactTile label="Gym sessions" value={String(facts.gymPerWeek)} caption="a week" />
          <FactTile label="Weights" value={facts.progressionTitle} caption={facts.progressionText} />
          <FactTile label="Lighter week" value={lighter.value} caption={lighter.caption} />
        </Row>

        {inUse && facts.hasRhythm ? <PositionCard planId={plan.id} /> : null}

        <SectionTitle title="The week" />
        <Card variant="list" style={{ paddingHorizontal: S.lg }}>
          {DAY_SHORT.map((name, d) => {
            const sessions = daySessions(plan, d);
            return (
              <View
                key={name}
                style={{
                  minHeight: 44,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: S.md,
                  paddingVertical: sessions.length > 1 ? 6 : 0,
                  borderBottomWidth: d < 6 ? 1 : 0,
                  borderBottomColor: C.hairline,
                }}>
                <Txt v="tiny" style={{ width: 36, fontWeight: '600', letterSpacing: 0.66 }}>
                  {name}
                </Txt>
                <View style={{ flex: 1, gap: 2 }}>
                  {sessions.length === 0 ? (
                    <Txt color={C.textFaint} style={{ paddingLeft: 14 }}>
                      Rest
                    </Txt>
                  ) : (
                    sessions.map((s) => {
                      const sessionName = s.kind === 'gym' ? s.workout.name : s.session.name;
                      const minutes = s.kind === 'gym' ? s.workout.minutes : s.session.minutes;
                      return (
                        <View
                          key={`${s.kind}-${sessionName}`}
                          style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm, minHeight: 32 }}>
                          <View
                            style={
                              s.kind === 'gym'
                                ? { width: 6, height: 6, borderRadius: 3, backgroundColor: C.text }
                                : { width: 6, height: 6, borderRadius: 3, borderWidth: 1.5, borderColor: C.textMuted }
                            }
                          />
                          <Txt style={{ flex: 1, fontWeight: '600' }} numberOfLines={1}>
                            {sessionName}
                            {s.optional ? ' (optional)' : ''}
                          </Txt>
                          {minutes ? <Txt v="small">{minutes} min</Txt> : null}
                        </View>
                      );
                    })
                  )}
                </View>
              </View>
            );
          })}
        </Card>

        <SectionTitle title="Workouts" />
        {plan.workouts.map((w) => {
          const items = w.items.filter((i) => EXERCISE_BY_ID[i.exerciseId]);
          return (
            <Card
              key={w.id}
              onPress={() => router.push(`/plans/${plan.id}/${w.id}`)}
              accessibilityLabel={`${w.name}: see the workout`}
              style={{ gap: 10 }}>
              <Row gap={S.md} align="baseline" style={{ justifyContent: 'space-between' }}>
                <Txt v="h2" style={{ flexShrink: 1 }}>
                  {w.name}
                </Txt>
                <Row gap={S.xs}>
                  <Txt v="small">
                    {plural(items.length, 'exercise')} · about {w.minutes} min
                  </Txt>
                  <Ionicons name="chevron-forward" size={16} color={C.textFaint} />
                </Row>
              </Row>
              <View>
                {items.map((item) => (
                  <View
                    key={item.key}
                    style={{ minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: S.md }}>
                    <Txt style={{ flexShrink: 1 }}>{EXERCISE_BY_ID[item.exerciseId].name}</Txt>
                    <Txt color={C.textMuted}>
                      {item.sets} × {repsText(item, item.perSide)}
                    </Txt>
                  </View>
                ))}
              </View>
            </Card>
          );
        })}

        {others.length > 0 ? (
          <Button variant="danger" title="Delete plan" style={{ alignSelf: 'center' }} onPress={del} />
        ) : (
          <Txt v="caption" style={{ textAlign: 'center' }}>
            This is your only plan, so it can’t be deleted. Restore an example from the plan list to have another.
          </Txt>
        )}
      </Screen>

      {inUse ? null : (
        <BottomBar>
          <Button title="Use this plan" onPress={useThisPlan} />
        </BottomBar>
      )}

      <Sheet
        visible={ask === 'start'}
        title="When does week 1 start?"
        subtitle={`${plan.name} has weeks that change. Pick the Monday it begins.`}
        actions={startActions}
        onClose={() => setAsk(null)}
      />
      <Sheet
        visible={ask === 'continue'}
        title={`Use ${plan.name}`}
        subtitle={
          standing.status === 'paused'
            ? `You left it in ${weekOfText(standing.week, standing.cycleLength)}.`
            : undefined
        }
        actions={continueActions}
        onClose={() => setAsk(null)}
      />
      <Sheet
        visible={ask === 'delete'}
        title={`Delete “${plan.name}”?`}
        subtitle="Your workout history stays. Pick the plan to use instead."
        actions={deleteActions}
        onClose={() => setAsk(null)}
      />
    </View>
  );
}

function FactTile({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <Card style={{ flex: 1, padding: S.md, gap: 4, borderRadius: 14 }}>
      <Txt v="caption" style={{ fontWeight: '500' }}>
        {label}
      </Txt>
      <Txt v="bar">{value}</Txt>
      <Txt v="tiny">{caption}</Txt>
    </Card>
  );
}

/** Where the plan in use stands, and moving its start date by a week. */
function PositionCard({ planId }: { planId: string }) {
  const plan = useStore((s) => s.plans.find((p) => p.id === planId))!;
  const state = useStore((s) => s.planState[planId]);
  const setPlanStart = useStore((s) => s.setPlanStart);
  const [dateText, setDateText] = useState(state?.start ?? '');
  if (!state) return null;
  const today = todayISO();
  const pos = planPosition(plan, state, today);
  const text = positionText(plan, pos);
  const setStart = (iso: string) => {
    const monday = mondayOfISO(iso);
    setPlanStart(planId, monday);
    setDateText(monday);
  };
  return (
    <Card>
      <View style={{ gap: 2 }}>
        <Txt v="h2">
          {pos.started
            ? `${text.week}${text.phase ? ` · ${text.phase}` : ''}${pos.cycle > 1 ? ` · cycle ${pos.cycle}` : ''}`
            : `Starts in ${plural(pos.daysUntilStart, 'day')}`}
        </Txt>
        {pos.started && text.rule ? <Txt v="small">{text.rule}</Txt> : null}
        <Txt v="small">Week 1 started on {formatDateLong(parseISODate(state.start).getTime())}.</Txt>
      </View>
      {/* One week back in the plan means week 1 began a week later, and the other way round. */}
      <Stepper
        value={pos.started ? `Week ${pos.week}` : 'Not started'}
        decrementLabel="One week back in the plan"
        incrementLabel="One week forward in the plan"
        onDecrement={() => setStart(addDaysISO(state.start, 7))}
        onIncrement={() => setStart(addDaysISO(state.start, -7))}
      />
      <Button variant="secondary" title="Start week 1 this Monday" onPress={() => setStart(today)} />
      <Divider />
      <Txt v="caption">Or type the date week 1 began (YYYY-MM-DD). It snaps to that week’s Monday.</Txt>
      <Row gap={S.sm}>
        <TextInput
          value={dateText}
          onChangeText={setDateText}
          style={[fieldStyle, { flex: 1 }]}
          placeholder="2026-10-05"
          placeholderTextColor={C.textFaint}
          accessibilityLabel="Date week 1 began"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Button variant="secondary" title="Set" disabled={!isISODate(dateText)} onPress={() => setStart(dateText)} />
      </Row>
    </Card>
  );
}
