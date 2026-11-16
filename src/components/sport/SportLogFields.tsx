import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { EffortPicker } from '@/components/sport/ScalePicker';
import { NumberStepper } from '@/components/sport/NumberStepper';
import { Card, Divider, fieldStyle, Txt } from '@/components/ui';
import { PainPicker } from '@/components/workout/PainPicker';
import { paceText, SPORT_MINUTES_MAX, type SportEntry, type SportField } from '@/lib/sportSession';
import type { SportDef } from '@/lib/types';
import { C, R, S, T } from '@/theme';

/** What the log asks for, in words next to the field that breaks a rule. */
export const FIELD_ERRORS: Record<SportField, string> = {
  minutes: `Minutes must be a whole number from 1 to ${SPORT_MINUTES_MAX}.`,
  effort: 'Effort must be a whole number from 1 to 10.',
  pain: 'Pain must be from 0 to 10.',
  distanceKm: 'The distance must be more than 0 km.',
  match: 'Pick match or practice.',
};

/** A line that says what is wrong with a field. Not red: red is for pain 4 and up, and delete. */
export function FieldError({ children }: { children: string }) {
  return (
    <View style={styles.error} accessibilityRole="alert">
      <Ionicons name="alert-circle-outline" size={18} color={C.text} />
      <Txt v="small" color={C.text} style={{ flex: 1 }}>
        {children}
      </Txt>
    </View>
  );
}

/** The log sheet: time (or distance, time and pace for a run), effort, match or practice, pain and notes. */
export function SportLogFields({
  def,
  values,
  onChange,
  errors,
  minutesTitle,
  minutesHint,
  minutesStep = 1,
}: {
  def: SportDef;
  values: SportEntry;
  /** What changed. `undefined` clears a field. */
  onChange: (patch: SportEntry) => void;
  errors: readonly SportField[];
  /** "Time played" for a session from the clock, "Minutes" for one entered afterwards. */
  minutesTitle: string;
  minutesHint?: string;
  minutesStep?: number;
}) {
  const minutes = (
    <NumberStepper
      value={values.minutes}
      onChange={(v) => onChange({ minutes: v })}
      unit="min"
      step={minutesStep}
      min={1}
      decrementLabel="Fewer minutes"
      incrementLabel="More minutes"
      accessibilityLabel="Minutes"
    />
  );
  const pace = def.logsDistance ? paceText(values.distanceKm, values.minutes) : null;
  const [paceNumber, paceUnit] = pace ? pace.split(' ') : ['–', '/km'];

  return (
    <>
      {def.logsDistance ? (
        <Card style={{ gap: 14 }}>
          <View style={styles.line}>
            <View style={styles.lineText}>
              <Txt v="h2">Distance</Txt>
              <Txt v="caption">Tap the number to type it</Txt>
            </View>
            <NumberStepper
              value={values.distanceKm}
              onChange={(v) => onChange({ distanceKm: v })}
              unit="km"
              step={0.5}
              min={0.5}
              decimal
              decrementLabel="Shorter"
              incrementLabel="Longer"
              accessibilityLabel="Distance in kilometres"
            />
          </View>
          {errors.includes('distanceKm') ? <FieldError>{FIELD_ERRORS.distanceKm}</FieldError> : null}
          <Divider />
          <View style={styles.line}>
            <View style={styles.lineText}>
              <Txt v="h2">Time</Txt>
              {minutesHint ? <Txt v="caption">{minutesHint}</Txt> : null}
            </View>
            {minutes}
          </View>
          {errors.includes('minutes') ? <FieldError>{FIELD_ERRORS.minutes}</FieldError> : null}
          <Divider />
          <View style={styles.line}>
            <View style={styles.lineText}>
              <Txt v="h2">Pace</Txt>
              <Txt v="caption">Worked out from distance and time</Txt>
            </View>
            <Text style={styles.pace} accessibilityLabel={pace ? `Pace ${paceNumber} per kilometre` : 'No pace yet'}>
              {paceNumber} <Text style={styles.paceUnit}>{paceUnit}</Text>
            </Text>
          </View>
        </Card>
      ) : (
        <Card>
          <View style={styles.line}>
            <View style={styles.lineText}>
              <Txt v="h2">{minutesTitle}</Txt>
              {minutesHint ? <Txt v="caption">{minutesHint}</Txt> : null}
            </View>
            {minutes}
          </View>
          {errors.includes('minutes') ? <FieldError>{FIELD_ERRORS.minutes}</FieldError> : null}
        </Card>
      )}

      <Card style={{ gap: S.md }}>
        <View style={styles.titleRow}>
          <Txt v="h2">Effort</Txt>
          <Txt v="caption">1 easy · 10 all out</Txt>
        </View>
        <EffortPicker value={values.effort} onChange={(v) => onChange({ effort: v })} />
        {errors.includes('effort') ? <FieldError>{FIELD_ERRORS.effort}</FieldError> : null}
      </Card>

      {def.logsMatch ? (
        <View style={styles.segmentCard}>
          <View style={styles.segmentRow}>
            {([true, false] as const).map((isMatch) => {
              const on = values.match === isMatch;
              return (
                <Pressable
                  key={String(isMatch)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  onPress={() => onChange({ match: on ? undefined : isMatch })}
                  style={[styles.segment, on && styles.segmentOn]}>
                  <Text style={[styles.segmentText, on && { color: C.onAccent }]}>{isMatch ? 'Match' : 'Practice'}</Text>
                </Pressable>
              );
            })}
          </View>
          {errors.includes('match') ? <FieldError>{FIELD_ERRORS.match}</FieldError> : null}
        </View>
      ) : null}

      <Card style={{ gap: S.sm, paddingTop: 6 }}>
        <View style={styles.titleRow}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: S.sm }}>
            <Txt v="h2">Pain</Txt>
            <Txt v="caption">Optional</Txt>
          </View>
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push('/guide/pain')}
            style={styles.painRules}>
            <Text style={styles.painRulesText}>Pain rules</Text>
            <Ionicons name="chevron-forward" size={14} color={C.text} />
          </Pressable>
        </View>
        <PainPicker value={values.pain ?? null} onChange={(v) => onChange({ pain: v })} />
        {errors.includes('pain') ? <FieldError>{FIELD_ERRORS.pain}</FieldError> : null}
      </Card>

      <Card style={{ gap: S.sm }}>
        <Txt v="h2">
          Notes
        </Txt>
        <TextInput
          accessibilityLabel="Notes"
          value={values.note ?? ''}
          onChangeText={(t) => onChange({ note: t })}
          placeholder="Anything to remember"
          placeholderTextColor={C.textFaint}
          multiline
          style={styles.notes}
        />
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: S.md },
  lineText: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 24 },
  error: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  pace: { ...T.heading, color: C.text },
  paceUnit: { ...T.secondary, fontWeight: '500', color: C.textMuted },
  segmentCard: { backgroundColor: C.surface, borderRadius: R.card, padding: 6, gap: S.sm },
  segmentRow: { flexDirection: 'row', gap: 6 },
  segment: { flex: 1, height: 44, borderRadius: R.control, alignItems: 'center', justifyContent: 'center' },
  segmentOn: { backgroundColor: C.text },
  segmentText: { ...T.body, fontWeight: '600', color: C.textMuted },
  painRules: {
    minHeight: 44,
    marginRight: -S.sm,
    paddingHorizontal: S.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  painRulesText: { ...T.secondary, fontWeight: '600', color: C.text },
  notes: { ...fieldStyle, minHeight: 64, textAlignVertical: 'top', paddingVertical: 10, lineHeight: 22 },
});
