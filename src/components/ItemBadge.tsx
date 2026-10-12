import { StyleSheet, Text, View } from 'react-native';

import { C } from '@/theme';

/** Exercise number from the guide: blue for straight sets, orange for supersets ("5a"). */
export function ItemBadge({ label, superset }: { label: string; superset?: boolean }) {
  return (
    <View style={[styles.badge, { backgroundColor: superset ? C.orange : C.accent }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { minWidth: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  text: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
});
