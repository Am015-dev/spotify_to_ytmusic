# R24 gameplay re-review (strict), 12 Nov 2026

Reviewer R24. Scored by `GAMEPLAY-RUBRIC.md`. I changed no game code and did not trust the fixers' notes or benches.

How I played: each branch checked out locally with `origin/alex/brave-carson-rbpmlk` merged in (local only), built with
`VIS_SLUGS="," build-all.py --quick --out /tmp/r24 <slug>`, served over http next to its `games/<slug>/` asset folders.
Playwright phone contexts (isMobile, hasTouch), every action a `touchscreen.tap` at the centre of a visible, top-most control.
My drivers read the screen to decide but never called a game function. Default settings, default rival speed.
"New player" = taps a glowing / offered thing at random, unless a run says it followed the game's own suggestion.
The quick build skips phone-check, so I also ran `phone-check.js` on each staged build. The gate counts as PASS only if both pass.
Rules were checked against the published rulebooks and rule summaries online; notes stayed local and are not committed.
Screenshots: `games-src/reviews/R24-shots/`.

| Game | Total | Verdict | Gate | Lowest rows |
|---|---|---|---|---|
| emberclimb | 6.5 | FAIL | FAIL | 1 Rules 6, 5 Phone 6, 6 AI 6, 8 Bugs 6 |
| redline-rally | 6.9 | FAIL | FAIL (scenarios PASS, phone-check FAIL) | 4 Turn clarity 6, 5 Phone 6 |

---

## 1. emberclimb (shelf/W485-emberclimb-bench @ 9f12de21): 6.5, FAIL

Gate: **FAIL**. Quick build: scenarios 9/12 (`menu`: card cost box cut by 3 px; `ec-fight`: "End turn not found: #end";
`ec-fight-two`: "hero panel not found"). phone-check: FAIL at every size (3-4 dead taps on locked Story heroes, two lines over
8 words, "+ Second hero" and "Back" off screen in landscape).

What I played:
- Tutorial at 390x844 and 375x667: 15 guided steps, 23 taps, then the coached climb. Every tapped control was on screen and
  uncovered. Longest gap 2.2 s. 0 errors.
- Coached climb at 390, random playable cards and random glowing rooms: **won** ("CLIMB WON! Final boss down: Mire Behemoth",
  155 s, 7 floors).
- Three Quick games on defaults (Garrick, "1 act"), random playable cards, End turn when nothing plays, random glowing rooms:
  - 390 seed 3: **died on floor 4** to the Thorn Brute elite (52 s). It hit 56 x2 after 5 Strength from my Skills.
  - 375 seed 7: **won** ("SUMMIT! Final boss down: Ashen Wraith", 143 s).
  - 390 seed 11: **died at the boss** (205 s). Mire Behemoth split, and a split slug I could not see killed me.
- Foe turns about 1.9 s (max 3.2 s). 0 page errors, 0 console errors, 0 stuck states.

Fidelity check against the published game:
- Fixed: Quick game is Act 1 only. The boss is drawn at random from the act-1 three (I met the slime-type and ghost-type
  bosses). Foe Strength now reads "+8 per hit" / "+40 per hit", which matches the x8 scale. Weak, Vulnerable, Rest 24 and the
  die-driven foes all fit.
- Still not faithful: the data file says foe numbers were "written in video-game sizes" and converted (`tt()`), not taken from
  the tabletop cards. So floor-1 foes have 9-13 HP and the boss 128-138, and I cannot match them to the tabletop cards.
- The act-1 roster is cut down: 8 regular foe types. Several act-1 encounter types from the box are missing.
- Story mode still has "later act" chapters on the shelf-made act 2-3 foes.
- The setup line says "One act: 9 floors, then a boss drawn at random." Only the Rules card says it is Act 1. Nothing on the
  setup screen says "Act 1 only" or that acts 2-3 are left out.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 6 | Act 1 with a random act-1 boss and the Strength label are fixed. But foe numbers come from video-game sizes, not tabletop cards; the act-1 roster is reduced; Story still uses invented act 2-3 foes. |
