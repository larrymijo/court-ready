import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DATA_VERSION } from '@/store/migrations';
import { useStore } from '@/store/useStore';

// Made-up backups, one in each shape the app has written. Not anyone's real data.
import exportV1 from './fixtures/export-v1.json';
import exportV2 from './fixtures/export-v2.json';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// The app's visible name is Hybrid, but the owner's saved data hangs on the old internal names.
// These tests fail if one of them changes.

type Backup = { workouts: { exercises: { sets: unknown[] }[] }[]; body: unknown[] };

const countSets = (file: Backup) =>
  file.workouts.reduce((n, w) => n + w.exercises.reduce((m, e) => m + e.sets.length, 0), 0);

function storeKeyFor(channel?: string): string {
  const scope = globalThis as { __COURT_READY_CHANNEL__?: string };
  const before = scope.__COURT_READY_CHANNEL__;
  scope.__COURT_READY_CHANNEL__ = channel;
  try {
    let key = '';
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      key = (require('@/lib/channel') as { STORE_KEY: string }).STORE_KEY;
    });
    return key;
  } finally {
    scope.__COURT_READY_CHANNEL__ = before;
  }
}

describe('names the saved data hangs on', () => {
  it('keeps the main copy under court-ready and the beta copy under court-ready-beta', () => {
    expect(storeKeyFor('main')).toBe('court-ready');
    expect(storeKeyFor('beta')).toBe('court-ready-beta');
  });

  it('still marks exports as court-ready', () => {
    expect(JSON.parse(useStore.getState().exportData())).toMatchObject({ app: 'court-ready', version: DATA_VERSION });
  });
});

describe('backups made before the rename', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useStore.getState().resetAll();
  });

  it('the fixture for the current data version is current', () => {
    expect(exportV2.version).toBe(DATA_VERSION);
  });

  it.each([
    ['version 1', exportV1],
    ['the current version', exportV2],
  ])('imports a backup in the shape of %s', (_name, file) => {
    expect(useStore.getState().importData(JSON.stringify(file))).toEqual({ ok: true, workouts: file.workouts.length });
    const state = useStore.getState();
    expect(state.workouts).toHaveLength(file.workouts.length);
    expect(state.workouts.reduce((n, w) => n + w.exercises.reduce((m, e) => m + e.sets.length, 0), 0)).toBe(
      countSets(file as Backup),
    );
    expect(state.body).toHaveLength(file.body.length);
  });
});

describe('a file that is not a backup', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useStore.getState().resetAll();
  });

  it('is refused with the new message', () => {
    const res = useStore.getState().importData(JSON.stringify({ ...exportV2, app: 'something-else' }));
    expect(res).toEqual({ ok: false, error: 'This doesn’t look like a Hybrid backup.' });
    expect(useStore.getState().workouts).toEqual([]);
  });
});
