# Court-Ready polish plan

Written 9 Nov 2026 from the code on `main` of `larrymijo/court-ready` and the agreed design. Revised the same day: plans are built by the user, and Mass and Definition are samples.

Design reference: [Court-Ready Monochrome canvas](https://claude.ai/artifact/2C6G8CAQJLNT8wrDwTv3LU) with eight screens: Today, Plan, Edit plan, Workout, Rest timer, Progress, Daily check-in, Library.

## 1. Scope

- **Goal:** a workout tracker where you build your own plans from a large exercise library, based on the exercises you prefer. Three plans come preloaded: Court-Ready, and two samples, Mass and Definition.
- **Target:** the web app at `larrymijo.github.io/court-ready`, installed on the iPhone home screen.
- **Not a target:** polishing the Android APK, a native iPhone build, accounts or a server. Data stays on the phone.
- **Agreed design decisions:**
  - Strict greyscale on true black. White is the only accent. Red appears only for pain 4+ and delete.
  - Dark only for now.
  - The workout screen shows one set at a time and replaces the current set table.
  - Exercise movements are shown as two-position greyscale photo loops (start and end), not video.

## 2. What you asked for and where it lands

| You asked for | In the app today | What changes | Phase |
|---|---|---|---|
| Polished, professional, monochrome | Navy background with blue, orange, green and amber | New colour and type system, restyled components, four tabs | 1 |
| Better iPhone usability | Tick and RIR controls are 30 to 40 px wide; main actions sit mid-screen | 44 px minimum targets, one main action pinned in thumb reach, steppers so the keyboard is optional | 1, 4 |
| Choose which day to do | Today only offers the scheduled day; other days start from the Routines tab | "Choose another day" on Today, and every day startable from the Plan tab | 1 |
| A big exercise library | 49 exercises chosen for Court-Ready | 117 exercises covering the common gym lifts, with search and filters | 2 |
| Create your own exercises | Not possible | New-exercise form; your exercises work in plans, workouts and stats | 2 |
| Exercise animations | Text instructions only | Two-position photo loop on 113 of the 117 exercises | 2 |
| Build your own plans | The plan is fixed in code | Plan editor: days, exercises, sets, reps, rest. Copy, edit or delete any plan | 3 |
| Sample plans you can delete | One programme | Mass and Definition preloaded as samples, deletable and restorable | 3 |
| Switch between plans | Not possible | Plan list with one active plan; each plan keeps its place | 3 |
| Better rest timer | Small bottom bar that disappears at zero; on iPhone nothing signals the end | Full-screen ring, next set shown, sound at zero, overtime count, rest remembered per exercise | 4 |
| Future weights from the last log | One text hint per exercise ("beat it by a rep") | A target for every set with the reason, and rules for too easy and too hard | 4 |
| Suggested warm-up series | Ramp-up sets offered on the first exercise only | Warm-up row on each first heavy lift per muscle group, added with one tap | 4 |
| Log weight, calories, sleep | Weight and waist only | Daily check-in: weight, sleep, calories, protein, steps | 5 |
| Steps sync later | Not possible from a web app | Typed in for now; options listed under Later | 5, 8 |
| Muscles trained the most | List of sets per muscle for this week | Body map, ranking, comparison with the plan, any period | 6 |
| More, better and overall stats | Weekly numbers and one chart per exercise | Overview, Muscles, Lifts and Body views over 4 weeks, 12 weeks, the plan or all time | 6 |
| Better exercise suggestions | Fixed swap list per exercise | Ranked suggestions with a reason, and "below plan this week" additions | 7 |

## 3. Phases at a glance

| Phase | What you get | Size | Needs |
|---|---|---|---|
| 0. Safety net | Data migrations that cannot lose workouts, backup reminder, a beta link to try things first | Small | |
| 1. Monochrome shell | The new look on every screen, four tabs, day picker on Today | Large | 0 |
| 2. Exercise library | 117 exercises with photo loops and instructions, search and filters, your own exercises | Large | 1 |
| 3. Plans | Plan editor, Mass and Definition samples, plan switcher | Large | 2 |
| 4. Workout flow | One-set-at-a-time logging, new rest timer, warm-ups, per-set targets | Large | 1 |
| 5. Daily check-in | Weight, sleep, calories, protein and steps in one sheet | Medium | 1 |
| 6. Stats | Body map, muscle balance, lift trends, body trends | Large | 3, 4, 5 |
| 7. Smarter suggestions | Ranked swaps and additions for muscles below plan | Small | 2, 6 |
| 8. Later | Health sync, light theme, sharing plans | Not scheduled | |

The library and plans (2 and 3), the workout flow (4) and the check-in (5) do not depend on each other, so that order can change. Each phase ships on its own.

## 4. Design system

Colours, type, spacing, touch sizes, how meaning is shown without colour, and navigation are in [design.md](design.md).

## 5. Preloaded plans

All three are ordinary plans: you can edit, copy and delete them. A deleted preloaded plan can be added back from the Plan tab.

**Court-Ready.** Unchanged: Upper A, Lower + Core, Upper B and Bonus on fixed weekdays around volleyball and basketball, with the 12-week cycle and game mode.

**Mass (sample).** Push, Pull, Legs. Do the next day in order whenever you train; five or six sessions a week builds the most. Add reps, then weight. Every sixth week is lighter.

| Day | Exercise | Sets × reps | Rest |
|---|---|---|---|
| Push | Barbell bench press | 4 × 6–10 | 2:30 |
| | Incline dumbbell press | 3 × 8–12 | 2:00 |
| | Dumbbell shoulder press | 3 × 8–12 | 2:00 |
| | Lateral raise | 4 × 12–20 | 1:00 |
| | Cable fly | 3 × 10–15 | 1:30 |
| | Rope pushdown | 3 × 10–15 | 1:15 |
| Pull | Lat pulldown | 4 × 8–12 | 2:00 |
| | Seated cable row | 3 × 8–12 | 2:00 |
| | One-arm dumbbell row | 3 × 8–12 | 2:00 |
| | Face pull | 3 × 12–20 | 1:15 |
| | Dumbbell curl | 3 × 8–12 | 1:15 |
| | Hammer curl | 3 × 10–15 | 1:00 |
| Legs | Barbell back squat | 4 × 6–10 | 2:30 |
| | Romanian deadlift | 3 × 8–10 | 2:00 |
| | Leg press | 3 × 10–12 | 2:00 |
| | Seated leg curl | 3 × 10–15 | 1:30 |
| | Leg extension | 3 × 12–15 | 1:15 |
| | Standing calf raise | 4 × 10–15 | 1:00 |

One full rotation, counting helper muscles as half a set: chest 10, back 11.5, shoulders 13.5, biceps 11, triceps 8, quads 10, hamstrings 6, glutes 5, calves 4. Two rotations a week doubles that.

**Definition (sample).** Upper, Lower. Four sessions a week in order. Hold your weights instead of chasing more. No lighter week planned.

| Day | Exercise | Sets × reps | Rest |
|---|---|---|---|
| Upper | Barbell bench press | 3 × 6–10 | 2:30 |
| | Lat pulldown | 3 × 8–12 | 2:00 |
| | Incline dumbbell press | 3 × 8–12 | 2:00 |
| | Seated cable row | 3 × 8–12 | 2:00 |
| | Lateral raise | 3 × 12–20 | 1:00 |
| | Dumbbell curl | 2 × 10–15 | 1:00 |
| | Rope pushdown | 2 × 10–15 | 1:00 |
| Lower | Barbell back squat | 3 × 6–10 | 2:30 |
| | Romanian deadlift | 3 × 8–10 | 2:00 |
| | Leg press | 3 × 10–12 | 2:00 |
| | Seated leg curl | 3 × 10–15 | 1:30 |
| | Standing calf raise | 3 × 10–15 | 1:00 |
| | Cable crunch | 3 × 10–15 | 1:00 |

At four sessions a week: chest, back, shoulders, quads and hamstrings 12 each, biceps and triceps 10, glutes 9, calves 6, core 6.

Notes on both samples:
- They are deliberately simple and do not account for sport, injuries or what your gym has. Any exercise can be swapped in the editor.
- "Incline dumbbell press" is the low-incline press already in the app. Barbell bench press, dumbbell shoulder press, lat pulldown, barbell back squat, Romanian deadlift (barbell) and leg extension are new to the library.
- They ship without calorie numbers. You can set your own targets on any plan.

## 6. Exercise library

117 built-in exercises: the 49 the app has now, kept as they are, plus 68 common lifts.

| Group | Total | Added in phase 2 |
|---|---|---|
| Chest | 18 | Barbell bench press, incline barbell bench press, decline barbell bench press, dumbbell bench press, dumbbell fly, incline dumbbell fly, chest dip, Smith machine bench press, dumbbell pullover |
| Back | 19 | Pull-up, chin-up, lat pulldown, close-grip lat pulldown, barbell row, T-bar row, straight-arm pulldown, inverted row, deadlift, rack pull, barbell shrug, dumbbell shrug |
| Shoulders | 13 | Overhead press, dumbbell shoulder press, Arnold press, machine shoulder press, cable lateral raise, front raise, rear delt fly, upright row |
| Shoulder care | 7 | None |
| Biceps | 9 | Barbell curl, EZ-bar curl, incline dumbbell curl, preacher curl, concentration curl |
| Triceps | 9 | Skull crusher, dumbbell overhead triceps extension, close-grip bench press, bench dip, triceps dip, triceps kickback |
| Quads and glutes | 17 | Barbell back squat, front squat, hack squat, leg extension, walking lunge, step-up, Smith machine squat, hip thrust, glute bridge, cable pull-through, cable kickback, hip abduction machine, hip adduction machine |
| Hamstrings | 7 | Romanian deadlift, good morning, glute-ham raise |
| Calves | 3 | Seated calf raise |
| Core | 12 | Plank, crunch, hanging leg raise, knee raise, Russian twist, ab wheel rollout, mountain climber, bicycle crunch |
| Other | 3 | Wrist curl, farmer's walk, kettlebell swing |

- **Where the additions come from:** `yuhonas/free-exercise-db`, a public-domain set (Unlicense) of 876 exercises, each with muscles, equipment, how-to steps and a start and an end photo. All 68 additions were found in it by name.
- **Photos:** 113 of the 117 exercises have a pair. The four without are shoulder-care drills (scapular push-up, wall slide, prone Y raise, open book), which keep text only. Matching was done by name and I opened one pair; each pair still needs a look when it is built.
- **Each added exercise gets:** name, main and helper muscles, equipment, weight step, a short how-to adapted from the set, and its photo loop. The 49 existing exercises keep their hand-written technique text.
- **Your own exercises:** name, main muscle, helper muscles, equipment, how it is logged (weight and reps, or reps only), weight step and notes. They appear everywhere built-in ones do. Deleting one hides it from the library but keeps your history.

## 7. Phases in detail

### Phase 0. Safety net

Every later phase changes how data is saved, and the only copy of your training history is on your phone.

Work:
- Add this plan as `docs/polish-plan.md` and section 4 as `docs/design.md`.
- `src/store/migrations.ts`: numbered migration steps. `useStore.ts` raises the persist `version` with each change and runs the steps. `importData` runs the same steps, so old backups always import. `ExportData.version` follows the store version.
- Before a migration runs, keep the untouched previous state under a second storage key until the next migration.
- `settings.lastExportAt`. Today shows a quiet "Back up" row when the last export is older than 14 days. Settings shows how much storage is used.
- Tests in `src/store/__tests__/migrations.test.ts` with a made-up version 1 export. Your real export is not committed, because the repository is public.
- `.github/workflows/ci.yml`: the Android job runs only when started by hand. A `beta` branch builds to `/court-ready/beta/` with its own storage key and app name, and deploys together with `main`.

Done when: the version 1 fixture imports and exports unchanged, the app on `main` behaves as before, and the beta link installs as a second home-screen icon with separate data.

### Phase 1. Monochrome shell

You get: the agreed look on every screen, four tabs, and "Choose another day" on Today.

Work:
- `src/theme.ts`: replace the palette with the tokens in section 4. Remove the blue, orange, green and amber tokens. `TONE` shrinks to plain, strong and danger. `PHASE_COLOR` goes away.
- `src/components/ui.tsx`: restyle `Txt`, `Screen`, `PageHeader`, `Card`, `Button`, `IconButton`, `Chip`, `Stat`, `SectionTitle`, `ProgressBar`, `ToggleRow`, `Segmented`, `EmptyState`. Add `Stepper`, `ListRow`, `StatTile`, `Tag`, `BottomBar` (pinned primary action) and `Sheet` (the restyled `ActionSheet`).
- Tabs in `src/app/(tabs)/`: `routines.tsx` becomes `plan.tsx`, `guide.tsx` becomes `library.tsx` with Exercises and Guide segments, `history.tsx` moves to `src/app/history/index.tsx` and is opened from Progress.
- Today (`index.tsx`): hero card with the next session, a week strip using dots and rings (`WeekStrip.tsx`), "Choose another day" opening a sheet of every routine through the existing `startRoutineFlow`. On sport and rest days the card says what is scheduled and offers "Train anyway".
- Re-skin without behaviour changes: `WorkoutCard`, `WorkoutBanner`, `ItemBadge`, `PainPicker`, `LineChart`, `GuideBlocks`, `RichText`, `NumInput`, exercise, routine, history and settings screens.
- Web app polish: `public/manifest.json`, `app.json` and `scripts/finish-web-build.mjs` move to `#000000`. New monochrome icons in `public/icons/` and `assets/images/`. No tap highlight, text selection or long-press callout on controls. Decimal keypad on number fields. A "new version, reload" notice that never interrupts an open workout.

Done when: no hue is left except `danger`, every screen matches section 4, no target is under 44 px, and you have used the beta for a normal session.

### Phase 2. Exercise library

You get: 117 exercises you can search and filter, a photo loop and how-to on almost all of them, and your own exercises.

Work:
- Split `src/data/exercises.ts` into `src/data/exercises/` by muscle group and add the 68 exercises of section 6. `Equipment` gains `barbell` and `kettlebell`. `MuscleGroup` gains `forearms`. `kind` becomes `standard` or `care`.
- `scripts/build-library.mjs` drafts name, muscles, equipment and how-to steps for the additions from the photo set's data. The result is reviewed and committed as data; the app never fetches it.
- `scripts/build-exercise-media.mjs` crops each photo pair, resizes to 480 px and converts to greyscale WebP (about 20 KB a frame, roughly 4.5 MB in total) into `public/media/`. The phone caches them in the background after install, exercises in your plans first.
- `MovementLoop` component: cross-fades the two frames, pauses on tap, stays still when the phone asks for reduced motion. Used in the library, the exercise page and later the workout screen.
- Your own exercises: `customExercises` in the store and a form (canvas screen "Library", "New exercise"). `getExercise(id)` looks in built-in then custom, and every screen uses it instead of reading `EXERCISE_BY_ID`. An id that no longer exists shows as "Removed exercise", so old workouts never break.
- Library tab (`src/app/(tabs)/library.tsx`, `src/app/exercises.tsx`): search, muscle chips, equipment filter, sections for "In your plans" and "Recent", and the exercise page with loop, how-to, history and records. The same list is the picker when adding to a workout or a plan, with several picks at once.
- A credits line for the photo set in Library.
- Tests: ids are unique, every field is valid, every media entry has two files, the lookup handles custom and removed exercises.

Done when: all 117 are searchable with no signal, 113 show a loop, and an exercise you created can be logged, appears in history and stats, and can be removed without breaking either.

### Phase 3. Plans

You get: build, edit, copy and delete plans, the two samples, and switching between plans.

Work:
- New `Plan` type (section 8). Plans live in saved data, not in code. The first run after the update creates Court-Ready, Mass and Definition from templates in `src/data/plan-templates/`. Today's `routines.ts` and `schedule.ts` become the Court-Ready template.
- `RoutineId` becomes a plain string. `src/lib/program.ts` stops naming `bonus` and `lower` and reads flags on the day. Court-Ready keeps its 12-week cycle and game mode. Simple plans have no phases, only an optional lighter week every N weeks.
- Store: `plans`, `activePlanId`, a start date per plan, `Workout.planId`. Existing data migrates to the Court-Ready plan.
- Plan tab (canvas screen "Plan"): the plan list with "New plan". Each plan's menu has Edit, Copy and Delete. Deleting asks first and never touches history. Deleting the active plan asks which plan to switch to. "Restore preloaded plans" adds back any of the three that are missing and never overwrites one you edited.
- Plan editor (canvas screen "Edit plan"):
  - Name.
  - Days as tabs: add, rename, reorder, copy, delete.
  - Exercises picked from the Library, several at once.
  - Per exercise: sets, rep range and rest. Defaults: 3 × 8–12 with 2:00 rest for compound lifts, 3 × 10–15 with 1:15 for isolation work.
  - Reorder by dragging, remove, and "superset with next".
  - Plan options: days in order or on fixed weekdays; add reps then weight, or hold weights; lighter week off or every 4th to 8th; optional targets for calories, protein, steps and weight change.
  - Live feedback while you edit: sets and estimated time per day, and hard sets per muscle.
- All edits are pure functions in `src/lib/planEdit.ts` with tests.
- Today suggests the scheduled day (weekday plans) or the next day in order, and still lets you pick any day.
- `src/lib/body.ts`: the weekly check-in compares your weight trend with the active plan's goal when one is set. Court-Ready keeps its current wording and thresholds.
- Mass and Definition are written exactly as in section 5.

Done when: you can build a plan from nothing in the app and train with it, Mass and Definition can be deleted and restored, switching plans keeps each plan's place and all history, and a test proves Court-Ready prescribes exactly the same sets as before for every week.

### Phase 4. Workout flow

You get: logging a whole session with one thumb, a rest timer you can read from the floor, warm-ups and targets worked out for you. It works the same for any plan and any exercise, including your own.

**Logging** (`src/app/workout.tsx`, `src/components/workout/`)
- One exercise per screen: name, target line, movement loop, "Last time" next to "Today".
- Sets as rows: done sets compact, the current set as a card with weight and reps steppers and RIR chips, later sets greyed with their target.
- Weight steps by the exercise's `increment`. Tapping a number opens the keypad. "Log set" is pinned at the bottom.
- Tapping a done set reopens it for editing. Add set, remove set and warm-up toggle sit in the row menu.
- Supersets advance by themselves: after 5a the screen moves to 5b with the right rest.
- Tapping the set counter opens an overview of all exercises to jump around. Court-Ready's 8-minute warm-up checklist becomes its first page.
- Pain rating, notes, swap and "How to do it" stay, in the exercise menu. Pain 4+ keeps its stop banner. "Add exercise" uses the Library picker.

**Rest timer** (`RestTimerBar.tsx` becomes `RestTimer.tsx`)
- Opens full screen after a logged set: ring, large time, minus and plus 15 s, skip, and the next set with its target. Swipe down to shrink it to a bar.
- At zero: a short sound and a flash, then it counts up ("over by 0:20") until the next set is logged, so you can see how long you really rested.
- Rest changed with plus or minus is remembered for that exercise. Actual rest is saved with each set.
- Sound uses Web Audio in a new `src/lib/sound.web.ts`, armed on the tap that logs the set.

**Warm-up series** (new `src/lib/warmup.ts`, replacing `rampUpSets`)
- First heavy lift of the session: about 50% × 10, 70% × 5, 85% × 2 (today's rule).
- First heavy lift for a muscle group not yet worked that day: about 60% × 6 and 80% × 3.
- Isolation work and already-warm muscles: none. Very light working weights: one set.
- Rounded to the exercise's weight step. Shown as a "Warm-up" row and added with one tap.

**Targets** (`src/lib/progression.ts`)
- A target for each set, for example 22 kg × 10, 10, 9 after last time's 10, 9, 8.
- Every set at the top of the range: add weight and restart at the bottom of the range.
- Last time clearly too easy by logged RIR: add weight sooner.
- Under the bottom of the range two sessions running: step the weight down.
- More than two weeks since the exercise was done: start about 10% lighter.
- Lighter weeks keep the weight, as now. Plans set to "hold weights" aim to match last time.
- Each target shows its reason in one line. The finish screen lists next time's targets.

Data: `WorkoutSet.doneAt`, `WorkoutSet.restSec`, `Settings.restSound`, `Settings.restFullScreen`, `Settings.restByExercise`.

Done when: a full session can be logged without the keyboard, the timer shows the right time after switching apps, the end-of-rest sound is confirmed on your iPhone with music playing, and every old workout still opens.

### Phase 5. Daily check-in

You get: one sheet for weight, sleep, calories, protein and steps, opened from Today.

Work:
- `DayLog` replaces `BodyEntry` (section 8). Existing weigh-ins and waist values migrate.
- Check-in sheet as on the canvas: weight stepper with the 7-day average, sleep length and a 1 to 5 "rested" score, calories and protein with quick-add amounts and your own presets, steps typed in. Past days are editable.
- Today shows four tiles with today's values, against the active plan's targets when it has them.
- Progress, Body view: weight with a 7-day average line and weekly rate, waist, calorie and protein averages, step average, sleep average.
- Backup export and import include the new data.

Done when: a full check-in takes under 15 seconds with one hand and your old weigh-ins are all there.

### Phase 6. Stats

You get: a Progress tab that answers "what have I trained most", "am I getting stronger" and "is my body changing".

Work:
- Views: Overview, Muscles, Lifts, Body, plus History. Period: 4 weeks, 12 weeks, this plan, all time.
- Overview: sessions done against planned, hard sets, volume, records, each with the change from the previous period; most-trained body map; a consistency grid; key lift trend.
- Muscles: front and back body map where brighter means more hard sets; per muscle, sets per week against what the active plan prescribes, with a small trend; flags for below and above plan.
- Lifts: exercises ranked by estimated 1-rep-max change; record timeline; the existing exercise screen restyled.
- Session numbers: average length and average rest.
- `src/lib/stats.ts` grows period helpers, sets per muscle per week, adherence, lift trends. Every number on screen has a unit test.
- `src/components/charts/`: line, bar, sparkline, dot grid and `BodyMap`. Body map candidate: `react-native-body-highlighter` 3.2.0 (MIT, only needs `react-native-svg`, which the app already has). If it does not render well on the web build, draw our own.

Done when: the body map and the ranking agree, empty states read well with no data, and a year of generated data scrolls smoothly.

### Phase 7. Smarter suggestions

Work:
- Each exercise gets a movement `pattern` and joint `stress` tags in the library data.
- New `src/lib/suggest.ts` ranks swaps: curated swaps first where they exist, then same pattern and muscle, exercises you have history with, equipment you use, and lower joint stress when pain was logged. Each suggestion shows its reason.
- At the end of a workout it can offer up to three additions for muscles that are below the plan this week.
- The picker gets a Recommended section.
- README and screenshots refreshed.

Done when: every suggestion says why it is suggested, and a pain rating of 4+ offers lower-stress options first.

### Phase 8. Later, not scheduled

- **Health sync for steps, weight and sleep.** A web app cannot read Apple Health. The routes are a Shortcut that hands the numbers to the app, a native iPhone build (needs a paid Apple developer account), or staying manual. Decide after a few weeks of using the check-in.
- **Sharing a plan** as a file or link, so a plan you built can be given to someone else.
- **Light theme.** Cheap once the tokens exist.
- **Photos for your own exercises.**
- **Rest alerts while the phone is locked.** Needs push notifications and a server.

## 8. Data after all phases

```ts
interface Plan {
  id: string;
  name: string;
  template?: 'court-ready' | 'mass' | 'definition';   // set on preloaded plans, so they can be restored
  schedule: { kind: 'rotation' } | { kind: 'weekdays'; week: DayPlan[] };
  days: Routine[];                    // items: exerciseId, sets, repsMin, repsMax, restSec, rir?, group?, cue?
  cycle?: { phases: PhaseId[]; repeatFrom: number };  // Court-Ready's 12 weeks
  lighterWeekEvery?: number;          // simple plans
  progression: 'progress' | 'maintain';
  targets?: {
    kcal?: number; kcalRestDay?: number; proteinG?: number; steps?: number;
    weightPctPerWeek?: [number, number];
  };
}

interface DayLog {
  date: string;                       // YYYY-MM-DD
  weight?: number; waist?: number;
  kcal?: number; proteinG?: number;
  steps?: number;
  sleepMin?: number; rested?: 1 | 2 | 3 | 4 | 5;
}

// Persisted store
plans: Plan[];
activePlanId: string | null;
planState: Record<string, { start: string }>;
customExercises: ExerciseDef[];       // ids start with "custom_"; removed ones are kept as archived
workouts: Workout[];                  // + planId; sets gain doneAt, restSec
dayLogs: DayLog[];                    // replaces body[]
settings: Settings;                   // + restSound, restFullScreen, restByExercise, lastExportAt

// ExerciseDef gains
equipment: ... | 'barbell' | 'kettlebell';
archived?: boolean;
media?: string;                       // id in the photo set
pattern?: 'push-h' | 'push-v' | 'pull-h' | 'pull-v' | 'squat' | 'hinge' | 'lunge'
        | 'curl' | 'extension' | 'raise' | 'core' | 'care';
stress?: Partial<Record<'shoulder' | 'elbow' | 'knee' | 'lowback', 1 | 2 | 3>>;
```

## 9. Risks and limits

- **Losing history in a migration.** Covered by phase 0 and by trying each phase on the beta link first.
- **Plans become data.** Once plans are saved on the phone, a change to their format needs a migration like any other data. Improvements to a preloaded plan reach you only through "Restore preloaded plans", never by overwriting your edits.
- **iPhone web app limits.** No vibration. No sound once the phone is locked or the app is in the background. The silent switch and other apps' music may affect the rest sound, so phase 4 includes a test on your phone before the behaviour is fixed.
- **A bad release during a session.** `main` deploys straight to your phone, so changes go to `beta` first and are merged after one real workout.
- **Training content.** The sample plans and every default are general guidance, not advice for your body. Court-Ready's pain rules stay as they are.
- **Photo set.** Photos come from different shoots, so loops will not look identical, and four drills have none.
- **Storage.** Safari gives a web app about 5 MB for saved data. A year of training is roughly 0.6 MB of text, so there is room for several years. Settings will show usage, and the data moves to a larger store before it gets close. Photos are cached separately and do not count against this.
- **Expo changes quickly.** Follow `AGENTS.md`: read the SDK 57 docs before touching Expo APIs and add packages with `npx expo install`.

## 10. Open questions

Each has the assumption I will use unless you say otherwise.

1. The first sample's name. You called it "strength" in your last message; I kept "Mass", the muscle-building plan you first described. A true strength plan (heavier, 3 to 6 reps) would be a different table.
2. Court-Ready is treated like the samples: editable, deletable, restorable.
3. A beta link as a second home-screen icon. Assumed yes.
4. Stop building the Android APK on every push. Assumed yes.
5. The app icon in monochrome. I will propose two options in phase 1.

## 11. How the work runs

- One phase is one or a few pull requests. Each must pass `npm run lint`, `npm run typecheck` and `npm test`, and a screen-by-screen comparison with section 4 at 390 × 844.
- Changes land on `beta`. After you train with it once, they are merged to `main`.
- Where to build: on the PC, in `Documents\court-ready` (Git and Node 22 were installed on 10 Nov 2026), where the app runs in a live preview while it is being built.
