import Ionicons from '@expo/vector-icons/Ionicons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChecklistCard } from '@/components/ChecklistCard';
import { SessionBar } from '@/components/sport/SessionBar';
import { SessionHeader } from '@/components/sport/SessionHeader';
import { SportLogFields } from '@/components/sport/SportLogFields';
import { useSportNow } from '@/components/sport/useSportNow';
import { Button, Card, Tag, Txt } from '@/components/ui';
import { checklist } from '@/data/checklists';
import { sportDef } from '@/data/sports';
import { formatElapsed } from '@/lib/format';
import { confirm, notify, successFeedback } from '@/lib/platform';
import {
  clockHHMM,
  clockRangeText,
  playElapsedMs,
  sportStageIndex,
  sportStepLabels,
  sportSubtitle,
} from '@/lib/sportClock';
import { paceText, sportEntryErrors, type SportEntry } from '@/lib/sportSession';
import type { ActiveSport } from '@/lib/types';
import { useStore } from '@/store/useStore';
import { C, S, T } from '@/theme';

/** Leaves the screen without ending the session: back where the person came from, or Today. */
function minimize() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/** The sport session in progress, at the stage the store says it is at. It comes back after a reload as it was. */
export default function SportScreen() {
  const active = useStore((s) => s.activeSport);
  // Set just before the session is saved or discarded, so the "no session" redirect to Today does
  // not fight the screen the person is being sent to.
  const leavingRef = useRef(false);
  const setLeaving = (v: boolean) => {
    leavingRef.current = v;
  };

  useEffect(() => {
    if (!active && !leavingRef.current) router.replace('/');
  }, [active]);

  if (!active) return <View style={styles.screen} />;
  return <SportSession active={active} setLeaving={setLeaving} />;
}

function SportSession({ active, setLeaving }: { active: ActiveSport; setLeaving: (v: boolean) => void }) {
  const keepAwake = useStore((s) => s.settings.keepAwake);
  const def = sportDef(active.sport);
  // From the cool-down, "back" shows the log again. It is only a view: the session stays in its cool-down.
  const [reviewLog, setReviewLog] = useState(false);
  const view: ActiveSport['stage'] = active.stage === 'cooldown' && reviewLog ? 'log' : active.stage;

  // The screen stays awake for the warm-up and the cool-down, never while playing or logging.
  const awake = keepAwake && (view === 'warmup' || view === 'cooldown');
  useEffect(() => {
    if (!awake) return;
    activateKeepAwakeAsync('sport').catch(() => {});
    return () => {
      deactivateKeepAwake('sport').catch(() => {});
    };
  }, [awake]);

  const onDiscard = async () => {
    if (await confirm('Discard session?', 'The time and everything you logged in this session will be deleted.', 'Discard', true)) {
      setLeaving(true);
      useStore.getState().discardSport();
      minimize();
    }
  };

  const left =
    active.stage === 'cooldown' && !reviewLog
      ? { icon: 'chevron-back' as const, label: 'Back to the log', onPress: () => setReviewLog(true) }
      : active.stage === 'log' && !reviewLog
        ? { icon: 'chevron-back' as const, label: 'Back to the clock', onPress: () => useStore.getState().resumePlaying() }
        : { icon: 'chevron-down' as const, label: 'Minimise session', onPress: minimize };

  return (
    <View style={styles.screen}>
      <SessionHeader
        title={active.name}
        subtitle={sportSubtitle(active.planName, active.openedAt)}
        left={left}
        labels={sportStepLabels(def)}
        stageIndex={sportStageIndex(view)}
      />
      {view === 'warmup' ? <WarmupStage active={active} onDiscard={onDiscard} /> : null}
      {view === 'playing' ? <PlayingStage active={active} running={!!def?.logsDistance} onDiscard={onDiscard} /> : null}
      {view === 'log' ? (
        <LogStage active={active} onDiscard={onDiscard} review={active.stage === 'cooldown'} onContinue={() => setReviewLog(false)} />
      ) : null}
      {view === 'cooldown' ? <CooldownStage active={active} setLeaving={setLeaving} onDiscard={onDiscard} /> : null}
    </View>
  );
}

