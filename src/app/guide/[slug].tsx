import { router, Stack, useLocalSearchParams } from 'expo-router';

import { GuideBlocks } from '@/components/GuideBlocks';
import { Button, Screen, Txt } from '@/components/ui';
import { ARTICLES, ARTICLE_BY_SLUG } from '@/data/guide';
import { visibleGuideSlugs } from '@/lib/planView';
import { useStore } from '@/store/useStore';
import { S } from '@/theme';

export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const plan = useStore((s) => s.plans.find((p) => p.id === s.activePlanId));
  const article = ARTICLE_BY_SLUG[slug];
  if (!article) {
    return (
      <Screen edgesTop={false}>
        <Txt>Page not found.</Txt>
      </Screen>
    );
  }
  // A page of another plan still opens from a direct link; "Next" only goes on to pages that show.
  const shown = new Set(visibleGuideSlugs(ARTICLES.map((a) => a.slug), plan));
  const next = ARTICLES.slice(ARTICLES.indexOf(article) + 1).find((a) => shown.has(a.slug));

  return (
    <>
      <Stack.Screen options={{ title: article.section }} />
      <Screen edgesTop={false}>
        <Txt v="title" accessibilityRole="header">
          {article.title}
        </Txt>
        <GuideBlocks blocks={article.blocks} />
        {next ? (
          <Button
            style={{ marginTop: S.md }}
            variant="secondary"
            iconRight="arrow-forward"
            title={`Next: ${next.title}`}
            onPress={() => router.replace(`/guide/${next.slug}`)}
          />
        ) : null}
      </Screen>
    </>
  );
}
