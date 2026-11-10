import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LineChart } from '@/components/LineChart';
import { NumInput } from '@/components/NumInput';
import { TabScreen } from '@/components/TabScreen';
import {
  Button,
  Card,
  Divider,
  EmptyState,
  IconButton,
  PageHeader,
  ProgressBar,
  Row,
  SectionTitle,
  Segmented,
  Stat,
  Txt,
} from '@/components/ui';
import { EXERCISE_BY_ID, getExercise } from '@/data/exercises';
import { ROUTINES } from '@/data/routines';
import { weeklyAdvice, weeklyAverages } from '@/lib/body';
import { addDaysISO, mondayOfISO, parseISODate, todayISO } from '@/lib/dates';
import { formatChange, formatKg, formatShortDate, plural } from '@/lib/format';
import { confirm } from '@/lib/platform';
import { prescribe, programPosition } from '@/lib/program';
import { muscleSets, workoutsInWeek } from '@/lib/stats';
import type { MuscleGroup } from '@/lib/types';
import { useStore } from '@/store/useStore';
import { C, S } from '@/theme';

const MUSCLES: { key: MuscleGroup; label: string }[] = [
  { key: 'chest', label: 'Chest' },
  { key: 'back', label: 'Back' },
  { key: 'shoulders', label: 'Shoulders' },
  { key: 'biceps', label: 'Biceps' },
  { key: 'triceps', label: 'Triceps' },
  { key: 'quads', label: 'Quads' },
  { key: 'hamstrings', label: 'Hamstrings' },
  { key: 'glutes', label: 'Glutes' },
  { key: 'calves', label: 'Calves' },
  { key: 'core', label: 'Core' },
];

type Day = 'today' | 'yesterday';

