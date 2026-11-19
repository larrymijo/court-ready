import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ExerciseList } from '@/components/ExerciseList';
import { SportRing } from '@/components/WorkoutCard';
import { TabScreen, useTabBottomPadding } from '@/components/TabScreen';
import { Button, Card, ListRow, PageHeader, RowBadge, SectionTitle, Segmented, Txt, type IconName } from '@/components/ui';
import { CHECKLISTS } from '@/data/checklists';
import { ARTICLES, ARTICLE_SECTIONS } from '@/data/guide';
import { SPORTS } from '@/data/sports';
import { plural } from '@/lib/format';
import { visibleGuideSlugs } from '@/lib/planView';
import { checklistKindLabel, sportLogsText } from '@/lib/sportView';
import { useStore } from '@/store/useStore';
import { C, S } from '@/theme';

type View_ = 'exercises' | 'sports' | 'guide';

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
  const bottomPad = useTabBottomPadding();
  const customCount = useStore((s) => s.customExercises.length);
  const header = (
    <View style={{ gap: S.lg }}>
      <PageHeader title="Library" right={view === 'exercises' ? (
        <Button title="New exercise" icon="add" size="pill" onPress={() => router.push('/exercise/new')} />
      ) : undefined} />
      <Segmented<View_>
        value={view}
        onChange={setView}
        options={[
          { value: 'exercises', label: 'Exercises' },
          { value: 'sports', label: 'Sports' },
          { value: 'guide', label: 'Guide' },
        ]}
      />

    </View>
  );

  return (
    <>
      <View style={view === 'exercises' ? { flex: 1 } : { display: 'none' }}>
        <ExerciseList key={customCount} header={header} tabBottomPad={bottomPad} onChoose={(e) => router.push(`/exercise/${e.id}`)} />
      </View>
      {view !== 'exercises' ? (
        <TabScreen>
          {header}
          {view === 'sports' ? <SportsList /> : <GuideList />}
        </TabScreen>
      ) : null}
    </>
  );
}

/** The four sports, and every warm-up and cool-down, the gym ones included. Each opens on its own page. */
function SportsList() {
  return (
    <>
      <View style={{ gap: S.md }}>
        <SectionTitle title="Sports" />
        <Card variant="list">
          {SPORTS.map((s, i) => (
            <ListRow
              key={s.id}
              leading={
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.control, alignItems: 'center', justifyContent: 'center' }}>
                  <SportRing />
                </View>
              }
              title={s.name}
              subtitle={sportLogsText(s)}
              subtitleLines={2}
              chevron
              divider={i < SPORTS.length - 1}
              onPress={() => router.push(`/sports/${s.id}`)}
            />
          ))}
        </Card>
      </View>
      <View style={{ gap: S.md }}>
        <SectionTitle title="Warm-ups and cool-downs" />
        <Card variant="list">
          {CHECKLISTS.map((c, i) => (
            <ListRow
              key={c.id}
              leading={<RowBadge icon={c.kind === 'warmup' ? 'flame-outline' : 'snow-outline'} />}
              title={c.title}
              subtitle={`${checklistKindLabel(c)} · ${plural(c.steps.length, 'step')}`}
              chevron
              divider={i < CHECKLISTS.length - 1}
              onPress={() => router.push(`/checklists/${c.id}`)}
            />
          ))}
        </Card>
      </View>
    </>
  );
}

function GuideList() {
  const plan = useStore((s) => s.plans.find((p) => p.id === s.activePlanId));
  const shown = new Set(visibleGuideSlugs(ARTICLES.map((a) => a.slug), plan));
  return (
    <>
      {ARTICLE_SECTIONS.map((section) => {
        const articles = ARTICLES.filter((a) => a.section === section && shown.has(a.slug));
        if (articles.length === 0) return null;
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
