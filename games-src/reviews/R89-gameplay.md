# R89 strict gameplay review: nebula-aces

Reviewed commit: `f3c8282ad16c62f345f2d033dd147a342e5ff903` on origin/alex/brave-carson-rbpmlk. It contains cb812c16 (the shell calm pass). Date 2026-11-20 (UTC).
Reviewer only. No game code was changed.

## Verdict: FAIL, average 6.4. No stopper. Three rows are below 7 (2, 4, 5) and row 1 sits at 6.

| # | Row | Score |
|---|-----|-------|
| 1 | Rules fidelity | 6 |
| 2 | Tutorial teaches | 6 |
| 3 | First 10 seconds | 7 |
| 4 | Turn clarity | 6 |
| 5 | Phone play | 5 |
| 6 | AI and pacing | 7 |
| 7 | Feel | 7 |
| 8 | Bugs | 7 |

Average = 51 / 8 = 6.4.

**The game itself is sound.** The engine matches the original rules, and every full game reached its result screen with 0 errors.

**It fails the newer bar on four counts:**
- 4 player-facing texts are wrong.
- More than one helper is on screen at once.
- 4 of the game's own animations loop forever.
- Panels overlap at 375x553.

## Gates (run alone, 2 runs each)

| Gate | Run 1 | Run 2 |
|---|---|---|
| `--quick --out /tmp/x nebula-aces` | PASS | PASS (scenarios 115 s) |
| `--full --out /tmp/xf nebula-aces` (rules-test + sweep) | PASS | PASS |

`games/lab.html` was restored afterwards and is not committed.

The brief's env var `VIS_nebula-acesS=","` is not a valid shell name. Passing it through `env` leaves visual baselines on, and both runs then FAIL with "scenarios 9/12 ok: title: A snapshot doesn't exist at .baselines/nebu…", because this machine has no baselines. The template meant `VIS_SLUGS=","`, and the gate PASS results above use that.

## Rules vs original

**Engine.** No engine mismatch found.
- The W391 fixes are present:
  - One attack die per maneuver over asteroids: engine.js:136-139.
  - Tied squad totals give initiative to the second-named side, with no die: engine.js:66-68.
- No text still describes the old rules for either fix.
- One simplification is not disclosed: barrel roll and boost are simply not offered when the template or base would touch an asteroid (engine.js:172-176). The tabletop allows the move and then rolls the asteroid die. Either allow it, or add a "Kept simple" line.

**WRONG: these mislead the player**

| # | File:line | What it says | Correct |
|---|---|---|---|
| W1 | xw/flow.js:176 | The attack summary shows "+1 attack die" at range 1 and "+1 defence die" at range 3 for every weapon, torpedoes included. | The bonuses apply to the primary weapon only, which is what the engine does (engine.js:238 `w.bonus`). A torpedo shot at range 3 shows a bonus that is never rolled. |
| W2 | xw/story.js:26 | The blinded-pilot card says "the next attack rolls no dice". | The dice of that attack cannot be modified (data.js:30 and the engine). |
| W3 | xw/guide.js:93 | Stressed ship: "the other side picked a white one for it". | The opponent picks any non-red maneuver, white or green (engine.js:114-119; flow.js:62 says it right). |
| W4 | xw/ui.js:181 | Rules drawer: "Asteroids are placed for you". | Humans place asteroids (engine.js:77, ui.js:95 "Both sides take turns placing 6 asteroids"). The two texts contradict each other. |

**Contradiction / dead copy**

| # | File:line | Issue |
|---|---|---|
| C1 | xw/lore.js:42, :44 | Tutorial: "Tied pilot skill: the side with fewer squad points acts first." It is the side with initiative, which on a points tie is the second side. data.js:74 is correct, so the tutorial and the rules drawer disagree. |
| C2 | xw/guide.js:112 (+ stale comment engine.js:68) | The coach line for `q.key==='init'` ("Take initiative…") is left over from the die-roll era. Nothing asks that question any more. Delete it. |

**WORDING: imprecise but not contradicted by the game**

