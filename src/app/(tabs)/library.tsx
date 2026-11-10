import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ExerciseList } from '@/components/ExerciseList';
import { TabScreen } from '@/components/TabScreen';
import { Card, ListRow, PageHeader, RowBadge, SectionTitle, Segmented, Txt, type IconName } from '@/components/ui';
import { EXERCISES } from '@/data/exercises';
import { ARTICLES, ARTICLE_SECTIONS } from '@/data/guide';
import { S } from '@/theme';

type View_ = 'exercises' | 'guide';

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

export default function LibraryScreen() {
  const [view, setView] = useState<View_>('exercises');

  return (
    <TabScreen>
      <PageHeader subtitle={`${EXERCISES.length} exercises · ${ARTICLES.length} guide pages`} title="Library" />
      <Segmented<View_>
        value={view}
        onChange={setView}
        options={[
          { value: 'exercises', label: 'Exercises' },
          { value: 'guide', label: 'Guide' },
        ]}
      />

      {/* Both stay mounted, so a search survives a look at the guide. */}
      <View style={view === 'exercises' ? null : { display: 'none' }}>
        <ExerciseList initialFilter="plan" onChoose={(e) => router.push(`/exercise/${e.id}`)} />
      </View>
      <View style={view === 'guide' ? { gap: S.lg } : { display: 'none' }}>
        <GuideList />
      </View>
    </TabScreen>
  );
}

function GuideList() {
  return (
    <>
      {ARTICLE_SECTIONS.map((section) => {
        const articles = ARTICLES.filter((a) => a.section === section);
        return (
          <View key={section} style={{ gap: S.md }}>
            <SectionTitle title={section} />
            <Card variant="list">
              {articles.map((a, i) => (
                <ListRow
                  key={a.slug}
                  leading={<RowBadge icon={ICONS[a.slug] ?? 'document-text-outline'} />}
                  title={a.title}
                  subtitle={a.summary}
                  chevron
                  divider={i < articles.length - 1}
                  onPress={() => router.push(`/guide/${a.slug}`)}
                />
              ))}
            </Card>
          </View>
        );
      })}
      <Txt v="caption" style={{ textAlign: 'center' }}>
        General training advice, not medical advice. Sharp, worsening or night-time pain: see a physiotherapist or
        doctor.
      </Txt>
    </>
  );
}
