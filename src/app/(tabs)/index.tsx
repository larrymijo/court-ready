import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { NumInput } from '@/components/NumInput';
import {
  Button,
  Card,
  Chip,
  IconButton,
  PageHeader,
  ProgressBar,
  Row,
  Screen,
  SectionTitle,
  Stat,
  ToggleRow,
  Txt,
} from '@/components/ui';
import { WeekStrip } from '@/components/WeekStrip';
import { getExercise } from '@/data/exercises';
import { getRoutine } from '@/data/routines';
import { DAILY_TARGETS, DAY_LONG } from '@/data/schedule';
import { isoFromTimestamp, mondayOfISO, todayISO, weekdayIndex } from '@/lib/dates';
import { formatDate, formatDuration, formatElapsed, formatKg, formatVolume, plural } from '@/lib/format';
import { hardSetCount, PHASES, planForDate, programPosition } from '@/lib/program';
import { startRoutineFlow } from '@/lib/startWorkout';
import { workoutDurationMs, workoutSetCount, workoutsInWeek, workoutVolume } from '@/lib/stats';
import type { RoutineId } from '@/lib/types';
import { useNow } from '@/lib/useNow';
import { useStore } from '@/store/useStore';
import { C, PHASE_COLOR, S } from '@/theme';

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
  const [gameMode, setGameMode] = useState(false);
  const todayWeight = body.find((b) => b.date === today)?.weight ?? null;

  return (
    <Screen bottomPad={active ? 170 : 110}>
      <PageHeader
        subtitle={`${DAY_LONG[weekdayIndex(nowDate)]} · ${formatDate(now)}`}
        title="Today"
        right={<IconButton icon="settings-outline" label="Settings" onPress={() => router.push('/settings')} />}
      />

      {active ? <ResumeCard /> : null}

      <Card onPress={() => router.push('/guide/weeks12')}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt v="label">{pos.started ? `Week ${pos.week} of 12${pos.cycle > 1 ? ` · Cycle ${pos.cycle}` : ''}` : 'Plan'}</Txt>
          <Chip label={PHASES[pos.phase].name} tone={pos.phase === 'push' ? 'orange' : pos.phase === 'deload' ? 'ok' : 'info'} />
        </Row>
        {pos.started ? (
          <>
            <ProgressBar value={pos.week / 12} color={PHASE_COLOR[pos.phase]} />
            <Txt v="small">{PHASES[pos.phase].rule}</Txt>
          </>
        ) : (
          <Txt v="small">
            Your plan starts in {pos.daysUntilStart} day{pos.daysUntilStart === 1 ? '' : 's'}. Change the start date in
            Settings.
          </Txt>
        )}
      </Card>

      <WeekStrip mondayISO={monday} todayISO={today} workouts={workouts} />

      {doneToday.length > 0 ? (
        <Card tone="ok" onPress={() => router.push(`/history/${doneToday[0].id}`)}>
          <Row gap={S.sm}>
            <Ionicons name="checkmark-circle" size={22} color={C.green} />
            <Txt v="h2">Done today: {doneToday[0].name}</Txt>
          </Row>
          <Txt v="small" color={C.text}>
            {formatDuration(workoutDurationMs(doneToday[0]))} · {plural(workoutSetCount(doneToday[0]), 'set')} ·{' '}
            {formatVolume(workoutVolume(doneToday[0]))}
            {doneToday[0].prs?.length ? ` · ${doneToday[0].prs.length} PRs` : ''}
          </Txt>
        </Card>
      ) : null}

      {plan.kind === 'gym' ? (
        <TodayGymCard
          routineId={plan.routineId}
          phase={pos.phase}
          gameMode={gameMode}
          setGameMode={setGameMode}
          done={doneToday.some((w) => w.routineId === plan.routineId)}
        />
      ) : plan.kind === 'sport' ? (
        <SportCard label={plan.label} />
      ) : (
        <MaybeCard />
      )}

      <SectionTitle title="This week" />
      <Card>
        <Row gap={S.md}>
          <Stat value={`${gymSessions}/3`} label="gym sessions" color={gymSessions >= 3 ? C.green : undefined} />
          <Stat value={String(weekSets)} label="hard sets" />
          <Stat value={formatVolume(weekVolume)} label="volume" />
        </Row>
      </Card>

      <SectionTitle title="Daily targets" right={<Txt v="tiny">20-day food plan</Txt>} />
      <Card onPress={() => router.push('/guide/food')}>
        <Row gap={S.md}>
          <Stat value={DAILY_TARGETS.kcal.toLocaleString('en-US')} label={`kcal (${DAILY_TARGETS.kcalRestDay.toLocaleString('en-US')} rest day)`} />
          <Stat value={`${DAILY_TARGETS.proteinG} g`} label="protein" />
          <Stat value={`${DAILY_TARGETS.steps / 1000}k`} label={plan.kind === 'sport' ? 'steps (7k ok today)' : 'steps'} />
        </Row>
      </Card>

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt v="h2">Morning weigh-in</Txt>
          <Pressable onPress={() => router.push('/progress')} hitSlop={8}>
            <Txt v="small" color={C.accent}>
              History
            </Txt>
          </Pressable>
        </Row>
        {todayWeight != null ? (
          <Row gap={S.sm}>
            <Ionicons name="checkmark-circle" size={18} color={C.green} />
            <Txt>Logged {formatKg(todayWeight)} kg today</Txt>
          </Row>
        ) : (
          <QuickWeigh onSave={(kg) => logBody({ date: today, weight: kg })} />
        )}
        <Txt v="tiny">After the toilet, before eating. The weekly average is what counts.</Txt>
      </Card>
    </Screen>
  );
}

