import { isNewerBuild, markUpdateReady } from '@/lib/appUpdate';
import { useStore } from '@/store/useStore';

/** How often, at most, the app asks the server for a newer version when it comes back on screen. */
const CHECK_EVERY_MS = 60 * 1000;
/** A service worker from before the "new version" notice never answers; stop waiting after this. */
const ANSWER_WITHIN_MS = 3000;

/**
 * Registers the offline cache for the hosted web app. sw.js only exists in the GitHub Pages build
 * (scripts/finish-web-build.mjs makes it), so anywhere else this quietly does nothing.
 */
export function registerServiceWorker(): void {
  if (__DEV__ || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  // The bundle lives at <base>/_expo/static/js/…, which tells us the URL prefix the app is served
  // under ("" locally, "/court-ready" on GitHub Pages).
  const script = document.querySelector<HTMLScriptElement>('script[src*="/_expo/static/js/"]');
  const base = script ? new URL(script.src).pathname.split('/_expo/')[0] : '';
  // Register after the page has loaded so the precache download doesn't slow the first paint.
  const register = () => {
    navigator.serviceWorker
      .register(`${base}/sw.js`, { scope: `${base}/` })
      .then(watchForNewVersion)
      .catch(() => {});
  };
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}

/** Asks a service worker which build it has cached. Resolves to undefined if it doesn't say. */
function cachedBuild(worker: ServiceWorker): Promise<string | undefined> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    const timer = setTimeout(() => resolve(undefined), ANSWER_WITHIN_MS);
    channel.port1.onmessage = (event: MessageEvent<{ version?: unknown }>) => {
      clearTimeout(timer);
      resolve(typeof event.data?.version === 'string' ? event.data.version : undefined);
    };
    worker.postMessage({ type: 'court-ready:version' }, [channel.port2]);
  });
}

/**
 * Raises the "new version" notice (lib/appUpdate.ts) when the offline cache holds a newer build
 * than the one on screen. A home-screen app is rarely loaded afresh, so it also looks for a newer
 * build each time it comes back on screen, but never while a workout is open: nothing may change
 * under a session in progress.
 */
function watchForNewVersion(registration: ServiceWorkerRegistration): void {
  // Written into the page by scripts/finish-web-build.mjs.
  const runningBuild = (globalThis as { __COURT_READY_BUILD__?: string }).__COURT_READY_BUILD__;
  if (!runningBuild) return;

  const compare = async () => {
    const worker = navigator.serviceWorker.controller;
    if (!worker) return;
    if (isNewerBuild(runningBuild, await cachedBuild(worker))) markUpdateReady();
  };

  let lastCheck = Date.now();
  navigator.serviceWorker.addEventListener('controllerchange', compare);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    compare();
    const workoutOpen = useStore.getState().active != null;
    if (!workoutOpen && Date.now() - lastCheck > CHECK_EVERY_MS) {
      lastCheck = Date.now();
      registration.update().catch(() => {});
    }
  });
  compare();
}
