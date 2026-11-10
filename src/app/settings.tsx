import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, TextInput } from 'react-native';

import { Button, Card, Divider, Row, Screen, SectionTitle, ToggleRow, Txt } from '@/components/ui';
import { canPickBackupFile, pickBackupFile } from '@/lib/backup';
import { backupStatus, daysAgoText } from '@/lib/backupStatus';
import { IS_BETA } from '@/lib/channel';
import { addDaysISO, isISODate, mondayOfISO, parseISODate, todayISO } from '@/lib/dates';
import { exportBackup } from '@/lib/exportBackup';
import { formatDataSize, formatDateLong, plural } from '@/lib/format';
import { confirm, notify } from '@/lib/platform';
import { PHASES, programPosition } from '@/lib/program';
import { useNow } from '@/lib/useNow';
import { readSafetyCopy, savedDataLength, type SafetyCopy } from '@/store/safetyCopy';
import { useStore } from '@/store/useStore';
import { C, R, S } from '@/theme';

const DAY_MS = 24 * 60 * 60 * 1000;
/** Browsers give a web app about this much room for saved data. Text is stored as 2 bytes a character. */
const WEB_STORAGE_BYTES = 5 * 1024 * 1024;
/** How long after an update the "go back to the earlier copy" option stays on screen. */
const SAFETY_COPY_DAYS = 30;

export default function SettingsScreen() {
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const importData = useStore((s) => s.importData);
  const restoreSafetyCopy = useStore((s) => s.restoreSafetyCopy);
  const resetAll = useStore((s) => s.resetAll);
  const workouts = useStore((s) => s.workouts);
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
    <Screen edgesTop={false} bottomPad={40}>
      <SectionTitle title="12-week plan" />
      <Card>
        <Txt v="h2">
          {pos.started ? `Week ${pos.week} of 12 · ${PHASES[pos.phase].name}` : `Starts in ${pos.daysUntilStart} days`}
        </Txt>
        <Txt v="small">Week 1 started on {formatDateLong(parseISODate(settings.programStart).getTime())}.</Txt>
        <Row gap={S.sm}>
          <Button flex small variant="secondary" title="− 1 week" onPress={() => setStart(addDaysISO(settings.programStart, 7))} />
          <Button flex small variant="secondary" title="+ 1 week" onPress={() => setStart(addDaysISO(settings.programStart, -7))} />
        </Row>
        <Button small variant="secondary" title="Start week 1 this Monday" onPress={() => setStart(today)} />
        <Divider />
        <Txt v="tiny">Or type the date week 1 began (YYYY-MM-DD). It snaps to that week’s Monday.</Txt>
        <Row gap={S.sm}>
          <TextInput
            value={dateText}
            onChangeText={setDateText}
            style={[styles.input, { flex: 1 }]}
            placeholder="2026-10-05"
            placeholderTextColor={C.faint}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Button small title="Set" disabled={!isISODate(dateText)} onPress={() => setStart(dateText)} />
        </Row>
        <Txt v="tiny">“− 1 week” moves you back a week in the plan; “+ 1 week” moves you forward.</Txt>
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
        <Button variant="secondary" icon="share-outline" title="Export backup" onPress={exportBackup} />
        {canPickBackupFile ? (
          <Button variant="secondary" icon="folder-open-outline" title="Import backup file" onPress={onImportFile} />
        ) : null}
        <TextInput
          value={importText}
          onChangeText={setImportText}
          placeholder="Paste a backup here to import it"
          placeholderTextColor={C.faint}
          multiline
          style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
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

      <SectionTitle title="About" />
      <Card>
        <Txt>
          Court-Ready {Constants.expoConfig?.version ?? ''}
          {IS_BETA ? ' · beta' : ''}
        </Txt>
        {IS_BETA ? (
          <Txt v="small" color={C.text}>
            This is the beta copy, for trying changes first. It keeps its own data, separate from the main app.
          </Txt>
        ) : null}
        <Txt v="small">
          Workout tracker built around the Court-Ready Muscle guide: 3 gym sessions around volleyball and basketball,
          chest priority, shoulder- and elbow-friendly exercises.
        </Txt>
        <Txt v="tiny">General training advice, not medical advice.</Txt>
      </Card>
    </Screen>
  );
}

/** "under 1%", "12%": how much of the browser's storage the saved data takes. */
function shareOfStorage(bytes: number): string {
  const percent = (bytes / WEB_STORAGE_BYTES) * 100;
  return percent < 1 ? 'under 1%' : `${Math.round(percent)}%`;
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: C.surface2,
    color: C.text,
    borderRadius: R.sm,
    paddingHorizontal: S.md,
    paddingVertical: 10,
    fontSize: 15,
  },
});