function ResumeCard() {
  const active = useStore((s) => s.active)!;
  const now = useNow(1000);
  const done = active.exercises.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);
  const total = active.exercises.reduce((n, e) => n + e.sets.length, 0);
  return (
    <Card tone="info" onPress={() => router.push('/workout')}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt v="label" color={C.accent}>
          Workout in progress
        </Txt>
        <Txt v="small" color={C.text} style={{ fontVariant: ['tabular-nums'] }}>
          {formatElapsed(now - active.startedAt)}
        </Txt>
      </Row>
      <Txt v="h1">{active.name}</Txt>
      <ProgressBar value={total ? done / total : 0} />
      <Button title="Resume workout" icon="play" onPress={() => router.push('/workout')} />
    </Card>
  );
}

function TodayGymCard({
  routineId,
  phase,
  gameMode,
  setGameMode,
  done,
}: {
  routineId: RoutineId;
  phase: ReturnType<typeof programPosition>['phase'];
  gameMode: boolean;
  setGameMode: (v: boolean) => void;
  done: boolean;
}) {
  const routine = getRoutine(routineId);
  const sets = hardSetCount(routine, getExercise, { phase, gameMode: routineId === 'lower' && gameMode });
  return (
    <Card>
      <Txt v="label">{done ? 'Scheduled today — already done' : 'Scheduled today'}</Txt>
      <Txt v="h1">{routine.title}</Txt>
      <Txt v="small">
        {sets} hard sets · about {routine.minutes} min · {routine.intro}
      </Txt>
      {routineId === 'lower' ? (
        <ToggleRow
          title="Game mode"
          subtitle="Volleyball tomorrow? 2 sets per exercise, RIR 3, no split squats."
          value={gameMode}
          onChange={setGameMode}
        />
      ) : null}
      <Row gap={S.sm} style={{ marginTop: S.xs }}>
        <Button
          flex
          title={done ? 'Train again' : 'Start workout'}
          icon="play"
          variant={done ? 'secondary' : 'primary'}
          onPress={() => startRoutineFlow(routineId, { gameMode: routineId === 'lower' && gameMode })}
        />
        <Button title="Preview" variant="secondary" onPress={() => router.push(`/routine/${routineId}`)} />
      </Row>
    </Card>
  );
}

function SportCard({ label }: { label: string }) {
  return (
    <Card>
      <Txt v="label" color={C.orange}>
        Game day
      </Txt>
      <Txt v="h1">{label} today</Txt>
      <Txt v="small">No gym today. Warm up properly, and stretch your hitting arm after playing.</Txt>
      <Row gap={S.sm} style={{ marginTop: S.xs }}>
        <Button flex title="Game warm-up" icon="flame-outline" variant="secondary" onPress={() => router.push('/guide/warmups')} />
        <Button flex title="Pain rules" icon="medkit-outline" variant="secondary" onPress={() => router.push('/guide/pain')} />
      </Row>
    </Card>
  );
}

function MaybeCard() {
  return (
    <Card>
      <Txt v="label" color={C.orange}>
        Volleyball or bonus
      </Txt>
      <Txt v="h1">Playing today?</Txt>
      <Txt v="small">
        If you play, do the game warm-up and rest from the gym. If this week is only Tuesday and Friday, you can do the
        optional Bonus session — or just rest.
      </Txt>
      <Row gap={S.sm} style={{ marginTop: S.xs }}>
        <Button flex title="Bonus session" icon="add-circle-outline" onPress={() => router.push('/routine/bonus')} />
        <Button flex title="Game warm-up" variant="secondary" onPress={() => router.push('/guide/warmups')} />
      </Row>
    </Card>
  );
}

function QuickWeigh({ onSave }: { onSave: (kg: number) => void }) {
  const [kg, setKg] = useState<number | null>(null);
  return (
    <Row gap={S.sm}>
      <View style={{ flex: 1 }}>
        <NumInput value={kg} onChange={setKg} placeholder="kg" style={{ height: 44, fontSize: 18 }} accessibilityLabel="Bodyweight in kg" />
      </View>
      <Button title="Save" disabled={kg == null || kg < 30 || kg > 250} onPress={() => kg != null && onSave(kg)} />
    </Row>
  );
}