/** What sits above the pinned buttons: scrolls when it is long. */
function Body({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.body}
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag">
      {children}
    </ScrollView>
  );
}

function DiscardLink({ onPress }: { onPress: () => void }) {
  return <Button title="Discard session" variant="ghost" onPress={onPress} />;
}

function WarmupStage({ active, onDiscard }: { active: ActiveSport; onDiscard: () => void }) {
  const toggle = useStore((s) => s.toggleSportStep);
  const startPlaying = useStore((s) => s.startPlaying);
  const warmup = checklist(active.warmup);
  return (
    <>
      <Body>
        {warmup ? (
          <ChecklistCard checklist={warmup} checked={active.warmupChecked} onToggle={(i) => toggle('warmup', i)} />
        ) : (
          <Txt v="small">This warm-up isn’t in this version of the app. You can still start the session.</Txt>
        )}
        <DiscardLink onPress={onDiscard} />
      </Body>
      <SessionBar>
        <Button title={active.sport === 'running' ? 'Start run' : 'Start playing'} icon="play" onPress={() => startPlaying()} />
        <Button title="Skip warm-up" variant="ghost" onPress={() => startPlaying({ skippedWarmup: true })} />
      </SessionBar>
    </>
  );
}

function PlayingStage({ active, running, onDiscard }: { active: ActiveSport; running: boolean; onDiscard: () => void }) {
  const finishPlaying = useStore((s) => s.finishPlaying);
  // The clock is the saved start and "now". Nothing is counted, so a locked phone loses nothing.
  const now = useSportNow(true);
  const elapsed = playElapsedMs(active.playStartedAt, now);
  const text = formatElapsed(elapsed);
  const totalSec = Math.floor(elapsed / 1000);
  const spoken = `${Math.floor(totalSec / 60)} minutes ${totalSec % 60} seconds`;
  return (
    <>
      <View style={styles.playing}>
        <Text style={styles.playingLabel}>{running ? 'RUNNING' : 'PLAYING'}</Text>
        <Text
          accessibilityRole="timer"
          accessibilityLabel={spoken}
          numberOfLines={1}
          style={[styles.clock, elapsed >= 3_600_000 && { fontSize: 64, lineHeight: 70 }]}>
          {text}
        </Text>
        <Text style={styles.started}>
          {active.playStartedAt !== undefined ? `Started ${clockHHMM(active.playStartedAt)}` : ' '}
        </Text>
        <View style={styles.lockNote}>
          <Ionicons name="lock-closed-outline" size={18} color={C.textFaint} />
          <Txt v="small" style={{ flex: 1 }}>
            You can lock your phone. The clock keeps counting.
          </Txt>
        </View>
      </View>
      <SessionBar>
        <Button title="Finish" icon="stop" onPress={finishPlaying} />
        <Button title="Discard session" variant="ghost" onPress={onDiscard} />
      </SessionBar>
    </>
  );
}

function LogStage({
  active,
  onDiscard,
  review,
  onContinue,
}: {
  active: ActiveSport;
  onDiscard: () => void;
  /** Looking at the log again from the cool-down. */
  review: boolean;
  onContinue: () => void;
}) {
  const update = useStore((s) => s.updateSportDraft);
  const goToCooldown = useStore((s) => s.goToCooldown);
  const def = sportDef(active.sport)!;
  const d = active.draft;
  const values: SportEntry = {
    minutes: d.minutes,
    effort: d.effort,
    match: d.match,
    pain: d.pain,
    distanceKm: d.distanceKm,
    note: d.note,
  };
  const errors = sportEntryErrors(values, def);
  return (
    <>
      <Body>
        <Txt v="h1" accessibilityRole="header">
          How did it go?
        </Txt>
        <SportLogFields
          def={def}
          values={values}
          // Each field is saved as it changes, so a reload keeps what was typed.
          onChange={(patch) => update(patch)}
          errors={errors}
          minutesTitle={active.sport === 'running' ? 'Time' : 'Time played'}
          minutesHint={clockRangeText(active.playStartedAt, active.playEndedAt) ?? undefined}
        />
        <DiscardLink onPress={onDiscard} />
      </Body>
      <SessionBar>
        <Button
          title="Next: cool-down"
          iconRight="chevron-forward"
          disabled={errors.length > 0}
          onPress={() => {
            if (review) onContinue();
            else goToCooldown();
          }}
        />
        <Button title="Minimise session" variant="ghost" onPress={minimize} />
      </SessionBar>
    </>
  );
}

