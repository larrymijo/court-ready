import { Link, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Sheet, Txt } from '@/components/ui';
import { movementCredits } from '@/lib/exerciseMediaCredits';
import { C, S, SIZE } from '@/theme';

function CreditLink({ url, label, description }: { url: string; label: string; description: string }) {
  return (
    <Link href={url as Href} target="_blank" rel="noopener noreferrer" asChild>
      <Pressable accessibilityRole="link" accessibilityLabel={description} style={styles.link}>
        <Txt v="small" style={styles.underline}>{label}</Txt>
      </Pressable>
    </Link>
  );
}

export function MovementCredits() {
  const [open, setOpen] = useState(false);
  if (!movementCredits.length) return null;
  return (
    <>
      <Button title="Photo credits" variant="ghost" onPress={() => setOpen(true)} />
      {open ? (
        <Sheet visible title="Photo credits" onClose={() => setOpen(false)} closeLabel="Close">
          <Txt v="small">Hybrid crops, resizes and converts the original photos to greyscale.</Txt>
          {movementCredits.map((credit) => (
            <View key={credit.source} style={styles.credit}>
              <Txt v="h2">{credit.title}</Txt>
              <Txt v="small">{credit.author}</Txt>
              <View style={styles.links}>
                <CreditLink url={credit.source} label="Original photo" description={`Original photo for ${credit.title}`} />
                <CreditLink url={credit.licenseUrl} label={credit.license} description={`${credit.license} license for ${credit.title}`} />
              </View>
            </View>
          ))}
        </Sheet>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  credit: { gap: S.xs, paddingTop: S.md, borderBottomWidth: 1, borderBottomColor: C.hairline },
  links: { flexDirection: 'row', flexWrap: 'wrap', columnGap: S.lg },
  link: { minHeight: SIZE.touch, minWidth: SIZE.touch, justifyContent: 'center' },
  underline: { textDecorationLine: 'underline', color: C.text },
});
