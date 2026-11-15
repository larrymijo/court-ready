// The four sports a session can be started for, what a session of each logs, and its own warm-up
// and cool-down (docs/polish-plan.md, phase 4). Not saved data, but plans and finished sessions
// point to these ids, so a sport id or a checklist id here never changes once it has shipped.
// The checklists themselves live in src/data/checklists.ts.
import type { SportDef, SportId } from '@/lib/types';

export const SPORTS: SportDef[] = [
  {
    id: 'volleyball',
    name: 'Volleyball',
    warmup: 'game',
    cooldown: 'after-playing',
    logsDistance: false,
    logsMatch: true,
  },
  {
    id: 'basketball',
    name: 'Basketball',
    warmup: 'game-basketball',
    cooldown: 'after-playing',
    logsDistance: false,
    logsMatch: true,
  },
  {
    id: 'football',
    name: 'Football',
    warmup: 'football-warmup',
    cooldown: 'football-cooldown',
    logsDistance: false,
    logsMatch: true,
  },
  {
    id: 'running',
    name: 'Running',
    warmup: 'running-warmup',
    cooldown: 'running-cooldown',
    logsDistance: true,
    logsMatch: false,
  },
];

const BY_ID: Record<string, SportDef> = Object.fromEntries(SPORTS.map((s) => [s.id, s]));

/** The sport with this id, or undefined for an id this app doesn't know (saved by a newer app, or junk). */
export function sportDef(id: SportId | string): SportDef | undefined {
  return Object.prototype.hasOwnProperty.call(BY_ID, id) ? BY_ID[id] : undefined;
}
