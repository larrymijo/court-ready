import { View } from 'react-native';

import { EmptyState, Row, Screen, SectionTitle, Txt } from '@/components/ui';
import { WorkoutCard } from '@/components/WorkoutCard';
import { formatMonth, plural } from '@/lib/format';
import { recordKind } from '@/lib/plans';
import type { Workout } from '@/lib/types';
import { useStore } from '@/store/useStore';
import { C, S } from '@/theme';

/** Every finished workout, newest first, by month. Opened from Progress. */
export default function HistoryScreen() {
  const workouts = useStore((s) => s.workouts);

  const groups: { month: string; items: Workout[] }[] = [];
  for (const w of workouts) {
    const m = formatMonth(w.startedAt);
    const g = groups[groups.length - 1];
    if (g && g.month === m) g.items.push(w);
    else groups.push({ month: m, items: [w] });
  }

  const hasSport = workouts.some((w) => recordKind(w) === 'sport');

  return (
    <Screen edgesTop={false}>
      {workouts.length === 0 ? (
        <EmptyState
          icon="time-outline"
          title="No workouts yet"
          body="Finish your first session and it shows up here, with every set, your volume and your PRs."
        />
      ) : (
        <Txt v="small">{plural(workouts.length, 'session')} logged</Txt>
      )}
      {groups.map((g) => (
        <View key={g.month} style={{ gap: S.md }}>
          <SectionTitle title={g.month} right={<Txt v="caption">{plural(g.items.length, 'session')}</Txt>} />
          {g.items.map((w) => (
            <WorkoutCard key={w.id} w={w} />
          ))}
        </View>
      ))}
      {hasSport ? (
        <Row gap={S.lg} style={{ justifyContent: 'center' }}>
          <Txt v="caption">Gym shows its sets</Txt>
          <Row gap={6}>
            <View style={{ width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: C.textMuted }} />
            <Txt v="caption">Sport</Txt>
          </Row>
        </Row>
      ) : null}
    </Screen>
  );
}
