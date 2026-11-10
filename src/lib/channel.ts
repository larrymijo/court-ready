/**
 * Which copy of the app this is. The beta copy is served from /<repo>/beta/ and keeps its own
 * data, so trying a new version there can never touch the workouts saved by the main app.
 *
 * scripts/finish-web-build.mjs writes the answer into the page of each web build. That is what
 * counts on the hosted app, because it can't be stale the way a cached bundle could be. The
 * environment variable covers `EXPO_PUBLIC_CHANNEL=beta npx expo start` while developing.
 */
const built = (globalThis as { __COURT_READY_CHANNEL__?: string }).__COURT_READY_CHANNEL__;

export const IS_BETA = (built ?? process.env.EXPO_PUBLIC_CHANNEL) === 'beta';

/** Key the saved data lives under on the phone. */
export const STORE_KEY = IS_BETA ? 'court-ready-beta' : 'court-ready';
