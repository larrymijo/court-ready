import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { RichText } from '@/components/RichText';
import { Bullet, Card, Row, Txt, type IconName } from '@/components/ui';
import type { Block, Tone } from '@/data/guide';
import { C, R, S, T } from '@/theme';

/**
 * A tone used to be a colour. Now it is a small icon, so "good", "careful" and "bad" still read at
 * a glance. Only `stop` (pain 4+) is drawn in red.
 */
const TONE_ICON: Record<Tone, IconName> = {
  info: 'information-circle-outline',
  ok: 'checkmark-circle-outline',
  warn: 'alert-circle-outline',
  bad: 'close-circle-outline',
  stop: 'close-circle',
};

const toneColor = (t: Tone) => (t === 'stop' ? C.danger : C.textMuted);

export function GuideBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <View style={{ gap: S.md }}>
      {blocks.map((b, i) => (
        <BlockView key={i} b={b} />
      ))}
    </View>
  );
}

function BlockView({ b }: { b: Block }) {
  switch (b.t) {
    case 'lead':
      return <RichText text={b.text} style={styles.lead} />;
    case 'p':
      return <RichText text={b.text} />;
    case 'muted':
      return <RichText text={b.text} style={styles.muted} />;
    case 'h':
      return (
        <Txt v="h1" accessibilityRole="header" style={{ marginTop: S.md }}>
          {b.text}
        </Txt>
      );
    case 'bullets':
      return (
        <View style={{ gap: S.sm }}>
          {b.items.map((it, i) => (
            <Bullet key={i}>
              <RichText text={it} />
            </Bullet>
          ))}
        </View>
      );
    case 'steps':
      return (
        <View style={{ gap: S.sm }}>
          {b.items.map((it, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: S.sm }}>
              <Text style={styles.stepNum}>{i + 1}.</Text>
              <View style={{ flex: 1 }}>
                <RichText text={it} />
              </View>
            </View>
          ))}
        </View>
      );
    case 'callout':
      return (
        <Card>
          {b.title ? (
            <Row gap={S.sm} align="flex-start">
              <Ionicons name={TONE_ICON[b.tone]} size={20} color={toneColor(b.tone)} style={{ marginTop: 1 }} />
              <Txt v="h2" style={{ flex: 1 }}>
                {b.title}
              </Txt>
            </Row>
          ) : null}
          <View style={{ gap: S.sm }}>
            {b.items.map((it, i) =>
              b.items.length > 1 ? (
                <Bullet key={i}>
                  <RichText text={it} />
                </Bullet>
              ) : (
                <RichText key={i} text={it} />
              ),
            )}
          </View>
        </Card>
      );
    case 'table':
      return (
        <View style={styles.table}>
          {b.head ? (
            <View style={[styles.tr, styles.thead]}>
              {b.head.map((h, i) => (
                <Text key={i} style={[styles.th, i === 0 && styles.firstCol]}>
                  {h}
                </Text>
              ))}
            </View>
          ) : null}
          {b.rows.map((row, ri) => {
            const tone = b.tones?.[ri];
            return (
              <View key={ri} style={[styles.tr, ri < b.rows.length - 1 && styles.trBorder]}>
                {row.map((cell, ci) => (
                  <View key={ci} style={[styles.td, ci === 0 && styles.firstCol]}>
                    {ci === 0 && tone ? (
                      <Ionicons name={TONE_ICON[tone]} size={15} color={toneColor(tone)} style={{ marginTop: 1.5 }} />
                    ) : null}
                    <View style={{ flex: 1 }}>
                      <RichText
                        text={cell}
                        style={[styles.cellText, ci === 0 && { fontWeight: '600' }, ci === 0 && tone === 'stop' && { color: C.danger }]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      );
  }
}

const styles = StyleSheet.create({
  lead: { fontSize: 17, lineHeight: 24 },
  muted: { ...T.secondary, color: C.textMuted },
  stepNum: { ...T.body, lineHeight: 22, fontWeight: '600', color: C.textMuted, minWidth: 20 },
  table: { backgroundColor: C.surface, borderRadius: R.control, overflow: 'hidden' },
  tr: { flexDirection: 'row' },
  thead: { backgroundColor: C.control },
  trBorder: { borderBottomWidth: 1, borderBottomColor: C.hairline },
  th: { ...T.label, fontSize: 11, lineHeight: 14, flex: 2, color: C.textFaint, paddingVertical: S.sm, paddingHorizontal: S.md },
  td: { flex: 2, flexDirection: 'row', gap: 6, paddingVertical: 10, paddingHorizontal: S.md },
  firstCol: { flex: 1.3 },
  cellText: { ...T.secondary },
});
