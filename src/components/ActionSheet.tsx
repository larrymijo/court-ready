import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IconName } from '@/components/ui';
import { C, R, S } from '@/theme';

export interface SheetAction {
  label: string;
  icon?: IconName;
  destructive?: boolean;
  hint?: string;
  onPress: () => void;
}

/** Bottom sheet with a list of actions. */
export function ActionSheet({
  visible,
  title,
  actions,
  onClose,
}: {
  visible: boolean;
  title?: string;
  actions: SheetAction[];
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + S.md }]} onPress={() => {}}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {actions.map((a) => (
            <Pressable
              key={a.label}
              onPress={() => {
                onClose();
                a.onPress();
              }}
              style={({ pressed }) => [styles.action, pressed && { backgroundColor: C.surface2 }]}>
              {a.icon ? <Ionicons name={a.icon} size={20} color={a.destructive ? C.red : C.text} /> : null}
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionText, a.destructive && { color: C.red }]}>{a.label}</Text>
                {a.hint ? <Text style={styles.hint}>{a.hint}</Text> : null}
              </View>
            </Pressable>
          ))}
          <Pressable onPress={onClose} style={({ pressed }) => [styles.cancel, pressed && { opacity: 0.7 }]}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    paddingTop: S.md,
    paddingHorizontal: S.md,
    gap: 2,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    color: C.muted,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: S.sm,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingVertical: 14,
    paddingHorizontal: S.md,
    borderRadius: R.md,
  },
  actionText: { color: C.text, fontSize: 16, fontWeight: '600' },
  hint: { color: C.muted, fontSize: 12, marginTop: 1 },
  cancel: {
    marginTop: S.sm,
    backgroundColor: C.surface2,
    borderRadius: R.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: { color: C.text, fontSize: 16, fontWeight: '700' },
});
