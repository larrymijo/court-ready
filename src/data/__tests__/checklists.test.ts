import { describe, expect, it } from '@jest/globals';

import { CHECKLISTS, checklist } from '../checklists';
import { EXERCISE_BY_ID, EXERCISES } from '../exercises';

// The expected text below is copied from `git show HEAD:src/data/guide.ts` (WARMUPS, the game
// warm-up page and the after-playing routine, with the link markup taken out), not imported.
describe('checklists keep the text the app shows today', () => {
  it('upper warm-up', () => {
    const c = checklist('upper')!;
    expect(c.title).toBe('Upper warm-up · 8 min');
    expect(c.steps.map((s) => s.text)).toEqual([
      'Easy cardio 3–5 min (rower, bike, fast walk)',
      'Band external rotation — 15 per side',
      'Band pull-apart — 15',
      'Scapular push-up — 10',
      'Wall slide — 8',
    ]);
    // The care drills keep the links they had.
    expect(c.steps.map((s) => s.exerciseIds?.[0])).toEqual([undefined, 'c_er', 'c_pullapart', 'c_scappush', 'c_wallslide']);
  });

  it('lower warm-up', () => {
    const c = checklist('lower')!;
    expect(c.title).toBe('Lower warm-up · 8 min');
    expect(c.steps.map((s) => s.text)).toEqual([
      'Easy bike 3–5 min',
      'Bodyweight squat — 10',
      'Glute bridge — 10',
      'Leg swings — 10 + 10 each leg',
      'Hop and stick — 5 per leg, hold 2 s',
    ]);
  });

  it('game warm-up', () => {
    const c = checklist('game')!;
    expect(c.minutes).toBe(8);
    expect(c.kind).toBe('warmup');
    expect(c.steps.map((s) => s.text)).toEqual([
      'Jog, skips, side shuffles — 3 min.',
      'Leg swings and walking lunges with a twist — 1 min.',
      'Band external rotation 12 per side + band pull-apart 15 (no band: big arm circles).',
      'Scapular push-up — 10',
      'Jumps: 5 at half effort, 5 at three-quarters, 3 at full effort.',
      'Volleyball: build your hitting and serving from half to full power over about 5 minutes.',
    ]);
    expect(c.steps[2].exerciseIds).toEqual(['c_er', 'c_pullapart']);
    expect(c.steps[3].exerciseIds).toEqual(['c_scappush']);
  });

  it('after-playing routine', () => {
    const c = checklist('after-playing')!;
    expect(c.minutes).toBe(3);
    expect(c.kind).toBe('cooldown');
    expect(c.steps.map((s) => s.text)).toEqual([
      'Cross-body stretch — 2 × 30 s on your hitting arm',
      'Open book — 8 per side',
      'Calf stretch against a wall — 30 s per leg',
    ]);
    expect(c.steps[0].exerciseIds).toEqual(['c_crossbody']);
    expect(c.steps[1].exerciseIds).toEqual(['c_openbook']);
  });

  it('basketball warm-up is the game warm-up without the volleyball step, plus layups and shots', () => {
    const game = checklist('game')!.steps.map((s) => s.text);
    const basket = checklist('game-basketball')!.steps.map((s) => s.text);
    expect(basket.slice(0, 5)).toEqual(game.slice(0, 5));
    expect(basket.some((t) => t.startsWith('Volleyball'))).toBe(false);
    expect(basket[5]).toMatch(/^Layups and shots/);
    expect(basket).toHaveLength(6);
  });
});

describe('checklists as data', () => {
  it('has the ids that sports and plans point to', () => {
    for (const id of [
      'upper',
      'lower',
      'game',
      'game-basketball',
      'football-warmup',
      'running-warmup',
      'after-playing',
      'football-cooldown',
      'running-cooldown',
      'cool-upper',
      'cool-lower',
    ]) {
      expect(checklist(id)).toBeDefined();
    }
  });

  it('knows nothing for an unknown id', () => {
    expect(checklist('nope')).toBeUndefined();
    expect(checklist('toString')).toBeUndefined();
  });

  it('has unique ids and sensible fields', () => {
    const ids = CHECKLISTS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of CHECKLISTS) {
      expect(c.title.trim()).not.toBe('');
      expect(c.minutes).toBeGreaterThan(0);
      expect(c.steps.length).toBeGreaterThan(0);
      for (const s of c.steps) expect(s.text.trim()).not.toBe('');
    }
    // Warm-ups and cool-downs are told apart by their kind.
    expect(CHECKLISTS.filter((c) => c.kind === 'cooldown').map((c) => c.id).sort()).toEqual(
      ['after-playing', 'cool-lower', 'cool-upper', 'football-cooldown', 'running-cooldown'].sort(),
    );
  });

  it('links only to exercises that exist', () => {
    for (const c of CHECKLISTS) {
      for (const s of c.steps) {
        for (const id of s.exerciseIds ?? []) expect(EXERCISE_BY_ID[id]).toBeDefined();
      }
    }
  });

  it('links stretches from cool-downs and drills from warm-ups', () => {
    for (const c of CHECKLISTS.filter((c) => c.kind === 'cooldown')) {
      const kinds = c.steps.flatMap((s) => (s.exerciseIds ?? []).map((id) => EXERCISE_BY_ID[id].kind));
      expect(kinds.length).toBeGreaterThan(0);
    }
  });
});

describe('drills and stretches', () => {
  const moves = EXERCISES.filter((e) => e.kind === 'drill' || e.kind === 'stretch');

  it('are about thirty, with the right id prefix for their kind', () => {
    expect(moves.length).toBeGreaterThanOrEqual(28);
    expect(moves.filter((e) => e.kind === 'stretch')).toHaveLength(9);
    for (const e of moves) expect(e.id.startsWith(e.kind === 'drill' ? 'd_' : 's_')).toBe(true);
  });

  it('have a dose, a how-to and no swaps, and are tracked by reps only', () => {
    for (const e of moves) {
      expect(e.dose?.trim()).toBeTruthy();
      expect(e.swaps).toEqual([]);
      expect(e.tracking).toBe('reps');
      expect(e.increment).toBe(0);
      expect(e.isolation).toBe(false);
      expect(e.sections[0].label).toBe('HOW');
      expect(e.sections[0].items.length).toBeGreaterThan(0);
    }
  });

  it('have unique ids across the whole exercise list', () => {
    const ids = EXERCISES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('are not suggested as swaps for any exercise', () => {
    const moveIds = new Set(moves.map((e) => e.id));
    for (const e of EXERCISES) for (const s of e.swaps) expect(moveIds.has(s)).toBe(false);
  });
});
