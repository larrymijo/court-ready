import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { View } from 'react-native';

import { Card, Row, Tag, Txt, type IconName } from '@/components/ui';
import { EXERCISE_BY_ID } from '@/data/exercises';
import { formatDate, formatDuration, formatSet, formatTime, formatVolume, plural } from '@/lib/format';
import { recordKind } from '@/lib/plans';
import { matchTag, sportFigures, sportRecordName, sportSummary } from '@/lib/sportView';
import { e1rm, isWorkingSet, workoutDurationMs, workoutSetCount, workoutVolume } from '@/lib/stats';
import type { Workout } from '@/lib/types';
import { C, S } from '@/theme';

function Figure({ icon, text }: { icon: IconName; text: string }) {
  return (
    <Row gap={6}>
      <Ionicons name={icon} size={14} color={C.textFaint} />
      <Txt v="small" color={C.text}>
        {text}
      </Txt>
    </Row>
  );
}

/** A sport day's marker: a ring, where a gym day's is a filled dot (docs/design.md). */
export function SportRing() {
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Sport session"
      style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: C.textMuted }}
    />
  );
}

/** A sport session in the history list: its name, whether it was a match, and its numbers. No sets, no kg. */
function SportCard({ w }: { w: Workout }) {
  const tag = matchTag(w);
  const figures = sportFigures(w);
  const name = sportRecordName(w);
  return (
    <Card
      onPress={() => router.push(`/history/${w.id}`)}
      accessibilityLabel={`${name}, ${formatDate(w.startedAt)}${sportSummary(w) ? `, ${sportSummary(w)}` : ''}`}>
      <Row gap={S.md}>
        <View style={{ flex: 1, gap: 2 }}>
          <Row gap={S.sm}>
            <Txt v="h2" numberOfLines={1} style={{ flexShrink: 1 }}>
              {name}
            </Txt>
            {tag ? <Tag label={tag} style={{ height: 22 }} /> : null}
          </Row>
          <Txt v="small">{[formatDate(w.startedAt), ...figures].join(' · ')}</Txt>
        </View>
        <SportRing />
        <Ionicons name="chevron-forward" size={18} color={C.textFaint} />
      </Row>
    </Card>
  );
}

/** One finished workout in the history list. */
export function WorkoutCard({ w }: { w: Workout }) {
  if (recordKind(w) === 'sport') return <SportCard w={w} />;
  return (
    <Card onPress={() => router.push(`/history/${w.id}`)} accessibilityLabel={`${w.name}, ${formatDate(w.startedAt)}`}>
      <View style={{ gap: 2 }}>
        <Row style={{ justifyContent: 'space-between' }} gap={S.md}>
          <Txt v="h2" numberOfLines={1} style={{ flex: 1 }}>
            {w.name}
          </Txt>
          {w.prs?.length ? <Tag label={plural(w.prs.length, 'PR')} /> : null}
        </Row>
        <Txt v="small">
          {formatDate(w.startedAt)} · {formatTime(w.startedAt)}
          {w.week ? ` · Week ${w.week}` : ''}
        </Txt>
      </View>
      <Row gap={S.lg}>
        <Figure icon="time-outline" text={formatDuration(workoutDurationMs(w))} />
        <Figure icon="barbell-outline" text={formatVolume(workoutVolume(w))} />
        <Figure icon="layers-outline" text={plural(workoutSetCount(w), 'set')} />
      </Row>
      <View style={{ gap: 4 }}>
        {w.exercises.slice(0, 5).map((e) => {
          const ex = EXERCISE_BY_ID[e.exerciseId];
          const working = e.sets.filter(isWorkingSet);
          const best = working.reduce<(typeof working)[number] | null>(
            (b, s) => (!b || e1rm(s.weight ?? 0, s.reps ?? 0) > e1rm(b.weight ?? 0, b.reps ?? 0) ? s : b),
            null,
          );
          return (
            <Row key={e.id} style={{ justifyContent: 'space-between' }} gap={S.md}>
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
        {w.exercises.length > 5 ? <Txt v="caption">+{w.exercises.length - 5} more</Txt> : null}
      </View>
    </Card>
  );
}