export default function ProgressScreen() {
  const body = useStore((s) => s.body);
  const workouts = useStore((s) => s.workouts);
  const settings = useStore((s) => s.settings);
  const logBody = useStore((s) => s.logBody);
  const deleteBody = useStore((s) => s.deleteBody);
  const today = todayISO();
  const [day, setDay] = useState<Day>('today');
  const date = day === 'today' ? today : addDaysISO(today, -1);
  const existing = body.find((b) => b.date === date);
  const [weight, setWeight] = useState<number | null>(null);
  const [waist, setWaist] = useState<number | null>(null);

  const weeks = weeklyAverages(body).filter((w) => w.weight != null);
  const advice = weeklyAdvice(body);
  const waists = body.filter((b) => b.waist != null);
  const first = weeks[0];
  const latest = weeks[weeks.length - 1];
  const entries = [...body].reverse().slice(0, 10);

  const monday = mondayOfISO(today);
  const pos = programPosition(settings.programStart, today);
  const thisWeek = muscleSets(workoutsInWeek(workouts, monday), (id) => EXERCISE_BY_ID[id]);
  const plan: Partial<Record<MuscleGroup, number>> = {};
  for (const r of ROUTINES.filter((x) => x.id !== 'bonus')) {
    for (const item of r.items) {
      const ex = getExercise(item.exerciseId);
      if (ex.kind === 'care') continue;
      const p = prescribe(item, ex, { phase: pos.phase, routineId: r.id });
      plan[ex.primary] = (plan[ex.primary] ?? 0) + p.sets;
      for (const m of ex.secondary ?? []) plan[m] = (plan[m] ?? 0) + p.sets / 2;
    }
  }

  const perWeek = Array.from({ length: 8 }, (_, i) => {
    const m = addDaysISO(monday, -7 * (7 - i));
    return { monday: m, count: workoutsInWeek(workouts, m).length };
  });
  const maxCount = Math.max(3, ...perWeek.map((w) => w.count));

  const save = () => {
    if (weight == null && waist == null) return;
    logBody({ date, weight: weight ?? undefined, waist: waist ?? undefined });
    setWeight(null);
    setWaist(null);
  };

  return (
    <TabScreen>
      <PageHeader
        subtitle="Body & training"
        title="Progress"
        right={
          <Button
            size="pill"
            variant="secondary"
            title="History"
            icon="time-outline"
            accessibilityLabel={`History: ${plural(workouts.length, 'workout')}`}
            onPress={() => router.push('/history')}
          />
        }
      />

      <Card>
        <Row style={{ justifyContent: 'space-between' }} gap={S.md}>
          <Txt v="h2">Log weigh-in</Txt>
          <Segmented<Day>
            onCard
            style={{ width: 176 }}
            value={day}
            onChange={setDay}
            options={[
              { value: 'today', label: 'Today' },
              { value: 'yesterday', label: 'Yesterday' },
            ]}
          />
        </Row>
        <Row gap={S.sm} align="flex-end">
          <View style={styles.field}>
            <Txt v="tiny">Weight (kg)</Txt>
            <NumInput
              size="large"
              value={weight}
              onChange={setWeight}
              placeholder={existing?.weight != null ? formatKg(existing.weight) : '79.5'}
              accessibilityLabel="Weight in kg"
            />
          </View>
          <View style={styles.field}>
            <Txt v="tiny">Waist (cm, every 2 weeks)</Txt>
            <NumInput
              size="large"
              value={waist}
              onChange={setWaist}
              placeholder={existing?.waist != null ? formatKg(existing.waist) : 'optional'}
              accessibilityLabel="Waist in cm"
            />
          </View>
        </Row>
        <Button size="medium" title={existing ? 'Update' : 'Save'} onPress={save} disabled={weight == null && waist == null} />
        <Txt v="caption">Morning, after the toilet, before eating. Waist at belly-button height, relaxed.</Txt>
      </Card>

      {advice ? (
        <Card>
          <Txt v="label">Weekly check-in</Txt>
          <Row gap={S.md} align="flex-start">
            <Ionicons
              name={advice.tone === 'warn' ? 'alert-circle-outline' : 'checkmark-circle-outline'}
              size={22}
              color={C.text}
              style={{ marginTop: 1 }}
            />
            <View style={{ flex: 1, gap: 2 }}>
              <Txt v="h2">{advice.title}</Txt>
              <Txt v="small">{advice.detail}</Txt>
            </View>
          </Row>
        </Card>
      ) : (
        <Txt v="caption">Log at least one weigh-in in two different weeks to get your weekly check-in.</Txt>
      )}

      {weeks.length > 0 ? (
        <Card>
          <Row gap={S.md} align="flex-start">
            <Stat value={latest?.weight != null ? `${formatKg(Math.round(latest.weight * 10) / 10)} kg` : '–'} label="this week’s average" />
            <Stat
              value={first && latest && first !== latest ? formatChange(latest.weight! - first.weight!) : '–'}
              label="since you started"
            />
          </Row>
          <Txt v="label">Weekly average weight</Txt>
          <LineChart
            points={weeks.map((w) => ({ x: parseISODate(w.weekStart).getTime(), y: w.weight! }))}
            formatY={(v) => formatKg(Math.round(v * 10) / 10)}
          />
        </Card>
      ) : null}

      {waists.length >= 2 ? (
        <Card>
          <Txt v="label">Waist (cm)</Txt>
          <LineChart
            points={waists.map((b) => ({ x: parseISODate(b.date).getTime(), y: b.waist! }))}
            formatY={(v) => formatKg(Math.round(v * 10) / 10)}
          />
        </Card>
      ) : null}

      {entries.length > 0 ? (
        <Card variant="list" style={{ paddingRight: S.xs }}>
          {entries.map((b, i) => (
            <View key={b.date}>
              <Row gap={S.sm} style={styles.entry}>
                <Txt style={{ flex: 1 }}>{formatShortDate(parseISODate(b.date).getTime())}</Txt>
                <Txt style={styles.entryWeight}>{b.weight != null ? `${formatKg(b.weight)} kg` : ''}</Txt>
                <Txt v="small" style={styles.entryWaist}>
                  {b.waist != null ? `${formatKg(b.waist)} cm` : ''}
                </Txt>
                <IconButton
                  plain
                  icon="trash-outline"
                  size={18}
                  color={C.textFaint}
                  label={`Delete the entry from ${b.date}`}
                  onPress={async () => {
                    if (await confirm('Delete entry?', `Remove the weigh-in from ${b.date}?`, 'Delete', true)) deleteBody(b.date);
                  }}
                />
              </Row>
              {i < entries.length - 1 ? <Divider style={{ marginRight: S.md }} /> : null}
            </View>
          ))}
        </Card>
      ) : null}

      <SectionTitle title="Hard sets this week" right={<Txt v="caption">plan: week {pos.week}</Txt>} />
      {workouts.length === 0 ? (
        <EmptyState icon="stats-chart-outline" title="No training logged yet" body="Your weekly sets per muscle show up here once you finish a workout." />
      ) : (
        <Card>
          {MUSCLES.map(({ key, label }) => {
            const done = thisWeek[key] ?? 0;
            const target = plan[key] ?? 0;
            const reached = target > 0 && done >= target;
            return (
              <View key={key} style={{ gap: 6 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Txt v="small" color={C.text}>
                    {label}
                  </Txt>
                  <Txt v="small" color={reached ? C.text : C.textMuted} style={reached ? { fontWeight: '600' } : null}>
                    {formatKg(done)} of {formatKg(target)}
                  </Txt>
                </Row>
                <ProgressBar value={target ? done / target : 0} />
              </View>
            );
          })}
          <Txt v="caption">Main muscle counts 1 set, helper muscles ½. The target is what your 3 sessions prescribe this week.</Txt>
        </Card>
      )}

      <SectionTitle title="Workouts per week" />
      <Card>
        <Row align="flex-end" gap={S.sm} style={{ height: 112 }}>
          {perWeek.map((w) => (
            <View key={w.monday} style={styles.weekColumn}>
              <Txt v="tiny" color={C.text}>
                {w.count || ''}
              </Txt>
              <View
                style={{
                  width: '70%',
                  height: Math.max(4, (w.count / maxCount) * 70),
                  borderRadius: 4,
                  backgroundColor: w.count >= 3 ? C.text : w.count > 0 ? C.textFaint : C.track,
                }}
              />
              <Txt v="tiny">{formatShortDate(parseISODate(w.monday).getTime()).split(' ')[0]}</Txt>
            </View>
          ))}
        </Row>
        <Txt v="caption">Weeks starting Monday. White means all 3 sessions were done.</Txt>
      </Card>

      <Button title="How to read your progress" variant="ghost" iconRight="chevron-forward" onPress={() => router.push('/guide/track')} />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  field: { flex: 1, gap: 6 },
  entry: { minHeight: 48 },
  entryWeight: { width: 80, textAlign: 'right' },
  entryWaist: { width: 64, textAlign: 'right' },
  weekColumn: { flex: 1, alignItems: 'center', gap: 4 },
});
