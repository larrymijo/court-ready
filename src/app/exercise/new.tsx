import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BOTTOM_BAR_SPACE, BottomBar, Button, Check, PageHeader, Screen, Sheet, Txt, fieldStyle } from '@/components/ui';
import { EQUIPMENT, MUSCLE_GROUPS, exerciseLabel } from '@/lib/exerciseCatalog';
import { parseNumber } from '@/lib/format';
import { successFeedback } from '@/lib/platform';
import type { Equipment, MuscleGroup, TrackingType } from '@/lib/types';
import { useStore } from '@/store/useStore';
import { C, R, S, SIZE } from '@/theme';

type Picker = 'primary' | 'equipment';
const loggingOptions: { value: TrackingType; label: string }[] = [
  { value: 'weight_reps', label: 'Weight and reps' },
  { value: 'reps', label: 'Reps only' },
];

export default function NewExerciseScreen() {
  const createExercise = useStore((s) => s.createCustomExercise);
  const [name, setName] = useState('');
  const [primary, setPrimary] = useState<MuscleGroup>('chest');
  const [helpers, setHelpers] = useState<MuscleGroup[]>([]);
  const [equipment, setEquipment] = useState<Equipment>('barbell');
  const [tracking, setTracking] = useState<TrackingType>('weight_reps');
  const [step, setStep] = useState('2.5');
  const [notes, setNotes] = useState('');
  const [picker, setPicker] = useState<Picker | null>(null);
  const [helpersOpen, setHelpersOpen] = useState(false);
  const [error, setError] = useState('');

  const save = () => {
    const increment = parseNumber(step);
    if (tracking === 'weight_reps' && increment == null) {
      setError('Enter the weight step in kg.');
      return;
    }
    const result = createExercise({
      name, primary, secondary: helpers, equipment, tracking, notes,
      ...(tracking === 'weight_reps' && increment != null ? { increment } : {}),
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    successFeedback();
    router.replace(`/exercise/${result.id}`);
  };

  const backToLibrary = () => router.canGoBack() ? router.back() : router.replace('/library');

  return (
    <View style={styles.page}>
      <Stack.Screen options={{
        title: '',
        headerLeft: () => <Button variant="ghost" size="small" title="Library" icon="chevron-back" onPress={backToLibrary} />,
      }} />
      <Screen edgesTop={false} bottomPad={BOTTOM_BAR_SPACE + (error ? 50 : 0)}>
        <PageHeader title="New exercise" />
        <View style={styles.field}>
          <Txt v="h2">Name</Txt>
          <TextInput
            accessibilityLabel="Name"
            placeholder="Exercise name"
            placeholderTextColor={C.textFaint}
            maxLength={65}
            value={name}
            onChangeText={(value) => { setName(value); setError(''); }}
            style={fieldStyle}
          />
        </View>
        <View style={styles.field}>
          <Txt v="h2">Primary muscle</Txt>
          <Choice label="Primary muscle" value={exerciseLabel(primary)} onPress={() => setPicker('primary')} />
        </View>
        <View style={styles.helperPanel}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: helpersOpen }}
            onPress={() => setHelpersOpen(!helpersOpen)}
            style={styles.helperHeader}>
            <Txt v="h2" style={styles.grow}>Helper muscles</Txt>
            <Txt v="small">{helpers.length ? `${helpers.length} selected` : 'Optional'}</Txt>
            <Ionicons name={helpersOpen ? 'chevron-up' : 'chevron-down'} size={18} color={C.textMuted} />
          </Pressable>
          {helpersOpen ? (
            <View style={styles.helperOptions}>
              {MUSCLE_GROUPS.filter((group) => group !== primary).map((group) => {
                const selected = helpers.includes(group);
                return (
                  <Pressable
                    key={group}
                    accessibilityRole="checkbox"
                    accessibilityLabel={exerciseLabel(group)}
                    accessibilityState={{ checked: selected }}
                    onPress={() => setHelpers((current) => current.includes(group)
                      ? current.filter((g) => g !== group) : [...current, group])}
                    style={styles.helper}>
                    <Check done={selected} size={20} />
                    <Txt>{exerciseLabel(group)}</Txt>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
        <View style={styles.field}>
          <Txt v="h2">Equipment</Txt>
          <Choice label="Equipment" value={exerciseLabel(equipment)} onPress={() => setPicker('equipment')} />
        </View>
        <View style={styles.field}>
          <Txt v="h2">Log each set</Txt>
          <View accessibilityRole="radiogroup" accessibilityLabel="Log each set" style={styles.logOptions}>
            {loggingOptions.map((option) => (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: tracking === option.value }}
                accessibilityLabel={option.label}
                onPress={() => { setTracking(option.value); setError(''); }}
                style={styles.logChoice}>
                <Ionicons name={tracking === option.value ? 'radio-button-on' : 'radio-button-off'} size={20} color={C.text} />
                <Txt>{option.label}</Txt>
              </Pressable>
            ))}
          </View>
        </View>
        {tracking === 'weight_reps' ? (
          <View style={styles.field}>
            <Txt v="h2">Weight step (kg)</Txt>
            <TextInput
              accessibilityLabel="Weight step (kg)"
              inputMode="decimal"
              selectTextOnFocus
              value={step}
              onChangeText={(value) => { setStep(value); setError(''); }}
              style={fieldStyle}
            />
          </View>
        ) : null}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Txt v="h2">Technique notes</Txt>
            <Txt v="small">Optional</Txt>
          </View>
          <TextInput
            accessibilityLabel="Technique notes"
            placeholder="Setup or cues to remember"
            placeholderTextColor={C.textFaint}
            value={notes}
            onChangeText={setNotes}
            multiline
            maxLength={600}
            style={[fieldStyle, styles.notes]}
          />
        </View>
      </Screen>
      <BottomBar>
        {error ? <Txt accessibilityRole="alert" v="small" color={C.text}>{error}</Txt> : null}
        <Button title="Save exercise" onPress={save} />
      </BottomBar>
      <Sheet
        visible={picker !== null}
        title={picker === 'primary' ? 'Primary muscle' : 'Equipment'}
        onClose={() => setPicker(null)}
        actions={picker === 'primary'
          ? MUSCLE_GROUPS.map((group) => ({
              label: exerciseLabel(group),
              icon: group === primary ? 'checkmark' : undefined,
              onPress: () => {
                setPrimary(group);
                setHelpers((current) => current.filter((g) => g !== group));
              },
            }))
          : EQUIPMENT.map((gear) => ({
              label: exerciseLabel(gear),
              icon: gear === equipment ? 'checkmark' : undefined,
              onPress: () => setEquipment(gear),
            }))}
      />
    </View>
  );
}

function Choice({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <Pressable style={styles.choice} accessibilityRole="button" accessibilityLabel={`${label}, ${value}`} onPress={onPress}>
      <Txt style={styles.grow}>{value}</Txt>
      <Ionicons name="chevron-down" size={18} color={C.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.bg },
  grow: { flex: 1 },
  field: { gap: S.sm },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  choice: { flexDirection: 'row', alignItems: 'center', minHeight: 48, paddingHorizontal: 14, borderRadius: R.control, backgroundColor: C.control },
  helperPanel: { paddingHorizontal: S.md, backgroundColor: C.surface, borderRadius: R.control },
  helperHeader: { flexDirection: 'row', alignItems: 'center', gap: S.sm, minHeight: 48 },
  helperOptions: { flexDirection: 'row', flexWrap: 'wrap' },
  helper: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: S.sm, minHeight: SIZE.touch },
  logOptions: { flexDirection: 'row', flexWrap: 'wrap', columnGap: S.gutter },
  logChoice: { flexDirection: 'row', alignItems: 'center', gap: S.sm, minHeight: SIZE.touch },
  notes: { minHeight: 96, textAlignVertical: 'top' },
});
