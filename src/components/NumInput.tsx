import { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, type StyleProp, type TextStyle } from 'react-native';

import { formatKg, parseNumber } from '@/lib/format';
import { C, R, SIZE, T } from '@/theme';

/**
 * Number field that keeps what you type ("22," or "22.") while editing and only
 * commits valid numbers. Shows `placeholder` (e.g. last time's value) when empty.
 * Opens the phone's number keypad: with a decimal key for weights, digits only for reps.
 */
export function NumInput({
  value,
  onChange,
  placeholder,
  decimal = true,
  size = 'regular',
  style,
  done,
  accessibilityLabel,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
  decimal?: boolean;
  /** regular: a cell of the set table. large: a field on its own. */
  size?: 'regular' | 'large';
  style?: StyleProp<TextStyle>;
  /** The set is ticked: the field reads as settled text, but can still be edited. */
  done?: boolean;
  accessibilityLabel?: string;
}) {
  const [text, setText] = useState(value == null ? '' : formatKg(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setText(value == null ? '' : formatKg(value));
  }, [value]);

  return (
    <TextInput
      accessibilityLabel={accessibilityLabel}
      value={text}
      onChangeText={(t) => {
        const cleaned = decimal ? t.replace(/[^0-9.,]/g, '') : t.replace(/[^0-9]/g, '');
        setText(cleaned);
        const n = parseNumber(cleaned);
        if (cleaned === '' || n != null) onChange(n);
      }}
      onFocus={() => {
        focused.current = true;
      }}
      onBlur={() => {
        focused.current = false;
        setText(value == null ? '' : formatKg(value));
      }}
      placeholder={placeholder}
      placeholderTextColor={C.textFaint}
      inputMode={decimal ? 'decimal' : 'numeric'}
      selectTextOnFocus
      enterKeyHint="done"
      style={[styles.input, size === 'large' && styles.large, done && styles.done, style]}
      maxLength={6}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    ...T.rowTitle,
    backgroundColor: C.control,
    color: C.text,
    borderRadius: R.small,
    height: SIZE.touch,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  large: { ...T.button, height: SIZE.control, borderRadius: R.control },
  done: { backgroundColor: 'transparent' },
});
