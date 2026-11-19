// The web app's date and time fields: the browser's own pickers (an iPhone shows its wheel),
// dressed with the control tokens. A 52 px field with 17 px text, so iOS does not zoom in on focus.
import type { CSSProperties } from 'react';

import type { PickerFieldProps } from '@/components/sport/PickerField';
import { C, R, SIZE } from '@/theme';

const style: CSSProperties = {
  width: 160,
  height: SIZE.control,
  boxSizing: 'border-box',
  padding: '0 12px',
  border: 0,
  borderRadius: R.control,
  background: C.control,
  color: C.text,
  colorScheme: 'dark',
  fontFamily: 'system-ui, sans-serif',
  fontSize: 17,
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
  textAlign: 'center',
  outline: 'none',
  appearance: 'none',
  WebkitAppearance: 'none',
};

export function PickerField({ kind, value, onChange, accessibilityLabel }: PickerFieldProps) {
  return (
    <input
      type={kind}
      value={value}
      aria-label={accessibilityLabel}
      onChange={(e) => onChange(e.target.value)}
      style={style}
    />
  );
}
