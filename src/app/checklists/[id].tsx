import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { ChecklistSteps } from '@/components/library/ChecklistSteps';
import { Card, Screen, Txt } from '@/components/ui';
import { checklist } from '@/data/checklists';
import { checklistKindLabel, checklistMeta } from '@/lib/sportView';
import { C, S } from '@/theme';

/** One warm-up or cool-down to read. Other screens link here: /checklists/<id>. */
export default function ChecklistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const list = checklist(String(id ?? ''));

  if (!list) {
    return (
      <Screen edgesTop={false}>
        <Stack.Screen options={{ title: 'Not found' }} />
        <Txt>Warm-up or cool-down not found.</Txt>
      </Screen>
    );
  }

  return (
    <Screen edgesTop={false}>
      <Stack.Screen options={{ title: '' }} />
      <View style={{ gap: 2 }}>
        <Txt v="label">{checklistKindLabel(list)}</Txt>
        <Txt v="title">{list.title}</Txt>
        <Txt color={C.textMuted}>{checklistMeta(list)}</Txt>
      </View>
      <Card style={{ gap: S.md }}>
        <ChecklistSteps list={list} />
      </Card>
      <Txt v="caption">General guidance, not medical advice. Skip anything that hurts.</Txt>
    </Screen>
  );
}
