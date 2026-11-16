import { router } from 'expo-router';
import { View } from 'react-native';

import { Chip, Divider, Row, RowBadge, Txt } from '@/components/ui';
import { EXERCISE_BY_ID } from '@/data/exercises';
import type { Checklist } from '@/lib/types';
import { S } from '@/theme';

/**
 * A warm-up or cool-down written out, to read: numbered steps, and under a step that is a drill or a
 * stretch a how-to link to its exercise page. Nothing to tick here; ticking happens in a session.
 */
export function ChecklistSteps({ list }: { list: Checklist }) {
  return (
    <View style={{ gap: S.md }}>
      {list.steps.map((step, i) => {
        const links = (step.exerciseIds ?? []).map((id) => EXERCISE_BY_ID[id]).filter(Boolean);
        return (
          <View key={i} style={{ gap: S.md }}>
            {i > 0 ? <Divider /> : null}
            <Row gap={S.md} align="flex-start">
              <RowBadge label={String(i + 1)} />
              <View style={{ flex: 1, gap: S.sm }}>
                <Txt style={{ paddingTop: 7 }}>{step.text}</Txt>
                {links.length > 0 ? (
                  <Row gap={S.sm} style={{ flexWrap: 'wrap' }}>
                    {links.map((ex) => (
                      <Chip
                        key={ex.id}
                        icon="play-circle-outline"
                        label={links.length > 1 ? ex.name : `How to: ${ex.name}`}
                        accessibilityLabel={`How to: ${ex.name}`}
                        style={{ flexShrink: 1 }}
                        onPress={() => router.push(`/exercise/${ex.id}`)}
                      />
                    ))}
                  </Row>
                ) : null}
              </View>
            </Row>
          </View>
        );
      })}
    </View>
  );
}
