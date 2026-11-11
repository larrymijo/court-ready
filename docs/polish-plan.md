# Hybrid roadmap

This is the Court-Ready polish plan (first written 9 Nov 2026), revised on 11 Nov 2026 for a broader direction: the app becomes **Hybrid**, one place for sport and gym training in the same weekly plan. The file keeps its name so existing links still work.

**Status on 11 Nov:** this revision was approved on 11 Nov, keeping the current web address. Phase 0 is live in your main app. Phase 1 is built and live on the beta copy, not yet in your main app. Nothing in the new direction is built yet.

Design reference: [Court-Ready Monochrome canvas](https://claude.ai/artifact/2C6G8CAQJLNT8wrDwTv3LU) with eight screens. The new screens (plan list, week view, week editor, sport session) are drawn there at the start of their phase and agreed before they are built.

## What changed in this revision

- The app is renamed **Hybrid** (phase 2). "Court-Ready" stays as the name of the example plan built around volleyball and basketball.
- Every plan is a **weekly split**: each day holds gym workouts, sport sessions, or nothing (a rest day).
- **Sports become sessions** you start, warm up for, log and cool down from, like a gym workout: volleyball, basketball, football (soccer) and running.
- Gym workouts also get a **cool-down** of stretches.
- Plans can **mix gym and sport**, including the plans you create.
- **Plan suggestions** become their own late phase, kept apart from the plan system.
- "Mass" is now called **Muscle Mass Building**. It and Definition move from "next day in order" to fixed weekdays. Their exercises are unchanged.
- The old phase 3 (plans) is split: plans and weekly splits come first (phase 3), and creating your own plans comes after the library (phase 6). Phases are renumbered:

| Before | Now | Status |
|---|---|---|
| 0. Safety net | 0. Safety net | Live since 10 Nov |
| 1. Monochrome shell | 1. Monochrome shell | Live on the beta copy since 10 Nov |
| | 2. Hybrid name | New |
| 3. Plans | 3. Plans and weekly splits, and 6. Custom and hybrid plans | Split in two |
| | 4. Sports sessions | New |
| 2. Exercise library | 5. Exercise library | Moved after plans and sports |
| 4. Workout flow | 7. Workout flow | Unchanged |
| 5. Daily check-in | 8. Daily check-in | Unchanged |
| 6. Stats | 9. Stats | Adds sports |
| 7. Smarter suggestions | 10. Exercise suggestions | Unchanged |
| | 11. Plan suggestions | New |
| 8. Later | 12. Later | Adds items |

## 1. Scope

- **Goal:** Hybrid is a workout tracker for people who play sport and train in the gym. You follow a plan whose week mixes gym workouts and sport sessions, you can start any workout on any day, and you can build your own plans from a large exercise library. Three example plans come ready to use: Court-Ready, Muscle Mass Building and Definition.
- **Target:** the web app at `larrymijo.github.io/court-ready`, installed on the iPhone home screen. The address stays the same after the rename (decided 11 Nov, section 13).
- **Not a target:** polishing the Android APK, a native iPhone build, accounts, a server, or GPS tracking. Data stays on the phone.
- **Stays as it is:** logging sets, the rest timer, the warm-up checklists and ramp-up sets, pain ratings and swaps, game mode, the 12-week cycle, history and records, the guide, backups, working offline, and the beta copy. Later phases change these only where their own section says so.
- **Agreed design decisions:**
  - Strict greyscale on true black. White is the only accent. Red appears only for pain 4+ and delete.
  - Dark only for now.
  - The workout screen shows one set at a time and replaces the current set table (phase 7).
  - Exercise movements are shown as two-position greyscale photo loops (start and end), not video.

## 2. What you asked for and where it lands

"Now" means your main app; the beta copy already has phase 1.

| You asked for | Now | What changes | Phase |
|---|---|---|---|
| Polished, professional, monochrome | Navy with blue, orange, green and amber | Done on the beta copy | 1 |
| Rename the app to Hybrid | Called Court-Ready everywhere | Visible name and icon become Hybrid; the example plan keeps the name Court-Ready; your data stays where it is | 2 |
| Browse, choose and switch plans | One plan, fixed in code | Plan list with previews, one active plan, each plan keeps its place | 3 |
| Weekly splits with workouts and rest days | Court-Ready's week, fixed in code | Every plan has a Monday-to-Sunday week; each day holds sessions or rest | 3 |
| Keep Court-Ready, Definition and Muscle Mass Building as examples | Court-Ready only; the other two exist only in this document | All three ready to use, deletable and restorable | 3 |
| Start any workout, whatever today's plan says | Any Court-Ready gym session from the Routines tab, or an empty workout | Any session of any plan, gym or sport, from Today and the Plan tab | 3, 4 |
| Sports as daily workouts | Volleyball and basketball are labels on the week; they can't be started or logged | Volleyball, basketball, football and running as sessions you start, log and see in history | 4 |
| Warm-up before a sport, stretching after, also for the gym | Two gym warm-up checklists; the game warm-up and after-playing stretches are guide text | Warm-up and cool-down checklists for every sport and every gym workout | 4 |
| A big exercise library | 49 exercises | 117 lifts and about 30 warm-up drills and stretches, with search and filters | 5 |
| Create your own exercises | Not possible | New-exercise form | 5 |
| Exercise animations | Text only | Two-photo loops on most exercises, drills and stretches | 5 |
| Create, name, edit and save your own plans | Not possible | Plan editor: the week, its workouts, their exercises, sports | 6 |
| Plans that mix gym and sport | Only Court-Ready, fixed in code | Any plan, including your own | 3, 6 |
| Better iPhone usability | Small controls, main actions mid-screen | 44 px targets on the beta copy; one-thumb logging later | 1, 7 |
| Better rest timer | Small bar that disappears at zero | Full-screen ring, sound at zero, overtime count | 7 |
| Future weights from the last log | One hint per exercise | A target for every set with its reason | 7 |
| Suggested warm-up series | Ramp-up sets on the first exercise only | Warm-up sets for each first heavy lift per muscle group | 7 |
| Log weight, calories, sleep | Weight and waist only | Daily check-in: weight, sleep, calories, protein, steps | 8 |
| Steps synced later | Not possible from a web app | Typed in for now; options under Later | 8, 12 |
| Muscles trained the most | Sets per muscle for this week | Body map, ranking, comparison with the plan, any period | 9 |
| More, better and overall stats | Weekly numbers and one chart per exercise | Overview, muscles, lifts, body and sports | 9 |
| Better exercise suggestions | A fixed swap list per exercise | Ranked suggestions with a reason | 10 |
| Plan suggestions, later | None | A plan finder and hints, kept apart from the plan system | 11 |
| Keep every workout and setting safe | Versioned data, safety copy, backup reminder | A tested upgrade and a rehearsal with your real data in every phase that changes saved data | all |

## 3. How plans, weeks, sessions and exercises fit together

| Thing | What it is | Example |
|---|---|---|
| Exercise | One movement in the Library, with muscles, equipment, how-to and a photo loop. Warm-up drills and stretches are exercises too. | Barbell bench press; calf stretch |
| Gym workout | A named list of exercises with sets, reps, rest and effort, plus a warm-up and a cool-down | Upper A; Push |
| Sport session | One of the four sports, with that sport's warm-up and cool-down and what you log for it | Volleyball; Running |
| Session | Either of the two: what you train on a day. You start it, warm up, train, cool down and finish it, and it is saved in History. | |
| Warm-up and cool-down | Short checklists of drills or stretches with amounts, before and after a session | "Leg swings, 10 each leg" |
| Weekly split | Monday to Sunday. Each day holds one or more sessions, or none (a rest day). A session can be optional. | Thursday: volleyball or Bonus |
| Plan | A name, its gym workouts and sport sessions, its weekly split, how weights progress, and optional daily targets | Court-Ready |

```
Plan: Court-Ready (the active plan)
├─ Weekly split
│    Mon  Upper A                gym workout
│    Tue  Volleyball             sport session
│    Wed  Lower + Core           gym workout
│    Thu  Volleyball or Bonus    both optional
│    Fri  Basketball             sport session
│    Sat  Upper B                gym workout
│    Sun  Volleyball or rest     optional
├─ Gym workouts: Upper A, Lower + Core, Upper B, Bonus
│    each: exercises with sets × reps, rest and effort; a warm-up; a cool-down
├─ Sport sessions: Volleyball, Basketball
│    each: the sport's warm-up and cool-down; what you log
└─ Settings: 12-week cycle, game mode, daily targets

Library: every exercise, drill and stretch, and the four sports
History: every finished session, gym or sport, with the plan it came from
```

Rules:
- One plan is active. Today, the week strip and "This week" follow it.
- The week suggests; it never restricts. Any session of any plan, any sport or an empty workout can be started on any day. A planned session done on another day of the same week still counts as done.
- A day refers to the plan's workouts and sport sessions, so the same workout can be on several days (Push on Monday and Thursday).
- A sport session uses its sport's warm-up and cool-down. A gym workout uses the warm-up and cool-down chosen for it. Both can be skipped.
- Every finished session keeps its own name, sets or sport numbers, and the name of its plan. Editing, switching or deleting a plan never changes history.

## 4. User flows

**Choose an example plan** (phase 3)
1. Plan tab → **Plans**. Your plans are listed; the examples carry an "Example" tag.
2. Tap Definition. A preview shows its week, each workout's exercises, sessions per week and how weights progress.
3. Tap **Use this plan**. For a plan with a cycle, choose when week 1 starts: this Monday or next.
4. Today now shows Definition's session for today. Court-Ready keeps its place, and your history and records stay.

**Create and save your own plan** (phase 6)
1. Plan tab → Plans → **New plan**. Start blank or from a copy of any plan, and give it a name.
2. The week opens, Monday to Sunday. On a day, tap **Add session** and pick one of this plan's gym workouts, **New gym workout**, or a sport. Leave a day empty for rest. Mark a session optional if it is "if I feel like it".
3. A new gym workout: name it, add exercises from the Library (several at once), and set sets, reps and rest for each. Defaults are filled in. A warm-up and a cool-down are chosen for the muscles it trains, and can be changed.
4. A sport: volleyball, basketball, football or running, with an optional name ("Club practice") and planned length.
5. Plan options: how weights progress, a lighter week every few weeks or never, and daily targets if you want them.
6. While you edit, the plan shows sessions per week and hard sets per muscle. If you leave, your work is kept as a draft.
7. **Save**. The app asks whether to use the plan now.

**Switch plans** (phase 3)
1. Plan tab → Plans, tap the plan, **Use this plan**.
2. Going back to a plan with a cycle asks: **Continue at week 5** or **Start again at week 1**.
3. A workout in progress is not affected. It is saved under the plan it was started from.
4. History, records and stats stay. Progress can show this plan only, or everything.

**Train something other than today's plan** (phase 3 for gym, phase 4 for sport)
1. Today shows the session or sessions planned for today, or a rest day.
2. Tap **Choose another workout**, or go to the Plan tab and tap Start on any session.
3. The list shows today's session first, then the rest of this week's plan with what is already done, then the four sports, workouts from your other plans, and an empty workout.
4. Tap Start. Its warm-up opens. The plan does not change, and today's planned session stays on Today until it is done or the day ends.

**Do a sport session** (phase 4)
1. Start Volleyball from Today, the workout list or the Plan tab.
2. Follow the warm-up checklist with its photo loops: tick as you go, or skip.
3. Tap **Start playing**. A clock runs, and the screen may lock while the phone is in your bag.
4. Tap **Finish**. The time is filled in. Add effort from 1 to 10, match or practice, pain if any, and notes. A run asks for the distance and shows your pace.
5. Follow the cool-down checklist, then **Save**. The session appears in History, on the week strip and in "This week".
6. Forgot to start it? **Log a past session** with the date and the same details.

## 5. Design system

Colours, type, spacing, touch sizes, how meaning is shown without colour, and navigation are in [design.md](design.md).

## 6. Example plans

All three are ordinary plans in your list: use them as they are, edit them, copy them or delete them. A deleted example can be added back from the Plan tab, and an edited one can be reset to the original. App updates never overwrite your edits.

**Court-Ready.** Kept exactly as the app has it now:
- Gym workouts: Upper A (chest focus, about 60 min), Lower + Core (about 55 min, with game mode), Upper B (back and chest, about 65 min) and Bonus (optional, about 35 min). Every exercise, set, rep range, effort, rest, cue and superset stays the same, and so do the workout ids that your history points to.
- Week: Mon Upper A · Tue Volleyball · Wed Lower + Core · Thu Volleyball or Bonus, both optional · Fri Basketball · Sat Upper B · Sun Volleyball (optional) or rest.
- Also kept: the 12-week cycle (Learn, Build, Deload, Push, Deload, then again from week 3), game mode, the "adapt it to your week" rules, the upper and lower warm-ups, the game warm-up and after-playing stretches, the guide, and the daily targets (2,100 kcal, 1,900 on rest days, 165 g protein, 10,000 steps, 7,000 on game days).
- What changes: volleyball and basketball become sessions you can start and log (phase 4), and the game warm-up opens as a checklist instead of a guide page.

**Muscle Mass Building (example, formerly "Mass").** Push, Pull, Legs, each twice a week.
- Week: Mon Push · Tue Pull · Wed Legs · Thu Push · Fri Pull · Sat Legs · Sun rest.
- Add reps, then weight. Every sixth week is lighter.

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

Hard sets per week, counting helper muscles as half a set: chest 20, back 23, shoulders 27, biceps 22, triceps 16, quads 20, hamstrings 12, glutes 10, calves 8.

**Definition (example).** Upper, Lower, each twice a week.
- Week: Mon Upper · Tue Lower · Wed rest · Thu Upper · Fri Lower · Sat rest · Sun rest.
- Hold your weights instead of chasing more. No lighter week planned.

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

Hard sets per week: chest, back, shoulders, quads and hamstrings 12 each, biceps and triceps 10, glutes 9, calves 6, core 6.

Notes on both:
- They are deliberately simple: gym only, no sport, no allowance for injuries, no calorie numbers. Add a sport or move a day in the editor (phase 6), or build your own hybrid plan.
- Training fewer days than planned is fine: the week strip shows what is left, and any workout can be started from the list.
- "Incline dumbbell press" is the low-incline press already in the app. Six exercises are new and are added in phase 3: barbell bench press, dumbbell shoulder press, lat pulldown, barbell back squat, Romanian deadlift (barbell) and leg extension.

## 7. Sports, warm-ups and cool-downs

| Session | Warm-up, before | Cool-down, after | What you log |
|---|---|---|---|
| Volleyball | The current game warm-up, word for word (8 min): jog, skips and side shuffles; leg swings and walking lunges with a twist; band external rotation and pull-aparts; scapular push-ups; jumps building to full effort; hitting and serving from half to full power | The current after-playing routine (3 min): cross-body stretch on the hitting arm, open book, calf stretch | Time, effort 1–10, match or practice, pain 0–10 if any, notes |
| Basketball | The same game warm-up without the volleyball step. Proposed addition: layups and shots building to game speed | The same after-playing routine | As volleyball |
| Football (soccer) | New draft, about 10 min: easy jog, leg swings, walking lunges, side shuffles and carioca, skips, three short accelerations, passing over growing distances | New draft, about 5 min: calf, hamstring, quad, hip-flexor and groin stretches, 30 s each | As volleyball |
| Running | New draft, about 8 min: brisk walk or easy jog, leg swings, walking lunges, skips, three or four 15–20 s strides | New draft, about 5 min: easy walk, then calf, hamstring, quad, hip-flexor and glute stretches | Distance, time (pace worked out for you), effort, pain if any, notes |
| Gym workouts | Unchanged: the upper and lower warm-ups and ramp-up sets. Workouts you build get the one that matches their muscles. | New, about 3–4 min: upper days chest, lats, triceps and cross-body shoulder; lower days quads, hamstrings, hip flexors and calves | Sets, as now |

- The new drafts are general guidance. They are written in full in phase 4 and shown to you to approve before they ship, like the example plans were.
- Photo loops: the public-domain photo set has 123 stretches, all with a photo pair, and drills such as arm circles, carioca, skipping, walking lunges, inchworm and World's Greatest Stretch. These were matched by name; each pair gets a look when it is built. There is nothing for high knees, and the four shoulder-care drills stay text, as before.
- Warm-ups and cool-downs are checklists you tick or skip. They are not logged as sets; the finished session records whether you did them.

## 8. Exercise library

117 built-in lifts (the 49 the app has now, kept as they are, plus 68 common lifts) and about 30 warm-up drills and stretches.

| Group | Total | Added |
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
| Warm-up drills and stretches | about 30 | The drills and stretches used by the warm-ups and cool-downs of section 7. They never count as hard sets. |

- **Where the additions come from:** `yuhonas/free-exercise-db`, a public-domain set (Unlicense) of 876 exercises, each with muscles, equipment, how-to steps and a start and an end photo. All 68 lifts were found in it by name.
- **When they arrive:** the six lifts the example plans need come in phase 3, the drills and stretches in phase 4 (as text), and everything else, with all photo loops, in phase 5.
- **Each added exercise gets:** name, main and helper muscles, equipment, weight step, a short how-to adapted from the set, and its photo loop. The 49 existing exercises keep their hand-written technique text.
- **Your own exercises:** name, main muscle, helper muscles, equipment, how it is logged (weight and reps, or reps only), weight step and notes. They appear everywhere built-in ones do. Deleting one hides it from the library but keeps your history.

## 9. Phases at a glance

| Phase | What you get | Size | Needs | Changes saved data |
|---|---|---|---|---|
| 0. Safety net | Tested data upgrades, a safety copy, a backup reminder, the beta copy | Small | | Yes (done) |
| 1. Monochrome shell | The new look on every screen, four tabs, any day from Today | Large | 0 | No |
| 2. Hybrid name | The app is called Hybrid, with a new icon and a data summary to compare before and after updates | Small | 1 in your main app | No |
| 3. Plans and weekly splits | Plan list, three examples, weekly splits, switching plans, any workout on any day | Large | 1 | Yes |
| 4. Sports sessions | Volleyball, basketball, football and running as sessions with warm-ups and cool-downs; cool-downs for gym workouts | Large | 3 | Yes |
| 5. Exercise library | 117 lifts and about 30 drills and stretches with photo loops, and your own exercises | Large | 1, after 3 and 4 | Yes |
| 6. Custom and hybrid plans | Create, edit, copy and delete plans that mix gym and sport | Large | 3, 4, 5 | Yes |
| 7. Workout flow | One-set-at-a-time logging, new rest timer, warm-up sets, per-set targets | Large | 1 | Yes |
| 8. Daily check-in | Weight, sleep, calories, protein and steps in one sheet | Medium | 1 | Yes |
| 9. Stats | Body map, muscle balance, lift trends, body trends, sports | Large | 3, 4, 7, 8 | No |
| 10. Exercise suggestions | Ranked swaps and additions for muscles below plan | Small | 5, 9 | No |
| 11. Plan suggestions | A plan finder and hints, kept apart from the plan system | Medium | 3, 4, 6 in use for a few weeks, and 9 | A little |
| 12. Later | Health sync, sharing plans, light theme and more | | | |

One phase is released at a time, each tried on the beta copy first. The library comes after plans and sports so that exercise data is not changed by two phases at once. The workout flow (7) and the check-in (8) do not depend on plans or sports and can move earlier if you want them sooner.

## 10. Phases in detail

Every phase that changes saved data also follows section 11.

### Phase 0. Safety net (live since 10 Nov)

Built: versioned saved data with tested upgrades (`src/store/migrations.ts`), a safety copy of the data from before each upgrade (Settings offers to go back to it for 30 days), a backup reminder on Today, backup status and storage use in Settings, and the beta copy at `/court-ready/beta/` with its own name and data. The Android APK is built only on request. Every later phase relies on these.

### Phase 1. Monochrome shell (on the beta copy since 10 Nov)

Built: the monochrome theme and components, four tabs (Today, Plan, Progress, Library), the new Today with "Choose another day", the restyled workout, exercise, routine, history and settings screens, black launch colours, the "new version" notice that never interrupts a workout, and the monochrome icon.

Remaining: you use the beta copy for one normal session. Then it is released to your main app (export a backup on the phone first).

Done when: no hue is left except `danger`, every screen matches [design.md](design.md), no target is under 44 px, and you have used the beta for a normal session.

### Phase 2. Hybrid name

You get: the app is called Hybrid wherever you see its name, with a new icon. Court-Ready stays the name of the example plan. Nothing about your data changes.

Work:
- Visible name: `app.json` (`name`), `public/manifest.json` (`name`, `short_name`), the home-screen title in `scripts/finish-web-build.mjs` (Hybrid; the beta copy becomes Hybrid Beta), Settings → About, the backup file name (`hybrid-backup-<date>.json`) and share title, the message shown for a file that isn't a backup, `README.md`, `AGENTS.md`, and the title of `docs/design.md`.
- Icon: the current icon shows the letters CR. Two monochrome options with an H in the same style, for you to choose; then `public/icons/*` and `assets/images/*`.
- The example plan keeps its name: the Plan tab and Today call it Court-Ready, and its guide articles stay.
- Settings → Your data gets a summary line (workouts, sets, weigh-ins, last workout) to compare before and after any update or move.
- Settings → "Get the Hybrid icon" explains the steps below.
- Kept on purpose, because changing them would separate you from your data: the web address, the storage keys (`court-ready`, `court-ready-beta`), the marker inside backup files (`app: 'court-ready'`), the offline cache names, the app ids in `app.json` (`com.larrymijo.courtready`), the Expo slug and link scheme, and the repository name.

Getting the Hybrid icon on your iPhone:
- iPhone sets an icon's name and picture when you add it, so your current icon keeps the name Court-Ready and the old picture until it is added again. Inside, the app says Hybrid either way.
- An icon added again can start with empty data, so the move goes through a backup:
  1. In the current app: Settings → Export backup, and note the data summary.
  2. In Safari, open the app's address, then Share → Add to Home Screen. It is named Hybrid.
  3. Open the new icon. If your workouts aren't there, Settings → Import backup file.
  4. Check that the summary matches. Then delete the old icon and use only the new one: two icons can keep two separate copies of your data.
- The move is rehearsed first with the beta icon.

Needs: phase 1 in your main app.

Done when:
- No visible text calls the app Court-Ready; the name appears only as the plan.
- Your main app opens with all its data, and the summary matches what it showed before the update.
- A backup made before the rename imports.
- The icon move has been done once on the beta copy, and the summaries matched.

Data checks: no data version change. Tests check that the storage keys and the backup marker are unchanged, and that a backup from before the rename imports.

### Phase 3. Plans and weekly splits

You get: the plan list with Court-Ready, Muscle Mass Building and Definition, each with its week; switching plans without losing anything; Today and the week strip following the active plan; and any workout of any plan on any day.

Work:
- Plans become saved data (section 12), with a new data version. The upgrade:
  - creates Court-Ready from today's `src/data/routines.ts`, `src/data/schedule.ts` and `DAILY_TARGETS`, keeps the workout ids `uppera`, `lower`, `upperb` and `bonus`, makes it the active plan, and moves your 12-week start date into it;
  - adds Muscle Mass Building and Definition from `src/data/plan-templates/`;
  - links every finished workout, and any workout in progress, that has a `routineId` to Court-Ready and to its workout there; empty workouts stay without a plan;
  - keeps the old fields (`settings.programStart`, `routineId`) for at least one more release (section 11).
- The six lifts the examples need join the exercise list, with how-to text. Photo loops come in phase 5.
- `src/lib/program.ts` stops naming sessions: Bonus gets `cycleRule: 'deloadOnly'`, Lower + Core gets `gameMode`. Plans without a cycle get "a lighter week every N weeks", or none. Each plan keeps its own position.
- Weekly split: seven days, each with a list of sessions (gym or sport, optional or not); an empty day is a rest day. Court-Ready's Thursday holds volleyball and Bonus, both optional, with the current note; Sunday holds optional volleyball.
- Plan tab (canvas first): the active plan's week (Monday to Sunday with each day's sessions), its sessions with Start buttons, and **Plans**: your plans with the examples tagged, a preview, **Use this plan**, Delete (asks first, keeps history; deleting the active plan asks which plan to use instead) and **Restore examples**. Going back to a plan with a cycle offers to continue or start again.
- Today: the main card shows today's planned session or sessions, or a rest day. "Choose another day" becomes **Choose another workout** and opens the list of section 4. The week strip draws each day from the split. "This week" shows planned sessions done; a session done on another day of the week counts.
- Sport sessions in the week show as they do now, with the game warm-up and pain-rules links. Starting and logging them comes in phase 4.
- The 12-week card moves from Settings to Court-Ready's plan page. Daily targets and guide articles come from the active plan: Court-Ready keeps its numbers and articles; the examples have none.
- Progress compares this week's sets with the active plan, leaving optional sessions out as now.

