import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LineChart } from '@/components/LineChart';
import { NumInput } from '@/components/NumInput';
import { Button, Card, EmptyState, PageHeader, Row, Screen, SectionTitle, Stat, Txt } from '@/components/ui';
import { EXERCISE_BY_ID, getExercise } from '@/data/exercises';
import { ROUTINES } from '@/data/routines';
import { weeklyAdvice, weeklyAverages } from '@/lib/body';
import { addDaysISO, mondayOfISO, parseISODate, todayISO } from '@/lib/dates';
import { formatChange, formatKg, formatShortDate } from '@/lib/format';
import { confirm } from '@/lib/platform';
import { prescribe, programPosition } from '@/lib/program';
import { muscleSets, workoutsInWeek } from '@/lib/stats';
import type { MuscleGroup } from '@/lib/types';
import { useStore } from '@/store/useStore';
import { C, R, S, TONE } from '@/theme';

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

export default function ProgressScreen() {
  const body = useStore((s) => s.body);
  const workouts = useStore((s) => s.workouts);
  const settings = useStore((s) => s.settings);
  const active = useStore((s) => s.active);
  const logBody = useStore((s) => s.logBody);
  const deleteBody = useStore((s) => s.deleteBody);
  const today = todayISO();
  const [day, setDay] = useState<'today' | 'yesterday'>('today');
  const date = day === 'today' ? today : addDaysISO(today, -1);
  const existing = body.find((b) => b.date === date);
  const [weight, setWeight] = useState<number | null>(null);
  const [waist, setWaist] = useState<number | null>(null);

  const weeks = weeklyAverages(body).filter((w) => w.weight != null);
  const advice = weeklyAdvice(body);
  const waists = body.filter((b) => b.waist != null);
  const first = weeks[0];
  const latest = weeks[weeks.length - 1];

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
    <Screen bottomPad={active ? 170 : 110}>
      <PageHeader subtitle="Body & training" title="Progress" />

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt v="h2">Log weigh-in</Txt>
          <Row gap={6}>
            {(['today', 'yesterday'] as const).map((d) => (
              <Pressable key={d} onPress={() => setDay(d)} style={[styles.dayBtn, day === d && styles.dayBtnOn]}>
                <Text style={[styles.dayText, day === d && { color: C.text }]}>{d === 'today' ? 'Today' : 'Yesterday'}</Text>
              </Pressable>
            ))}
          </Row>
        </Row>
        <Row gap={S.sm}>
          <View style={{ flex: 1, gap: 4 }}>
            <Txt v="tiny">Weight (kg)</Txt>
            <NumInput
              value={weight}
              onChange={setWeight}
              placeholder={existing?.weight != null ? formatKg(existing.weight) : '79.5'}
              style={{ height: 44, fontSize: 18 }}
              accessibilityLabel="Weight in kg"
            />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Txt v="tiny">Waist (cm, every 2 weeks)</Txt>
            <NumInput
              value={waist}
              onChange={setWaist}
              placeholder={existing?.waist != null ? formatKg(existing.waist) : 'optional'}
              style={{ height: 44, fontSize: 18 }}
              accessibilityLabel="Waist in cm"
            />
          </View>
        </Row>
        <Button title={existing ? 'Update' : 'Save'} onPress={save} disabled={weight == null && waist == null} />
        <Txt v="tiny">Morning, after the toilet, before eating. Waist at belly-button height, relaxed.</Txt>
      </Card>

      {advice ? (
        <Card style={{ backgroundColor: TONE[advice.tone].bg, borderColor: 'transparent' }}>
          <Txt v="label" color={TONE[advice.tone].fg}>
            Weekly check-in
          </Txt>
          <Txt v="h2">{advice.title}</Txt>
          <Txt v="small" color={C.text}>
            {advice.detail}
          </Txt>
        </Card>
      ) : (
        <Txt v="small">Log at least one weigh-in in two different weeks to get your weekly check-in.</Txt>
      )}

      {weeks.length > 0 ? (
        <Card>
          <Row gap={S.md}>
            <Stat value={latest?.weight != null ? `${formatKg(Math.round(latest.weight * 10) / 10)} kg` : '–'} label="this week’s average" />
            <Stat
              value={first && latest && first !== latest ? formatChange(latest.weight! - first.weight!) : '–'}
              label="since you started"
              color={first && latest && latest.weight! < first.weight! ? C.green : undefined}
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
            color={C.orange}
            formatY={(v) => formatKg(Math.round(v * 10) / 10)}
          />
        </Card>
      ) : null}

      {body.length > 0 ? (
        <Card style={{ gap: 0, paddingVertical: S.xs }}>
          {[...body]
            .reverse()
            .slice(0, 10)
            .map((b, i, arr) => (
              <Row
                key={b.date}
                style={{ paddingVertical: 10, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: C.border }}>
                <Txt style={{ flex: 1 }}>{formatShortDate(parseISODate(b.date).getTime())}</Txt>
                <Txt style={{ width: 80, textAlign: 'right', fontVariant: ['tabular-nums'] }}>
                  {b.weight != null ? `${formatKg(b.weight)} kg` : ''}
                </Txt>
                <Txt v="small" style={{ width: 70, textAlign: 'right' }}>
                  {b.waist != null ? `${formatKg(b.waist)} cm` : ''}
                </Txt>
                <Pressable
                  hitSlop={8}
                  style={{ marginLeft: S.md }}
                  onPress={async () => {
                    if (await confirm('Delete entry?', `Remove the weigh-in from ${b.date}?`, 'Delete', true)) deleteBody(b.date);
                  }}>
                  <Ionicons name="trash-outline" size={16} color={C.faint} />
                </Pressable>
              </Row>
            ))}
        </Card>
      ) : null}

      <SectionTitle title="Hard sets this week" right={<Txt v="tiny">plan: week {pos.week}</Txt>} />
      {workouts.length === 0 ? (
        <EmptyState icon="stats-chart-outline" title="No training logged yet" body="Your weekly sets per muscle show up here once you finish a workout." />
      ) : (
        <Card>
          {MUSCLES.map(({ key, label }) => {
            const done = thisWeek[key] ?? 0;
            const target = plan[key] ?? 0;
            return (
              <View key={key} style={{ gap: 4 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Txt v="small" color={C.text}>
                    {label}
                  </Txt>
                  <Txt v="small" style={{ fontVariant: ['tabular-nums'] }}>
                    {formatKg(done)} / {formatKg(target)}
                  </Txt>
                </Row>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      { width: `${target ? Math.min(1, done / target) * 100 : 0}%`, backgroundColor: done >= target && target > 0 ? C.green : C.accent },
                    ]}
                  />
                </View>
              </View>
            );
          })}
          <Txt v="tiny">Main muscle counts 1 set, helper muscles ½. Target = what your 3 sessions prescribe this week.</Txt>
        </Card>
      )}

      <SectionTitle title="Workouts per week" />
      <Card>
        <Row align="flex-end" gap={S.sm} style={{ height: 110 }}>
          {perWeek.map((w) => (
            <View key={w.monday} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <Txt v="tiny" color={C.text}>
                {w.count || ''}
              </Txt>
              <View
                style={{
                  width: '70%',
                  height: Math.max(4, (w.count / maxCount) * 70),
                  borderRadius: 6,
                  backgroundColor: w.count >= 3 ? C.green : w.count > 0 ? C.accent : C.surface3,
                }}
              />
              <Txt v="tiny">{formatShortDate(parseISODate(w.monday).getTime()).split(' ')[0]}</Txt>
            </View>
          ))}
        </Row>
        <Txt v="tiny">Weeks starting Monday. Green = all 3 sessions done.</Txt>
      </Card>

      <Button title="How to read your progress" variant="ghost" onPress={() => router.push('/guide/track')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  dayBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: R.pill, backgroundColor: C.surface2 },
  dayBtnOn: { backgroundColor: C.surface3 },
  dayText: { color: C.muted, fontSize: 12, fontWeight: '700' },
  track: { height: 8, borderRadius: 4, backgroundColor: C.surface3, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
});
