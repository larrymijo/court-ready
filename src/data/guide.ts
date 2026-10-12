// The reading part of the "Court-Ready Muscle" guide.
// Inline syntax inside text: **bold** and [[target|label]] links, where target is
// another article slug or an exercise id.

export type Tone = 'info' | 'ok' | 'warn' | 'bad';

export type Block =
  | { t: 'lead'; text: string }
  | { t: 'p'; text: string }
  | { t: 'muted'; text: string }
  | { t: 'h'; text: string }
  | { t: 'bullets'; items: string[] }
  | { t: 'steps'; items: string[] }
  | { t: 'callout'; tone: Tone; title?: string; items: string[] }
  | { t: 'table'; head?: string[]; rows: string[][]; tones?: (Tone | null)[] };

export interface Article {
  slug: string;
  section: string;
  title: string;
  summary: string;
  blocks: Block[];
}

export const ARTICLES: Article[] = [
  {
    slug: 'how',
    section: 'Start here',
    title: 'How this plan works',
    summary: '3 focused sessions, what builds muscle, how your joints are protected',
    blocks: [
      {
        t: 'lead',
        text: 'You play 2–4 games or practices a week. That’s a lot of jumping, sprinting and hitting, and it uses up recovery. So instead of 5 tiring gym days, this plan gets the most muscle out of **3 focused sessions of about an hour**.',
      },
      { t: 'h', text: 'What builds muscle' },
      {
        t: 'steps',
        items: [
          '**Train close to failure.** Most sets end 1–2 reps before you couldn’t do another ([[rir|RIR 1–2]]). Easy sets don’t build much muscle.',
          '**Add reps, then weight.** Every session, try to beat last time by one rep or a little weight. The app shows last time’s numbers on every set.',
          '**Do enough sets.** About 10–16 hard sets per muscle per week. Chest gets the most, because it’s your priority.',
          '**Full range, slow lowering.** Lower each rep in 2–3 seconds and get a good stretch — in a range that doesn’t hurt.',
          '**Rest properly.** 2–3 minutes between sets of big lifts. Sleep 7–9 hours.',
          '**Eat for both goals.** Plenty of protein and a small calorie deficit ([[food|food]]).',
        ],
      },
      { t: 'h', text: 'How your joints are protected' },
      {
        t: 'bullets',
        items: [
          'Dumbbells, cables and machines instead of heavy straight bars, so your wrists and shoulders can move naturally.',
          'Palms-facing (neutral) grips on presses and pulls wherever possible.',
          'At least as much pulling as pushing, plus extra work for the back of the shoulder.',
          'A 5-minute shoulder routine before every upper-body session ([[warmups|warm-ups]]).',
          'No heavy overhead pressing — volleyball already loads your shoulder overhead.',
          'Clear [[pain|pain rules]], so you always know when to push and when to back off.',
        ],
      },
      {
        t: 'callout',
        tone: 'info',
        title: 'Build muscle and lose fat at the same time?',
        items: [
          'Yes — especially if you’re fairly new to serious lifting, coming back after a break, or have some fat to lose. Expect the scale to move slowly while your waist gets smaller and your lifts go up. That’s the sign it’s working.',
          'If you’re already lean and very experienced, gaining a lot of muscle eventually needs a small calorie surplus. Then it’s best to focus on one goal at a time.',
        ],
      },
      { t: 'h', text: 'What you need' },
      {
        t: 'bullets',
        items: [
          'A normal gym: dumbbells, adjustable bench, cable machine, leg press or hack squat, leg curl machine.',
          'A light resistance band for warm-ups (cheap, fits in your bag).',
          'This app, to log every set.',
        ],
      },
    ],
  },
  {
    slug: 'week',
    section: 'Start here',
    title: 'Your week',
    summary: 'Gym on Mon, Wed, Sat around volleyball and basketball',
    blocks: [
      {
        t: 'table',
        head: ['Day', 'Plan'],
        rows: [
          ['Monday', '**Upper A** — chest focus'],
          ['Tuesday', 'Volleyball'],
          ['Wednesday', '**Lower + Core**'],
          ['Thursday', 'Volleyball (some weeks) or the optional Bonus'],
          ['Friday', 'Basketball'],
          ['Saturday', '**Upper B** — back & chest'],
          ['Sunday', 'Volleyball (some weeks) or rest'],
        ],
      },
      { t: 'h', text: 'Why this order' },
      {
        t: 'bullets',
        items: [
          'Your upper-body days (Monday and Saturday) are far apart, so your shoulder recovers between them.',
          'No leg session the day before Tuesday volleyball or Friday basketball.',
          'Every muscle gets trained about twice a week — legs once in the gym, plus your sports.',
          'Keep the same days every week if you can. Routine makes it easy to stay consistent.',
        ],
      },
      { t: 'h', text: 'Adapt it to your week' },
      {
        t: 'table',
        head: ['This week', 'Do this'],
        rows: [
          ['Only Tue + Fri', 'All 3 sessions. Optional: add the Bonus session on Thursday or Sunday.'],
          ['+ Sunday volleyball', 'All 3 sessions as written. No Bonus.'],
          [
            '+ Thursday volleyball',
            'Wednesday Lower in **game mode**. Or, if Sunday is free: Upper B on Wednesday and Lower on Saturday.',
          ],
          [
            'Thu + Sun volleyball',
            'Upper A and Upper B as written. Lower in game mode — or skip it if you feel beaten up. Your sports already work your legs.',
          ],
          [
            'Big match or tournament',
            'No Lower in the 2 days before it. The day before: rest, or a light session (half the sets, RIR 3).',
          ],
        ],
        tones: [null, null, 'warn', 'bad', 'bad'],
      },
      {
        t: 'p',
        text: '**Game mode** = 2 sets per exercise, stop at RIR 3, skip the split squats. Turn it on when you start the Lower session.',
      },
      { t: 'h', text: 'Gym and sport on the same day?' },
      {
        t: 'p',
        text: 'Try to keep them on different days. If you must combine them, leave at least 6 hours between them, and never do the Lower session before playing.',
      },
    ],
  },
  {
    slug: 'weeks12',
    section: 'Start here',
    title: 'The 12 weeks',
    summary: 'Learn, Build, Deload, Push, Deload — the app adjusts your sets',
    blocks: [
      {
        t: 'p',
        text: 'Three blocks of hard work with easy weeks in between. The easy weeks (deloads) aren’t lost time — they let your joints and muscles catch up, so you come back stronger. The app works out your week from your start date and adjusts the sets and RIR for you.',
      },
      {
        t: 'table',
        head: ['Weeks', 'Phase', 'What to do'],
        rows: [
          ['1–2', 'Learn', 'One set less than written, RIR 3. Learn the technique, find your weights.'],
          ['3–6', 'Build', 'Sets and RIR as written. Beat last week by a rep or a little weight.'],
          ['7', 'Deload', 'Half the sets (round up), same weights, RIR 3–4. Easy on purpose.'],
          ['8–11', 'Push', '+1 set on exercises 1 and 2 of every session. Isolation: last set to RIR 0.'],
          ['12', 'Deload', 'Half the sets, RIR 3–4. Measure your progress ([[track|how]]).'],
        ],
        tones: [null, null, 'ok', null, 'ok'],
      },
      {
        t: 'p',
        text: '**After week 12:** start again at week 3 with your new weights. Keep the exercises that feel great; swap 1–2 others for a similar one ([[swaps|swap list]]).',
      },
      {
        t: 'callout',
        tone: 'info',
        title: 'Isolation vs big lifts',
        items: [
          '**Isolation** = one joint moving: flyes, raises, face pulls, curls, pushdowns, leg curls, calf raises. Safe to push very hard.',
          '**Big lifts** (presses, pull-ups, rows, leg press, RDLs): never to failure. Keep 1–2 reps in the tank — that’s where joint pain and injuries happen.',
        ],
      },
    ],
  },
  {
    slug: 'rir',
    section: 'Start here',
    title: 'How hard to train (RIR)',
    summary: 'Reps in reserve: how many more good reps you could have done',
    blocks: [
      {
        t: 'p',
        text: 'Every exercise has a target **RIR — reps in reserve**. It means: when you stop the set, how many more good reps could you have done? You can log it on each set.',
      },
      {
        t: 'table',
        head: ['RIR', 'Feels like', 'Use for'],
        rows: [
          ['4+', 'Easy. Warm-up feel.', 'Warm-up sets'],
          ['3', 'Hard work starts. You could do 3 more.', 'Weeks 1–2, deloads, game mode'],
          ['2', 'Reps slow down. 2 more for sure.', 'Big lifts'],
          ['1', 'Grinding. Maybe 1 more.', 'Big lifts, isolation'],
          ['0', 'The next rep would fail or break your form.', 'Last set of isolation only'],
        ],
      },
      { t: 'h', text: 'Get it right' },
      {
        t: 'bullets',
        items: [
          'Most people stop too early. Your last reps should be slow and hard — but with the same form as your first rep.',
          'Test yourself: every 2–3 weeks, on the last set of a cable or machine exercise, keep going until you can’t do a clean rep. If you thought you had 2 left but did 6 more, push harder.',
          'Good form means the same path every rep, no swinging, and no pain. A rep with bad form doesn’t count.',
        ],
      },
    ],
  },
  {
    slug: 'pain',
    section: 'Shoulder, elbows & chest',
    title: 'Pain rules',
    summary: '0–2 train, 3 careful, 4+ or sharp: stop and swap',
    blocks: [
      {
        t: 'p',
        text: 'You can keep training with a sore shoulder or elbow — as long as the pain stays low and doesn’t build up. During every exercise, rate the pain from 0 (none) to 10 (worst possible). The app lets you log it on each exercise.',
      },
      {
        t: 'table',
        head: ['Pain', 'What to do'],
        rows: [
          ['0–2', 'Train as planned.'],
          [
            '3',
            'A dull ache (not sharp) that doesn’t climb during the set is OK. Don’t add weight. It must be back to normal by the next morning — if not, treat it as red next time.',
          ],
          [
            '4+',
            'Or any pain that is sharp, pinching, or worse the next morning. **Stop that exercise today.** Next time use less weight, a shorter range, or the swap. If it keeps happening for 2–3 sessions, see a physiotherapist.',
          ],
        ],
        tones: ['ok', 'warn', 'bad'],
      },
      {
        t: 'callout',
        tone: 'bad',
        title: 'See a doctor or physio — don’t train through these:',
        items: [
          'Pain that wakes you at night or is there all the time, even at rest',
          'Numbness, tingling, or pain shooting down your arm',
          'Real weakness — you can’t lift your arm or grip like before',
          'It started with a fall, a “pop”, or your shoulder slipping out',
          'Swelling or bruising',
          'No improvement after 3–4 weeks on this plan',
        ],
      },
      {
        t: 'muted',
        text: 'General training advice, not a diagnosis — a physio can test your shoulder and elbow properly.',
      },
    ],
  },
  {
    slug: 'shoulder',
    section: 'Shoulder, elbows & chest',
    title: 'Your shoulder & volleyball',
    summary: 'Why the hitting shoulder hurts and what to do on court',
    blocks: [
      {
        t: 'p',
        text: 'Pain in the hitting shoulder is very common in volleyball. Every spike and serve loads the **rotator cuff** (small muscles that keep the ball of your shoulder centred) and the muscles that control your shoulder blade. When they get tired or weak, and the back of the shoulder gets stiff, the joint gets irritated. If you hit with your right arm, that’s likely why the right side hurts more.',
      },
      { t: 'h', text: 'What the plan does about it' },
      {
        t: 'bullets',
        items: [
          'Strengthens the rotator cuff and shoulder-blade muscles: face pulls, reverse flyes and the shoulder-care exercises ([[c_er|band external rotation]], [[c_pullapart|pull-aparts]], [[c_scappush|scapular push-ups]], [[c_wallslide|wall slides]], [[c_proney|prone Y raises]]).',
          'Trains chest and back with pain-free angles, and leaves heavy overhead work to the court.',
          'Spreads your upper-body sessions so the shoulder recovers between them.',
        ],
      },
      { t: 'h', text: 'On the court' },
      {
        t: 'bullets',
        items: [
          'Do the 8-minute [[warmups|game warm-up]] before every game or practice.',
          'Build up hitting and serving: start at half power, reach full power after about 5 minutes.',
          'When the shoulder is irritated: float serves instead of jump serves for a few weeks, and fewer full-power spikes in the warm-up.',
          'If hitting hurts above 3/10, or feels sharp: stop hitting for the day and tell your coach.',
          'After playing: [[c_crossbody|cross-body stretch]] and [[c_openbook|open book]] — 3 minutes.',
        ],
      },
    ],
  },
  {
    slug: 'elbows',
    section: 'Shoulder, elbows & chest',
    title: 'Your elbows',
    summary: 'Load the tendon smartly: no straight bars, higher reps, no death grip',
    blocks: [
      {
        t: 'p',
        text: 'Elbow pain from lifting is usually a tendon that’s been asked to do too much, too soon — lots of gripping, straight bars, or heavy arm work. Tendons get stronger with the right load, so the goal isn’t to stop training. It’s to load them smartly.',
      },
      { t: 'h', text: 'Elbow rules' },
      {
        t: 'bullets',
        items: [
          'Use dumbbells, an EZ-bar, cables and ropes. No straight-bar curls or skull crushers for now.',
          'Don’t death-grip. On rows, pulldowns, pull-ups and RDLs, use lifting straps if your forearms or elbows complain.',
          'Arms: 10–15+ reps with a 2–3 s lowering. Heavy, sloppy arm training is the classic cause.',
          'No snapping into lockout on presses and pushdowns — finish smoothly.',
          'Warm up: one light set of about 20 reps before your first curl and pushdown set (log it as a warm-up set).',
          'Add arm sets slowly. Only add a 3rd set of curls and pushdowns once your elbows have felt fine for 3+ weeks.',
        ],
      },
      {
        t: 'callout',
        tone: 'warn',
        title: 'Not better after 3–4 weeks?',
        items: ['See a physiotherapist. Elbow tendon pain usually responds well to a specific loading program.'],
      },
    ],
  },
  {
    slug: 'chest',
    section: 'Shoulder, elbows & chest',
    title: 'Why your chest lags — the fix',
    summary: 'Elbows 45°, low incline, chest first, 14–16 hard sets',
    blocks: [
      { t: 'h', text: 'Common reasons' },
      {
        t: 'steps',
        items: [
          '**Your shoulders do the work.** If your shoulders roll forward and your elbows flare out, the front of the shoulder takes the load (and gets irritated) instead of your chest.',
          '**Not enough hard chest sets.** A few easy sets of bench press won’t do it.',
          '**No real stretch.** Half reps and bouncing skip the bottom of the rep — the part that builds the most muscle.',
          '**Pain holds you back.** If pressing hurts, you can’t train hard. Pain-free exercises let you push.',
        ],
      },
      {
        t: 'callout',
        tone: 'ok',
        title: 'Elbow angle',
        items: [
          'Elbows about 45° from your body: your chest does the work.',
          'Elbows flared to 90° (a “T”): pinches the front of the shoulder.',
        ],
      },
      {
        t: 'callout',
        tone: 'info',
        title: 'Bench angle',
        items: ['Flat: mid chest.', '15–30° (one or two notches): upper chest.', '45° and steeper: mostly shoulders.'],
      },
      { t: 'h', text: 'The fix in this plan' },
      {
        t: 'bullets',
        items: [
          'Chest first in both upper sessions, when you’re freshest.',
          '14–16 hard chest sets a week — more than any other muscle.',
          'Low incline (15–30°) for the upper chest, the part that usually looks “flat”.',
          'Every press: shoulder blades back and down, elbows about 45°, 2–3 s lowering, a short pause in the stretch.',
          'Cables and machines to take your chest close to failure safely.',
          'Think “bring your upper arms together across your chest”, not “push the weight up”.',
        ],
      },
    ],
  },
  {
    slug: 'skip',
    section: 'Shoulder, elbows & chest',
    title: 'Lifts to skip for now',
    summary: 'Dips, upright rows, wide-grip bench and more — with what to do instead',
    blocks: [
      {
        t: 'p',
        text: 'Not “bad” exercises — they just put a sore shoulder or elbow in its worst positions. After 2–3 pain-free months you can test some of them again, starting light.',
      },
      {
        t: 'table',
        head: ['Skip', 'Why', 'Instead'],
        rows: [
          ['Barbell bench press, wide grip', 'Fixed bar and flared elbows pinch the front of the shoulder.', 'Dumbbell or machine press'],
          ['Dips', 'The deep bottom position overstretches the front of the shoulder.', 'Push-ups, low-to-high fly'],
          ['Upright rows', 'Arm turned in and raised high — the classic pinch position.', 'Lateral raises'],
          ['Behind-the-neck press or pulldown', 'Extreme shoulder position under load.', 'Pulldown to the chest'],
          ['Heavy overhead barbell press', 'Volleyball already loads your shoulder overhead a lot.', 'Lateral raises + incline press'],
          ['Barbell back squat', 'Holding the bar behind you strains sore shoulders and elbows.', 'Leg press, hack squat'],
          ['Straight-bar curls, skull crushers', 'The fixed wrist angle stresses your elbows.', 'DB curls, rope pushdowns'],
          ['Deep straight-arm dumbbell flyes', 'A big, hard-to-control stretch on the front of the shoulder.', 'Cable fly, pec deck'],
        ],
      },
    ],
  },
  {
    slug: 'warmups',
    section: 'The workouts',
    title: 'Warm-ups',
    summary: 'Upper, lower and game-day warm-ups, ramp-up sets, after playing',
    blocks: [
      {
        t: 'p',
        text: 'Ten minutes that make every session better and safer. Don’t skip them — especially with a sore shoulder. The workout screen shows the right warm-up as a checklist.',
      },
      { t: 'h', text: 'Gym · upper days (8 min)' },
      {
        t: 'steps',
        items: [
          'Easy cardio, 3–5 min: rower, bike or fast walk.',
          '[[c_er|Band external rotation]] — 15 per side',
          '[[c_pullapart|Band pull-apart]] — 15',
          '[[c_scappush|Scapular push-up]] — 10',
          '[[c_wallslide|Wall slide]] — 8',
          'Ramp-up sets for your first exercise (below).',
        ],
      },
      { t: 'h', text: 'Gym · lower day (8 min)' },
      {
        t: 'steps',
        items: [
          'Easy bike, 3–5 min.',
          'Bodyweight squat — 10',
          'Glute bridge — 10',
          'Leg swings — 10 forward-back and 10 side-to-side, each leg',
          'Hop and stick — 5 per leg: small hop, land softly on one leg with your knee over your toes, hold 2 s.',
          'Ramp-up sets for leg press (below).',
        ],
      },
      { t: 'h', text: 'Ramp-up sets' },
      {
        t: 'p',
        text: 'Before the first exercise of the day, work up to your working weight. These sets shouldn’t tire you. Rest about 60 s between them. The app calculates them from your working weight.',
      },
      {
        t: 'table',
        head: ['', 'Ramp-up', 'Example (22 kg)'],
        rows: [
          ['1', 'About 50% × 8–10 reps', '12 kg × 10'],
          ['2', 'About 70% × 4–5 reps', '16 kg × 5'],
          ['3', 'About 85% × 2–3 reps', '18 kg × 2'],
          ['→', 'Your working sets', '22 kg × 6–10'],
        ],
      },
      { t: 'h', text: 'Before volleyball or basketball (8 min)' },
      {
        t: 'steps',
        items: [
          'Jog, skips, side shuffles — 3 min.',
          'Leg swings and walking lunges with a twist — 1 min.',
          '[[c_er|Band external rotation]] 12 per side + [[c_pullapart|band pull-apart]] 15 (no band: big arm circles).',
          '[[c_scappush|Scapular push-up]] — 10',
          'Jumps: 5 at half effort, 5 at three-quarters, 3 at full effort.',
          'Volleyball: build your hitting and serving from half to full power over about 5 minutes.',
        ],
      },
      { t: 'h', text: 'After playing (3 min)' },
      {
        t: 'bullets',
        items: [
          '[[c_crossbody|Cross-body stretch]] — 2 × 30 s on your hitting arm',
          '[[c_openbook|Open book]] — 8 per side',
          'Calf stretch against a wall — 30 s per leg',
        ],
      },
    ],
  },
  {
    slug: 'technique',
    section: 'The workouts',
    title: 'Rules for every rep',
    summary: 'Tempo, breathing and range for every exercise',
    blocks: [
      {
        t: 'bullets',
        items: [
          '**Tempo:** lower in 2–3 s, short pause in the stretch, then lift with control — not slow, not jerky.',
          '**Breathing:** breathe in on the way down, out through the hardest part. On leg press and RDLs, take a big belly breath and brace before each rep.',
          '**Range:** as deep as you can go without pain and without losing your position.',
        ],
      },
      {
        t: 'p',
        text: 'Every exercise has its own page with setup, how to do it, what to avoid and what to change if it hurts. Open it from the exercise library or by tapping an exercise during a workout.',
      },
    ],
  },
  {
    slug: 'progress',
    section: 'Grow & recover',
    title: 'How to progress',
    summary: 'Double progression: add reps, then weight',
    blocks: [
      {
        t: 'p',
        text: 'Muscles grow when you ask them to do a little more over time. The simplest way is **double progression** — and the app tells you when it’s time to go up:',
      },
      {
        t: 'steps',
        items: [
          'Every exercise has a rep range, for example 8–12.',
          'Pick a weight you can lift for the bottom of the range at the target RIR.',
          'Each session, try to add a rep to one or more sets.',
          'When you reach the top of the range on **all** sets with good form, go up to the next weight (dumbbells usually +2–2.5 kg; machines one step).',
          'Start again near the bottom of the range, and repeat.',
        ],
      },
      { t: 'h', text: 'Example: low-incline press, 3 × 6–10' },
      {
        t: 'table',
        head: ['Week', 'Weight', 'Reps'],
        rows: [
          ['3', '22 kg', '9 · 8 · 7'],
          ['4', '22 kg', '10 · 9 · 8'],
          ['5', '22 kg', '10 · 10 · 9'],
          ['6', '22 kg', '10 · 10 · 10 ✓ → go up'],
          ['8', '24 kg', '8 · 7 · 7 · 6 (4 sets in the Push block)'],
        ],
        tones: [null, null, null, 'ok', null],
      },
      { t: 'h', text: 'When the next weight is too big a jump' },
      {
        t: 'p',
        text: 'Going from 8 to 10 kg on lateral raises is +25%. Instead, keep the weight and add reps (up to about 25), or slow the lowering to 4 s — then move up. Cables often have smaller steps.',
      },
      { t: 'h', text: 'Stuck?' },
      { t: 'p', text: 'If an exercise hasn’t moved in 3 sessions:' },
      {
        t: 'steps',
        items: [
          'Check your sleep, food and stress first.',
          'Drop the weight 10% and build back up over 2–3 weeks.',
          'Still stuck? Switch to a similar exercise ([[swaps|swap list]]).',
        ],
      },
    ],
  },
  {
    slug: 'recovery',
    section: 'Grow & recover',
    title: 'Rest & recovery',
    summary: 'Rest between sets, sleep, rest days, signs you need more rest',
    blocks: [
      {
        t: 'lead',
        text: 'You don’t grow in the gym — you grow while you recover. With 2–4 sport sessions a week, recovery is what limits you.',
      },
      { t: 'h', text: 'Rest between sets' },
      {
        t: 'table',
        head: ['Exercise', 'Rest'],
        rows: [
          ['Big lifts: presses, rows, pull-ups, pulldowns, leg press, RDL', '**2–3 min**'],
          ['Split squats, leg curls, flyes, push-ups, crunches', '**60–90 s**'],
          ['Supersets: raises, face pulls, arms, calves, core', '**45 s** between the pair, **60–75 s** after the second'],
        ],
      },
      {
        t: 'p',
        text: 'The rest timer starts by itself when you tick a set. Start the next set when your breathing has settled and you feel ready to give a full effort. Longer rests on big lifts build more muscle than rushing.',
      },
      { t: 'h', text: 'Sleep: your #1 recovery tool' },
      {
        t: 'bullets',
        items: [
          '7–9 hours a night, with a similar bedtime every day.',
          'After evening games, give yourself 30–60 minutes to wind down: shower, food, calm screens.',
          'No caffeine in the 8 hours before bed. Dark, cool room.',
          'In one study, people on a diet who slept 5.5 hours lost much less fat — and more muscle — than when they slept 8.5 hours on the same diet.',
        ],
      },
      { t: 'h', text: 'Rest days' },
      {
        t: 'bullets',
        items: [
          'Rest days are part of the plan. Walk, stretch lightly, move around — but no extra hard workouts.',
          'Some soreness is normal, especially in weeks 1–2. Training while mildly sore is fine. Being very sore is not a sign of a good workout.',
        ],
      },
      {
        t: 'callout',
        tone: 'warn',
        title: 'Signs you need more rest',
        items: [
          'Your lifts go down 2 sessions in a row',
          'Your joints ache a little more each week',
          'Soreness lasts more than 3 days',
          'Poor sleep, low motivation, easily irritated',
          'You get sick more often than usual',
          '**→ Take 2–3 extra easy days, or do your deload week early.**',
        ],
      },
    ],
  },
  {
    slug: 'food',
    section: 'Grow & recover',
    title: 'Food: build muscle, lose fat',
    summary: '2,100 kcal, 165 g protein, 10,000 steps — and how to adjust',
    blocks: [
      {
        t: 'lead',
        text: 'Training builds the muscle; food decides whether you also lose fat. You need four things: train hard, eat plenty of protein, eat a little less than you burn, and sleep well.',
      },
      { t: 'h', text: 'Your daily targets (20-day plan)' },
      {
        t: 'table',
        head: ['Target', 'Daily', 'Notes'],
        rows: [
          ['Calories', '2,100 kcal', '1,900 kcal on full rest days (no gym, no game)'],
          ['Protein', '165 g', 'About 2 g per kg: protects your muscle while you diet'],
          ['Carbs', 'about 250 g', 'Fuel for the gym and games: don’t cut them'],
          ['Fat', 'about 45 g', 'Don’t go much lower'],
          ['Steps', '10,000', '7,000 is enough on game days'],
          ['Water', '2.5–3 L', 'Plus about 0.5 L per hour of sport'],
          ['Sleep', '7–9 h', 'Short sleep makes you lose more muscle and less fat'],
        ],
      },
      { t: 'h', text: 'A day of eating (about 2,125 kcal, 168 g protein)' },
      {
        t: 'table',
        head: ['Meal', 'What to eat', 'Protein'],
        rows: [
          ['Breakfast', 'Kvarg oats: 250 g kvarg, 60 g oats, 100 g frozen mango or berries, 1 tbsp peanut butter', '40 g'],
          ['Lunch', 'Chicken box: 175 g chicken, 75 g rice (dry), 200 g frozen wok vegetables', '43 g'],
          ['Snack', '3 boiled eggs, 1 banana, 1 knäckebröd', '20 g'],
          ['Dinner', 'Chicken & lentil chili with 250 g potatoes', '38 g'],
          ['Evening', '250 g kvarg with cinnamon (or 200 g keso)', '27 g'],
        ],
      },
      { t: 'h', text: 'Adjust once a week' },
      {
        t: 'p',
        text: 'Log your morning weight in the Progress tab 3–7 times a week. The app compares weekly averages and tells you what to change:',
      },
      {
        t: 'table',
        head: ['Week average vs last week', 'Do this'],
        rows: [
          ['Down 0.5–1 kg', 'Perfect: change nothing'],
          ['Down more than 1 kg, and you feel flat in games', 'Add 150–200 kcal a day'],
          ['Down less than 0.3 kg', 'Check steps and weigh your food, then cut 150 kcal'],
          ['Same weight, but waist down', 'You’re losing fat and gaining muscle: keep going'],
        ],
        tones: ['ok', 'warn', 'warn', 'ok'],
      },
      { t: 'h', text: 'Around training and games' },
      {
        t: 'bullets',
        items: [
          '2–3 h before: a normal meal with carbs and protein.',
          '1 hour before, if you’re hungry: a banana.',
          'Within about 2 h after: a meal with protein and carbs.',
          'Tournament, or two sessions in a day: eat 300–400 kcal more that day.',
        ],
      },
      { t: 'h', text: 'What will slow you down' },
      {
        t: 'bullets',
        items: [
          '**Alcohol:** four 50 cl beers are about 800 kcal and hurt sleep and recovery.',
          '**Lösgodis:** a 200 g bag is 700–800 kcal.',
          '**Fika:** a kanelbulle is about 300 kcal. Have the coffee, skip the bun.',
          '**Sugary drinks** and weekend pizzas (about 1,200 kcal).',
        ],
      },
      { t: 'h', text: 'Supplements (optional)' },
      {
        t: 'bullets',
        items: [
          '**Creatine monohydrate**, 3–5 g every day: one of the best-researched supplements for strength and muscle. It adds 1–2 kg of water weight at the start. (Check with a doctor first if you have kidney problems.)',
          '**Whey protein**: just convenient food, if you struggle to reach your protein.',
          '**Vitamin D** in winter if you live far from the equator.',
          '**Caffeine** before training is fine, but not in the 8 hours before bed.',
        ],
      },
    ],
  },
  {
    slug: 'track',
    section: 'Grow & recover',
    title: 'Track progress & adjust',
    summary: 'What to measure and how to read the signs',
    blocks: [
      { t: 'h', text: 'What to measure' },
      {
        t: 'bullets',
        items: [
          '**Bodyweight:** weekly average of 3–7 morning weigh-ins (Progress tab).',
          '**Waist:** every 2 weeks, in the morning, tape at belly-button height, relaxed.',
          '**Photos:** every 4 weeks — same light, same poses (front, side, back).',
          '**Your log:** are your weights and reps going up? Each exercise page has a chart.',
        ],
      },
      { t: 'h', text: 'Read the signs' },
      {
        t: 'table',
        head: ['If you see…', 'Do this'],
        rows: [
          ['Weight slowly down, waist down, lifts up', '**Perfect. Keep going.**'],
          ['Weight the same, waist down, lifts up', '**Fat out, muscle in. Ignore the scale.**'],
          ['Weight dropping fast (over 0.5% a week), lifts dropping', '**Eat ~200 kcal more per day.**'],
          ['Weight and waist stuck for 3+ weeks', '**Eat ~200 kcal less per day.**'],
          ['Lifts going down for 2+ weeks', '**Fix sleep and food, then deload early.**'],
        ],
        tones: ['ok', 'ok', 'warn', 'warn', 'bad'],
      },
      {
        t: 'callout',
        tone: 'info',
        title: 'Be patient',
        items: [
          'Muscle grows slowly: you’ll see it in photos over 2–3 months, not in the mirror day to day. Three good sessions a week for a year will change your body.',
        ],
      },
    ],
  },
  {
    slug: 'life',
    section: 'Adapt',
    title: 'When life gets in the way',
    summary: 'Missed sessions, short on time, exams, sick, flare-ups, travel',
    blocks: [
      { t: 'h', text: 'Missed a session' },
      {
        t: 'p',
        text: 'Don’t double up. Do the next session in order when you can — and keep the rule: no Lower the day before a game.',
      },
      { t: 'h', text: 'Only 40 minutes' },
      { t: 'p', text: 'Do exercises 1–4 and skip the rest. Main lifts first, always.' },
      { t: 'h', text: 'Exam weeks or a crazy week' },
      {
        t: 'p',
        text: 'Minimum week: 2 sessions (Upper A + Lower, or Upper A + Upper B), exercises 1–4 only. That keeps your muscle and strength for several weeks.',
      },
      { t: 'h', text: 'Sick' },
      {
        t: 'p',
        text: 'Fever, chest cold or feeling ill all over: rest until you’re better. A mild cold above the neck: a light session (half the sets, RIR 3) is OK if you feel like it.',
      },
      { t: 'h', text: 'Back after a week off' },
      { t: 'p', text: 'First session at RIR 3 with one set less. Back to normal the session after.' },
      { t: 'h', text: 'After a tournament or a very hard week' },
      { t: 'p', text: 'Next gym session at RIR 3, or take an extra rest day.' },
      { t: 'h', text: 'Shoulder flares up' },
      {
        t: 'p',
        text: 'Switch all pressing to the most comfortable option (machine press or push-ups), use a shorter range, keep the pulling and the shoulder routine, and follow the [[pain|pain rules]].',
      },
      { t: 'h', text: 'No gym (travel)' },
      {
        t: 'p',
        text: '3 times a week, close to failure: push-ups (all variations), band rows and pull-aparts, split squats, single-leg RDLs, calf raises.',
      },
    ],
  },
  {
    slug: 'swaps',
    section: 'Adapt',
    title: 'Exercise swaps',
    summary: 'Machine busy or uncomfortable? Use the first pain-free swap',
    blocks: [
      {
        t: 'p',
        text: 'Machine busy, missing, or uncomfortable? Use the first swap that’s available and pain-free. During a workout, open an exercise’s menu and tap Swap.',
      },
      {
        t: 'table',
        head: ['Exercise', 'Swaps'],
        rows: [
          ['Low-incline DB press', 'Incline machine press · feet-elevated push-up'],
          ['Flat DB press', 'Machine chest press · DB floor press · push-up'],
          ['Cable fly (chest height)', 'Pec deck · light DB fly, stopping at chest level'],
          ['Low-to-high cable fly', 'Pec deck · light low-incline DB fly'],
          ['Chest-supported row', 'Machine row · one-arm DB row with a hand on a bench'],
          ['Lat pulldown', 'Assisted pull-up · one-arm cable pulldown'],
          ['Neutral-grip pull-up', 'Lat pulldown · assisted pull-up'],
          ['Seated cable row', 'Machine row · one-arm DB row'],
          ['Lateral raise', 'Cable ↔ dumbbell · machine lateral raise'],
          ['Face pull', 'Band face pull · reverse pec deck'],
          ['Reverse pec deck', 'Cable rear-delt fly · band pull-apart (high reps)'],
          ['Dumbbell curl', 'Cable curl · EZ-bar curl · hammer curl'],
          ['Rope pushdown', 'V-bar pushdown · one-arm cable pushdown'],
          ['Leg press / hack squat', 'Heel-elevated goblet squat · belt squat'],
          ['DB Romanian deadlift', 'Barbell RDL · 45° back extension · cable pull-through'],
          ['Bulgarian split squat', 'Reverse lunge · step-up'],
          ['Seated leg curl', 'Lying leg curl · Nordic curl (advanced)'],
          ['Standing calf raise', 'Leg-press calf raise · one-leg DB calf raise on a step'],
          ['Pallof press', 'Dead bug · side plank'],
          ['Cable crunch', 'Dead bug · short-range ab wheel'],
        ],
      },
    ],
  },
  {
    slug: 'cheat',
    section: 'Adapt',
    title: 'Cheat sheet',
    summary: 'The rules on one screen',
    blocks: [
      {
        t: 'bullets',
        items: [
          '**Effort:** big lifts RIR 1–2. Isolation RIR 0–1. Never grind presses to failure.',
          '**Rest:** 2–3 min on big lifts, 60–90 s on small ones.',
          '**Progress:** top of the rep range on all sets → next weight up.',
          '**Pain:** 0–3/10 dull = OK. 4+/10, sharp, or worse next morning → stop and swap.',
          '**Recover:** sleep 7–9 h, ~2 g protein per kg, deload in weeks 7 and 12.',
          '**Weeks 1–2:** one set less, RIR 3. **Weeks 8–11:** +1 set on exercises 1–2.',
        ],
      },
    ],
  },
];