Needs: phase 1.

Done when:
- With Court-Ready active, Today, the Plan tab and the workout screen show what they show now, compared screen by screen on the beta copy.
- A test proves Court-Ready prescribes exactly the same sets, reps and effort as before for every workout in weeks 1 to 40, with and without game mode.
- You can switch to Definition and back, and Court-Ready continues at the same week.
- Any session of any plan starts from Today's list, whatever the day.
- Muscle Mass Building, Definition and Court-Ready can be deleted and restored.

Data checks:
- Made-up backups from data versions 1 and 2 upgrade with the same number of workouts, sets, records and weigh-ins. Every old workout opens with its name and sets and links to its Court-Ready workout, and the plan week is the same as before.
- The rehearsal with your real backup on the beta copy (section 11).
- "Go back to that copy" returns the data from before the update.

### Phase 4. Sports sessions

You get: volleyball, basketball, football and running as sessions you start, warm up for, log and cool down from, in any plan's week and from the workout list; and a cool-down after gym workouts.

Work:
- `src/data/sports.ts`: the four sports, what each logs, and their warm-up and cool-down. Library gets a Sports section.
- `src/data/checklists.ts`: warm-ups and cool-downs become data. The current upper and lower warm-ups, game warm-up and after-playing routine move there word for word, and the guide shows the same text from there. New: the football and running warm-ups and cool-downs and the gym cool-downs (upper, lower, full body), approved by you before they ship (section 7). Steps that are drills or stretches link to an exercise; about 30 join the exercise list.
- Sport session screen (canvas first): warm-up → **Start playing** (a clock; the screen may lock) → **Finish** and log → cool-down → **Save**. **Log a past session** for a session you didn't start in the app.
- Finished sport sessions are saved with `kind: 'sport'` and their numbers (section 12), with a new data version.
- Gym workouts end with their cool-down, which can be skipped. The warm-up checklist at the top stays as it is.
- Court-Ready: Tuesday's volleyball and Friday's basketball become sessions you can start; Thursday and Sunday offer optional volleyball. When tomorrow's planned session is a sport, the Lower + Core card suggests game mode; it never turns it on by itself.
- History lists sport sessions with their numbers and a detail page, and they can be deleted. "Done today" and "This week" count them. Volume, sets and records ignore them.

