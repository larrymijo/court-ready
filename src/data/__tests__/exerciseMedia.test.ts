import { describe, expect, it } from '@jest/globals';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import media from '@/data/exerciseMedia.json';
import { EXERCISE_BY_ID } from '@/data/exercises';
import { getMovementPair } from '@/lib/exerciseMedia.web';
import { movementCredits } from '@/lib/exerciseMediaCredits';

const directory = join(__dirname, '../../../public/media');
const ids = Object.keys(media);

describe('exercise photos', () => {
  it('ships exactly the reviewed exercise folders', () => {
    expect(ids.length).toBeGreaterThan(0);
    expect(readdirSync(directory).sort()).toEqual([...ids].sort());
  });

  it.each(Object.entries(media))('%s has two distinct WebP positions and credits for both', (id, entry) => {
    expect(EXERCISE_BY_ID[id]?.id).toBe(id);
    expect(entry.frames).toHaveLength(2);
    expect(readdirSync(join(directory, id)).sort()).toEqual(['end.webp', 'start.webp']);
    const buffers = ['start', 'end'].map((name) => readFileSync(join(directory, id, name + '.webp')));
    for (const buffer of buffers) {
      expect(buffer.toString('ascii', 0, 4)).toBe('RIFF');
      expect(buffer.toString('ascii', 8, 12)).toBe('WEBP');
    }
    expect(buffers[0].equals(buffers[1])).toBe(false);
    for (const frame of entry.frames) {
      const credit = movementCredits.find((item) => item.source === frame.source);
      expect(credit).toBeDefined();
      expect(credit?.author).toBeTruthy();
      expect(credit?.title).toBeTruthy();
      expect(credit?.license).toBeTruthy();
      expect(credit?.source).toMatch(/^https:\/\//);
      expect(credit?.licenseUrl).toMatch(/^https:\/\//);
    }
  });

  it('resolves the web pair under the published channel and skips exercises without photos', () => {
    const original = process.env.EXPO_PUBLIC_BASE_URL;
    try {
      process.env.EXPO_PUBLIC_BASE_URL = '/court-ready/beta/';
      const id = ids[0];
      expect(getMovementPair(id)).toEqual({
        start: { uri: `/court-ready/beta/media/${id}/start.webp` },
        end: { uri: `/court-ready/beta/media/${id}/end.webp` },
      });
    } finally {
      if (original === undefined) delete process.env.EXPO_PUBLIC_BASE_URL;
      else process.env.EXPO_PUBLIC_BASE_URL = original;
    }
    for (const id of ['custom-example', 'removed-id', 'toString', '__proto__', '../']) {
      expect(getMovementPair(id)).toBeUndefined();
    }
  });
});
