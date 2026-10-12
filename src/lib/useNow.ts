import { useSyncExternalStore } from 'react';

interface Clock {
  subscribe: (onTick: () => void) => () => void;
  read: () => number;
}

// One shared ticking clock per interval, running only while someone is subscribed.
const clocks = new Map<number, Clock>();

function clockFor(intervalMs: number): Clock {
  const existing = clocks.get(intervalMs);
  if (existing) return existing;

  let now = Date.now();
  let timer: ReturnType<typeof setInterval> | undefined;
  const listeners = new Set<() => void>();
  const clock: Clock = {
    subscribe(onTick) {
      listeners.add(onTick);
      if (timer === undefined) {
        // The clock was idle: catch up straight away so a fresh timer never shows a stale time.
        now = Date.now();
        timer = setInterval(() => {
          now = Date.now();
          listeners.forEach((l) => l());
        }, intervalMs);
      }
      return () => {
        listeners.delete(onTick);
        if (listeners.size === 0 && timer !== undefined) {
          clearInterval(timer);
          timer = undefined;
        }
      };
    },
    read: () => now,
  };
  clocks.set(intervalMs, clock);
  return clock;
}

const paused = () => () => {};

/** Current time, refreshed every `intervalMs` while `active` is true. */
export function useNow(intervalMs = 1000, active = true): number {
  const clock = clockFor(intervalMs);
  return useSyncExternalStore(active ? clock.subscribe : paused, clock.read, clock.read);
}
