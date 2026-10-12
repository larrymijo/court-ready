import { StyleSheet, Text, View } from 'react-native';

import { RichText } from '@/components/RichText';
import { Bullet, Card, Txt } from '@/components/ui';
import type { Block, Tone } from '@/data/guide';
import { C, R, S, TONE } from '@/theme';

const toneColor = (t: Tone) => TONE[t];

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
      return <RichText text={b.text} style={{ fontSize: 17, lineHeight: 25 }} />;
    case 'p':
      return <RichText text={b.text} />;
    case 'muted':
      return <RichText text={b.text} style={{ color: C.muted, fontSize: 13, lineHeight: 18 }} />;
    case 'h':
      return (
        <Txt v="h2" style={{ marginTop: S.sm }}>
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
    case 'callout': {
      const t = toneColor(b.tone);
      return (
        <Card style={{ backgroundColor: t.bg, borderColor: 'transparent' }}>
          {b.title ? <Txt style={{ fontWeight: '800', color: t.fg }}>{b.title}</Txt> : null}
          {b.items.map((it, i) =>
            b.items.length > 1 ? (
              <Bullet key={i} color={t.fg}>
                <RichText text={it} />
              </Bullet>
            ) : (
              <RichText key={i} text={it} />
            ),
          )}
        </Card>
      );
    }
    case 'table':
      return (
        <View style={styles.table}>
          {b.head ? (
            <View style={[styles.tr, styles.thead]}>
              {b.head.map((h, i) => (
                <Text key={i} style={[styles.th, i === 0 && styles.firstCol]}>
                  {h.toUpperCase()}
                </Text>
              ))}
            </View>
          ) : null}
          {b.rows.map((row, ri) => {
            const tone = b.tones?.[ri];
            return (
              <View
                key={ri}
                style={[
                  styles.tr,
                  ri < b.rows.length - 1 && styles.trBorder,
                  tone ? { backgroundColor: toneColor(tone).bg } : null,
                ]}>
                {row.map((cell, ci) => (
                  <View key={ci} style={[styles.td, ci === 0 && styles.firstCol]}>
                    <RichText
                      text={cell}
                      style={[styles.cellText, ci === 0 && { fontWeight: '700' }]}
                    />
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
  stepNum: { color: C.accent, fontWeight: '800', fontSize: 15, lineHeight: 22, minWidth: 20 },
  table: { backgroundColor: C.surface, borderRadius: R.md, overflow: 'hidden' },
  tr: { flexDirection: 'row' },
  thead: { backgroundColor: C.surface2 },
  trBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
  th: { flex: 2, color: C.muted, fontSize: 10, fontWeight: '800', letterSpacing: 0.6, padding: S.sm },
  td: { flex: 2, padding: S.sm },
  firstCol: { flex: 1.3 },
  cellText: { fontSize: 13, lineHeight: 18 },
});