- **Pilot-skill ties** (flow.js:46, guide.js:112, ui.js:133, data.js:74): "initiative moves and fires first". In combat, equal pilot skill fires simultaneously (engine.js:224).
- **Asteroid damage** (lore.js:10, hlp.js:64, ui.js:95, data.js:71, guide.js:72): "Flying through an asteroid hurts" / "a damage die". It is one attack die, and only a hit or crit hurts. flow.js:59 words it correctly.
- **Who cannot act** (hlp.js:64, :74): "Stressed or bumped ships cannot act". The list leaves out ships that overlapped an asteroid (engine.js:154).
- **Asteroid attack ban** (data.js:71): the rules drawer never says a ship ending on an asteroid cannot attack (engine.js:139).
- **Range bonus** (hlp.js:80, data.js:71, flow.js:158, lore.js:26, campaign.json:61): never says "primary weapon only".
- **Damage cards** (hlp.js:86): "A crit also draws a damage card". Hits also deal cards, face down. lore.js:58 is right.
- **Target lock reroll** (hlp.js:83): "reroll your blanks". A lock rerolls any attack dice you choose (engine.js:215).
- **Target lock duration** (hlp.js:78): "A lock stays until you spend it". A new lock replaces the old one, and the lock is lost when the target dies (engine.js:215, :356).
- **Clearing stress** (hlp.js:69, lore.js:61, guide.js:70/90, flow.js:60/127/214): "no red moves until a green one clears it". A green maneuver removes one stress token only (engine.js:147).
- **Damage-card texts** (story.js:26-27): "rolls a die for damage" should say only a hit deals damage. The concussed card triggers on any ship or obstacle overlap.
- **Fallback loss line** (ui.js:193): "lost to asteroid or crit damage". Bombs, mines, fire and breach are missing.

Not covered: the 57 expansion pilot and upgrade texts in exp.js. About 8 were spot-checked and matched.

## First-timer play (touch only, served build from /tmp/x, `?phone=1`)

**Tutorial (Learn in 5 minutes)**
- Played to completion at both sizes, 0 errors, about 50 s each:
  - "How you win" card, then a dial card, then "Your first battle".
  - A 1-vs-1 guided game, which ended in round 2.
- It teaches, in order: pilot-skill order, one action, arc/range/order, focus, shields then hull, pilot power, rocks, stress, target lock and reroll.
- It never teaches: the range 1/3 dice bonuses, bumping, flying off the mat, the end phase (which tokens drop), or commanding 2+ ships. Every default quick game after the lesson needs that last one, because the rival flies 2 ships.

**Quick games, newcomer who always taps the ★ suggestion**

| Size | Result | Round | Taps | Errors |
|---|---|---|---|---|
| 375x667 | won | 25 | 135 | 0 |
| 375x553 | lost | 5 | 34 | 0 |
| 375x667 | won | 11 | 57 | 0 |
| 375x553 | lost | 15 | 77 | 0 |

- Newcomer win rate is 2/4, so a newcomer can win on the default level.
- The round-5 loss is fast and comes from following the ★ move alone.
- Your one ship against two enemy ships is the original core matchup and is fair by points.

**Clear whose turn it is?** Mostly yes:
- The "R2 Fire · you" chip.
- The bottom hint line ("Tap a glowing enemy to shoot").
- "⏳ Rival's turn: … takes aim".

**The weak spot is clutter.** The same instruction is often shown 3 times at once, as banner, hint line and finger (see Clutter).

## Clutter (sampled once a second)

**calm-audit.js** (`CALM_SECS=20`, /tmp/x): `loops=1 maxHelpers=1`. The loop is `button.bfring.need {bfpulse}` on both the play path and the guided path. This is the known xw/board.css:42.

**My own sampler** (every second over 4 full games and 2 tutorials; glows counted by class; coach bubble `#na-coach` and finger `#bffing` counted as helpers):

| Path | Max loops | Max helpers | Detail |
|---|---|---|---|
| Quick games | 2 | 1 helper + 1 glow | See loops and screens below. |
| Tutorial | 2 | **2** in 7 of 26 samples | Coach bubble and finger together, e.g. "Ready? Tap Fly", "One action / Focus first", "Arc, range, order" + finger on the target. |
| After Hint/bulb, 15 s at 375x667 and 375x553 | 1 every second | 1 bubble + 1 glow every second | The bulb bubble "Tap your ship, then choose where it flies" duplicates the hint line under it. The pulsing ring keeps pulsing. |

Loops seen in quick games:
- `#bffing {bftap}`: board.css:102/104, the finger bobs forever.
- `.bfring.need {bfpulse}`: board.css:42/46.
- `.bfshot.aim path {bfdash}`: board.css:26/28, the aim line marches forever.
- `.bftgt.rec {bftg}`: board.css:57 and :286, the target chip glows forever.

The worst screens:
- **Round 1 opening.** The "Round 1: plan your move" banner, the bobbing finger, the pulsing ring and the hint line "Tap your ship to plan its move" are all up together. That is 4 cues for one tap.
- **Combat.** "Fire at … · range 3 · 3 dice vs 5" chip, "Your turn: Combat" banner, ★ target chip, arcs and the hint line.

Result: **FAIL.** The target is 0 infinite animations, including the game's own loops; there are 4 distinct loops. The target is max 1 helper; the tutorial shows 2, and 2 counting glows elsewhere.

## Phone (375x667 and 375x553)

