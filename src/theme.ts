// The design system in code. The written form is docs/design.md: read it before changing a value here.
import { DarkTheme, type Theme } from 'expo-router';
import type { TextStyle } from 'react-native';

/** Greyscale on true black. White is the only accent; red is for pain 4+ and delete only. */
export const C = {
  /** Screen background. */
  bg: '#000000',
  /** Cards. */
  surface: '#111111',
  /** Inputs, steppers, chips, secondary buttons. */
  control: '#1C1C1C',
  /** Progress tracks, the selected segment. */
  track: '#2A2A2A',
  /** Dividers inside cards. */
  hairline: '#222222',
  /** Outlined buttons, empty check circles. */
  outline: '#3A3A3A',
  /** Primary text, primary button fill, done marks. */
  text: '#FAFAFA',
  /** Secondary text. */
  textMuted: '#B3B3B3',
  /** Labels and captions. Passes 4.5:1 on bg, surface and control. */
  textFaint: '#8C8C8C',
  /** Text on white. */
  onAccent: '#000000',
  /** Pain 4+ and delete only. */
  danger: '#FF453A',
  /** Dimmed screen behind a sheet. */
  scrim: 'rgba(0,0,0,0.6)',
} as const;

export const TONE = {
  plain: { fg: C.text, bg: C.control },
  /** Selected, today, done: white fill with black text. */
  strong: { fg: C.onAccent, bg: C.text },
  danger: { fg: C.danger, bg: C.control },
} as const;

export type ToneName = keyof typeof TONE;

/** Numbers line up in columns everywhere. */
const TABULAR: TextStyle['fontVariant'] = ['tabular-nums'];

/** Type scale: system font, size / line height / weight. */
export const T = {
  title: { fontSize: 32, lineHeight: 38, fontWeight: '700', letterSpacing: -0.64, fontVariant: TABULAR },
  hero: { fontSize: 28, lineHeight: 32, fontWeight: '700', letterSpacing: -0.56, fontVariant: TABULAR },
  heading: { fontSize: 22, lineHeight: 26, fontWeight: '700', letterSpacing: -0.22, fontVariant: TABULAR },
  /** Buttons and bar titles. */
  button: { fontSize: 17, lineHeight: 22, fontWeight: '600', fontVariant: TABULAR },
  rowTitle: { fontSize: 16, lineHeight: 22, fontWeight: '600', fontVariant: TABULAR },
  body: { fontSize: 15, lineHeight: 20, fontVariant: TABULAR },
  /** Pills, chips and small buttons, as drawn on the canvas. */
  pill: { fontSize: 14, lineHeight: 18, fontWeight: '600', fontVariant: TABULAR },
  secondary: { fontSize: 13, lineHeight: 18, fontVariant: TABULAR },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.96,
    textTransform: 'uppercase',
    fontVariant: TABULAR,
  },
  smallest: { fontSize: 11, lineHeight: 14, fontVariant: TABULAR },
} satisfies Record<string, TextStyle>;

/** Corner radius by what the shape is. */
export const R = { hero: 24, card: 20, button: 16, control: 14, small: 12, pill: 999 } as const;

/** Spacing. The screen gutter is 20, card padding 16 (lg), hero card padding 20 (gutter). */
export const S = { xs: 4, sm: 8, md: 12, lg: 16, gutter: 20, xl: 24, xxl: 32 } as const;

/** Sizes of things you touch. Nothing you can tap is smaller than `touch`. */
export const SIZE = { touch: 44, button: 56, control: 52, tabBar: 56 } as const;

export const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: C.text,
    background: C.bg,
    card: C.bg,
    text: C.text,
    border: C.hairline,
    notification: C.text,
  },
};
