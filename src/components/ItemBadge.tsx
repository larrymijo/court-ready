import { StyleSheet, Text, View } from 'react-native';

import { C, T } from '@/theme';

/** Exercise number from the guide. Straight sets are filled; superset partners ("5a", "5b") are outlined. */
export function ItemBadge({ label, superset }: { label: string; superset?: boolean }) {
  return (
    <View style={[styles.badge, superset ? styles.superset : styles.straight]}>
      <Text style={[styles.text, superset && { color: C.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { minWidth: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  straight: { backgroundColor: C.control },
  superset: { borderWidth: 1, borderColor: C.outline },
  text: { ...T.secondary, lineHeight: 16, fontWeight: '600', color: C.text },
});
