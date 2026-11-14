import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ChooseWorkoutSheet } from '@/components/plan/ChooseWorkoutSheet';
import { NumInput } from '@/components/NumInput';
import { TabScreen } from '@/components/TabScreen';
import {
  Button,
  Card,
  Check,
  IconButton,
  ListRow,
  PageHeader,
  ProgressBar,
  Row,
  SectionTitle,
  StatTile,
  StepBar,
  Tag,
  ToggleRow,
  Txt,
} from '@/components/ui';
import { WeekStrip } from '@/components/WeekStrip';
import { EXERCISE_BY_ID, getExercise } from '@/data/exercises';
import { DAY_LONG } from '@/data/schedule';
import { backupStatus, daysAgoText } from '@/lib/backupStatus';
import { isoFromTimestamp, mondayOfISO, todayISO, weekdayIndex } from '@/lib/dates';
import { exportBackup } from '@/lib/exportBackup';
import { formatDuration, formatElapsed, formatKg, formatShortDate, formatVolume, plural } from '@/lib/format';
import { prescribeItem } from '@/lib/plans';
import { planTargetTiles, planWeekView, positionText, type WeekDayView } from '@/lib/planView';
import { routineAreas, routineSummary } from '@/lib/routineSummary';
import { startEmptyWorkoutFlow, startPlanWorkoutFlow } from '@/lib/startWorkout';
import { workoutDurationMs, workoutSetCount, workoutsInWeek, workoutVolume } from '@/lib/stats';
import type { GymWorkout, PhaseId, Plan, Routine } from '@/lib/types';
import { useNow } from '@/lib/useNow';
import { workoutPosition } from '@/store/planData';
import { useStore } from '@/store/useStore';
import { C, S } from '@/theme';

