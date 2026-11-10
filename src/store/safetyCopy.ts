import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORE_KEY } from '@/lib/channel';

const COPY_KEY = `${STORE_KEY}:before-update`;

/** The saved data exactly as it was before an app update changed its shape. */
export interface SafetyCopy {
  /** Data version the copy was saved at. */
  version: number;
  /** ISO time the copy was made. */
  savedAt: string;
  state: unknown;
}

/**
 * Keeps the data as it was before an update upgrades it. There is one copy; the next update
 * replaces it. A full or unavailable storage must not stop the update, so failures are ignored.
 */
export async function keepSafetyCopy(state: unknown, version: number): Promise<void> {
  try {
    const copy: SafetyCopy = { version, savedAt: new Date().toISOString(), state };
    await AsyncStorage.setItem(COPY_KEY, JSON.stringify(copy));
  } catch {
    // Nothing to do: the data itself is still upgraded and saved.
  }
}

export async function readSafetyCopy(): Promise<SafetyCopy | null> {
  try {
    const raw = await AsyncStorage.getItem(COPY_KEY);
    if (!raw) return null;
    const copy = JSON.parse(raw) as Partial<SafetyCopy>;
    if (typeof copy.version !== 'number' || typeof copy.savedAt !== 'string' || copy.state == null) return null;
    return { version: copy.version, savedAt: copy.savedAt, state: copy.state };
  } catch {
    return null;
  }
}

/** Characters of saved data on the phone: the store plus the safety copy. */
export async function savedDataLength(): Promise<number> {
  try {
    const [store, copy] = await Promise.all([AsyncStorage.getItem(STORE_KEY), AsyncStorage.getItem(COPY_KEY)]);
    return (store?.length ?? 0) + (copy?.length ?? 0);
  } catch {
    return 0;
  }
}
