import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { NumInput } from '@/components/NumInput';
import { RoutineRows } from '@/components/RoutineRows';
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
  RowBadge,
  SectionTitle,
  Sheet,
  StatTile,
  StepBar,
  Tag,
  ToggleRow,
  Txt,
} from '@/components/ui';
import { WeekStrip } from '@/components/WeekStrip';
import { getExercise } from '@/data/exercises';
import { getRoutine } from '@/data/routines';
import { DAILY_TARGETS, DAY_LONG, type DayPlan } from '@/data/schedule';
import { backupStatus, daysAgoText } from '@/lib/backupStatus';
import { isoFromTimestamp, mondayOfISO, todayISO, weekdayIndex } from '@/lib/dates';
import { exportBackup } from '@/lib/exportBackup';
import { formatDuration, formatElapsed, formatKg, formatShortDate, formatVolume, plural } from '@/lib/format';
import { PHASES, planForDate, prescribe, programPosition, type ProgramPosition } from '@/lib/program';
import { routineAreas, routineSummary } from '@/lib/routineSummary';
import { startRoutineFlow } from '@/lib/startWorkout';
import { workoutDurationMs, workoutSetCount, workoutsInWeek, workoutVolume } from '@/lib/stats';
import type { RoutineId } from '@/lib/types';
import { useNow } from '@/lib/useNow';
import { useStore } from '@/store/useStore';
import { C, S } from '@/theme';

export default function TodayScreen() {
  const settings = useStore((s) => s.settings);
  const workouts = useStore((s) => s.workouts);
  const active = useStore((s) => s.active);
  const body = useStore((s) => s.body);
  const logBody = useStore((s) => s.logBody);
  const now = useNow(30_000);
  const nowDate = new Date(now);
  const today = todayISO(nowDate);
  const monday = mondayOfISO(today);
  const pos = programPosition(settings.programStart, today);
  const plan = planForDate(nowDate);
  const weekWorkouts = workoutsInWeek(workouts, monday);
  const doneToday = workouts.filter((w) => isoFromTimestamp(w.startedAt) === today);
  const gymSessions = weekWorkouts.filter((w) => w.routineId && w.routineId !== 'bonus').length;
  const weekVolume = weekWorkouts.reduce((a, w) => a + workoutVolume(w), 0);
  const weekSets = weekWorkouts.reduce((a, w) => a + workoutSetCount(w), 0);
  const weekTime = weekWorkouts.reduce((a, w) => a + workoutDurationMs(w), 0);
  const [gameMode, setGameMode] = useState(false);
  const [picking, setPicking] = useState(false);
  const todayWeight = body.find((b) => b.date === today)?.weight ?? null;
  const backup = backupStatus(workouts, settings.lastExportAt, now);
  const todayRoutineId = plan.kind === 'gym' ? plan.routineId : undefined;

  const startFromPicker = (id: RoutineId | null) => {
    setPicking(false);
    startRoutineFlow(id);
  };

  return (
    <TabScreen>
      <PageHeader
        subtitle={`${DAY_LONG[weekdayIndex(nowDate)]} ${formatShortDate(now)}`}
        title="Today"
        right={<IconButton icon="settings-outline" label="Settings" onPress={() => router.push('/settings')} />}
      />

      {active ? <ResumeCard /> : null}

      <PlanCard pos={pos} sessions={gymSessions} />

      <WeekStrip mondayISO={monday} todayISO={today} workouts={workouts} />

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

      {plan.kind === 'gym' ? (
        <GymCard
          routineId={plan.routineId}
          phase={pos.phase}
          gameMode={gameMode}
          setGameMode={setGameMode}
          done={doneToday.some((w) => w.routineId === plan.routineId)}
          primary={!active}
          onChooseAnother={() => setPicking(true)}
        />
      ) : (
        <OffDayCard plan={plan} onTrainAnyway={() => setPicking(true)} />
      )}

      <SectionTitle title="This week" />
      <Row gap={S.sm} align="stretch">
        <StatTile label="Hard sets" value={String(weekSets)} />
        <StatTile label="Volume" value={formatVolume(weekVolume)} />
        <StatTile label="Time" value={formatDuration(weekTime)} />
      </Row>

      <SectionTitle title="Daily targets" right={<Txt v="caption">20-day food plan</Txt>} />
      <Row gap={S.sm} align="stretch">
        <StatTile
          label="Calories"
          value={DAILY_TARGETS.kcal.toLocaleString('en-US')}
          caption={`${DAILY_TARGETS.kcalRestDay.toLocaleString('en-US')} rest day`}
          onPress={() => router.push('/guide/food')}
        />
        <StatTile label="Protein" value={`${DAILY_TARGETS.proteinG} g`} caption="every day" onPress={() => router.push('/guide/food')} />
        <StatTile
          label="Steps"
          value={`${DAILY_TARGETS.steps / 1000}k`}
          caption={plan.kind === 'sport' ? `${DAILY_TARGETS.stepsGameDay / 1000}k ok today` : 'every day'}
          onPress={() => router.push('/guide/food')}
        />
      </Row>

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

      <Sheet
        visible={picking}
        title="Start a workout"
        subtitle="Any day of your plan, whatever today is."
        onClose={() => setPicking(false)}>
        <RoutineRows todayRoutineId={todayRoutineId} onStart={startFromPicker} onOpen={startFromPicker} lastDivider />
        <ListRow
          leading={<RowBadge icon="create-outline" />}
          title="Empty workout"
          subtitle="Pick exercises as you go"
          onPress={() => startFromPicker(null)}
          trailing={
            <Button size="pill" variant="outline" title="Start" accessibilityLabel="Start an empty workout" onPress={() => startFromPicker(null)} />
          }
        />
      </Sheet>
    </TabScreen>
  );
}

