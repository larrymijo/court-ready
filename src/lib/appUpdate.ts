import { useSyncExternalStore } from 'react';

/**
 * "A new version is ready."
 *
 * The web app keeps running the version it was opened with until the page loads again, and a
 * home-screen app can stay open for days. When the offline cache (the service worker, see
 * serviceWorker.web.ts) has fetched a newer build than the one on screen, the app shows a notice
 * with a Reload button. It never reloads by itself, and the notice stays away while a workout is
 * open.
 */
type State = 'none' | 'ready' | 'dismissed';

let state: State = 'none';
const listeners = new Set<() => void>();

function set(next: State): void {
  if (state === next) return;
  state = next;
  for (const listener of listeners) listener();
}

/**
 * True when the cached build is a different one from the build that is running. Either side
 * unknown (a dev server, an older service worker that doesn't answer) means no notice.
 */
export function isNewerBuild(runningBuild: string | undefined, cachedBuild: string | undefined): boolean {
  return !!runningBuild && !!cachedBuild && runningBuild !== cachedBuild;
}

export function markUpdateReady(): void {
  if (state === 'none') set('ready');
}

/** "Later": hides the notice until the app is opened again. */
export function dismissUpdate(): void {
  if (state === 'ready') set('dismissed');
}

export function isUpdateReady(): boolean {
  return state === 'ready';
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** True while the "new version" notice should be offered. */
export function useUpdateReady(): boolean {
  return useSyncExternalStore(subscribe, isUpdateReady, isUpdateReady);
}

/** Loads the page again, which starts the new version. Saved data is untouched. */
export function reloadApp(): void {
  const location = (globalThis as { location?: { reload?: () => void } }).location;
  location?.reload?.();
}

/** For tests. */
export function resetUpdateState(): void {
  set('none');
}
