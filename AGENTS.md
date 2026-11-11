This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## This project: shipping and saved data

- The plan is `docs/polish-plan.md` and the design system is `docs/design.md`. Read both before changing screens.
- `main` is the app the owner trains with. A push to `main` runs CI and then the Pages workflow, and the result is live on their phone. A push to `beta` publishes the beta copy at `/court-ready/beta/`, which keeps its own saved data. Build a new phase on `beta` first, and never push either branch without the owner's explicit OK.
- The owner's training history exists only in the app's storage on their phone. Any change to the shape of saved data needs a step in `src/store/migrations.ts`, a raised `DATA_VERSION`, and a test in `src/store/__tests__/migrations.test.ts`.
- The app's visible name is Hybrid; "Court-Ready" is the name of its example plan. These names must never change, because the owner's saved data hangs on them: the web address path `/court-ready/`, the storage keys `court-ready` and `court-ready-beta`, the backup marker `app: 'court-ready'`, the offline cache name prefixes, the app ids `com.larrymijo.courtready`, the Expo slug and link scheme, and the repository name.
- Never commit a real backup file: the repository is public. Test data is made up (`src/store/__tests__/fixtures/`).
- GitHub Actions can't be run locally. After a push, check that the CI and Pages runs passed and open the published app before saying it shipped.
