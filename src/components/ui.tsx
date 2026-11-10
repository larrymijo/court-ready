// Shared building blocks. Sizes, colours and type come from src/theme.ts (docs/design.md).
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { C, R, S, SIZE, T, TONE, type ToneName } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

type TxtVariant = 'title' | 'hero' | 'h1' | 'h2' | 'bar' | 'body' | 'small' | 'caption' | 'tiny' | 'label' | 'num';

export function Txt({
  v = 'body',
  color,
  style,
  ...rest
}: TextProps & { v?: TxtVariant; color?: string }) {
  return <Text style={[txt[v], color ? { color } : null, style]} {...rest} />;
}

const txt = StyleSheet.create({
  /** Screen title. */
  title: { ...T.title, color: C.text },
  hero: { ...T.hero, color: C.text },
  /** Section heading. */
  h1: { ...T.heading, color: C.text },
  /** Row and card title. */
  h2: { ...T.rowTitle, color: C.text },
  /** Bar title. */
  bar: { ...T.button, color: C.text },
  body: { ...T.body, color: C.text },
  small: { ...T.secondary, color: C.textMuted },
  /** Helper sentence under a card or a field. */
  caption: { ...T.secondary, color: C.textFaint },
  tiny: { ...T.smallest, color: C.textFaint },
  label: { ...T.label, color: C.textFaint },
  /** A figure in a stat. */
  num: { ...T.button, color: C.text },
});

/** Room a screen leaves at the bottom for a pinned BottomBar. */
export const BOTTOM_BAR_SPACE = SIZE.button + 44;

/** Scrollable page with the screen gutter and safe-area padding. */
export function Screen({
  children,
  scroll = true,
  bottomPad = S.xl,
  edgesTop = true,
  edgesBottom = true,
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  bottomPad?: number;
  edgesTop?: boolean;
  /** False under the tab bar, which already keeps clear of the home indicator. */
  edgesBottom?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const pad: ViewStyle = {
    paddingTop: (edgesTop ? insets.top : 0) + 10,
    paddingBottom: bottomPad + (edgesBottom ? insets.bottom : 0),
    paddingHorizontal: S.gutter,
    gap: S.lg,
  };
  if (!scroll) return <View style={[styles.screen, pad, contentStyle]}>{children}</View>;
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[pad, contentStyle]}
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag">
      {children}
    </ScrollView>
  );
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <View style={styles.pageHeader}>
      <View style={styles.pageHeaderText}>
        {subtitle ? (
          <Txt v="label" numberOfLines={1}>
            {subtitle}
          </Txt>
        ) : null}
        <Txt v="title" accessibilityRole="header">
          {title}
        </Txt>
      </View>
      {right}
    </View>
  );
}

/** `hero` is the one big card of a screen; `list` holds ListRows, which bring their own padding. */
export function Card({
  children,
  style,
  onPress,
  variant = 'card',
  accessibilityLabel,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'card' | 'hero' | 'list';
  accessibilityLabel?: string;
}) {
  const shape = variant === 'hero' ? styles.cardHero : variant === 'list' ? styles.cardList : null;
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [styles.card, shape, pressed && styles.pressed, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, shape, style]}>{children}</View>;
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

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
/** large: the main action of a screen. medium: other actions. small and pill: inside rows and bars. */
type ButtonSize = 'large' | 'medium' | 'small' | 'pill';

export function Button({
  title,
  onPress,
  variant = 'primary',
  size,
  small,
  icon,
  iconRight,
  disabled,
  style,
  flex,
  accessibilityLabel,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shorthand for size="small". */
  small?: boolean;
  icon?: IconName;
  iconRight?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  flex?: boolean;
  accessibilityLabel?: string;
}) {
  const sz: ButtonSize =
    size ?? (small ? 'small' : variant === 'primary' ? 'large' : variant === 'ghost' || variant === 'danger' ? 'small' : 'medium');
  const v = buttonVariants[variant];
  const iconSize = sz === 'large' || sz === 'medium' ? 18 : 16;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        buttonSizes[sz],
        { backgroundColor: v.bg },
        variant === 'outline' && styles.buttonOutline,
        flex && { flex: 1 },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      {icon ? <Ionicons name={icon} size={iconSize} color={v.fg} /> : null}
      <Text style={[buttonText[sz], { color: v.fg }]}>{title}</Text>
      {iconRight ? <Ionicons name={iconRight} size={iconSize} color={v.fg} /> : null}
    </Pressable>
  );
}

