// A date or a time of day as a field. On the phone apps (and anywhere without the browser's own
// pickers) it is a plain text field: "2026-11-10" and "18:30". The web app uses PickerField.web.tsx,
// which shows the browser's own date and time inputs.
import { StyleSheet, TextInput } from 'react-native';

import { C, R, SIZE, T } from '@/theme';

export interface PickerFieldProps {
  kind: 'date' | 'time';
  /** "YYYY-MM-DD" or "HH:MM"; may be half typed, or empty. */
  value: string;
  onChange: (value: string) => void;
  accessibilityLabel: string;
}

export function PickerField({ kind, value, onChange, accessibilityLabel }: PickerFieldProps) {
  return (
    <TextInput
      accessibilityLabel={accessibilityLabel}
      value={value}
      onChangeText={onChange}
      placeholder={kind === 'date' ? 'YYYY-MM-DD' : 'HH:MM'}
      placeholderTextColor={C.textFaint}
      autoCapitalize="none"
      autoCorrect={false}
      maxLength={kind === 'date' ? 10 : 5}
      enterKeyHint="done"
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    ...T.button,
    width: 160,
    height: SIZE.control,
    borderRadius: R.control,
    backgroundColor: C.control,
    color: C.text,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
});