export default function TodayScreen() {
  const settings = useStore((s) => s.settings);
  const workouts = useStore((s) => s.workouts);
  const active = useStore((s) => s.active);
  const body = useStore((s) => s.body);
  const logBody = useStore((s) => s.logBody);
  const plans = useStore((s) => s.plans);
  const activePlanId = useStore((s) => s.activePlanId);
  const planState = useStore((s) => s.planState);
  const now = useNow(30_000);
  const nowDate = new Date(now);
  const today = todayISO(nowDate);
  const monday = mondayOfISO(today);
  const plan = plans.find((p) => p.id === activePlanId) ?? plans[0];
  const weekView = plan ? planWeekView(plan, planState[plan.id], workouts, today) : null;
  const day = weekView?.days[weekdayIndex(nowDate)];
  const weekWorkouts = workoutsInWeek(workouts, monday);
  const doneToday = workouts.filter((w) => isoFromTimestamp(w.startedAt) === today);
  const weekVolume = weekWorkouts.reduce((a, w) => a + workoutVolume(w), 0);
  const weekSets = weekWorkouts.reduce((a, w) => a + workoutSetCount(w), 0);
  const weekTime = weekWorkouts.reduce((a, w) => a + workoutDurationMs(w), 0);
  const [gameMode, setGameMode] = useState(false);
  const [picking, setPicking] = useState(false);
  const todayWeight = body.find((b) => b.date === today)?.weight ?? null;
  const backup = backupStatus(workouts, settings.lastExportAt, now);

  if (!plan || !weekView || !day) return null;

  const phase = workoutPosition(plan, planState[plan.id], today).phase;
  // A gym session is the card of the day when it is required, or when no required one is planned.
  const gymToday = day.sessions.filter((s) => s.kind === 'gym');
  const hasRequiredGym = gymToday.some((s) => !s.optional);
  const gymCards = hasRequiredGym ? gymToday : [];
  const sportToday = day.sessions.filter((s) => s.kind === 'sport');
  const sportDay = sportToday.some((s) => !s.optional);
  const targets = planTargetTiles(plan, sportDay);
  const hasFood = !!plan.articles?.includes('food');

  const startFromPicker = (planId: string, workoutId: string) => {
    setPicking(false);
    startPlanWorkoutFlow(planId, workoutId);
  };

  return (
    <TabScreen>
      <PageHeader
        subtitle={`${DAY_LONG[weekdayIndex(nowDate)]} ${formatShortDate(now)}`}
        title="Today"
        right={<IconButton icon="settings-outline" label="Settings" onPress={() => router.push('/settings')} />}
      />

      {active ? <ResumeCard /> : null}

      <PlanCard plan={plan} view={weekView} />

      <WeekStrip days={weekView.days} workouts={workouts} />

      {doneToday.length > 0 ? (
        <Card variant="list">
          <ListRow
            leading={<Check done size={28} />}
            title={`Done today: ${doneToday[0].name}`}
            subtitle={`${formatDuration(workoutDurationMs(doneToday[0]))} · ${plural(workoutSetCount(doneToday[0]), 'set')} · ${formatVolume(workoutVolume(doneToday[0]))}${
              doneToday[0].prs?.length ? ` · ${plural(doneToday[0].prs.length, 'PR')}` : ''
            }`}
            chevron
            onPress={() => router.push(`/history/${doneToday[0].id}`)}
          />
        </Card>
      ) : null}

      {gymCards.length > 0 ? (
        gymCards.map((s, i) => {
          const workout = plan.workouts.find((w) => w.id === s.id);
          if (!workout) return null;
          return (
            <GymCard
              key={`${s.id}-${i}`}
              plan={plan}
              workout={workout}
              phase={phase}
              gameMode={gameMode}
              setGameMode={setGameMode}
              done={doneToday.some((w) => w.planId === plan.id && w.sessionId === workout.id)}
              primary={!active && i === 0}
              onChooseAnother={() => setPicking(true)}
            />
          );
        })
      ) : (
        <OffDayCard plan={plan} day={day} onTrainAnyway={() => setPicking(true)} />
      )}
      {gymCards.length > 0 && sportToday.length > 0 ? (
        <Card variant="list">
          {sportToday.map((s, i) => (
            <ListRow
              key={s.id}
              title={s.name}
              subtitle={s.optional ? 'Sport · optional. Open the game warm-up.' : 'Sport. Open the game warm-up.'}
              chevron
              divider={i < sportToday.length - 1}
              onPress={() => router.push('/guide/warmups')}
            />
          ))}
        </Card>
      ) : null}

      <SectionTitle title="This week" />
      <Row gap={S.sm} align="stretch">
        <StatTile label="Hard sets" value={String(weekSets)} />
        <StatTile label="Volume" value={formatVolume(weekVolume)} />
        <StatTile label="Time" value={formatDuration(weekTime)} />
      </Row>

      {targets.length > 0 ? (
        <>
          <SectionTitle title="Daily targets" right={hasFood ? <Txt v="caption">20-day food plan</Txt> : undefined} />
          <Row gap={S.sm} align="stretch">
            {targets.map((t) => (
              <StatTile
                key={t.key}
                label={t.label}
                value={t.value}
                caption={t.caption}
                onPress={hasFood ? () => router.push('/guide/food') : undefined}
              />
            ))}
          </Row>
        </>
      ) : null}

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt v="h2">Morning weigh-in</Txt>
          <Button
            variant="ghost"
            title="History"
            iconRight="chevron-forward"
            style={{ marginVertical: -S.md, marginRight: -S.md }}
            onPress={() => router.push('/progress')}
          />
        </Row>
        {todayWeight != null ? (
          <Row gap={S.md}>
            <Check done size={24} />
            <Txt>Logged {formatKg(todayWeight)} kg today</Txt>
          </Row>
        ) : (
          <QuickWeigh onSave={(kg) => logBody({ date: today, weight: kg })} />
        )}
        <Txt v="caption">After the toilet, before eating. The weekly average is what counts.</Txt>
      </Card>

      {backup.remind ? (
        <Card>
          <Row gap={S.md} align="flex-start">
            <Ionicons name="save-outline" size={22} color={C.textMuted} style={{ marginTop: 1 }} />
            <View style={{ flex: 1, gap: 2 }}>
              <Txt v="h2">Back up your workouts</Txt>
              <Txt v="small">
                {plural(backup.unsaved, 'workout')} {backup.unsaved === 1 ? 'is' : 'are'} saved only on this phone
                {settings.lastExportAt ? `; your last backup was ${daysAgoText(settings.lastExportAt, now)}` : ''}.
              </Txt>
            </View>
          </Row>
          <Button variant="secondary" icon="share-outline" title="Export backup" onPress={exportBackup} />
        </Card>
      ) : null}

      <ChooseWorkoutSheet
        visible={picking}
        plans={plans}
        activePlanId={plan.id}
        workouts={workouts}
        today={today}
        onStart={startFromPicker}
        onStartEmpty={() => {
          setPicking(false);
          startEmptyWorkoutFlow();
        }}
        onClose={() => setPicking(false)}
      />
    </TabScreen>
  );
}

