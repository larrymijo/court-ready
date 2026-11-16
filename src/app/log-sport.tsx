import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PickerField } from '@/components/sport/PickerField';
import { FieldError, SportLogFields } from '@/components/sport/SportLogFields';
import { BOTTOM_BAR_SPACE, BottomBar, Button, Card, Check, Chip, IconButton, Screen, Txt } from '@/components/ui';
import { SPORTS, sportDef } from '@/data/sports';
import { todayISO } from '@/lib/dates';
import { successFeedback } from '@/lib/platform';
import { sportSessionForToday } from '@/lib/planView';
import { clockHHMM, startTimeMs } from '@/lib/sportClock';
import { sportEntryErrors, type SportEntry } from '@/lib/sportSession';
import type { SportId } from '@/lib/types';
import { useStore } from '@/store/useStore';
import { C, S, SIZE } from '@/theme';

/** "Log a past session": a session that wasn't started in the app, with its date and the same details as the log sheet. */
export default function LogSportScreen() {
  const { sport: sportParam } = useLocalSearchParams<{ sport?: string | string[] }>();
  const wanted = Array.isArray(sportParam) ? sportParam[0] : sportParam;
  const plans = useStore((s) => s.plans);
  const activePlanId = useStore((s) => s.activePlanId);
  const logPastSport = useStore((s) => s.logPastSport);

  const [sport, setSport] = useState<SportId>(() => sportDef(wanted ?? '')?.id ?? SPORTS[0].id);
  const [date, setDate] = useState(() => todayISO());
  const [time, setTime] = useState(() => clockHHMM(Date.now()));
  const [entry, setEntry] = useState<SportEntry>({ minutes: 60 });
  const [warmupDone, setWarmupDone] = useState(false);
  const [cooldownDone, setCooldownDone] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const def = sportDef(sport)!;
  const errors = sportEntryErrors(entry, def);

  const change = (patch: SportEntry) => {
    setEntry((e) => ({ ...e, ...patch }));
    setProblem(null);
  };

  const pickSport = (id: SportId) => {
    const next = sportDef(id)!;
    setSport(id);
    // What the new sport doesn't log is dropped, so the entry stays valid for it.
    setEntry((e) => ({
      ...e,
      ...(next.logsMatch ? {} : { match: undefined }),
      ...(next.logsDistance ? {} : { distanceKm: undefined }),
    }));
    setProblem(null);
  };

  const onSave = () => {
    const startedAt = startTimeMs(date, time);
    if (startedAt === null) {
      setProblem('Pick a real date and start time.');
      return;
    }
    if (startedAt > Date.now()) {
      setProblem('That start time hasn’t happened yet. Pick one in the past.');
      return;
    }
    if (errors.length > 0) {
      setProblem('Fix what is marked above first.');
      return;
    }
    // The session counts for the active plan's session of this sport planned on that day, if the plan has one.
    const plan = plans.find((p) => p.id === activePlanId);
    const session = plan ? sportSessionForToday(plan, sport, date) : undefined;
    const id = logPastSport({
      sport,
      date,
      time,
      minutes: entry.minutes!,
      effort: entry.effort,
      match: entry.match,
      pain: entry.pain,
      distanceKm: entry.distanceKm,
      note: entry.note,
      warmupDone,
      cooldownDone,
      ...(plan && session ? { planId: plan.id, sessionId: session.id } : {}),
    });
    if (!id) {
      setProblem('The session couldn’t be saved. Check the date, the start time and the minutes.');
      return;
    }
    successFeedback();
    router.replace(`/history/${id}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <IconButton plain icon="close" size={22} label="Close without saving" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
          ),
        }}
      />
      <Screen edgesTop={false} bottomPad={BOTTOM_BAR_SPACE + (problem ? 40 : 0)} contentStyle={{ gap: S.md }}>
        <View style={{ gap: S.sm }}>
          <Txt v="h2">Sport</Txt>
          <View style={styles.chips}>
            {SPORTS.map((s) => (
              <Chip key={s.id} label={s.name} selected={s.id === sport} onPress={() => pickSport(s.id)} />
            ))}
          </View>
        </View>

        <Card style={{ gap: S.md }}>
          <View style={styles.line}>
            <Txt v="h2">Date</Txt>
            <PickerField
              kind="date"
              value={date}
              onChange={(v) => {
                setDate(v);
                setProblem(null);
              }}
              accessibilityLabel="Date"
            />
          </View>
          <View style={styles.line}>
            <Txt v="h2">Start time</Txt>
            <PickerField
              kind="time"
              value={time}
              onChange={(v) => {
                setTime(v);
                setProblem(null);
              }}
              accessibilityLabel="Start time"
            />
          </View>
        </Card>

        <SportLogFields
          def={def}
          values={entry}
          onChange={change}
          errors={errors}
          minutesTitle="Minutes"
          minutesStep={5}
        />

        <Card style={{ paddingVertical: S.xs }}>
          <DoneRow label="Warm-up done" on={warmupDone} onPress={() => setWarmupDone(!warmupDone)} />
          <DoneRow label="Cool-down done" on={cooldownDone} onPress={() => setCooldownDone(!cooldownDone)} />
        </Card>
      </Screen>
      <BottomBar>
        {problem ? <FieldError>{problem}</FieldError> : null}
        <Button title="Save" onPress={onSave} />
      </BottomBar>
    </View>
  );
}

function DoneRow({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={onPress} style={styles.done}>
      <Check done={on} size={24} />
      <Txt v="body">{label}</Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: S.md },
  done: { flexDirection: 'row', alignItems: 'center', gap: S.md, minHeight: SIZE.touch },
});
