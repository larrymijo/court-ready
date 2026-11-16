import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/**
 * The current time, to redraw the clock. While `active` it refreshes every second, and again the
 * moment the page becomes visible or the app comes back to the front: a phone locked in a bag
 * suspends the page, and the clock must show the right time when it wakes. The clock itself is
 * always worked out from saved timestamps, so this only decides when to look again.
 */
export function useSportNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    const refresh = () => setNow(Date.now());
    refresh();
    const timer = setInterval(refresh, 1000);
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    const hasDocument = typeof document !== 'undefined' && typeof document.addEventListener === 'function';
    if (hasDocument) {
      document.addEventListener('visibilitychange', onVisible);
      window.addEventListener('pageshow', refresh);
      window.addEventListener('focus', refresh);
    }
    return () => {
      clearInterval(timer);
      appState.remove();
      if (hasDocument) {
        document.removeEventListener('visibilitychange', onVisible);
        window.removeEventListener('pageshow', refresh);
        window.removeEventListener('focus', refresh);
      }
    };
  }, [active]);

  return now;
}
