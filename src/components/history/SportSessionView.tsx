import { router, Stack } from 'expo-router';
import { View } from 'react-native';

import { BOTTOM_BAR_SPACE, BottomBar, Button, Card, Check, Divider, Row, Screen, Tag, Txt } from '@/components/ui';
import { confirm } from '@/lib/platform';
import {
  matchTag,
  prepMark,
  sportPlanText,
  sportRecordName,
  sportStats,
  sportWhenText,
  type SportStat,
} from '@/lib/sportView';
import type { Workout } from '@/lib/types';
import { useStore } from '@/store/useStore';
import { C, R, S } from '@/theme';

/** One figure of a sport session, like the stat tiles of a gym workout; pain of 4 or more is `danger`. */
function Figure({ stat }: { stat: SportStat }) {
  return (
    <View
      accessible
      accessibilityLabel={`${stat.label} ${stat.value} ${stat.caption}`}
      style={{ flex: 1, backgroundColor: C.surface, borderRadius: R.control, padding: S.md, gap: 4 }}>
      <Txt v="caption" style={{ fontSize: 12, lineHeight: 16, fontWeight: '500' }}>
        {stat.label}
      </Txt>
      <Txt v="hero" color={stat.danger ? C.danger : C.text} style={{ fontSize: 22, lineHeight: 26 }} numberOfLines={1}>
        {stat.value}
      </Txt>
      <Txt v="tiny">{stat.caption}</Txt>
    </View>
  );
}

/** The figures in rows of three; a short last row keeps the same tile width. */
function Figures({ stats }: { stats: SportStat[] }) {
  const rows: SportStat[][] = [];
  for (let i = 0; i < stats.length; i += 3) rows.push(stats.slice(i, i + 3));
  return (
    <View style={{ gap: S.sm }}>
      {rows.map((row) => (
        <Row key={row[0].key} gap={S.sm} align="stretch">
          {row.map((s) => (
            <Figure key={s.key} stat={s} />
          ))}
          {Array.from({ length: 3 - row.length }, (_, i) => (
            <View key={`pad${i}`} style={{ flex: 1 }} />
          ))}
        </Row>
      ))}
    </View>
  );
}

function PrepRow({ label, mark, divider }: { label: string; mark: 'Done' | 'Skipped'; divider?: boolean }) {
  return (
    <>
      <Row gap={S.md} style={{ minHeight: 48 }}>
        <Check done={mark === 'Done'} />
        <Txt v="h2" style={{ flex: 1, fontSize: 15 }}>
          {label}
        </Txt>
        <Txt v="small">{mark}</Txt>
      </Row>
      {divider ? <Divider /> : null}
    </>
  );
}

/** A finished sport session's own page (a history record with `kind: 'sport'`). */
export function SportSessionView({ workout }: { workout: Workout }) {
  const deleteWorkout = useStore((s) => s.deleteWorkout);
  const name = sportRecordName(workout);
  const tag = matchTag(workout);
  const plan = sportPlanText(workout);
  const stats = sportStats(workout);
  const warmup = prepMark(workout.warmupDone);
  const cooldown = prepMark(workout.cooldownDone);
  const note = typeof workout.note === 'string' ? workout.note.trim() : '';

  const onDelete = async () => {
    if (await confirm('Delete session?', 'This removes it from your history and from this week.', 'Delete', true)) {
      deleteWorkout(workout.id);
      router.back();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Stack.Screen options={{ title: '' }} />
      <Screen edgesTop={false} bottomPad={BOTTOM_BAR_SPACE}>
        <View style={{ gap: 4 }}>
          <Row gap={S.md} style={{ flexWrap: 'wrap' }}>
            <Txt v="title" style={{ flexShrink: 1 }}>
              {name}
            </Txt>
            {tag ? <Tag label={tag} /> : null}
            {workout.loggedLater ? <Tag label="Logged later" /> : null}
          </Row>
          <Txt color={C.textMuted}>{sportWhenText(workout)}</Txt>
          {plan ? <Txt v="caption">{plan}</Txt> : null}
        </View>

        {stats.length > 0 ? <Figures stats={stats} /> : null}

        {warmup || cooldown ? (
          <Card>
            {warmup ? <PrepRow label="Warm-up" mark={warmup} divider={!!cooldown} /> : null}
            {cooldown ? <PrepRow label="Cool-down" mark={cooldown} /> : null}
          </Card>
        ) : null}

        {note ? (
          <Card style={{ gap: 6 }}>
            <Txt v="label">Notes</Txt>
            <Txt>{note}</Txt>
          </Card>
        ) : null}
      </Screen>
      <BottomBar>
        <Button
          title="Delete session"
          variant="danger"
          size="large"
          icon="trash-outline"
          style={{ backgroundColor: C.surface }}
          onPress={onDelete}
        />
      </BottomBar>
    </View>
  );
}