export const ARTICLE_BY_SLUG: Record<string, Article> = Object.fromEntries(ARTICLES.map((a) => [a.slug, a]));

export const ARTICLE_SECTIONS: string[] = ARTICLES.reduce<string[]>((acc, a) => {
  if (!acc.includes(a.section)) acc.push(a.section);
  return acc;
}, []);

/** Warm-up checklists shown at the top of a workout. */
export const WARMUPS: Record<'upper' | 'lower', { title: string; steps: { text: string; exerciseId?: string }[] }> = {
  upper: {
    title: 'Upper warm-up · 8 min',
    steps: [
      { text: 'Easy cardio 3–5 min (rower, bike, fast walk)' },
      { text: 'Band external rotation — 15 per side', exerciseId: 'c_er' },
      { text: 'Band pull-apart — 15', exerciseId: 'c_pullapart' },
      { text: 'Scapular push-up — 10', exerciseId: 'c_scappush' },
      { text: 'Wall slide — 8', exerciseId: 'c_wallslide' },
    ],
  },
  lower: {
    title: 'Lower warm-up · 8 min',
    steps: [
      { text: 'Easy bike 3–5 min' },
      { text: 'Bodyweight squat — 10' },
      { text: 'Glute bridge — 10' },
      { text: 'Leg swings — 10 + 10 each leg' },
      { text: 'Hop and stick — 5 per leg, hold 2 s' },
    ],
  },
};