const buttonVariants: Record<ButtonVariant, { bg: string; fg: string }> = {
  primary: { bg: C.text, fg: C.onAccent },
  secondary: { bg: C.control, fg: C.text },
  outline: { bg: 'transparent', fg: C.text },
  ghost: { bg: 'transparent', fg: C.textMuted },
  danger: { bg: 'transparent', fg: C.danger },
};

export function IconButton({
  icon,
  onPress,
  label,
  color = C.text,
  size = 22,
  plain,
  style,
}: {
  icon: IconName;
  onPress: () => void;
  /** Read out by screen readers: say what the button does. */
  label: string;
  color?: string;
  size?: number;
  /** No filled circle behind the icon. */
  plain?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, !plain && styles.iconButtonFilled, pressed && styles.pressed, style]}>
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}

/** A pill you can tap: a filter, a choice, a shortcut. White when selected. */
export function Chip({
  label,
  onPress,
  selected,
  tone = 'plain',
  icon,
  style,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  selected?: boolean;
  tone?: 'plain' | 'danger';
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const t = selected ? TONE.strong : TONE[tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={selected == null ? undefined : { selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, { backgroundColor: t.bg }, pressed && styles.pressed, style]}>
      {icon ? <Ionicons name={icon} size={16} color={t.fg} /> : null}
      <Text style={[styles.chipText, { color: t.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

/** A small outlined label that only says something: "PR", "Optional", "Week 4 · Build". Not tappable. */
export function Tag({
  label,
  tone = 'plain',
  icon,
  style,
}: {
  label: string;
  tone?: ToneName;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const fg = tone === 'strong' ? C.onAccent : tone === 'danger' ? C.danger : C.textMuted;
  return (
    <View
      style={[
        styles.tag,
        tone === 'strong' ? styles.tagStrong : tone === 'danger' ? styles.tagDanger : null,
        style,
      ]}>
      {icon ? <Ionicons name={icon} size={12} color={fg} /> : null}
      <Text style={[styles.tagText, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** A figure with its label, for a row of figures inside a card. */
export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Txt v="num" numberOfLines={1}>
        {value}
      </Txt>
      <Txt v="tiny">{label}</Txt>
    </View>
  );
}

/** A figure on its own small card: label, value, and a short caption underneath. */
export function StatTile({
  label,
  value,
  caption,
  onPress,
}: {
  label: string;
  value: string;
  caption?: string;
  onPress?: () => void;
}) {
  const content = (
    <>
      <Text style={styles.tileLabel} numberOfLines={1}>
        {label}
      </Text>
      <Txt v="num" numberOfLines={1}>
        {value}
      </Txt>
      {caption != null ? (
        <Txt v="tiny" numberOfLines={2}>
          {caption}
        </Txt>
      ) : null}
    </>
  );
  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }
  return <View style={styles.tile}>{content}</View>;
}

export function SectionTitle({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <Row style={styles.sectionTitle} gap={S.md}>
      <Txt v="label" accessibilityRole="header" style={{ flex: 1 }} numberOfLines={1}>
        {title}
      </Txt>
      {right}
    </Row>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

export function ProgressBar({ value, height = 4 }: { value: number; height?: number }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: C.track, overflow: 'hidden' }}>
      <View style={{ width: `${pct * 100}%`, height, borderRadius: height / 2, backgroundColor: C.text }} />
    </View>
  );
}

/** A bar cut into equal steps, like the weeks of the plan. */
export function StepBar({ total, filled }: { total: number; filled: number }) {
  return (
    <View style={styles.stepBar}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.step, i < filled && styles.stepOn]} />
      ))}
    </View>
  );
}

/** The mark for "done": a white circle with a black check. An empty ring until then. */
export function Check({ done, size = 24 }: { done: boolean; size?: number }) {
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' },
        done ? { backgroundColor: C.text } : { borderWidth: 1.5, borderColor: C.outline },
      ]}>
      {done ? <Ionicons name="checkmark-sharp" size={Math.round(size * 0.62)} color={C.onAccent} /> : null}
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
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={title}
      onPress={() => onChange(!value)}
      style={styles.toggleRow}>
      <View style={styles.rowText}>
        <Txt v="h2">{title}</Txt>
        {subtitle ? <Txt v="small">{subtitle}</Txt> : null}
      </View>
      <View style={[styles.toggle, value && styles.toggleOn]}>
        <View style={[styles.knob, value && styles.knobOn]} />
      </View>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  onCard,
  style,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  /** Set when it sits on a card, so it stays visible against the card's grey. */
  onCard?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View accessibilityRole="tablist" style={[styles.segmented, onCard && { backgroundColor: C.control }, style]}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={styles.segment}>
            <View style={[styles.segmentFill, on && styles.segmentOn]}>
              <Text style={[styles.segmentText, on && { color: C.text }]} numberOfLines={1}>
                {o.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export function EmptyState({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  return (
    <Card style={styles.empty}>
      <Ionicons name={icon} size={28} color={C.textFaint} />
      <Txt v="h2" style={{ textAlign: 'center' }}>
        {title}
      </Txt>
      <Txt v="small" style={{ textAlign: 'center' }}>
        {body}
      </Txt>
    </Card>
  );
}

export function Bullet({ children }: { children: ReactNode }) {
  return (
    <Row align="flex-start" gap={S.md}>
      <View style={styles.bullet} />
      <View style={{ flex: 1 }}>{children}</View>
    </Row>
  );
}

/** Minus and plus around a value, so a number can change without the keyboard. */
export function Stepper({
  value,
  onDecrement,
  onIncrement,
  decrementLabel,
  incrementLabel,
  canDecrement = true,
  canIncrement = true,
  style,
}: {
  value: string;
  onDecrement: () => void;
  onIncrement: () => void;
  /** Read out by screen readers, e.g. "One week back". */
  decrementLabel: string;
  incrementLabel: string;
  canDecrement?: boolean;
  canIncrement?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.stepper, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={decrementLabel}
        disabled={!canDecrement}
        onPress={onDecrement}
        style={({ pressed }) => [styles.stepperButton, pressed && styles.stepperPressed, !canDecrement && styles.disabled]}>
        <Ionicons name="remove" size={22} color={C.text} />
      </Pressable>
      <Txt v="h1" numberOfLines={1} style={styles.stepperValue} accessibilityLiveRegion="polite">
        {value}
      </Txt>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={incrementLabel}
        disabled={!canIncrement}
        onPress={onIncrement}
        style={({ pressed }) => [styles.stepperButton, pressed && styles.stepperPressed, !canIncrement && styles.disabled]}>
        <Ionicons name="add" size={22} color={C.text} />
      </Pressable>
    </View>
  );
}

/** Round badge at the start of a row: a number, a short code or an icon. */
export function RowBadge({ label, icon, square }: { label?: string; icon?: IconName; square?: boolean }) {
  return (
    <View style={[styles.rowBadge, square && styles.rowBadgeSquare]}>
      {icon ? <Ionicons name={icon} size={18} color={C.textMuted} /> : <Text style={styles.rowBadgeText}>{label}</Text>}
    </View>
  );
}

/**
 * One line of a list: something at the start, a title with an optional second line, and something at
 * the end. The text part is the tap target; `trailing` sits beside it, so it can be a button of its own.
 */
export function ListRow({
  title,
  subtitle,
  caption,
  leading,
  trailing,
  onPress,
  chevron,
  endIcon,
  divider,
  destructive,
  subtitleLines = 1,
  accessibilityLabel,
}: {
  title: string;
  subtitle?: string;
  /** A third, fainter line. */
  caption?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  /** An icon at the end of the row instead of the chevron, e.g. a plus when the row adds something. */
  endIcon?: IconName;
  /** Draws the line under the row; leave it off on the last row of a card. */
  divider?: boolean;
  destructive?: boolean;
  subtitleLines?: number;
  accessibilityLabel?: string;
}) {
  const main = (
    <>
      {leading}
      <View style={styles.rowText}>
        <Txt v="h2" numberOfLines={2} color={destructive ? C.danger : undefined}>
          {title}
        </Txt>
        {subtitle ? (
          <Txt v="small" numberOfLines={subtitleLines}>
            {subtitle}
          </Txt>
        ) : null}
        {caption ? (
          <Txt v="caption" numberOfLines={1}>
            {caption}
          </Txt>
        ) : null}
      </View>
      {endIcon ? (
        <Ionicons name={endIcon} size={22} color={C.text} />
      ) : chevron ? (
        <Ionicons name="chevron-forward" size={18} color={C.textFaint} />
      ) : null}
    </>
  );
  return (
    <View style={[styles.listRow, divider && styles.listRowDivider]}>
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          onPress={onPress}
          style={({ pressed }) => [styles.listRowMain, pressed && styles.pressed]}>
          {main}
        </Pressable>
      ) : (
        <View style={styles.listRowMain}>{main}</View>
      )}
      {trailing}
    </View>
  );
}

/** The main action of a screen, pinned in thumb reach above the home indicator. */
export function BottomBar({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, S.lg) }]}>{children}</View>;
}