- **Text.** No visible text under 11 px. The only hits are `span.icw` labels at font-size 0, which are hidden icon captions.
- **Taps.** Every control is 44 px or more. The planned-move chips `.bfm.small.set` measure exactly 44x44, borderline (seen as 43.x).
- **Overlap at 375x553** (from the second game at 375x553):
  - **P1.** Rival attack, round 4: the "Rival's turn / Knifepoint takes aim" banner sits on top of the dice panel and covers the DODGE dice and the "0 hits" result.
  - **P2.** Own combat, round 2: the "Your turn: Combat · Kael Varro can shoot. Pick a target." banner overlaps the ★ "3 vs 5" target chip and its own second line. The "Fire at Knifepoint · range 3" chip lies across the Nightjar label. A "STRESS" float text sits on the ship.
  - **P3.** The pilot-power button "★ Focus → evade / Change 1 of your focus results to…" is cut off with an ellipsis, so the player never sees what it does.
- **Dead taps.**
  - None in normal play: the bot never stalled for 15 s.
  - In the tutorial, tapping the wrong action (Focus when the coach wants Lock) does nothing visible apart from `GX.buzz` and a finger wiggle (board.js:287 `tutAllow`). It gives no text, and iOS has no vibration, so it reads as a dead tap.

## Row notes and repro (rows under 7)

**Row 1, Rules 6.**
- The engine is right.
- W1-W4 are player-facing rules errors, and W1 shows wrong dice counts in the live shot summary.
- To repro W1: take a pilot with a torpedo upgrade, fire it at range 3, and read the summary line. It shows "+1 defence die", which the engine does not roll.

**Row 2, Tutorial 6.**
- The lesson ends after 1-vs-1, round 2.
- It never teaches the range 1/3 bonuses, bump, off the mat, the end phase, or flying 2 ships, which the first real game requires.
- The coach bubble and finger show together (2 helpers).
- Repro: fresh storage, then "New here? Learn in 5 minutes", then follow the finger. At "Ready? Tap Fly" the bubble and finger are up together.

**Row 4, Turn clarity 6.**
- Instructions are shown 2-4 times at once (banner + hint + finger + bulb bubble).
- The banners cover the very chip they describe (P2).
- The pilot-power text is truncated (P3).
- "3 vs 5" on the target chip is not explained where it appears.
- Repro: Launch, then Quick, then fire in round 2 at 375x553.

**Row 5, Phone 5.**
- P1 hides the defence dice behind a banner during the rival's attack.
- P2 and P3 overlap and truncate at 375x553.
- 4 infinite loops on the board.
- Repro: Launch, then play at 375x553 until the rival's first attack (round 1-4). The dice panel is covered.

**The other rows.**
- Row 3 (7): the title is clear, with Launch / Learn / Story. The Goal card has 3 bullets.
- Row 6 (7): the AI is quick and sensible, and a newcomer wins 2/4.
- Row 7 (7): dice roll, "Missed!" / hit callouts, 3D ships, arcs.
- Row 8 (7): 0 errors and 0 stuck states. The tutorial's silent gated taps cost a point.

## Prioritized fix list

1. **Loops to 0** (board.css):
   - `bfpulse` :42, `bftap` :102, `bfdash` :26, `bftg` :57/:286.
   - Make each one 2-3 iterations, or start it only after an idle delay and then stop it.
   - Re-run `calm-audit.js` and expect `loops=0`.
2. **One helper at a time:**
   - In the tutorial, hide `#bffing` while `#na-coach` is up, or drop the bubble on tap steps.
   - In play, while the "Round N" / "Your turn" banner shows, hide the finger and do not pulse the ring.
   - Drop the bulb bubble's line when it repeats the hint line.
3. **P1/P2 banners:**
   - Never place `#bfban` over `#bfdice` or over the target chip; put it in the top band or skip it while the dice panel is open.
   - Remove the "Your turn: Combat" banner when the hint line already says "Tap a glowing enemy to shoot".
4. **P3:** let the pilot-power button wrap to 2 lines, or shorten it to "Change 1 focus to evade".
5. **Text fixes:**
   - W1 flow.js:176: show the range bonus only when the weapon is primary.
   - W2 story.js:26: "dice can't be modified".
   - W3 guide.js:93: "a non-red one".
   - W4 ui.js:181: "Both sides place asteroids, or tap Auto".
   - C1 lore.js:42/44: "the side with initiative".
   - C2 guide.js:112: delete the line.
   - Then the WORDING list (one stress per green; lock rerolls any dice; primary only; asteroid = one attack die; ship on an asteroid can't shoot).
6. **Tutorial coverage:**
   - Add one guided step on range bonuses, and one on bump / off the mat.
   - Make the end of the lesson a 1-vs-2 so the player flies 2 ships, or add a "you now command 2 ships" step.
7. **Gated tutorial taps:** show the coach line again (or a short "Tap ⌖ Lock for this step") instead of a silent buzz.
8. **Undisclosed simplification:** barrel roll and boost into asteroids. Allow the move with the die roll, or add a "Kept simple" line.
