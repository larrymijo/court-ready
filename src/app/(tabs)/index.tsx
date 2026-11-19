import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ChooseWorkoutSheet } from '@/components/plan/ChooseWorkoutSheet';
import { NumInput } from '@/components/NumInput';
import { logPastSession, SportMark, SportPrepLinks, SportSessionCard, startPlannedSport } from '@/components/today/SportSessionCard';
import { TabScreen } from '@/components/TabScreen';
import {
  Button,
  Card,
  Check,
  Divider,
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
import { mondayOfISO, todayISO, weekdayIndex } from '@/lib/dates';
import { exportBackup } from '@/lib/exportBackup';
import { formatDuration, formatElapsed, formatKg, formatShortDate, formatVolume, plural } from '@/lib/format';
import { prescribeItem, recordKind } from '@/lib/plans';
import {
  gameModeHint,
  gameModeHintText,
  offDayTitle,
  planTargetTiles,
  planWeekView,
  positionText,
  type ChooseSportItem,
  type WeekDayView,
} from '@/lib/planView';
import { routineAreas, routineSummary } from '@/lib/routineSummary';
import { sportRecordName, sportSummary } from '@/lib/sportView';
import { startEmptyWorkoutFlow, startPlanWorkoutFlow, startSportFlow } from '@/lib/startWorkout';
import { doneToday as finishedToday, weekSummary, workoutDurationMs, workoutSetCount, workoutVolume } from '@/lib/stats';
import type { GymWorkout, PhaseId, Plan } from '@/lib/types';
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
  const doneToday = finishedToday(workouts, today);
  // Gym and sport sessions of the week: sport counts its sessions and its minutes, never sets or kg.
  const week = weekSummary(workouts, monday);
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
  const gameHint = gameModeHint(plan, today);

  const startFromPicker = (planId: string, workoutId: string) => {
    setPicking(false);
    startPlanWorkoutFlow(planId, workoutId);
  };
  const startSportFromPicker = (item: ChooseSportItem) => {
    setPicking(false);
    startSportFlow({ sport: item.sport, planId: item.planId, sessionId: item.sessionId });
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
          {doneToday.map((w, i) => (
            <ListRow
              key={w.id}
              leading={<Check done size={28} />}
              title={`Done today: ${recordKind(w) === 'sport' ? sportRecordName(w) : w.name}`}
              subtitle={
                recordKind(w) === 'sport'
                  ? sportSummary(w) || 'Sport session'
                  : `${formatDuration(workoutDurationMs(w))} · ${plural(workoutSetCount(w), 'set')} · ${formatVolume(workoutVolume(w))}${
                      w.prs?.length ? ` · ${plural(w.prs.length, 'PR')}` : ''
                    }`
              }
              chevron
              divider={i < doneToday.length - 1}
              onPress={() => router.push(`/history/${w.id}`)}
            />
          ))}
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
              done={doneToday.some((w) => recordKind(w) === 'gym' && w.planId === plan.id && w.sessionId === workout.id)}
              primary={!active && i === 0}
              gameModeHint={gameHint}
              onChooseAnother={() => setPicking(true)}
            />
          );
        })
      ) : (
        <OffDayCard plan={plan} day={day} onTrainAnyway={() => setPicking(true)} />
      )}
      {gymCards.length > 0
        ? sportToday.map((s) => <SportSessionCard key={`${s.kind}-${s.id}`} plan={plan} session={s} />)
        : null}

      <SectionTitle title="This week" right={week.sessions > 0 ? <Txt v="small">{plural(week.sessions, 'session')}</Txt> : undefined} />
      <Row gap={S.sm} align="stretch">
        <StatTile label="Hard sets" value={String(week.sets)} />
        <StatTile label="Volume" value={formatVolume(week.volume)} />
        <StatTile label="Time" value={formatDuration(week.minutes * 60_000)} />
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
        onStartSport={startSportFromPicker}
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
        {view.sessionsPlannedAll > 0 ? (
          <Txt v="small">
            {view.sessionsDoneAll} of {view.sessionsPlannedAll} sessions
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
  gameModeHint: sportTomorrow,
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
  /** The sport session planned tomorrow, if any: a suggestion line shows, game mode stays the person's choice. */
  gameModeHint?: string;
  onChooseAnother: () => void;
}) {
  const gm = !!workout.gameMode && gameMode;
  const known = workout.items.filter((item) => EXERCISE_BY_ID[item.exerciseId]);
  const exercises = known.filter((item) => !prescribeItem(item, getExercise(item.exerciseId), workout, { phase, gameMode: gm }).skip).length;
  const shown: GymWorkout = { ...workout, items: known };
  return (
    <Card variant="hero">
      <Txt v="label">{done ? 'Scheduled today · done' : 'Up next · scheduled today'}</Txt>
      <View style={{ gap: 4 }}>
        <Txt v="hero">{workout.name}</Txt>
        <Txt color={C.textMuted}>{routineSummary(shown, exercises)}</Txt>
      </View>
      <Row gap={6} style={{ flexWrap: 'wrap' }}>
        {routineAreas(shown, getExercise).map((area) => (
          <Tag key={area} label={area} />
        ))}
      </Row>
      {workout.gameMode ? (
        <>
          {sportTomorrow && !gameMode ? <Txt v="small">{gameModeHintText(sportTomorrow)}</Txt> : null}
          <ToggleRow
            title="Game mode"
            subtitle={
              sportTomorrow
                ? '2 sets per exercise, RIR 3, no split squats.'
                : 'Volleyball tomorrow? 2 sets per exercise, RIR 3, no split squats.'
            }
            value={gameMode}
            onChange={setGameMode}
          />
        </>
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

/**
 * A day with no required gym session: sport, optional sessions or rest. Says what is planned and
 * still lets you train. A planned sport session gets Start, "Log a past session" and its checklists.
 */
function OffDayCard({ plan, day, onTrainAnyway }: { plan: Plan; day: WeekDayView; onTrainAnyway: () => void }) {
  const sports = day.sessions.filter((s) => s.kind === 'sport');
  const sport = sports.length > 0;
  const requiredSport = sports.some((s) => !s.optional);
  const optionalGym = day.sessions.find((s) => s.kind === 'gym');
  const allDone = sport && sports.every((s) => s.done);
  const body = day.note ?? (requiredSport ? 'No gym today.' : 'Nothing planned today. Rest, or train if you feel like it.');
  return (
    <Card variant="hero">
      <Txt v="label">
        {sport ? (allDone ? 'Scheduled today · done' : 'Up next · scheduled today') : day.sessions.length > 0 ? 'Scheduled today' : 'Rest day'}
      </Txt>
      <View style={{ gap: 4 }}>
        <Row gap={10}>
          {sport ? <SportMark size={10} /> : null}
          <Txt v="hero" style={{ flexShrink: 1 }}>
            {offDayTitle(day)}
          </Txt>
        </Row>
        <Txt color={C.textMuted}>{body}</Txt>
      </View>
      {sport ? (
        <>
          {sports.map((s, i) => (
            <View key={s.id} style={{ gap: S.md }}>
              <Button
                size="large"
                variant={i === 0 && !s.done ? 'primary' : 'secondary'}
                icon="play"
                title={s.done ? 'Start again' : sports.length > 1 ? `Start ${s.name}` : 'Start'}
                onPress={() => startPlannedSport(plan, s)}
              />
              <SportPrepLinks plan={plan} session={s} />
            </View>
          ))}
          <Row style={{ justifyContent: 'center', flexWrap: 'wrap', marginVertical: -8 }}>
            <Button variant="ghost" title="Log a past session" onPress={() => logPastSession(sports[0].sport)} />
            <Button variant="ghost" title="Choose another workout" onPress={onTrainAnyway} />
          </Row>
          <Divider />
        </>
      ) : (
        <Button size="large" variant="secondary" title="Train anyway" onPress={onTrainAnyway} />
      )}
      {sport || optionalGym ? (
        <Row style={{ justifyContent: 'space-between', marginTop: -6, marginBottom: -10, marginHorizontal: -S.sm }}>
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