Needs: phase 3.

Done when:
- Each sport starts from Today, the Plan tab and the workout list, with its own warm-up and cool-down.
- On your iPhone (beta copy), a session survives the screen locking during play and is saved with the right time.
- A session can be logged afterwards.
- Every gym workout offers a cool-down at the end.
- Logging a gym workout works as before.

Data checks: gym workouts from before are unchanged; sport sessions are in backups and import back; a test proves volume, sets and records are the same with and without sport sessions in history; backups from every earlier data version import.

### Phase 5. Exercise library (was phase 2)

You get: 117 lifts and about 30 warm-up drills and stretches you can search and filter, a photo loop and how-to on almost all of them, and your own exercises.

Work:
- Split `src/data/exercises.ts` into `src/data/exercises/` by muscle group and add the remaining lifts of section 8. `Equipment` gains `barbell` and `kettlebell`. `MuscleGroup` gains `forearms`. `kind` becomes `standard`, `care`, `drill` or `stretch`. Ids added in phases 3 and 4 stay the same.
- `scripts/build-library.mjs` drafts name, muscles, equipment and how-to steps for the additions from the photo set's data. The result is reviewed and committed as data; the app never fetches it.
- `scripts/build-exercise-media.mjs` crops each photo pair, resizes it to 480 px and converts it to greyscale WebP (about 20 KB a frame, roughly 5 to 6 MB in total) in `public/media/`. The phone caches them in the background after install, exercises in your plans first.
- `MovementLoop` component: cross-fades the two frames, pauses on tap, and stays still when the phone asks for reduced motion. Used in the library, the exercise page, the warm-up and cool-down checklists, and later the workout screen.
- Your own exercises: `customExercises` in the store and a form (canvas screen "Library", "New exercise"), with a new data version. `getExercise(id)` looks in built-in then custom, and every screen uses it instead of reading `EXERCISE_BY_ID`. An id that no longer exists shows as "Removed exercise", so old workouts never break.
- Library tab: search, muscle chips, equipment filter, sections for "In your plans" and "Recent", and the exercise page with loop, how-to, history and records. The same list is the picker for workouts and plans, with several picks at once.
- A credits line for the photo set in Library.
- Tests: ids are unique, every field is valid, every media entry has two files, and the lookup handles custom and removed exercises.

