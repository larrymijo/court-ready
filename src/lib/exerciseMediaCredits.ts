import media from '@/data/exerciseMedia.json';

type Credit = {
  title: string;
  author: string;
  source: string;
  license: string;
  licenseUrl: string;
};

type CreditedPair = Credit & { frames: readonly Partial<Credit>[] };

// A composite photo has one credit. Frames taken from separate originals each keep theirs.
const sources = new Map<string, Credit>();
for (const entry of Object.values<CreditedPair>(media)) {
  for (const frame of entry.frames) {
    const credit = {
      title: frame.title ?? entry.title,
      author: frame.author ?? entry.author,
      source: frame.source ?? entry.source,
      license: frame.license ?? entry.license,
      licenseUrl: frame.licenseUrl ?? entry.licenseUrl,
    };
    sources.set(credit.source, credit);
  }
}
export const movementCredits = [...sources.values()].sort((a, b) => a.title.localeCompare(b.title));
