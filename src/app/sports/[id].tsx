import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { ChecklistSteps } from '@/components/library/ChecklistSteps';
import { Card, Screen, SectionTitle, Txt } from '@/components/ui';
import { checklist } from '@/data/checklists';
import { sportDef } from '@/data/sports';
import { checklistMeta, sportLogsText } from '@/lib/sportView';
import type { Checklist } from '@/lib/types';
import { C, S } from '@/theme';

/** A sport of the Library: what a session logs, with its warm-up and cool-down written out. */
export default function SportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const def = sportDef(String(id ?? ''));

  if (!def) {
    return (
      <Screen edgesTop={false}>
        <Stack.Screen options={{ title: 'Not found' }} />
        <Txt>Sport not found.</Txt>
      </Screen>
    );
  }

  const warmup = checklist(def.warmup);
  const cooldown = checklist(def.cooldown);

  return (
    <Screen edgesTop={false}>
      <Stack.Screen options={{ title: def.name }} />
      <View style={{ gap: 2 }}>
        <Txt v="label">Sport</Txt>
        <Txt v="title">{def.name}</Txt>
      </View>

      <SectionTitle title="What a session logs" />
      <Card>
        <Txt>{sportLogsText(def)}</Txt>
        <Txt v="caption">
          A session has a warm-up before and a cool-down after. You tick or skip each, and the saved session records which.
        </Txt>
      </Card>

      {warmup ? <Prep heading="Warm-up" list={warmup} /> : null}
      {cooldown ? <Prep heading="Cool-down" list={cooldown} /> : null}
    </Screen>
  );
}

function Prep({ heading, list }: { heading: string; list: Checklist }) {
  return (
    <View style={{ gap: S.md }}>
      <SectionTitle title={heading} />
      <Card style={{ gap: S.md }}>
        <View style={{ gap: 2 }}>
          <Txt v="h2">{list.title}</Txt>
          <Txt v="small" color={C.textMuted}>
            {checklistMeta(list)}
          </Txt>
        </View>
        <ChecklistSteps list={list} />
      </Card>
    </View>
  );
}