Needs: phase 1. Built after phases 3 and 4.

Done when: everything is searchable with no signal, every lift, drill and stretch with a photo pair shows a loop, and an exercise you created can be logged, appears in history and stats, and can be removed without breaking either.

Data checks: every exercise id in your history still resolves to the same exercise; a backup from before this phase imports.

### Phase 6. Custom and hybrid plans (was the editor part of phase 3)

You get: create, name, edit, copy, save and delete your own plans, with weeks that mix gym workouts and sports.

Work:
- **New plan**: blank, or a copy of any plan.
- Week editor (canvas screen "Edit plan", extended to the week): Monday to Sunday; add a session to a day (one of this plan's gym workouts, a new gym workout, or a sport), reorder, mark optional, remove (an empty day is a rest day), copy a day to another.
- Gym workout editor: name, focus, exercises from the Library (several at once), sets, rep range, rest, effort and supersets. Defaults: 3 × 8–12 with 2:00 rest for compound lifts, 3 × 10–15 with 1:15 for isolation work. Warm-up and cool-down suggested from the muscles trained, and changeable.
- Sport session settings: sport, name, planned length, warm-up and cool-down (the sport's own by default).
- Plan options: add reps then weight, or hold weights; a lighter week off, or every 4th to 8th week; optional targets for calories, protein, steps and weight change.
- Live feedback: sessions per week (gym and sport), hard sets per muscle per week, time per day, and gentle warnings such as "Legs the day before a match".
- Edits to an example stay yours, with **Reset to original**.
- A draft is kept while you edit, until **Save** or **Discard**.
- All edits are pure functions in `src/lib/planEdit.ts`, with tests.

Needs: phases 3, 4 and 5.

Done when: you can build a hybrid plan from nothing in the app (for example Mon Push, Tue Football, Wed Pull, Thu rest, Fri Legs, Sat Running, Sun rest), save it, train with it for a week, switch away and back, edit it and delete it, and every session's history is kept.

Data checks: editing or deleting a plan or workout never changes finished sessions; a session whose workout or plan was deleted still opens with its name and numbers; your plans are in backups and import back; a draft never changes the active plan until it is saved.

### Phase 7. Workout flow (was phase 4)

You get: logging a whole session with one thumb, a rest timer you can read from the floor, warm-up sets and targets worked out for you. It works the same for any plan and any exercise, including your own.

**Logging** (`src/app/workout.tsx`, `src/components/workout/`)
- One exercise per screen: name, target line, movement loop, "Last time" next to "Today".
- Sets as rows: done sets compact, the current set as a card with weight and reps steppers and RIR chips, later sets greyed with their target.
- Weight steps by the exercise's `increment`. Tapping a number opens the keypad. "Log set" is pinned at the bottom.
- Tapping a done set reopens it for editing. Add set, remove set and warm-up toggle sit in the row menu.
- Supersets advance by themselves: after 5a the screen moves to 5b with the right rest.
- Tapping the set counter opens an overview of all exercises to jump around. The workout's warm-up checklist becomes its first page, and its cool-down the last.
- Pain rating, notes, swap and "How to do it" stay, in the exercise menu. Pain 4+ keeps its stop banner. "Add exercise" uses the Library picker.

**Rest timer** (`RestTimerBar.tsx` becomes `RestTimer.tsx`)
- Opens full screen after a logged set: ring, large time, minus and plus 15 s, skip, and the next set with its target. Swipe down to shrink it to a bar.
- At zero: a short sound and a flash, then it counts up ("over by 0:20") until the next set is logged, so you can see how long you really rested.
- Rest changed with plus or minus is remembered for that exercise. Actual rest is saved with each set.
- Sound uses Web Audio in a new `src/lib/sound.web.ts`, armed on the tap that logs the set.

**Warm-up sets** (new `src/lib/warmup.ts`, replacing `rampUpSets`)
- First heavy lift of the session: about 50% × 10, 70% × 5, 85% × 2 (today's rule).
- First heavy lift for a muscle group not yet worked that day: about 60% × 6 and 80% × 3.
- Isolation work and muscles already warm: none. Very light working weights: one set.
- Rounded to the exercise's weight step. Shown as a "Warm-up" row and added with one tap.

**Targets** (`src/lib/progression.ts`)
- A target for each set, for example 22 kg × 10, 10, 9 after last time's 10, 9, 8.
- Every set at the top of the range: add weight and restart at the bottom of the range.
- Last time clearly too easy by logged RIR: add weight sooner.
- Under the bottom of the range two sessions running: step the weight down.
- More than two weeks since the exercise was done: start about 10% lighter.
- Lighter weeks keep the weight, as now. Plans set to "hold weights" aim to match last time.
- Each target shows its reason in one line. The finish screen lists next time's targets.

Data: `WorkoutSet.doneAt`, `WorkoutSet.restSec`, `Settings.restSound`, `Settings.restFullScreen`, `Settings.restByExercise`, with a new data version.

Needs: phase 1. Can move earlier.

Done when: a full session can be logged without the keyboard, the timer shows the right time after switching apps, the end-of-rest sound is confirmed on your iPhone with music playing, and every old workout still opens.

Data checks: old sets without times or rest still open and count; backups from every earlier data version import.

### Phase 8. Daily check-in (was phase 5)

You get: one sheet for weight, sleep, calories, protein and steps, opened from Today.

Work:
- `DayLog` replaces `BodyEntry` (section 12), with a new data version. Existing weigh-ins and waist values move across.
- Check-in sheet as on the canvas: weight stepper with the 7-day average, sleep length and a 1 to 5 "rested" score, calories and protein with quick-add amounts and your own presets, steps typed in. Past days are editable.
- Today shows four tiles with today's values, against the active plan's targets when it has them. On a day with a planned sport, the steps target uses the plan's sport-day number (Court-Ready: 7,000).
- Progress, Body view: weight with a 7-day average line and weekly rate, waist, calorie and protein averages, step average, sleep average.
- Backup export and import include the new data.

Needs: phase 1; plan targets come from phase 3.

Done when: a full check-in takes under 15 seconds with one hand, and your old weigh-ins are all there.

Data checks: every weigh-in and waist value from before is there with the same date and number.

### Phase 9. Stats (was phase 6)

You get: a Progress tab that answers "what have I trained most", "am I getting stronger", "is my body changing" and "how much sport am I doing".

Work:
- Views: Overview, Muscles, Lifts, Body and Sports, plus History. Period: 4 weeks, 12 weeks, this plan, all time.
- Overview: sessions done against planned (gym and sport), hard sets, volume, records, each with the change from the previous period; most-trained body map; a consistency grid with gym and sport days; key lift trend.
- Muscles: front and back body map where brighter means more hard sets; per muscle, sets per week against what the active plan prescribes, with a small trend; flags for below and above plan. The body map counts gym sets only, and says so.
- Lifts: exercises ranked by estimated 1-rep-max change; record timeline; the existing exercise screen restyled.
- Sports: sessions per week by sport, training time, effort, and running distance and pace over time.
- Session numbers: average length and average rest.
- `src/lib/stats.ts` grows period helpers, sets per muscle per week, adherence, lift trends and sport totals. Every number on screen has a unit test.
- `src/components/charts/`: line, bar, sparkline, dot grid and `BodyMap`. Body map candidate: `react-native-body-highlighter` 3.2.0 (MIT, only needs `react-native-svg`, which the app already has). If it does not render well on the web build, draw our own.

Needs: phases 3, 4, 7 and 8.

Done when: the body map and the ranking agree, empty states read well with no data, and a year of generated data scrolls smoothly.

### Phase 10. Exercise suggestions (was phase 7)

Work:
- Each exercise gets a movement `pattern` and joint `stress` tags in the library data.
- New `src/lib/suggest.ts` ranks swaps: curated swaps first where they exist, then same pattern and muscle, exercises you have history with, equipment you use, and lower joint stress when pain was logged. Each suggestion shows its reason.
- At the end of a workout it can offer up to three additions for muscles that are below the plan this week.
- The picker gets a Recommended section.
- README and screenshots refreshed.

Needs: phases 5 and 9.

Done when: every suggestion says why it is suggested, and a pain rating of 4+ offers lower-stress options first.

### Phase 11. Plan suggestions (new)

You get: help choosing or shaping a plan. It starts only after plans, the editor and sports have worked reliably for a few weeks, and it stays separate from them.

How it fits into the app:
- **Find a plan for me** on the Plans list. A few questions: your goal (muscle, leaner, sport, general fitness), which sports you play and on which days, how many gym days you have, session length, equipment, experience. The answer is one or two suggestions: an example as it is, or an example adapted to your week (for example Muscle Mass Building with its leg days moved away from match days). Each says why. Tap one to preview it; **Save as my plan** makes it a normal plan you can edit. Nothing changes until you save.
- **Hints** on the Plan tab, optional and dismissible, from your plan and your history: a hard leg session the day before a planned match, a muscle below the plan for three weeks, six training days in a row, a sport you log every week that isn't in your plan.
- A switch in Settings turns suggestions off.

How it is kept separate:
- It lives in `src/lib/planSuggest/` and its own screens. It reads plans and history and returns a draft plan or a hint. It saves only through the same function the plan editor uses, and only when you tap Save.
- Fixed rules written as code and tested. It works offline, with no server and no AI service.
- The app works the same with it switched off or removed.

Needs: phases 3, 4 and 6 in use for a few weeks; phase 9 for hints based on your history.

Done when: every suggestion and hint says why; nothing changes a plan without Save; turning suggestions off hides them all; every rule has a test.

Data checks: the only new saved data is the on/off setting and which hints you dismissed.

### Phase 12. Later, not scheduled

- **Health sync for steps, weight and sleep.** A web app cannot read Apple Health. The routes are a Shortcut that hands the numbers to the app, a native iPhone build (needs a paid Apple developer account), or staying manual. Decide after a few weeks of using the check-in.
- **Sport sessions from your watch** (Apple Health workouts). Also needs a native iPhone build.
- **A Hybrid web address.** The address stays `/court-ready/` for now; moving it later is possible with the same backup move as the icon.
- **Sharing a plan** as a file or link, so a plan you built can be given to someone else.
- **Light theme.** Cheap once the tokens exist.
- **Photos for your own exercises.**
- **Rest alerts while the phone is locked.** Needs push notifications and a server.
- **GPS for runs.** Not planned: a web app can't track reliably with the screen off. Log the distance from your watch.

## 11. Keeping your data safe

Your training history exists only in the app on your phone, so every phase that changes saved data follows these rules.

1. **One tested upgrade per change.** Each change raises the data version and adds a step in `src/store/migrations.ts`. Tests upgrade made-up backups from every earlier version (version 1, version 2, and each new one as it ships) and check that nothing is lost. Your real backup is never committed, because the repository is public.
2. **Expand, then contract.** A release adds the new fields and keeps the old ones. Old fields are removed one release later at the earliest. If a release has to be rolled back, the previous app still finds what it needs.
3. **Safety copy.** The data from before each upgrade is kept on the phone, and Settings offers to go back to it for 30 days (built in phase 0).
4. **Rehearsal on the beta copy.** Before a release that changes saved data, you export a backup from your main app and import it into the beta copy, which keeps its own data. The data summary (phase 2) must match, every screen must open, and the plan week must be right.
5. **Release.** Export a backup on your phone, then the release is pushed. The CI and Pages runs are checked, the live app is opened, and the summary is compared again.
6. **Names that never change:** exercise ids, Court-Ready's workout ids (`uppera`, `lower`, `upperb`, `bonus`), the storage keys, and the backup marker.
7. **History stands on its own.** Each finished session keeps its own name, sets or sport numbers, and plan name, so editing or deleting plans and exercises never rewrites history.
8. **Old backups always import,** from any earlier version of the app, Court-Ready or Hybrid.

The rename changes no saved data, so it needs no upgrade. Its only risk is the home-screen icon, which phase 2 handles with a backup move.

## 12. Data after all phases

```ts
type SportId = 'volleyball' | 'basketball' | 'football' | 'running';

interface Plan {
  id: string;                          // 'court-ready' for the plan you use now
  name: string;
  example?: 'court-ready' | 'muscle-mass' | 'definition';   // set on examples, for "Reset to original"
  workouts: GymWorkout[];              // Court-Ready: 'uppera', 'lower', 'upperb', 'bonus'
  sports: SportSession[];              // Court-Ready: volleyball, basketball
  week: PlanDay[];                     // 7 days, Monday first
  cycle?: { phases: PhaseId[]; repeatFrom: number };        // Court-Ready's 12 weeks
  lighterWeekEvery?: number;           // Muscle Mass Building: 6
  progression: 'progress' | 'maintain';
  targets?: {
    kcal?: number; kcalRestDay?: number; proteinG?: number;
    steps?: number; stepsSportDay?: number; weightPctPerWeek?: [number, number];
  };
  articles?: string[];                 // guide pages that belong to this plan
}

interface PlanDay {
  sessions: { ref: SessionRef; optional?: boolean }[];      // none = rest day
  note?: string;                       // "Volleyball some weeks, or the Bonus session"
}

type SessionRef = { kind: 'gym'; workoutId: string } | { kind: 'sport'; sessionId: string };

interface GymWorkout {                 // today's Routine, field for field, with string ids
  id: string; name: string; focus: string; minutes: number;
  items: RoutineItem[]; groups: Record<string, string>;
  warmup: string; cooldown?: string;   // checklist ids
  cycleRule?: 'full' | 'deloadOnly';   // Bonus: only halved in deload weeks
  gameMode?: boolean;                  // Lower + Core
  optional?: boolean; intro?: string; shortOnTime?: string;
}

interface SportSession {
  id: string; sport: SportId; name: string;   // "Volleyball", "Club practice"
  minutes?: number;
  warmup?: string; cooldown?: string;  // the sport's own unless set
}

interface Checklist {                  // warm-ups and cool-downs, shipped with the app
  id: string; title: string; minutes: number;
  steps: { text: string; exerciseId?: string }[];
}

interface Workout {                    // one finished session; the existing fields stay
  kind?: 'gym' | 'sport';              // missing on old records = gym
  planId?: string;                     // old records with a routineId: 'court-ready'
  planName?: string;                   // copied in, so history reads well after a plan is deleted
  sessionId?: string;                  // the workout or sport session in that plan
  routineId?: string;                  // kept as it was (expand, then contract)
  sport?: SportId; minutes?: number; effort?: number; distanceKm?: number;
  match?: boolean; pain?: number | null; warmupDone?: boolean; cooldownDone?: boolean;
  // name, startedAt, finishedAt, week, phase, gameMode, exercises, prs: as now
}

interface DayLog {
  date: string;                        // YYYY-MM-DD
  weight?: number; waist?: number;
  kcal?: number; proteinG?: number;
  steps?: number;
  sleepMin?: number; rested?: 1 | 2 | 3 | 4 | 5;
}

// Saved on the phone
plans: Plan[];
activePlanId: string;
planState: Record<string, { start: string; leftAtWeek?: number }>;
planDraft?: Plan;                      // the plan being edited, until Save or Discard
customExercises: ExerciseDef[];        // ids start with "custom_"; removed ones are kept as archived
workouts: Workout[];                   // gym and sport sessions; sets gain doneAt and restSec
dayLogs: DayLog[];                     // replaces body[]
settings: Settings;                    // programStart kept one release after phase 3;
                                       // + restSound, restFullScreen, restByExercise, suggestions

// ExerciseDef gains
kind: 'standard' | 'care' | 'drill' | 'stretch';    // drills and stretches never count as hard sets
equipment: ... | 'barbell' | 'kettlebell';
archived?: boolean;
media?: string;                        // id in the photo set
pattern?: 'push-h' | 'push-v' | 'pull-h' | 'pull-v' | 'squat' | 'hinge' | 'lunge'
        | 'curl' | 'extension' | 'raise' | 'core' | 'care';
stress?: Partial<Record<'shoulder' | 'elbow' | 'knee' | 'lowback', 1 | 2 | 3>>;
```

## 13. Conflicts with the current app, and decisions

### Conflicts and how this plan resolves them

| In the app now | Why it conflicts | Resolution | Phase |
|---|---|---|---|
| Court-Ready's four workouts, its week and its targets are fixed in code, and the rules name the Bonus and Lower sessions | Plans must be data that can be switched and edited | Court-Ready becomes the first plan in saved data, built from today's files; the rules become settings on the workouts. A test proves every week prescribes the same sets as before. | 3 |
| Volleyball and basketball are labels on the week; Thursday and Sunday are "maybe" days | Sports must be sessions | They become sport sessions in Court-Ready's week; Thursday and Sunday hold optional sessions | 3, 4 |
| A workout is only saved with at least one ticked set | A sport session has no sets | Sport sessions have their own finish rules | 4 |
| Finished workouts record only which of the four Court-Ready sessions they were | History must stay readable across several plans | Each record also gets its plan and session; old records are assigned to Court-Ready; names are already stored on each record | 3 |
| The 12-week start date is a global setting | Each plan keeps its own place | Moves into the plan; the old setting stays one more release | 3 |
| Warm-ups are two built-in checklists; the game warm-up and after-playing stretches are guide text | Every sport and workout needs a warm-up and a cool-down | Checklists become data; the existing four keep their exact words | 4 |
| The workout screen keeps the phone awake | During a match the phone is in your bag | Sport sessions let the screen lock while you play | 4 |
| Guide articles and daily targets are Court-Ready's (2,100 kcal, "your week") | Other plans have other targets or none | General articles stay for everyone; Court-Ready's articles and targets belong to that plan | 3 |
| Today counts "of 3 sessions", and Progress compares sets with Court-Ready's three sessions | Other plans have other weeks | Both follow the active plan's week | 3 |
| This roadmap ran Mass and Definition "next day in order" | Every plan is a weekly split now | Placed on weekdays (section 6); the "in order" option is dropped | 3 |
| "Court-Ready" is in the storage keys, backup files, the home-screen name and the CR icon | Renaming must not separate you from your data | Only visible names change; internal names stay; the icon moves with a backup | 2 |

### Decided

1. **The web address stays `larrymijo.github.io/court-ready/`** (11 Nov). The app is called Hybrid everywhere you see it, your current icon and its data keep working, and the beta link stays the same. A home-screen icon named Hybrid still means adding the icon again with the backup move of phase 2; without the move, the icon keeps saying Court-Ready.

### Assumptions, approved with the roadmap on 11 Nov

1. The examples stay ordinary plans in your list: use them, edit them, delete them, restore them (as in the earlier plan).
2. Muscle Mass Building and Definition go on the weekdays in section 6. Their exercises don't change.
3. A day can hold more than one session (gym and sport), each can be optional, and a day with none is a rest day. Court-Ready needs this for its Thursday.
4. A sport session logs time, effort 1–10, match or practice, pain if any, and notes; a run adds distance and shows pace. There is no GPS.
5. Basketball keeps the shared game warm-up. The football and running warm-ups and cool-downs and the gym cool-downs are drafts for you to approve in phase 4.
6. "Football" in the app means soccer.
7. The phase order in section 9. Phase 1 reaches your main app before phase 2 starts.

## 14. Risks and limits

- **Losing history in an upgrade.** Covered by section 11: tests, the safety copy, the rehearsal on the beta copy, and a backup before every release.
- **Plans become data.** Once plans are saved on the phone, a change to their shape needs an upgrade like any other data. Improvements to an example reach you only through "Reset to original", never by overwriting your edits.
- **The rename and the home screen.** iPhone keeps an icon's name and picture from when it was added, and an icon added again may start with empty data. Phase 2 moves the data with a backup and compares the summary.
- **iPhone web app limits.** No vibration. No sound once the phone is locked or the app is in the background. The silent switch and other apps' music may affect the rest sound, so phase 7 includes a test on your phone before the behaviour is fixed. A sport session's clock is worked out from start and finish times, so it stays right while the screen is locked.
- **A bad release during a session.** `main` goes straight to your phone, so every change is tried on the beta copy first and released after one real workout.
- **Training content.** The example plans, the sport warm-ups and cool-downs, and every default are general guidance, not advice for your body. Court-Ready's pain rules stay as they are.
- **Photo set.** Photos come from different shoots, so loops will not look identical, and a few drills have none.
- **Storage.** Safari gives a web app about 5 MB for saved data. A year of training is roughly 0.6 MB of text, and sport sessions are small, so there is room for several years. Settings shows usage, and the data moves to a larger store before it gets close. Photos are cached separately and do not count against this.
- **Expo changes quickly.** Follow `AGENTS.md`: read the SDK 57 docs before touching Expo APIs and add packages with `npx expo install`.

## 15. How the work runs

- Where: on this PC, in `Documents\court-ready`, with the app running in a live preview while it is built.
- Design first: each phase's new screens are drawn on the canvas and agreed before building.
- Each phase passes `npm run lint`, `npm run typecheck` and `npm test`, and a screen-by-screen check against [design.md](design.md) at 390 × 844 in the preview.
- Work is committed on `main` on this PC and tried on the beta copy (`git push origin main:beta`), which keeps its own data. Nothing is pushed without your OK.
- Release to your main app: after you have trained with the beta copy once and said yes. Export a backup on your phone first. Then the CI and Pages runs are checked and the live app is opened before saying it shipped.
- A phase that changes saved data also gets the rehearsal of section 11.
