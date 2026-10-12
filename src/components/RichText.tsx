import { router } from 'expo-router';
import { Text, type StyleProp, type TextStyle } from 'react-native';

import { EXERCISE_BY_ID } from '@/data/exercises';
import { ARTICLE_BY_SLUG } from '@/data/guide';
import { C } from '@/theme';

/** Opens a guide article or an exercise page from a [[target|label]] link. */
export function openTarget(target: string): void {
  if (ARTICLE_BY_SLUG[target]) router.push(`/guide/${target}`);
  else if (EXERCISE_BY_ID[target]) router.push(`/exercise/${target}`);
}

type Part = { kind: 'text' | 'bold' | 'link'; text: string; target?: string };

export function parseRich(text: string): Part[] {
  const parts: Part[] = [];
  const re = /\*\*(.+?)\*\*|\[\[([\w-]+)\|([^\]]+)\]\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ kind: 'text', text: text.slice(last, m.index) });
    if (m[1] != null) parts.push({ kind: 'bold', text: m[1] });
    else parts.push({ kind: 'link', text: m[3], target: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ kind: 'text', text: text.slice(last) });
  return parts;
}

export function RichText({
  text,
  style,
  numberOfLines,
}: {
  text: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  const parts = parseRich(text);
  return (
    <Text style={[{ color: C.text, fontSize: 15, lineHeight: 22 }, style]} numberOfLines={numberOfLines}>
      {parts.map((p, i) => {
        if (p.kind === 'bold')
          return (
            <Text key={i} style={{ fontWeight: '700' }}>
              {p.text}
            </Text>
          );
        if (p.kind === 'link')
          return (
            <Text
              key={i}
              onPress={() => openTarget(p.target!)}
              style={{ color: C.accent, fontWeight: '600' }}
              suppressHighlighting>
              {p.text}
            </Text>
          );
        return <Text key={i}>{p.text}</Text>;
      })}
    </Text>
  );
}
