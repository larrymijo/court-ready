import { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, type StyleProp, type TextStyle } from 'react-native';

import { formatKg, parseNumber } from '@/lib/format';
import { C, R } from '@/theme';

/**
 * Number field that keeps what you type ("22," or "22.") while editing and only
 * commits valid numbers. Shows `placeholder` (e.g. last time's value) when empty.
 */
export function NumInput({
  value,
  onChange,
  placeholder,
  decimal = true,
  style,
  done,
  accessibilityLabel,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
  decimal?: boolean;
  style?: StyleProp<TextStyle>;
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
      placeholderTextColor={C.faint}
      keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
      selectTextOnFocus
      returnKeyType="done"
      style={[styles.input, done && styles.done, style]}
      maxLength={6}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: C.surface2,
    color: C.text,
    borderRadius: R.sm,
    height: 36,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 4,
    fontVariant: ['tabular-nums'],
  },
  done: { backgroundColor: 'rgba(52,199,123,0.12)' },
});