function CooldownStage({
  active,
  setLeaving,
  onDiscard,
}: {
  active: ActiveSport;
  setLeaving: (v: boolean) => void;
  onDiscard: () => void;
}) {
  const toggle = useStore((s) => s.toggleSportStep);
  const saveSport = useStore((s) => s.saveSport);
  const def = sportDef(active.sport)!;
  const cooldown = checklist(active.cooldown);
  const d = active.draft;

  const save = (skippedCooldown: boolean) => {
    setLeaving(true);
    const id = saveSport(skippedCooldown ? { skippedCooldown: true } : undefined);
    if (!id) {
      setLeaving(false);
      notify('Couldn’t save the session', 'Something in the log breaks a rule. Go back to the log and check the minutes, effort and pain.');
      return;
    }
    successFeedback();
    router.replace(`/history/${id}?new=1`);
  };

  const pace = def.logsDistance ? paceText(d.distanceKm, d.minutes) : null;
  const painStop = typeof d.pain === 'number' && d.pain >= 4;
  return (
    <>
      <Body>
        {cooldown ? (
          <ChecklistCard checklist={cooldown} checked={active.cooldownChecked} onToggle={(i) => toggle('cooldown', i)} />
        ) : null}
        <Card style={{ gap: 10, paddingVertical: 14 }}>
          <Txt v="label">To be saved</Txt>
          <View style={styles.summary}>
            {def.logsDistance && d.distanceKm !== undefined ? (
              <Text style={styles.summaryBold}>{`${d.distanceKm} km`}</Text>
            ) : null}
            <Text style={styles.summaryBold}>{`${d.minutes ?? 0} min`}</Text>
            {pace ? <Text style={styles.summaryText}>{pace}</Text> : null}
            {d.effort !== undefined ? <Text style={styles.summaryText}>{`Effort ${d.effort}`}</Text> : null}
            {d.match !== undefined ? <Tag label={d.match ? 'Match' : 'Practice'} /> : null}
            {typeof d.pain === 'number' ? (
              <Text style={[styles.summaryBold, painStop && { color: C.danger }]}>{`Pain ${d.pain}`}</Text>
            ) : null}
          </View>
          {active.warmupDone !== undefined ? (
            <Txt v="small">{active.warmupDone ? 'Warm-up done' : 'Warm-up skipped'}</Txt>
          ) : null}
        </Card>
        <DiscardLink onPress={onDiscard} />
      </Body>
      <SessionBar>
        <Button title="Save session" icon="checkmark" onPress={() => save(false)} />
        <Button title="Skip and save" variant="ghost" onPress={() => save(true)} />
      </SessionBar>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  body: { paddingTop: S.gutter, paddingHorizontal: S.gutter, paddingBottom: S.lg, gap: S.md },
  playing: { flex: 1, paddingHorizontal: S.gutter, alignItems: 'center', justifyContent: 'center', gap: 10 },
  playingLabel: { ...T.label, color: C.textFaint },
  clock: {
    fontSize: 88,
    lineHeight: 92,
    fontWeight: '700',
    letterSpacing: -2.64,
    color: C.text,
    fontVariant: ['tabular-nums'],
  },
  started: { ...T.body, color: C.textMuted },
  lockNote: { marginTop: 22, maxWidth: 280, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  summary: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 14, rowGap: 6 },
  summaryBold: { ...T.body, fontWeight: '600', color: C.text },
  summaryText: { ...T.body, color: C.text },
});