| 2 | Tutorial teaches | 7 | 15 one-line steps in rule order, then every room met by doing. I won the coached climb by random play. Still 4 Next-only steps (goal, energy, pattern, map). It ends on the normal result screen, not a "now play a real game" card. |
| 3 | First 10 seconds | 7 | Big "New here? Learn in 5 minutes"; step 1 points at the boss intent with "Goal: beat the boss on top." |
| 4 | Turn clarity | 7 | Strength chips now say "+40 per hit"; intents show damage and hits. Nothing on screen says a Skill feeds the elite's Strength until the "+1 Strength" pop. |
| 5 | Phone play | 6 | Fixed: the elite reward fits at 375 (3 cards, Skip and Continue visible). New: when the boss splits at 390, the foe row overflows. One Bile Blob shows half cut at the right edge with its intent cut ("+1 Slim"), and the two slugs are not on screen. The potion in the tutorial is 36x36. |
| 6 | AI and pacing | 6 | Brisk (foe turns about 1.9 s, climbs 1-3.5 min). A new player won 1 of 3 Quick climbs on defaults, plus the coached climb. A floor-4 elite still kills a new player in under a minute (56 x2 against 80 HP). |
| 7 | Feel | 7 | Damage pops, cards fly, painted foes, painted reward and result screens. |
| 8 | Bugs | 6 | 0 errors, 0 stuck in 5 runs. But the gate fails (3 scenario tests, phone-check). The result says "Felled by Mire Slug (boss)". A "Relic: Dawnstone" tooltip stays over the deck grid on the CLIMB WON screen. Split foes are off screen. |
| | **Total** | **6.5** | **FAIL**: rows 1, 5, 6 and 8 are below 7; gate FAIL. No stopper. |

### Earlier findings (R21)
| Finding | Status | Evidence |
|---|---|---|
| Row 6: 0 wins in 3 climbs; floor-1 Ash Imp kill | **Partly fixed**: 1 of 3 Quick climbs won, coached climb won; floor-4 elite kill in 52 s. | R24-shots/ember-q2-summit-375.jpg, ember-q1-fallen-elite-floor4-390.jpg, ember-tutclimb-won-stale-relic-tip-390.jpg |
| Row 1/4: foe chip "Strength 1: +1 per hit" | **Fixed** ("Strength 5: +40 per hit"). | ember-q1-elite-56x2-390.jpg |
| Row 1: one fixed boss per act, act 2-3 reuse | **Fixed for Quick** (Act 1 only, random act-1 boss). Story still uses act 2-3 foes. | ember-quick-setup-oneact-390.jpg |
| Row 5: elite reward below the fold at 375 | **Fixed**. | ember-elite-reward-fits-375.jpg |
| Row 2: coached climb losable, ends like a loss | **Not seen this time** (I won it). It still ends on the plain result screen. | ember-tutclimb-won-stale-relic-tip-390.jpg |
| Row 2: 4 Next-only steps | **Not fixed**. | ember-tut-01-next-390.jpg |
| Row 4: "Fully blocked" coach line with 0 Block | **Not seen** in my runs. | n/a |
| Row 1: campfire text names the source medium | **Not re-checked** (my runs rested via "Rest: heal 24"). | n/a |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 5/8 | Killed the boss at 390 | Foe row overflows: the Bile Blob is half off the right edge, its intent cut ("+1 Slim"), the two slugs are not visible. One of them killed me. | ember-q3-split-foes-offscreen-390.jpg |
| 8 | Died after the split | "Felled by Mire Slug (boss)": a split slug is called the boss. | ember-q3-fallen-slug-boss-390.jpg |
| 8 | Won the coached climb | A "Relic: Dawnstone" tooltip floats over the final-deck grid. | ember-tutclimb-won-stale-relic-tip-390.jpg |
| 6 | Quick game 390, random rooms | Took the floor-4 elite; it gained Strength from my Skills and hit 56 x2. Dead in 52 s. | ember-q1-elite-56x2-390.jpg, ember-q1-fallen-elite-floor4-390.jpg |
| 1 | Read the setup screen | "One act: 9 floors, then a boss drawn at random." The game never says "Act 1 only" there. | ember-quick-setup-oneact-390.jpg |
| 1 | Data check | Foe numbers say they were written in video-game sizes and converted, not taken from the tabletop cards. | n/a (src/data.js comment above SCALE) |
| 5 | Tutorial step 14 | The potion target is 36x36. | ember-tut-14-potion-390.jpg |
| Gate | Quick build + phone-check | Scenarios 9/12; phone-check FAIL at every size. | n/a (build log) |

---

## 2. redline-rally (shelf/W496-redline-gameplay @ 3fb5afbf): 6.9, FAIL

Gate: **FAIL**. Quick build PASS (10/10 scenarios). phone-check: PASS at 390, landscape and rotations, but **FAIL at 375x553**:
a 27-word text ("The car furthest round the track...").

What I played:
- Tutorial at 375x667 by touch: 45 lines, 41 taps, 90 s (R19: 293 s), 0 errors. It ends on "You know every rule / Play a real
  game". One wait of 9.6 s (the rivals racing on after the flag).
- Three default races (Play ▶, Sunline, 2 laps, 4 Easy rivals) to the podium. I followed the advice line for gears ("shift up" /
  "shift down"), played the biggest cards and discarded Brakes and 1s:
  - 375, boosts chosen at random: **5th of 5**, 148 s, 6 spin-outs, 20 heat burned.
  - 390, took the "Suggested" boost answer: **won**, 119 s, 2 spin-outs.
  - 375, took the "Suggested" boost answer: **won**, 122 s, 2 spin-outs.
