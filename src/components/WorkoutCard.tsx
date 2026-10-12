import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { View } from 'react-native';

import { Card, Chip, Row, Txt } from '@/components/ui';
import { EXERCISE_BY_ID } from '@/data/exercises';
import { formatDate, formatDuration, formatSet, formatTime, formatVolume, plural } from '@/lib/format';
import { e1rm, isWorkingSet, workoutDurationMs, workoutSetCount, workoutVolume } from '@/lib/stats';
import type { Workout } from '@/lib/types';
import { C, S } from '@/theme';

export function WorkoutCard({ w }: { w: Workout }) {
  return (
    <Card onPress={() => router.push(`/history/${w.id}`)}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt v="h2">{w.name}</Txt>
        {w.prs?.length ? <Chip icon="trophy" label={`${w.prs.length} PR${w.prs.length === 1 ? '' : 's'}`} tone="warn" /> : null}
      </Row>
      <Txt v="small">
        {formatDate(w.startedAt)} · {formatTime(w.startedAt)}
        {w.week ? ` · Week ${w.week}` : ''}
      </Txt>
      <Row gap={S.lg}>
        <Row gap={5}>
          <Ionicons name="time-outline" size={14} color={C.muted} />
          <Txt v="small" color={C.text}>
            {formatDuration(workoutDurationMs(w))}
          </Txt>
        </Row>
        <Row gap={5}>
          <Ionicons name="barbell-outline" size={14} color={C.muted} />
          <Txt v="small" color={C.text}>
            {formatVolume(workoutVolume(w))}
          </Txt>
        </Row>
        <Row gap={5}>
          <Ionicons name="layers-outline" size={14} color={C.muted} />
          <Txt v="small" color={C.text}>
            {plural(workoutSetCount(w), 'set')}
          </Txt>
        </Row>
      </Row>
      <View style={{ gap: 3, marginTop: 2 }}>
        {w.exercises.slice(0, 5).map((e) => {
          const ex = EXERCISE_BY_ID[e.exerciseId];
          const working = e.sets.filter(isWorkingSet);
          const best = working.reduce<(typeof working)[number] | null>(
            (b, s) => (!b || e1rm(s.weight ?? 0, s.reps ?? 0) > e1rm(b.weight ?? 0, b.reps ?? 0) ? s : b),
            null,
          );
          return (
            <Row key={e.id} style={{ justifyContent: 'space-between' }}>
              <Txt v="small" numberOfLines={1} style={{ flex: 1 }}>
                {working.length} × {ex?.name ?? e.exerciseId}
              </Txt>
              {best ? (
                <Txt v="small" color={C.text}>
                  {ex ? formatSet(ex, best.weight, best.reps) : ''}
                </Txt>
              ) : null}
            </Row>
          );
        })}
        {w.exercises.length > 5 ? <Txt v="tiny">+{w.exercises.length - 5} more</Txt> : null}
      </View>
    </Card>
  );
}
