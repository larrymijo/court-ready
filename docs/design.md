# Court-Ready design system

Monochrome, iPhone first. The screens are drawn on the [Court-Ready Monochrome canvas](https://claude.ai/artifact/2C6G8CAQJLNT8wrDwTv3LU); this file is their written form, so the build does not depend on opening it. The plan that applies it is in [polish-plan.md](polish-plan.md).

**Colour**

| Token | Value | Used for |
|---|---|---|
| `bg` | `#000000` | Screen background |
| `surface` | `#111111` | Cards |
| `control` | `#1C1C1C` | Inputs, steppers, chips, secondary buttons |
| `track` | `#2A2A2A` | Progress tracks, selected segment |
| `hairline` | `#222222` | Dividers inside cards |
| `outline` | `#3A3A3A` | Outlined buttons, empty check circles |
| `text` | `#FAFAFA` | Primary text, primary button fill, done marks |
| `textMuted` | `#B3B3B3` | Secondary text |
| `textFaint` | `#8C8C8C` | Labels, captions (passes 4.5:1 on `bg`, `surface` and `control`) |
| `onAccent` | `#000000` | Text on white |
| `danger` | `#FF453A` | Pain 4+ and delete only |

**Type:** system font (SF Pro on iPhone), tabular numbers everywhere.

| Style | Size / line / weight |
|---|---|
| Screen title | 32 / 38 / 700, tracking -0.02em |
| Hero | 28 / 32 / 700 |
| Section heading | 22 / 26 / 700 |
| Button, bar title | 17 / 600 |
| Row title | 16 / 600 |
| Body | 15 / 20 |
| Secondary | 13 / 18 |
| Label | 12 / 600, uppercase, tracking +0.08em |
| Smallest | 11 |

**Shape and spacing:** screen gutter 20. Card padding 16 (hero card 20). Radius 24 hero card, 20 card, 16 primary button, 14 control, 12 small button, pill for chips. No shadows, no borders on cards.

**Touch:** every target at least 44 px. Primary button 56 px tall, pinned to the bottom with the safe-area inset. Stepper buttons 44 px.

**Meaning without colour**

| Meaning | Shown as |
|---|---|
| Done | White filled circle with a black check |
| Selected, today | White fill with black text |
| Gym day, sport day | Filled dot, ring |
| Warm-up set | Outlined "W" badge |
| Record | Small outlined "PR" tag |
| Phase | Text label, no colour |
| Up or down | Sign and number, never red or green |
| Chart series | White line or bar; grey for reference and targets |

**Navigation:** four tabs: Today, Plan, Progress, Library. History becomes a view inside Progress. The guide and the exercise list live in Library. Settings stays behind the icon on Today.
