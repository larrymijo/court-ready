import { router, Stack, useLocalSearchParams } from 'expo-router';

import { GuideBlocks } from '@/components/GuideBlocks';
import { Button, Screen, Txt } from '@/components/ui';
import { ARTICLES, ARTICLE_BY_SLUG } from '@/data/guide';
import { S } from '@/theme';

export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const article = ARTICLE_BY_SLUG[slug];
  if (!article) {
    return (
      <Screen edgesTop={false}>
        <Txt>Page not found.</Txt>
      </Screen>
    );
  }
  const idx = ARTICLES.indexOf(article);
  const next = ARTICLES[idx + 1];

  return (
    <>
      <Stack.Screen options={{ title: article.section }} />
      <Screen edgesTop={false} bottomPad={40}>
        <Txt v="title" style={{ marginBottom: S.xs }}>
          {article.title}
        </Txt>
        <GuideBlocks blocks={article.blocks} />
        {next ? (
          <Button
            style={{ marginTop: S.lg }}
            variant="secondary"
            icon="arrow-forward"
            title={`Next: ${next.title}`}
            onPress={() => router.replace(`/guide/${next.slug}`)}
          />
        ) : null}
      </Screen>
    </>
  );
}
