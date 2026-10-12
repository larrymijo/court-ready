import { View } from 'react-native';

import { EmptyState, PageHeader, Screen, SectionTitle } from '@/components/ui';
import { WorkoutCard } from '@/components/WorkoutCard';
import { formatMonth } from '@/lib/format';
import type { Workout } from '@/lib/types';
import { useStore } from '@/store/useStore';
import { S } from '@/theme';

export default function HistoryScreen() {
  const workouts = useStore((s) => s.workouts);
  const active = useStore((s) => s.active);

  const groups: { month: string; items: Workout[] }[] = [];
  for (const w of workouts) {
    const m = formatMonth(w.startedAt);
    const g = groups[groups.length - 1];
    if (g && g.month === m) g.items.push(w);
    else groups.push({ month: m, items: [w] });
  }

  return (
    <Screen bottomPad={active ? 170 : 110}>
      <PageHeader subtitle={`${workouts.length} workout${workouts.length === 1 ? '' : 's'}`} title="History" />
      {workouts.length === 0 ? (
        <EmptyState
          icon="time-outline"
          title="No workouts yet"
          body="Finish your first session and it shows up here, with every set, your volume and your PRs."
        />
      ) : null}
      {groups.map((g) => (
        <View key={g.month} style={{ gap: S.md }}>
          <SectionTitle title={g.month} />
          {g.items.map((w) => (
            <WorkoutCard key={w.id} w={w} />
          ))}
        </View>
      ))}
    </Screen>
  );
}