/** Where you are in the plan, and how many of this week's sessions are done. Opens the guide page or the plan. */
function PlanCard({ plan, view }: { plan: Plan; view: ReturnType<typeof planWeekView> }) {
  const pos = view.position;
  const text = pos?.started ? positionText(plan, pos) : null;
  const guide = !!plan.articles?.includes('weeks12');
  const cycleLength = plan.cycle?.phases.length ?? 0;
  return (
    <Card
      onPress={() => router.push(guide ? '/guide/weeks12' : `/plans/${plan.id}`)}
      accessibilityLabel={guide ? 'Your place in the 12-week plan. Opens the guide.' : `${plan.name}: your place in the plan. Opens the plan.`}>
      <Row style={{ justifyContent: 'space-between' }} align="baseline" gap={S.md}>
        {text ? (
          <Txt style={{ fontWeight: '600', flexShrink: 1 }}>
            {text.week}
            {text.phase ? (
              <Txt color={C.textFaint} style={{ fontWeight: '500' }}>
                {' '}
                · {text.phase}
                {text.cycle > 1 ? ` · cycle ${text.cycle}` : ''}
              </Txt>
            ) : null}
          </Txt>
        ) : (
          <Txt style={{ fontWeight: '600', flexShrink: 1 }}>
            {pos ? `Starts in ${plural(pos.daysUntilStart, 'day')}` : plan.name}
          </Txt>
        )}
        {view.sessionsPlanned > 0 ? (
          <Txt v="small">
            {view.sessionsDone} of {view.sessionsPlanned} sessions
          </Txt>
        ) : null}
      </Row>
      {cycleLength > 0 ? <StepBar total={cycleLength} filled={pos?.started ? pos.week : 0} /> : null}
      {text?.rule ? (
        <Txt v="small">{text.rule}</Txt>
      ) : pos && !pos.started ? (
        <Txt v="small">Change the start date on the plan page.</Txt>
      ) : null}
    </Card>
  );
}

function ResumeCard() {
  const active = useStore((s) => s.active)!;
  const now = useNow(1000);
  const done = active.exercises.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);
  const total = active.exercises.reduce((n, e) => n + e.sets.length, 0);
  return (
    <Card variant="hero">
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt v="label">Workout in progress</Txt>
        <Txt v="small">{formatElapsed(now - active.startedAt)}</Txt>
      </Row>
      <View style={{ gap: 4 }}>
        <Txt v="hero">{active.name}</Txt>
        <Txt color={C.textMuted}>
          {done} of {plural(total, 'set')} done
        </Txt>
      </View>
      <ProgressBar value={total ? done / total : 0} />
      <Button title="Resume workout" icon="play" onPress={() => router.push('/workout')} />
    </Card>
  );
}

