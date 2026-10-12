import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { DAY_SHORT, WEEK_PLAN } from '@/data/schedule';
import { addDaysISO, isoFromTimestamp } from '@/lib/dates';
import type { Workout } from '@/lib/types';
import { C, R } from '@/theme';

/** Mon–Sun tiles: gym days blue, sport days orange, maybe-days dashed. A tick when you trained. */
export function WeekStrip({ mondayISO, todayISO, workouts }: { mondayISO: string; todayISO: string; workouts: Workout[] }) {
  const trained = new Set(workouts.filter((w) => w.finishedAt).map((w) => isoFromTimestamp(w.startedAt)));
  return (
    <View style={styles.row}>
      {WEEK_PLAN.map((p, i) => {
        const date = addDaysISO(mondayISO, i);
        const isToday = date === todayISO;
        const did = trained.has(date);
        const maybe = p.kind === 'maybe';
        const bg = p.kind === 'gym' ? C.accent : p.kind === 'sport' ? C.orange : 'transparent';
        return (
          <View key={i} style={[styles.tile, { backgroundColor: bg }, maybe && styles.maybe, isToday && styles.today]}>
            <Text style={[styles.day, { color: maybe ? C.faint : 'rgba(255,255,255,0.75)' }]}>{DAY_SHORT[i]}</Text>
            <Text style={[styles.l1, { color: maybe ? C.orange : '#FFFFFF' }]} numberOfLines={1}>
              {p.tile[0]}
            </Text>
            <Text style={[styles.l2, { color: maybe ? C.muted : 'rgba(255,255,255,0.8)' }]} numberOfLines={1}>
              {p.tile[1]}
            </Text>
            <View style={styles.tickSlot}>
              {did ? <Ionicons name="checkmark-circle" size={15} color={maybe ? C.green : '#FFFFFF'} /> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
  tile: {
    flex: 1,
    borderRadius: R.md,
    paddingTop: 7,
    paddingHorizontal: 1,
    alignItems: 'center',
    minHeight: 72,
  },
  maybe: { borderWidth: 1.2, borderStyle: 'dashed', borderColor: C.orange },
  today: { borderWidth: 2, borderColor: C.text, borderStyle: 'solid' },
  day: { fontSize: 9.5, fontWeight: '800', letterSpacing: 0.5 },
  l1: { fontSize: 11, fontWeight: '800', marginTop: 3 },
  l2: { fontSize: 9.5, fontWeight: '600' },
  tickSlot: { height: 18, justifyContent: 'center' },
});
