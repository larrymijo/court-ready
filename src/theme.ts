import { DarkTheme, type Theme } from 'expo-router';

export const C = {
  bg: '#0B0D12',
  surface: '#151821',
  surface2: '#1D212C',
  surface3: '#272C39',
  border: '#262B38',
  text: '#F3F4F6',
  muted: '#9AA3B2',
  faint: '#6B7385',
  accent: '#4C7DFF',
  accentSoft: 'rgba(76,125,255,0.16)',
  orange: '#FF8A3D',
  orangeSoft: 'rgba(255,138,61,0.16)',
  green: '#34C77B',
  greenSoft: 'rgba(52,199,123,0.16)',
  red: '#FF5A5F',
  redSoft: 'rgba(255,90,95,0.16)',
  amber: '#FFB547',
  amberSoft: 'rgba(255,181,71,0.16)',
} as const;

export const TONE = {
  info: { fg: C.accent, bg: C.accentSoft },
  ok: { fg: C.green, bg: C.greenSoft },
  warn: { fg: C.amber, bg: C.amberSoft },
  bad: { fg: C.red, bg: C.redSoft },
  orange: { fg: C.orange, bg: C.orangeSoft },
  plain: { fg: C.text, bg: C.surface2 },
} as const;

export type ToneName = keyof typeof TONE;

export const R = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 } as const;
export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: C.accent,
    background: C.bg,
    card: C.bg,
    text: C.text,
    border: C.border,
    notification: C.orange,
  },
};

export const PHASE_COLOR = {
  learn: C.accent,
  build: C.accent,
  deload: C.green,
  push: C.orange,
} as const;
