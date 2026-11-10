import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DATA_VERSION, isNewerData, migrate } from '@/store/migrations';
import { readSafetyCopy } from '@/store/safetyCopy';
import { useStore } from '@/store/useStore';

// A made-up backup in the shape the first released version wrote. Not anyone's real data.
import exportV1 from './fixtures/export-v1.json';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

/** What version 1 of the app kept in the phone's storage. */
const v1State = {
  settings: exportV1.settings,
  workouts: exportV1.workouts,
  active: null,
  warmupChecked: [],
  body: exportV1.body,
  rest: null,
};

describe('migrate', () => {
  it('brings version 1 data up to date and leaves the rest alone', () => {
    expect(migrate(v1State, 1)).toEqual({ ...v1State, settings: { ...exportV1.settings, lastExportAt: null } });
  });

  it('is safe to run again on data that is already current', () => {
    const once = migrate(v1State, 1);
    expect(migrate(once, DATA_VERSION)).toEqual(once);
    expect(migrate(once, 1)).toEqual(once);
  });

  it('keeps fields it does not know about', () => {
    const out = migrate({ ...v1State, somethingNew: [1, 2], settings: { ...exportV1.settings, extra: 'x' } }, 1);
    expect(out.somethingNew).toEqual([1, 2]);
    expect((out.settings as Record<string, unknown>).extra).toBe('x');
  });

  it('leaves data from a newer app untouched', () => {
    const newer = { settings: { future: true }, workouts: [] };
    expect(isNewerData(DATA_VERSION + 1)).toBe(true);
    expect(isNewerData(DATA_VERSION)).toBe(false);
    expect(migrate(newer, DATA_VERSION + 1)).toEqual(newer);
  });

  it('treats a missing or broken version number as the first version', () => {
    expect(migrate(v1State, 0)).toEqual(migrate(v1State, 1));
    expect(migrate(v1State, Number.NaN)).toEqual(migrate(v1State, 1));
  });

  it('does not throw on unreadable data', () => {
    expect(migrate(null, 1)).toEqual({ settings: { lastExportAt: null } });
    expect(migrate('nonsense', 1)).toEqual({ settings: { lastExportAt: null } });
  });
});

describe('backup files', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useStore.getState().resetAll();
  });

  it('imports a version 1 backup', () => {
    expect(useStore.getState().importData(JSON.stringify(exportV1))).toEqual({ ok: true, workouts: 2 });
    const state = useStore.getState();
    expect(state.workouts).toEqual(exportV1.workouts);
    expect(state.body).toEqual(exportV1.body);
    // The phone holds what the file holds, so it counts as backed up when the file was made.
    expect(state.settings).toEqual({ ...exportV1.settings, lastExportAt: Date.parse(exportV1.exportedAt) });
  });

  it('exports at the current version, and that file imports back the same', () => {
    useStore.getState().importData(JSON.stringify(exportV1));
    const before = useStore.getState();
    const file = before.exportData();
    expect(JSON.parse(file)).toMatchObject({ app: 'court-ready', version: DATA_VERSION });

    useStore.getState().resetAll();
    expect(useStore.getState().workouts).toEqual([]);
    expect(useStore.getState().importData(file)).toEqual({ ok: true, workouts: 2 });
    const after = useStore.getState();
    expect(after.workouts).toEqual(before.workouts);
    expect(after.body).toEqual(before.body);
    expect({ ...after.settings, lastExportAt: null }).toEqual({ ...before.settings, lastExportAt: null });
  });

  it('refuses a backup from a newer app and keeps what is on the phone', () => {
    useStore.getState().importData(JSON.stringify(exportV1));
    const res = useStore.getState().importData(JSON.stringify({ ...exportV1, version: DATA_VERSION + 1, workouts: [] }));
    expect(res.ok).toBe(false);
    expect(useStore.getState().workouts).toHaveLength(2);
  });

  it('refuses text that is not a backup', () => {
    expect(useStore.getState().importData('not json').ok).toBe(false);
    expect(useStore.getState().importData(JSON.stringify({ app: 'something-else', workouts: [], body: [] })).ok).toBe(false);
  });
});

describe('data saved on the phone by version 1', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    await AsyncStorage.setItem('court-ready', JSON.stringify({ state: v1State, version: 1 }));
    await useStore.persist.rehydrate();
  });

  it('is upgraded when the app loads', async () => {
    const state = useStore.getState();
    expect(state.workouts).toEqual(exportV1.workouts);
    expect(state.body).toEqual(exportV1.body);
    expect(state.settings).toEqual({ ...exportV1.settings, lastExportAt: null });

    const saved = JSON.parse((await AsyncStorage.getItem('court-ready')) ?? '{}');
    expect(saved.version).toBe(DATA_VERSION);
    expect(saved.state.workouts).toEqual(exportV1.workouts);
  });

  it('is kept as a copy that can be put back', async () => {
    const copy = await readSafetyCopy();
    expect(copy?.version).toBe(1);
    expect(copy?.state).toEqual(v1State);

    useStore.getState().deleteWorkout(exportV1.workouts[0].id);
    expect(useStore.getState().workouts).toHaveLength(1);
    expect(await useStore.getState().restoreSafetyCopy()).toEqual({ ok: true, workouts: 2 });
    expect(useStore.getState().workouts).toEqual(exportV1.workouts);
  });
});

describe('with nothing saved yet', () => {
  it('starts empty and has no copy to put back', async () => {
    await AsyncStorage.clear();
    useStore.getState().resetAll();
    await AsyncStorage.clear();
    expect(await readSafetyCopy()).toBeNull();
    expect((await useStore.getState().restoreSafetyCopy()).ok).toBe(false);
  });
});
