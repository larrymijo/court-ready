import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, TextInput, View } from 'react-native';

import { Button, Card, Divider, Row, Screen, SectionTitle, Stepper, ToggleRow, Txt, fieldStyle } from '@/components/ui';
import { canPickBackupFile, pickBackupFile } from '@/lib/backup';
import { backupStatus, daysAgoText } from '@/lib/backupStatus';
import { IS_BETA } from '@/lib/channel';
import { summarizeData, summaryLines } from '@/lib/dataSummary';
import { addDaysISO, isISODate, mondayOfISO, parseISODate, todayISO } from '@/lib/dates';
import { exportBackup } from '@/lib/exportBackup';
import { formatDataSize, formatDateLong, plural } from '@/lib/format';
import { confirm, notify } from '@/lib/platform';
import { PHASES, programPosition } from '@/lib/program';
import { useNow } from '@/lib/useNow';
import { readSafetyCopy, savedDataLength, type SafetyCopy } from '@/store/safetyCopy';
import { useStore } from '@/store/useStore';
import { C, S } from '@/theme';

const DAY_MS = 24 * 60 * 60 * 1000;
/** Browsers give a web app about this much room for saved data. Text is stored as 2 bytes a character. */
const WEB_STORAGE_BYTES = 5 * 1024 * 1024;
/** How long after an update the "go back to the earlier copy" option stays on screen. */
const SAFETY_COPY_DAYS = 30;
const ICON_STEPS = [
  'Here: Export backup, and note the data summary at the top of Your data.',
  'In Safari, open the app’s address, then Share → Add to Home Screen.',
  'Open the new icon. If your workouts aren’t there, go to Settings → Import backup file.',
  'Check that the summary matches. Then delete the old icon and use only the new one: two icons can keep two separate copies of your data.',
];