/** A gym session planned for today. */
function GymCard({
  plan,
  workout,
  phase,
  gameMode,
  setGameMode,
  done,
  primary,
  onChooseAnother,
}: {
  plan: Plan;
  workout: GymWorkout;
  phase: PhaseId;
  gameMode: boolean;
  setGameMode: (v: boolean) => void;
  done: boolean;
  /** False while another workout is open: then "Resume" is the main action of the screen. */
  primary: boolean;
  onChooseAnother: () => void;
}) {
  const gm = !!workout.gameMode && gameMode;
  const known = workout.items.filter((item) => EXERCISE_BY_ID[item.exerciseId]);
  const exercises = known.filter((item) => !prescribeItem(item, getExercise(item.exerciseId), workout, { phase, gameMode: gm }).skip).length;
  // routineSummary and routineAreas read only the items, focus and minutes, which a workout has too.
  const asRoutine = { ...workout, items: known } as unknown as Routine;
  return (
    <Card variant="hero">
      <Txt v="label">{done ? 'Scheduled today · done' : 'Up next · scheduled today'}</Txt>
      <View style={{ gap: 4 }}>
        <Txt v="hero">{workout.name}</Txt>
        <Txt color={C.textMuted}>{routineSummary(asRoutine, exercises)}</Txt>
      </View>
      <Row gap={6} style={{ flexWrap: 'wrap' }}>
        {routineAreas(asRoutine, getExercise).map((area) => (
          <Tag key={area} label={area} />
        ))}
      </Row>
      {workout.gameMode ? (
        <ToggleRow
          title="Game mode"
          subtitle="Volleyball tomorrow? 2 sets per exercise, RIR 3, no split squats."
          value={gameMode}
          onChange={setGameMode}
        />
      ) : null}
      <Button
        size="large"
        title={done ? 'Train again' : 'Start workout'}
        icon="play"
        variant={done || !primary ? 'secondary' : 'primary'}
        onPress={() => startPlanWorkoutFlow(plan.id, workout.id, { gameMode: gm })}
      />
      <Row style={{ justifyContent: 'space-between', marginTop: -6, marginBottom: -10, marginHorizontal: -S.sm }}>
        <Button variant="ghost" title="Preview" onPress={() => router.push(`/plans/${plan.id}/${workout.id}`)} />
        <Button variant="ghost" title="Choose another workout" iconRight="chevron-forward" onPress={onChooseAnother} />
      </Row>
    </Card>
  );
}

/** A day with no required gym session: sport, optional sessions or rest. Says what is planned and still lets you train. */
function OffDayCard({ plan, day, onTrainAnyway }: { plan: Plan; day: WeekDayView; onTrainAnyway: () => void }) {
  const names = day.sessions.map((s) => s.name);
  const sport = day.sessions.some((s) => s.kind === 'sport');
  const requiredSport = day.sessions.some((s) => s.kind === 'sport' && !s.optional);
  const optionalGym = day.sessions.find((s) => s.kind === 'gym');
  const body =
    day.note ??
    (requiredSport
      ? 'No gym today. Warm up properly, and stretch your hitting arm after playing.'
      : 'Nothing planned today. Rest, or train if you feel like it.');
  return (
    <Card variant="hero">
      <Txt v="label">{day.sessions.length > 0 ? 'Scheduled today' : 'Rest day'}</Txt>
      <View style={{ gap: 4 }}>
        <Txt v="hero">{names.length > 0 ? names.join(' or ') : 'Rest'}</Txt>
        <Txt color={C.textMuted}>{body}</Txt>
      </View>
      <Button size="large" variant="secondary" title="Train anyway" onPress={onTrainAnyway} />
      {sport || optionalGym ? (
        <Row style={{ justifyContent: 'space-between', marginTop: -6, marginBottom: -10, marginHorizontal: -S.sm }}>
          {sport ? <Button variant="ghost" title="Game warm-up" onPress={() => router.push('/guide/warmups')} /> : <View />}
          {optionalGym ? (
            <Button
              variant="ghost"
              title={`${optionalGym.name} session`}
              iconRight="chevron-forward"
              onPress={() => router.push(`/plans/${plan.id}/${optionalGym.id}`)}
            />
          ) : (
            <Button variant="ghost" title="Pain rules" iconRight="chevron-forward" onPress={() => router.push('/guide/pain')} />
          )}
        </Row>
      ) : null}
    </Card>
  );
}

function QuickWeigh({ onSave }: { onSave: (kg: number) => void }) {
  const [kg, setKg] = useState<number | null>(null);
  return (
    <Row gap={S.sm}>
      <View style={{ flex: 1 }}>
        <NumInput value={kg} onChange={setKg} placeholder="kg" size="large" accessibilityLabel="Bodyweight in kg" />
      </View>
      <Button variant="secondary" title="Save" disabled={kg == null || kg < 30 || kg > 250} onPress={() => kg != null && onSave(kg)} />
    </Row>
  );
}
