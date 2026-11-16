import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Check, Txt } from '@/components/ui';
import { DAY_SHORT } from '@/data/schedule';
import { parseISODate } from '@/lib/dates';
import { sportWeekSessionLine, weekSessionLine, type WeekDayView, type WeekSessionView } from '@/lib/planView';
import { C, S, T } from '@/theme';

/** The marker before a session's name: a filled dot for gym, a ring for sport. */
export function SessionDot({ kind }: { kind: 'gym' | 'sport' }) {
  return <View style={kind === 'gym' ? styles.dot : styles.ring} />;
}

/** The legend under the week: gym, sport, done. */
export function WeekLegend() {
  return (
    <View style={styles.legend}>
      <View style={styles.legendItem}>
        <SessionDot kind="gym" />
        <Text style={styles.legendText}>Gym</Text>
      </View>
      <View style={styles.legendItem}>
        <SessionDot kind="sport" />
        <Text style={styles.legendText}>Sport</Text>
      </View>
      <View style={styles.legendItem}>
        <Check done size={12} />
        <Text style={styles.legendText}>Done</Text>
      </View>
    </View>
  );
}

/**
 * This week of a plan, day by day (the Plan tab). A gym or sport session has a Start button, or the
 * done mark. Tapping a sport session's name opens that sport's page in the Library.
 */
export function WeekList({
  days,
  onStart,
  onStartSport,
}: {
  days: WeekDayView[];
  onStart: (workoutId: string) => void;
  onStartSport: (session: WeekSessionView) => void;
}) {
  return (
    <Card variant="list" style={styles.card}>
      {days.map((day, i) => (
        <View key={day.date} style={[styles.day, i < days.length - 1 && styles.divider]}>
          <DayLabel day={day} />
          <View style={styles.sessions}>
            {day.sessions.length === 0 ? (
              <View style={[styles.session, { minHeight: 44 }]}>
                <Txt color={C.textFaint} style={{ paddingLeft: 14 }}>
                  Rest
                </Txt>
              </View>
            ) : (
              day.sessions.map((s) => (
                <SessionRow key={`${s.kind}-${s.id}-${s.ref.kind}`} day={day} session={s} onStart={onStart} onStartSport={onStartSport} />
              ))
            )}
          </View>
        </View>
      ))}
    </Card>
  );
}

function DayLabel({ day }: { day: WeekDayView }) {
  const dayOfMonth = parseISODate(day.date).getDate();
  return (
    <View style={styles.dayLabel} accessible accessibilityLabel={`${DAY_SHORT[day.weekday]} ${dayOfMonth}${day.isToday ? ', today' : ''}`}>
      <Text style={[styles.dayName, day.isToday && { color: C.text }]}>{DAY_SHORT[day.weekday]}</Text>
      <View style={[styles.date, day.isToday && styles.dateToday]}>
        <Text style={[styles.dateText, day.isToday && styles.dateTextToday]}>{dayOfMonth}</Text>
      </View>
    </View>
  );
}

function SessionRow({
  day,
  session,
  onStart,
  onStartSport,
}: {
  day: WeekDayView;
  session: WeekSessionView;
  onStart: (workoutId: string) => void;
  onStartSport: (session: WeekSessionView) => void;
}) {
  const sport = session.kind === 'sport';
  const text = (
    <>
      <View style={styles.nameRow}>
        <SessionDot kind={session.kind} />
        <Txt v="h2" numberOfLines={2} style={{ flexShrink: 1 }}>
          {session.name}
        </Txt>
      </View>
      <Txt v="small" style={{ paddingLeft: 14 }}>
        {sport ? sportWeekSessionLine(day, session) : weekSessionLine(day, session)}
      </Txt>
    </>
  );
  // A sport session's text opens its sport's page; the Start button beside it starts the session.
  const openSport = () => {
    if (session.sport) router.push(`/sports/${session.sport}`);
  };
  return (
    <View style={styles.session}>
      {sport && session.sport ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${session.name}: open the sport page`}
          onPress={openSport}
          style={({ pressed }) => [styles.sessionText, pressed && { opacity: 0.7 }]}>
          {text}
        </Pressable>
      ) : (
        <View style={styles.sessionText}>{text}</View>
      )}
      {session.done ? (
        <View style={styles.arrow}>
          <View accessible accessibilityRole="image" accessibilityLabel="Done">
            <Check done size={28} />
          </View>
        </View>
      ) : session.startable ? (
        <Button
          size="pill"
          variant={day.isToday && !session.optional ? 'primary' : 'outline'}
          title="Start"
          accessibilityLabel={`Start ${session.name}`}
          onPress={() => (sport ? onStartSport(session) : onStart(session.id))}
        />
      ) : sport && session.sport ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${session.name}: open the sport page`}
          onPress={openSport}
          style={styles.arrow}>
          <Ionicons name="chevron-forward" size={20} color={C.textFaint} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: 4, paddingLeft: S.lg, paddingRight: S.md },
  day: { flexDirection: 'row', alignItems: 'flex-start', gap: S.md, paddingVertical: 10 },
  divider: { borderBottomWidth: 1, borderBottomColor: C.hairline },
  dayLabel: { width: 36, alignItems: 'center', gap: 2, paddingTop: 8 },
  dayName: { ...T.smallest, fontWeight: '600', letterSpacing: 0.66, color: C.textFaint },
  date: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dateToday: { backgroundColor: C.text },
  dateText: { ...T.rowTitle, color: C.text },
  dateTextToday: { ...T.body, color: C.onAccent, fontWeight: '700' },
  sessions: { flex: 1, minWidth: 0, gap: 4 },
  session: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: S.md },
  sessionText: { flex: 1, minWidth: 0, minHeight: 44, justifyContent: 'center', gap: 2, paddingVertical: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  arrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.text },
  ring: { width: 6, height: 6, borderRadius: 3, borderWidth: 1.5, borderColor: C.textMuted },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 18 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { fontSize: 12, lineHeight: 16, color: C.textFaint },
});
