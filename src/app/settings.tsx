import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { Button, Card, Divider, Row, Screen, SectionTitle, ToggleRow, Txt } from '@/components/ui';
import { canPickBackupFile, pickBackupFile, saveBackup } from '@/lib/backup';
import { addDaysISO, isISODate, mondayOfISO, parseISODate, todayISO } from '@/lib/dates';
import { formatDateLong } from '@/lib/format';
import { confirm, notify } from '@/lib/platform';
import { PHASES, programPosition } from '@/lib/program';
import { useStore } from '@/store/useStore';
import { C, R, S } from '@/theme';

export default function SettingsScreen() {
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const exportData = useStore((s) => s.exportData);
  const importData = useStore((s) => s.importData);
  const resetAll = useStore((s) => s.resetAll);
  const workouts = useStore((s) => s.workouts);
  const [dateText, setDateText] = useState(settings.programStart);
  const [importText, setImportText] = useState('');
  const today = todayISO();
  const pos = programPosition(settings.programStart, today);

  const setStart = (iso: string) => {
    const monday = mondayOfISO(iso);
    update({ programStart: monday });
    setDateText(monday);
  };

  const onExport = async () => {
    try {
      await saveBackup(exportData());
    } catch {
      notify('Export failed', 'Something went wrong while saving the backup. Try again.');
    }
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
        <Button variant="secondary" icon="share-outline" title="Export backup" onPress={onExport} />
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
        <Divider />
        <Button variant="danger" icon="trash-outline" title="Delete all data" onPress={onReset} />
      </Card>

      <SectionTitle title="About" />
      <Card>
        <Txt>Court-Ready {Constants.expoConfig?.version ?? ''}</Txt>
        <Txt v="small">
          Workout tracker built around the Court-Ready Muscle guide: 3 gym sessions around volleyball and basketball,
          chest priority, shoulder- and elbow-friendly exercises.
        </Txt>
        <Txt v="tiny">General training advice, not medical advice.</Txt>
      </Card>
    </Screen>
  );
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
