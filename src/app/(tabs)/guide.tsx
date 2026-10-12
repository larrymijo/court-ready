import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Card, PageHeader, Row, Screen, SectionTitle, Txt, type IconName } from '@/components/ui';
import { EXERCISES } from '@/data/exercises';
import { ARTICLES, ARTICLE_SECTIONS } from '@/data/guide';
import { useStore } from '@/store/useStore';
import { C, S } from '@/theme';

const ICONS: Record<string, IconName> = {
  how: 'compass-outline',
  week: 'calendar-outline',
  weeks12: 'git-commit-outline',
  rir: 'speedometer-outline',
  pain: 'medkit-outline',
  shoulder: 'body-outline',
  elbows: 'hand-left-outline',
  chest: 'fitness-outline',
  skip: 'close-circle-outline',
  warmups: 'flame-outline',
  technique: 'repeat-outline',
  progress: 'trending-up-outline',
  recovery: 'moon-outline',
  food: 'restaurant-outline',
  track: 'analytics-outline',
  life: 'shuffle-outline',
  swaps: 'swap-horizontal-outline',
  cheat: 'flash-outline',
};

export default function GuideScreen() {
  const active = useStore((s) => s.active);
  const planCount = EXERCISES.filter((e) => e.kind === 'main').length;
  const careCount = EXERCISES.filter((e) => e.kind === 'care').length;

  return (
    <Screen bottomPad={active ? 170 : 110}>
      <PageHeader subtitle="Court-Ready Muscle" title="Guide" />

      <Card onPress={() => router.push('/exercises')}>
        <Row gap={S.md}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="barbell" size={22} color={C.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt v="h2">Exercise technique</Txt>
            <Txt v="small">
              {planCount} exercises, {careCount} shoulder-care drills and their swaps — setup, how to, what to avoid, what
              to change if it hurts.
            </Txt>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.faint} />
        </Row>
      </Card>

      {ARTICLE_SECTIONS.map((section) => (
        <View key={section} style={{ gap: S.sm }}>
          <SectionTitle title={section} />
          <Card style={{ paddingVertical: S.xs, gap: 0 }}>
            {ARTICLES.filter((a) => a.section === section).map((a, i, arr) => (
              <Pressable
                key={a.slug}
                onPress={() => router.push(`/guide/${a.slug}`)}
                style={({ pressed }) => [
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: S.md,
                    paddingVertical: S.md,
                    borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                    borderBottomColor: C.border,
                  },
                  pressed && { opacity: 0.6 },
                ]}>
                <Ionicons name={ICONS[a.slug] ?? 'document-text-outline'} size={20} color={C.accent} />
                <View style={{ flex: 1 }}>
                  <Txt style={{ fontWeight: '700' }}>{a.title}</Txt>
                  <Txt v="small" numberOfLines={1}>
                    {a.summary}
                  </Txt>
                </View>
                <Ionicons name="chevron-forward" size={16} color={C.faint} />
              </Pressable>
            ))}
          </Card>
        </View>
      ))}
      <Txt v="tiny" style={{ textAlign: 'center' }}>
        General training advice, not medical advice. Sharp, worsening or night-time pain → see a physiotherapist or
        doctor.
      </Txt>
    </Screen>
  );
}