/** Where you are in the 12 weeks. Opens the guide page that explains them. */
function PlanCard({ pos, sessions }: { pos: ProgramPosition; sessions: number }) {
  return (
    <Card onPress={() => router.push('/guide/weeks12')} accessibilityLabel="Your place in the 12-week plan. Opens the guide.">
      <Row style={{ justifyContent: 'space-between' }} align="baseline" gap={S.md}>
        {pos.started ? (
          <Txt style={{ fontWeight: '600', flexShrink: 1 }}>
            Week {pos.week} of 12{' '}
            <Txt color={C.textFaint} style={{ fontWeight: '500' }}>
              · {PHASES[pos.phase].name}
              {pos.cycle > 1 ? ` · cycle ${pos.cycle}` : ''}
            </Txt>
          </Txt>
        ) : (
          <Txt style={{ fontWeight: '600', flexShrink: 1 }}>Starts in {plural(pos.daysUntilStart, 'day')}</Txt>
        )}
        <Txt v="small">{sessions} of 3 sessions</Txt>
      </Row>
      <StepBar total={12} filled={pos.started ? pos.week : 0} />
      <Txt v="small">{pos.started ? PHASES[pos.phase].rule : 'Change the start date in Settings.'}</Txt>
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

/** The session scheduled for today. */
function GymCard({
  routineId,
  phase,
  gameMode,
  setGameMode,
  done,
  primary,
  onChooseAnother,
}: {
  routineId: RoutineId;
  phase: ProgramPosition['phase'];
  gameMode: boolean;
  setGameMode: (v: boolean) => void;
  done: boolean;
  /** False while another workout is open: then "Resume" is the main action of the screen. */
  primary: boolean;
  onChooseAnother: () => void;
}) {
  const routine = getRoutine(routineId);
  const gm = routineId === 'lower' && gameMode;
  const exercises = routine.items.filter(
    (item) => !prescribe(item, getExercise(item.exerciseId), { phase, routineId, gameMode: gm }).skip,
  ).length;
  return (
    <Card variant="hero">
      <Txt v="label">{done ? 'Scheduled today · done' : 'Up next · scheduled today'}</Txt>
      <View style={{ gap: 4 }}>
        <Txt v="hero">{routine.name}</Txt>
        <Txt color={C.textMuted}>{routineSummary(routine, exercises)}</Txt>
      </View>
      <Row gap={6} style={{ flexWrap: 'wrap' }}>
        {routineAreas(routine, getExercise).map((area) => (
          <Tag key={area} label={area} />
        ))}
      </Row>
      {routineId === 'lower' ? (
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
        onPress={() => startRoutineFlow(routineId, { gameMode: gm })}
      />
      <Row style={{ justifyContent: 'space-between', marginTop: -6, marginBottom: -10, marginHorizontal: -S.sm }}>
        <Button variant="ghost" title="Preview" onPress={() => router.push(`/routine/${routineId}`)} />
        <Button variant="ghost" title="Choose another day" iconRight="chevron-forward" onPress={onChooseAnother} />
      </Row>
    </Card>
  );
}

/** A sport day, or a day that is sport or rest: says what is scheduled and still lets you train. */
function OffDayCard({ plan, onTrainAnyway }: { plan: Exclude<DayPlan, { kind: 'gym' }>; onTrainAnyway: () => void }) {
  const sport = plan.kind === 'sport';
  return (
    <Card variant="hero">
      <Txt v="label">Scheduled today</Txt>
      <View style={{ gap: 4 }}>
        <Txt v="hero">{sport ? plan.label : `Volleyball ${plan.tile[1]}`}</Txt>
        <Txt color={C.textMuted}>
          {sport
            ? 'No gym today. Warm up properly, and stretch your hitting arm after playing.'
            : 'If you play, do the game warm-up and rest from the gym. If this week is only Tuesday and Friday, you can do the optional Bonus session, or just rest.'}
        </Txt>
      </View>
      <Button size="large" variant="secondary" title="Train anyway" onPress={onTrainAnyway} />
      <Row style={{ justifyContent: 'space-between', marginTop: -6, marginBottom: -10, marginHorizontal: -S.sm }}>
        <Button variant="ghost" title="Game warm-up" onPress={() => router.push('/guide/warmups')} />
        {sport ? (
          <Button variant="ghost" title="Pain rules" iconRight="chevron-forward" onPress={() => router.push('/guide/pain')} />
        ) : (
          <Button variant="ghost" title="Bonus session" iconRight="chevron-forward" onPress={() => router.push('/routine/bonus')} />
        )}
      </Row>
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