export default function SettingsScreen() {
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const importData = useStore((s) => s.importData);
  const restoreSafetyCopy = useStore((s) => s.restoreSafetyCopy);
  const resetAll = useStore((s) => s.resetAll);
  const workouts = useStore((s) => s.workouts);
  const body = useStore((s) => s.body);
  const summary = useMemo(() => summarizeData(workouts, body), [workouts, body]);
  const [iconOpen, setIconOpen] = useState(false);
  const [dateText, setDateText] = useState(settings.programStart);
  const [importText, setImportText] = useState('');
  const [savedBytes, setSavedBytes] = useState<number | null>(null);
  const [safetyCopy, setSafetyCopy] = useState<SafetyCopy | null>(null);
  const now = useNow(60_000);
  const today = todayISO();
  const pos = programPosition(settings.programStart, today);
  const backup = backupStatus(workouts, settings.lastExportAt, now);
  const showSafetyCopy = safetyCopy != null && now - Date.parse(safetyCopy.savedAt) < SAFETY_COPY_DAYS * DAY_MS;

  useEffect(() => {
    let cancelled = false;
    // Saving happens just after a change, so look a moment later.
    const timer = setTimeout(() => {
      savedDataLength().then((chars) => !cancelled && setSavedBytes(chars * 2));
      readSafetyCopy().then((copy) => !cancelled && setSafetyCopy(copy));
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [workouts.length, settings]);

  const setStart = (iso: string) => {
    const monday = mondayOfISO(iso);
    update({ programStart: monday });
    setDateText(monday);
  };

  const onRestoreCopy = async () => {
    const ok = await confirm(
      'Go back to the earlier copy?',
      'This replaces your workouts, weigh-ins and settings with the copy from before the update. Anything logged since then is lost, so export a backup first.',
      'Go back',
      true,
    );
    if (!ok) return;
    const res = await restoreSafetyCopy();
    if (res.ok) notify('Restored', `${plural(res.workouts, 'workout')} are back from the earlier copy.`);
    else notify('Couldn’t go back', res.error);
  };

  const runImport = async (text: string) => {
    const ok = await confirm('Import data?', 'This replaces your current workouts, weigh-ins and settings.', 'Import', true);
    if (!ok) return;
    const res = importData(text.trim());
    if (res.ok) {
      setImportText('');
      notify('Imported', `${res.workouts} workouts restored.`);
    } else {
      notify('Import failed', res.error);
    }
  };

  const onImport = async () => {
    if (importText.trim()) await runImport(importText);
  };

  const onImportFile = async () => {
    const text = await pickBackupFile();
    if (text) await runImport(text);
  };

  const onReset = async () => {
    const ok = await confirm(
      'Delete everything?',
      `All ${workouts.length} workouts, weigh-ins and settings will be deleted. Export first if you want a backup.`,
      'Delete all',
      true,
    );
    if (ok) {
      resetAll();
      router.back();
    }
  };

  return (
    <Screen edgesTop={false}>
      <SectionTitle title="12-week plan" />
      <Card>
        <View style={{ gap: 2 }}>
          <Txt v="h2">
            {pos.started ? `Week ${pos.week} of 12 · ${PHASES[pos.phase].name}` : `Starts in ${plural(pos.daysUntilStart, 'day')}`}
          </Txt>
          <Txt v="small">Week 1 started on {formatDateLong(parseISODate(settings.programStart).getTime())}.</Txt>
        </View>
        {/* One week back in the plan means week 1 began a week later, and the other way round. */}
        <Stepper
          value={pos.started ? `Week ${pos.week}` : 'Not started'}
          decrementLabel="One week back in the plan"
          incrementLabel="One week forward in the plan"
          onDecrement={() => setStart(addDaysISO(settings.programStart, 7))}
          onIncrement={() => setStart(addDaysISO(settings.programStart, -7))}
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

      <SectionTitle title="Workout" />
      <Card>
        <ToggleRow
          title="Rest timer"
          subtitle="Starts by itself when you tick a set"
          value={settings.restTimer}
          onChange={(v) => update({ restTimer: v })}
        />
        <Divider />
        <ToggleRow title="Vibrate when rest ends" value={settings.vibrate} onChange={(v) => update({ vibrate: v })} />
        <Divider />
        <ToggleRow
          title="Keep screen on during workouts"
          subtitle="So the rest timer stays visible"
          value={settings.keepAwake}
          onChange={(v) => update({ keepAwake: v })}
        />
      </Card>

      <SectionTitle title="Your data" />
      <Card>
        <View style={{ gap: 2 }}>
          {summaryLines(summary).map((line, i) => (
            <Txt key={line} v={i === 0 ? 'h2' : 'small'} color={i === 0 ? C.text : C.textMuted}>
              {line}
            </Txt>
          ))}
        </View>
        <View style={{ gap: S.xs }}>
          <Txt v="small">Everything is stored on this phone only. Export a backup now and then.</Txt>
          <Txt v="small" color={C.text}>
            {settings.lastExportAt
              ? `Last backup: ${formatDateLong(settings.lastExportAt)} (${daysAgoText(settings.lastExportAt, now)}).`
              : 'No backup made yet.'}
            {backup.unsaved > 0
              ? settings.lastExportAt
                ? ` ${plural(backup.unsaved, 'workout')} since then.`
                : ` ${plural(backup.unsaved, 'workout')} only on this phone.`
              : ''}
          </Txt>
          {savedBytes != null ? (
            <Txt v="small">
              Saved data: {formatDataSize(savedBytes)}
              {Platform.OS === 'web' ? `, ${shareOfStorage(savedBytes)} of the room the browser gives the app.` : '.'}
            </Txt>
          ) : null}
        </View>
        <Button variant="secondary" icon="share-outline" title="Export backup" onPress={exportBackup} />
        {canPickBackupFile ? (
          <Button variant="secondary" icon="folder-open-outline" title="Import backup file" onPress={onImportFile} />
        ) : null}
        <TextInput
          value={importText}
          onChangeText={setImportText}
          placeholder="Paste a backup here to import it"
          placeholderTextColor={C.textFaint}
          accessibilityLabel="Paste a backup here to import it"
          multiline
          style={[fieldStyle, { minHeight: 88, textAlignVertical: 'top' }]}
        />
        <Button
          variant="secondary"
          icon="download-outline"
          title="Import pasted backup"
          disabled={!importText.trim()}
          onPress={onImport}
        />
        {safetyCopy && showSafetyCopy ? (
          <>
            <Divider />
            <Txt v="small">
              The app updated how it saves your data on {formatDateLong(Date.parse(safetyCopy.savedAt))} and kept a copy
              from just before. If something looks wrong since then, you can go back to it.
            </Txt>
            <Button variant="secondary" icon="arrow-undo-outline" title="Go back to that copy" onPress={onRestoreCopy} />
          </>
        ) : null}
        <Divider />
        <Button variant="danger" icon="trash-outline" title="Delete all data" onPress={onReset} />
      </Card>

      {Platform.OS === 'web' ? (
        <>
          <SectionTitle title="Home-screen icon" />
          <Card>
            <Txt v="small">
              iPhone sets an icon’s name and picture when it is added, so the current icon keeps its old name and picture
              until it is added again. Inside, the app says Hybrid either way.
            </Txt>
            <Button
              variant="secondary"
              icon="phone-portrait-outline"
              iconRight={iconOpen ? 'chevron-up' : 'chevron-down'}
              title={iconOpen ? 'Hide the steps' : 'Get the Hybrid icon'}
              onPress={() => setIconOpen((v) => !v)}
            />
            {iconOpen ? (
              <>
                <Divider />
                <Txt v="small" color={C.text}>
                  An icon added again can start with empty data, so the move goes through a backup. The new icon is named{' '}
                  {IS_BETA ? 'Hybrid Beta' : 'Hybrid'} (now {IS_BETA ? 'CR Beta' : 'Court-Ready'}).
                </Txt>
                {ICON_STEPS.map((step, i) => (
                  <Row key={step} gap={S.sm} style={{ alignItems: 'flex-start' }}>
                    <Txt v="small" color={C.text} style={{ width: 18 }}>
                      {i + 1}.
                    </Txt>
                    <Txt v="small" style={{ flex: 1 }}>
                      {step}
                    </Txt>
                  </Row>
                ))}
              </>
            ) : null}
          </Card>
        </>
      ) : null}

      <SectionTitle title="About" />
      <Card>
        <Txt v="h2">
          Hybrid {Constants.expoConfig?.version ?? ''}
          {IS_BETA ? ' · beta' : ''}
        </Txt>
        {IS_BETA ? (
          <Txt v="small" color={C.text}>
            This is the beta copy, for trying changes first. It keeps its own data, separate from the main app.
          </Txt>
        ) : null}
        <Txt v="small">
          A workout tracker for sport and gym training. Its example plan, Court-Ready, follows the Court-Ready Muscle
          guide: 3 gym sessions around volleyball and basketball, chest priority, shoulder- and elbow-friendly
          exercises.
        </Txt>
        <Txt v="caption">General training advice, not medical advice.</Txt>
      </Card>
    </Screen>
  );
}

/** "under 1%", "12%": how much of the browser's storage the saved data takes. */
function shareOfStorage(bytes: number): string {
  const percent = (bytes / WEB_STORAGE_BYTES) * 100;
  return percent < 1 ? 'under 1%' : `${Math.round(percent)}%`;
}