export interface SheetAction {
  label: string;
  icon?: IconName;
  destructive?: boolean;
  hint?: string;
  onPress: () => void;
}

/** A panel that slides over the bottom of the screen: a list of actions, your own content, or both. */
export function Sheet({
  visible,
  title,
  subtitle,
  actions,
  children,
  onClose,
  closeLabel = 'Cancel',
}: {
  visible: boolean;
  title?: string;
  subtitle?: string;
  actions?: SheetAction[];
  children?: ReactNode;
  onClose: () => void;
  closeLabel?: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Close">
        {/* The empty handler keeps a tap on the sheet itself from closing it. */}
        <Pressable
          accessibilityViewIsModal
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, S.lg) }]}
          onPress={() => {}}>
          <View style={styles.sheetGrabber} />
          {title ? (
            <View style={styles.sheetHeader}>
              <Txt v="bar" accessibilityRole="header" style={{ textAlign: 'center' }}>
                {title}
              </Txt>
              {subtitle ? (
                <Txt v="small" style={{ textAlign: 'center' }}>
                  {subtitle}
                </Txt>
              ) : null}
            </View>
          ) : null}
          <ScrollView style={styles.sheetScroll} bounces={false} keyboardShouldPersistTaps="handled">
            {children}
            {actions?.map((a) => (
              <Pressable
                key={a.label}
                accessibilityRole="button"
                onPress={() => {
                  onClose();
                  a.onPress();
                }}
                style={({ pressed }) => [styles.sheetAction, pressed && { backgroundColor: C.control }]}>
                {a.icon ? <Ionicons name={a.icon} size={22} color={a.destructive ? C.danger : C.text} /> : null}
                <View style={styles.rowText}>
                  <Txt v="h2" color={a.destructive ? C.danger : undefined}>
                    {a.label}
                  </Txt>
                  {a.hint ? (
                    <Txt v="small" numberOfLines={2}>
                      {a.hint}
                    </Txt>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </ScrollView>
          <Button title={closeLabel} variant="secondary" onPress={onClose} style={{ marginTop: S.sm }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Text fields share this look: the `control` grey, 16 px text so iPhones don't zoom in on focus. */
export const fieldStyle: TextStyle = {
  ...T.rowTitle,
  fontWeight: '400',
  backgroundColor: C.control,
  color: C.text,
  borderRadius: R.control,
  paddingHorizontal: 14,
  paddingVertical: S.md,
  minHeight: 48,
};

const buttonSizes = StyleSheet.create({
  large: { minHeight: SIZE.button, borderRadius: R.button, paddingHorizontal: S.gutter },
  medium: { minHeight: SIZE.control, borderRadius: R.control, paddingHorizontal: S.lg },
  small: { minHeight: SIZE.touch, borderRadius: R.small, paddingHorizontal: 14 },
  pill: { minHeight: SIZE.touch, borderRadius: R.pill, paddingHorizontal: S.lg },
});

const buttonText = StyleSheet.create({
  large: { ...T.button, textAlign: 'center', flexShrink: 1 },
  medium: { ...T.rowTitle, textAlign: 'center', flexShrink: 1 },
  small: { ...T.pill, textAlign: 'center', flexShrink: 1 },
  pill: { ...T.pill, textAlign: 'center', flexShrink: 1 },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  pageHeader: { flexDirection: 'row', alignItems: 'flex-end', gap: S.md },
  pageHeaderText: { flex: 1, gap: 2 },
  card: { backgroundColor: C.surface, borderRadius: R.card, padding: S.lg, gap: S.md },
  cardHero: { borderRadius: R.hero, padding: S.gutter, gap: 14 },
  cardList: { paddingVertical: S.xs, gap: 0 },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.4 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, paddingVertical: S.sm },
  buttonOutline: { borderWidth: 1, borderColor: C.outline },
  iconButton: {
    width: SIZE.touch,
    height: SIZE.touch,
    borderRadius: SIZE.touch / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonFilled: { backgroundColor: C.control },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    minHeight: SIZE.touch,
    paddingHorizontal: S.lg,
    borderRadius: R.pill,
  },
  chipText: { ...T.pill, flexShrink: 1 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    height: 28,
    paddingHorizontal: 10,
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: C.outline,
  },
  tagStrong: { backgroundColor: C.text, borderColor: C.text },
  tagDanger: { borderColor: C.danger },
  tagText: { fontSize: 12, lineHeight: 16, fontWeight: '500', fontVariant: ['tabular-nums'] },
  stat: { flex: 1, gap: 2 },
  tile: { flex: 1, backgroundColor: C.surface, borderRadius: R.control, paddingVertical: S.md, paddingHorizontal: 10, gap: 4 },
  tileLabel: { color: C.textFaint, fontSize: 12, lineHeight: 16, fontWeight: '500' },
  sectionTitle: { marginTop: S.sm, justifyContent: 'space-between', minHeight: 20 },
  divider: { height: 1, backgroundColor: C.hairline },
  stepBar: { flexDirection: 'row', gap: 4 },
  step: { flex: 1, height: 4, borderRadius: 2, backgroundColor: C.track },
  stepOn: { backgroundColor: C.text },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, minHeight: SIZE.touch },
  toggle: { width: 52, height: 32, borderRadius: 16, backgroundColor: C.outline, padding: 3 },
  toggleOn: { backgroundColor: C.text },
  knob: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.textMuted },
  knobOn: { backgroundColor: C.onAccent, marginLeft: 20 },
  segmented: { flexDirection: 'row', height: SIZE.touch, borderRadius: R.small, backgroundColor: C.surface, paddingHorizontal: 2 },
  // The tap target is the full 44 px; the pill drawn inside it is a little smaller.
  segment: { flex: 1, paddingVertical: 3, paddingHorizontal: 1 },
  segmentFill: { flex: 1, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  segmentOn: { backgroundColor: C.track },
  segmentText: { ...T.secondary, fontWeight: '600', color: C.textFaint },
  empty: { alignItems: 'center', paddingVertical: S.xl, gap: S.sm },
  bullet: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.textFaint, marginTop: 8 },
  stepper: {
    height: SIZE.control,
    borderRadius: R.control,
    backgroundColor: C.control,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperButton: {
    width: SIZE.touch,
    height: SIZE.touch,
    borderRadius: R.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperPressed: { backgroundColor: C.track },
  stepperValue: { flex: 1, textAlign: 'center' },
  rowBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBadgeSquare: { width: SIZE.touch, height: SIZE.touch, borderRadius: R.small },
  rowBadgeText: { ...T.pill, color: C.text },
  rowText: { flex: 1, gap: 2 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  listRowDivider: { borderBottomWidth: 1, borderBottomColor: C.hairline },
  listRowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 60, paddingVertical: 10 },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    paddingHorizontal: S.gutter,
    backgroundColor: C.bg,
    gap: S.sm,
  },
  scrim: { flex: 1, backgroundColor: C.scrim, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: R.hero,
    borderTopRightRadius: R.hero,
    paddingTop: S.sm,
    paddingHorizontal: S.lg,
    maxHeight: '88%',
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  sheetGrabber: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: C.outline, marginBottom: S.sm },
  sheetHeader: { gap: 2, paddingVertical: S.sm, paddingHorizontal: S.sm },
  sheetScroll: { flexGrow: 0 },
  sheetAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: SIZE.button,
    paddingVertical: S.sm,
    paddingHorizontal: S.sm,
    borderRadius: R.control,
  },
});
