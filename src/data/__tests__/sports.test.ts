import { describe, expect, it } from '@jest/globals';

import { SPORTS, sportDef } from '@/data/sports';

// Plans and finished sessions point to these ids, so they never change once shipped.
describe('sports', () => {
  it('keeps the four sports and their checklist ids', () => {
    expect(SPORTS.map((s) => [s.id, s.warmup, s.cooldown])).toEqual([
      ['volleyball', 'game', 'after-playing'],
      ['basketball', 'game-basketball', 'after-playing'],
      ['football', 'football-warmup', 'football-cooldown'],
      ['running', 'running-warmup', 'running-cooldown'],
    ]);
  });

  it('asks a run for its distance and not for match or practice; the others the other way round', () => {
    for (const s of SPORTS) {
      expect(s.logsDistance).toBe(s.id === 'running');
      expect(s.logsMatch).toBe(s.id !== 'running');
    }
  });

  it('finds a sport by id, and nothing for an id it does not know', () => {
    expect(sportDef('football')?.name).toBe('Football');
    expect(sportDef('curling')).toBeUndefined();
    expect(sportDef('toString')).toBeUndefined();
  });
});
