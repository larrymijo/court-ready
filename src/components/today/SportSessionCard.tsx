import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Row, Txt } from '@/components/ui';
import type { WeekSessionView } from '@/lib/planView';
import { startSportFlow } from '@/lib/startWorkout';
import type { Plan } from '@/lib/types';
import { C, S } from '@/theme';

/** The marker of a sport day: a ring, where a gym day's is a filled dot (docs/design.md). `size` 10 is the hero card's. */
export function SportMark({ size = 6 }: { size?: number }) {
  const border = size >= 10 ? 2 : 1.5;
  return <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: border, borderColor: C.textMuted }} />;
}

/** Starts a planned sport session so it counts for the plan. */
export function startPlannedSport(plan: Plan, session: WeekSessionView): void {
  if (session.sport) void startSportFlow({ sport: session.sport, planId: plan.id, sessionId: session.id });
}

/** Opens "Log a past session" on the sport. */
export function logPastSession(sport: WeekSessionView['sport']): void {
  router.push({ pathname: '/log-sport', params: sport ? { sport } : {} });
}

/**
 * A sport session planned for a day that also has a gym workout: a small card under the workout
 * with Start, "Log a past session" and the game warm-up. Optional sessions are offered the same way.
 */
export function SportSessionCard({ plan, session }: { plan: Plan; session: WeekSessionView }) {
  return (
    <Card>
      <Row gap={S.md}>
        <View style={styles.text}>
          <Row gap={S.sm}>
            <SportMark />
            <Txt v="h2" numberOfLines={2} style={{ flexShrink: 1 }}>
              {session.name}
            </Txt>
          </Row>
          <Txt v="small" style={{ paddingLeft: 14 }}>
            {session.done ? 'Sport · done' : session.optional ? 'Sport · optional' : 'Sport'}
          </Txt>
        </View>
        <Button
          size="pill"
          variant="outline"
          title={session.done ? 'Start again' : 'Start'}
          accessibilityLabel={`Start ${session.name}`}
          onPress={() => startPlannedSport(plan, session)}
        />
      </Row>
      <Row style={styles.links}>
        <Button variant="ghost" title="Log a past session" onPress={() => logPastSession(session.sport)} />
        <Button variant="ghost" title="Game warm-up" iconRight="chevron-forward" onPress={() => router.push('/guide/warmups')} />
      </Row>
    </Card>
  );
}

const styles = StyleSheet.create({
  text: { flex: 1, minWidth: 0, gap: 2 },
  links: { justifyContent: 'space-between', marginTop: -6, marginBottom: -10, marginHorizontal: -S.sm },
});
