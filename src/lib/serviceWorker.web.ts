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
    navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/` }).catch(() => {});
  };
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}
