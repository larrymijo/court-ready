import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { C, R, S, TONE, type ToneName } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

type TxtVariant = 'title' | 'h1' | 'h2' | 'body' | 'small' | 'tiny' | 'label' | 'num';

export function Txt({
  v = 'body',
  color,
  style,
  ...rest
}: TextProps & { v?: TxtVariant; color?: string }) {
  return <Text style={[txt[v], color ? { color } : null, style]} {...rest} />;
}

const txt = StyleSheet.create({
  title: { color: C.text, fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: -0.5 },
  h1: { color: C.text, fontSize: 21, lineHeight: 27, fontWeight: '800', letterSpacing: -0.3 },
  h2: { color: C.text, fontSize: 17, lineHeight: 23, fontWeight: '700' },
  body: { color: C.text, fontSize: 15, lineHeight: 22 },
  small: { color: C.muted, fontSize: 13, lineHeight: 18 },
  tiny: { color: C.muted, fontSize: 11, lineHeight: 15 },
  label: { color: C.muted, fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  num: { color: C.text, fontSize: 22, lineHeight: 28, fontWeight: '800', fontVariant: ['tabular-nums'] },
});

/** Scrollable page with safe-area padding. Leaves room at the bottom for the tab bar. */
export function Screen({
  children,
  scroll = true,
  bottomPad = 110,
  edgesTop = true,
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  bottomPad?: number;
  edgesTop?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const pad: ViewStyle = {
    paddingTop: (edgesTop ? insets.top : 0) + S.md,
    paddingBottom: bottomPad + insets.bottom,
    paddingHorizontal: S.lg,
    gap: S.md,
  };
  if (!scroll) return <View style={[{ flex: 1, backgroundColor: C.bg }, pad, contentStyle]}>{children}</View>;
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={[pad, contentStyle]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag">
      {children}
    </ScrollView>
  );
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <View style={styles.pageHeader}>
      <View style={{ flex: 1 }}>
        {subtitle ? <Txt v="label">{subtitle}</Txt> : null}
        <Txt v="title">{title}</Txt>
      </View>
      {right}
    </View>
  );
}

export function Card({
  children,
  style,
  onPress,
  tone,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  tone?: ToneName;
}) {
  const toneStyle = tone ? { backgroundColor: TONE[tone].bg, borderColor: 'transparent' } : null;
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, toneStyle, pressed && styles.pressed, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, toneStyle, style]}>{children}</View>;
}

export function Row({
  children,
  gap = S.sm,
  style,
  align = 'center',
}: {
  children: ReactNode;
  gap?: number;
  style?: StyleProp<ViewStyle>;
  align?: ViewStyle['alignItems'];
}) {
  return <View style={[{ flexDirection: 'row', alignItems: align, gap }, style]}>{children}</View>;
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  small,
  disabled,
  style,
  flex,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  small?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  flex?: boolean;
}) {
  const v = buttonVariants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: v.bg },
        flex && { flex: 1 },
        pressed && styles.pressed,
        disabled && { opacity: 0.4 },
        style,
      ]}>
      {icon ? <Ionicons name={icon} size={small ? 16 : 19} color={v.fg} /> : null}
      <Text style={[styles.buttonText, small && { fontSize: 14 }, { color: v.fg }]}>{title}</Text>
    </Pressable>
  );
}

const buttonVariants: Record<ButtonVariant, { bg: string; fg: string }> = {
  primary: { bg: C.accent, fg: '#FFFFFF' },
  secondary: { bg: C.surface2, fg: C.text },
  ghost: { bg: 'transparent', fg: C.accent },
  danger: { bg: C.redSoft, fg: C.red },
  success: { bg: C.green, fg: '#06150D' },
};

export function IconButton({
  icon,
  onPress,
  color = C.text,
  size = 22,
  bg = C.surface2,
  label,
}: {
  icon: IconName;
  onPress: () => void;
  color?: string;
  size?: number;
  bg?: string;
  label?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.iconButton, { backgroundColor: bg }, pressed && styles.pressed]}>
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}

export function Chip({
  label,
  tone = 'plain',
  icon,
  onPress,
  style,
  textStyle,
}: {
  label: string;
  tone?: ToneName;
  icon?: IconName;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  const t = TONE[tone];
  const content = (
    <>
      {icon ? <Ionicons name={icon} size={13} color={t.fg} /> : null}
      <Text style={[styles.chipText, { color: t.fg }, textStyle]}>{label}</Text>
    </>
  );
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        hitSlop={6}
        style={({ pressed }) => [styles.chip, { backgroundColor: t.bg }, pressed && styles.pressed, style]}>
        {content}
      </Pressable>
    );
  }
  return <View style={[styles.chip, { backgroundColor: t.bg }, style]}>{content}</View>;
}

export function Stat({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Txt v="num" color={color} numberOfLines={1}>
        {value}
      </Txt>
      <Txt v="tiny">{label}</Txt>
    </View>
  );
}

export function SectionTitle({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <Row style={{ marginTop: S.sm, justifyContent: 'space-between' }}>
      <Txt v="label">{title}</Txt>
      {right}
    </Row>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: C.border }, style]} />;
}

export function ProgressBar({ value, color = C.accent, height = 6 }: { value: number; color?: string; height?: number }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={{ height, borderRadius: height, backgroundColor: C.surface3, overflow: 'hidden' }}>
      <View style={{ width: `${pct * 100}%`, height, borderRadius: height, backgroundColor: color }} />
    </View>
  );
}

export function ToggleRow({
  title,
  subtitle,
  value,
  onChange,
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Row style={{ justifyContent: 'space-between', paddingVertical: S.xs }} gap={S.md}>
      <View style={{ flex: 1 }}>
        <Txt>{title}</Txt>
        {subtitle ? <Txt v="small">{subtitle}</Txt> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: C.surface3, true: C.accent }}
        thumbColor="#FFFFFF"
      />
    </Row>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[styles.segment, on && { backgroundColor: C.surface3 }]}>
            <Text style={[styles.segmentText, on && { color: C.text }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function EmptyState({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  return (
    <Card style={{ alignItems: 'center', paddingVertical: S.xl, gap: S.sm }}>
      <Ionicons name={icon} size={34} color={C.faint} />
      <Txt v="h2">{title}</Txt>
      <Txt v="small" style={{ textAlign: 'center' }}>
        {body}
      </Txt>
    </Card>
  );
}

export function Bullet({ children, color = C.accent }: { children: ReactNode; color?: string }) {
  return (
    <Row align="flex-start" gap={S.sm}>
      <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: color, marginTop: 9 }} />
      <View style={{ flex: 1 }}>{children}</View>
    </Row>
  );
}

const styles = StyleSheet.create({
  pageHeader: { flexDirection: 'row', alignItems: 'flex-end', gap: S.md, marginBottom: S.xs },
  card: {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    padding: S.lg,
    gap: S.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.border,
  },
  pressed: { opacity: 0.7 },
  button: {
    minHeight: 48,
    borderRadius: R.md,
    paddingHorizontal: S.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.sm,
  },
  buttonSmall: { minHeight: 36, paddingHorizontal: S.md, borderRadius: R.sm },
  buttonText: { fontSize: 16, fontWeight: '700' },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: R.pill,
  },
  chipText: { fontSize: 12, fontWeight: '700' },
  segmented: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: R.md, padding: 3, gap: 3 },
  segment: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
  segmentText: { color: C.muted, fontWeight: '700', fontSize: 14 },
});