- Go to my next decision: 5.0-5.2 s average, 6.7 s max (R19: 9.4-9.7). No countdown on the boost or discard questions; they
  waited for my tap. 0 page errors, 0 console errors, 0 stuck states, 0 dead taps.

Is Easy too soft? A plain player who takes the "Suggested" boost wins with 2 spin-outs and 17-20 heat burned, while rivals burn
1-8. The same plain player who boosts at random finishes last. So choices still matter, but mostly one choice (boost). The
"Suggested" badge decides it, and the gears follow a "shift up / shift down" line. Easy is beatable, not boring, but the race is
close to "follow the labels".

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and right: discard every round, boost after the reveal, adrenaline, slipstream, corners, spin-out, cooldown, stress, two-gear shift. Fixed: the boost question now reads "add the next speed card", and a risky boost is offered (marked risky), not hidden. |
| 2 | Tutorial teaches | 7 | Every rule in order, one line and one tap each, 90 s, ends in a real race. 10 of the lines are Next-only. One 9.6 s wait at the end. |
| 3 | First 10 seconds | 7 | Play ▶ is clear; the goal card is still five lines; phone-check flags a 27-word text at 375. |
| 4 | Turn clarity | 6 | Good advice line ("Corner 4 in 1: up to speed 4 safe."), no auto-answer timers, a "Suggested" label on the boost. But at 375 the board often shows no car when I plan. After a 5th place the score line said "Dax leads by -2". |
| 5 | Phone play | 6 | Fixed: Race again / Title no longer cover the 375 result rows; cards 52x80, gears 74x49. Not fixed: in 3 of 5 planning shots at 375 my car is not on the board (trees only). 390 is better (car in 3 of 5). |
| 6 | AI and pacing | 7 | Brisk: about 5 s from Go to my next decision, races 2-2.5 min. A new player can win on Easy (2 of 2 with the suggestion). Random boosting loses badly, so it is not a walkover. |
| 7 | Feel | 7 | Cars slide, start lights, "+1 engine" / "+5 spaces" pops, podium with heat, spin-out and slipstream stats. |
| 8 | Bugs | 7 | 0 errors, 0 stuck, 0 dead taps in a tutorial and 3 races. Gate FAIL (phone-check 375 text). "leads by -2" copy. |
| | **Total** | **6.9** | **FAIL**: rows 4 and 5 are below 7; gate FAIL. No stopper. |

### Earlier findings (R19)
| Finding | Status | Evidence |
|---|---|---|
| Row 4/5: car not on the board while planning at 375 | **Not fixed**: 3 of 5 planning shots show trees only. | R24-shots/rr-375-plan-trees-no-car.jpg, rr-375-plan-trees-no-car-2.jpg, rr-plan-camera-strip-375top-390bottom.jpg |
| Row 1/7: 1.5 s auto-answer on boost and discard | **Fixed**: no countdown; the questions wait. | rr-375-boost-suggested.jpg |
| Row 6: 9.4-9.7 s from Go to next decision | **Fixed**: 5.0-5.2 s average. | n/a (timed in the driver) |
| Row 6: no win in 2 races | **Fixed with the suggestion** (won 2 of 2); 5th when boosting at random. | rr-390-win-suggested.jpg, rr-375-win-suggested.jpg, rr-375-5th-random-boost.jpg |
| Row 5: result buttons over rows 4-5 at 375 | **Fixed**. | rr-375-5th-random-boost.jpg |
| Row 8: "One cleaner corner" with 0 spin-outs | **Not seen** (my runs had spin-outs). | n/a |
| Row 1: boost hidden when a flip of 1 would spin | **Fixed**: offered as "Boost -1 heat (risky)". | n/a (question text in driver log) |
| Row 2: long tutorial (5 min) | **Fixed** (90 s). | rr-375-tut-end.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 6 | Three Easy races, same plan, only the boost answer changed | "Suggested" boost: won twice. Random boost: 5th, 6 spin-outs. The badge decides the race. | rr-390-win-suggested.jpg, rr-375-5th-random-boost.jpg |
| 4/8 | Finished 5th at 375 | The score line read "You 5th of 5 · Dax leads by -2". | n/a (page text read at the result) |
| 4/5 | Planned after a spin-out at 375 | Board shows trees only; the car and the corner are off camera. | rr-375-plan-trees-no-car.jpg |
| Gate | phone-check at 375x553 | FAIL: 27-word text "The car furthest round the track...". | n/a (phone-check results) |
| 2 | Tutorial end | Rivals keep racing for 9.6 s before the end card. | rr-375-tut-end.jpg |
