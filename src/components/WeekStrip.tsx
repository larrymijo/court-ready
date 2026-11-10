import { StyleSheet, Text, View } from 'react-native';

import { Check } from '@/components/ui';
import { DAY_LONG, DAY_SHORT, WEEK_PLAN } from '@/data/schedule';
import { addDaysISO, isoFromTimestamp, parseISODate } from '@/lib/dates';
import type { Workout } from '@/lib/types';
import { C, T } from '@/theme';

/**
 * Monday to Sunday. Today is the white circle. Under each date: a filled dot for a gym day, a ring
 * for a sport day, and the check mark once you trained that day.
 */
export function WeekStrip({ mondayISO, todayISO, workouts }: { mondayISO: string; todayISO: string; workouts: Workout[] }) {
  const trained = new Set(workouts.filter((w) => w.finishedAt).map((w) => isoFromTimestamp(w.startedAt)));
  const days = WEEK_PLAN.map((plan, i) => {
    const date = addDaysISO(mondayISO, i);
    return { plan, date, dayOfMonth: parseISODate(date).getDate(), isToday: date === todayISO, did: trained.has(date) };
  });
  const anyDone = days.some((d) => d.did);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {days.map(({ plan, date, dayOfMonth, isToday, did }, i) => (
          <View
            key={date}
            style={styles.day}
            accessible
            accessibilityLabel={`${DAY_LONG[i]} ${dayOfMonth}${isToday ? ', today' : ''}: ${plan.label}${did ? ', trained' : ''}`}>
            <Text style={[styles.name, isToday && { color: C.text }]}>{DAY_SHORT[i]}</Text>
            <View style={[styles.date, isToday && styles.dateToday]}>
              <Text style={[styles.dateText, isToday && styles.dateTextToday]}>{dayOfMonth}</Text>
            </View>
            <View style={styles.mark}>
              {did ? <Check done size={14} /> : plan.kind === 'gym' ? <View style={styles.dot} /> : plan.kind === 'sport' ? <View style={styles.ring} /> : null}
            </View>
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.dot} />
          <Text style={styles.legendText}>Gym</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.ring} />
          <Text style={styles.legendText}>Sport</Text>
        </View>
        {anyDone ? (
          <View style={styles.legendItem}>
            <Check done size={12} />
            <Text style={styles.legendText}>Trained</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  row: { flexDirection: 'row', gap: 4 },
  day: { flex: 1, alignItems: 'center', gap: 6 },
  name: { ...T.smallest, fontWeight: '600', letterSpacing: 0.66, color: C.textFaint },
  date: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  dateToday: { backgroundColor: C.text },
  dateText: { ...T.rowTitle, color: C.text },
  dateTextToday: { color: C.onAccent, fontWeight: '700' },
  mark: { height: 14, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.text },
  ring: { width: 6, height: 6, borderRadius: 3, borderWidth: 1.5, borderColor: C.textMuted },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 18 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { fontSize: 12, lineHeight: 16, color: C.textFaint },
});
