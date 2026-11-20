# R81 strict gameplay review: rampart-and-vine

**Commit reviewed:** `f3c8282ad16c62f345f2d033dd147a342e5ff903` (origin/alex/brave-carson-rbpmlk, includes cb812c16 shell calm pass)
**Verdict: FAIL**. Average **6.1**. Rows under 7: 1, 4, 5, 6, 8. No stopper found.

| # | Row | Score |
|---|-----|-------|
| 1 | Rules fidelity | 6 |
| 2 | Tutorial teaches | 7 |
| 3 | First 10 seconds | 7 |
| 4 | Turn clarity | 6 |
| 5 | Phone play | 5 |
| 6 | AI and pacing | 5 |
| 7 | Feel | 7 |
| 8 | Bugs | 6 |

## Gates (each run alone, `VIS_rampart-and-vineS=","`)
| Run | Result | Why |
|-----|--------|-----|
| --quick 1 | FAIL (174 s) | scenarios 10/14: `story-scene` "story text not visible: .gxc-scene .gxc-sc-text" + visual title/menu/board |
| --quick 2 | FAIL (179 s) | scenarios 11/14: visual title/menu/board (61 664 px, 21% different from ui-baselines) |
| --full 1 | FAIL (319 s) | phone-check ran clean; LAB WARN 8/12 (LAB rows != scenario list); `sweep.js` FAILURES: 1 (help kit `bubbles:{} bulbs:0`) |
| --full 2 | FAIL (321 s) | same as full 1 |

Baselines were pulled with `scripts/baselines.sh pull` before these runs (a pre-pull run had no snapshot at all). So the visual failure is real: either the baselines are stale after the calm pass, or the look changed. `story-scene` is flaky: it failed in 2 of the 4 quick runs. `games/lab.html` and the sweep-shots rewritten by --full were not committed.
`node games-src/carc/logic-test.js`: RULES 71, PASS 71, FAIL 0.

## Clutter (sampled every second; tutorial and 3 games at each size, plus a separate bulb probe)
- **Helpers: max 1.** No second over 1, also during the tutorial and after the bulb.
- **Infinite animations: FAIL. Max 10 at once, never 0 on your own turn.** These are the game's own loops:
  - `.glow::after {pulse2}` (`carc/game/src/skin.css:208`, `head.html:46`): every legal square, often 4 to 7 at once
  - `#htile.mine {hpulse}` (`head.html:68`): the tile in hand, every turn
  - `.fglow {fpulse}` (`skin.css:164`, `head.html:54`): every follower circle, plus `.fglow.wait`
  - Also infinite in the CSS, though not seen in my samples: `#world .pvhl {pulse}` (`skin.css:149`) and `#ghost {tapg}` (`head.html:58`)
- **15 s after the bulb:** 3 loops (2× glow pulse2 + htile hpulse) while placing, 4 (fglow fpulse) while placing a follower. None of them stop.
- The bulb is hidden (`display:none`) until you turn on the **Hints** toggle in the header (off by default). calm-audit's bulb tap therefore finds nothing in a default game.

## Rules vs the original (engine and every player-facing text)
The engine matches the rulebook notes (71/71 assertions; checklist rule 5, the Merchants & Masons field geometry, is still the known open item). The text has these mismatches:
1. `carc/game/src/hlp.js:53` card "The mason": "Each tile added gives an extra turn." Wrong: only a tile **you** add on a normal turn. A rival's tile gives nothing, and the extra turn never chains (engine `doPlace`: `!c.bonus`).
2. `carc/game/src/hlp.js:77` bulb reason "Mason here: each tile that grows it gives an extra turn." Same error.
3. `carc/game/src/ai.js:106` reason "each later tile that extends it gives you an extra turn." Same error.
4. `carc/game/src/story.js:22` (and `tutor.js:89`) fig_town: "Claim the town before it closes." But the step before (place3) has just **closed** the town, and you then claim the finished town, which scores at once. The line contradicts the board.
5. `carc/game/src/story.js:32` + `tutor.js` step `pennant`: "Each banner in a finished town adds 2 points" is shown on the 2-tile town that just scored +4 with **no banner** (status: "You +4: finished town, 2 tiles"). The banner is never shown.
6. `carc/game/src/engine.js:86` log: "“X” fits nowhere. It is set aside and you draw again." It says "you" on the computer's turn too.
7. Expansions have no rules card. HLP_RULES (`hlp.js:37-58`) has no card for the tavern (2 per tile, 0 if unfinished), basilica (3 per tile and banner, 0 if unfinished), champion (counts 2) or goods (10 per kind to the majority). The tutorial's own comment (`tutor.js:16`) promises "the lightbulb explains them". Only the coach's "later" list has one-liners, and even that has no "0 if unfinished".
8. Things left out that change scoring:
   - `story.js:66` coach `last` and the tutorial `final` line ("Open things: 1 per tile") drop "+1 per banner" for unfinished towns.
   - `story.js:70` coachEnd town: "2 per tile if finished, 1 if not". It leaves out banners.
   - `hlp.js:54` hog card: "scores 4, not 3". That is only true if you hold the field majority.
   - `hlp.js:38/40` "How a turn works" / "Every turn" leave out the priory as a claim and as a score.
9. `bf.js:328` goal card: "Towns pay double." That holds only against roads, and banners are not mentioned. Acceptable, but loose.

## First-timer play (touch only)
- **Tutorial**, at 375x667 and at 375x553: 24 steps, all reached by tapping the lit target. 0 wrong taps, 0 stuck. It ends "You win 20 to 2", then "Play a real game" starts a real game.
  - 8 of the 24 steps are "tap the lit tiles to go on" acknowledgements rather than actions.
  - The discard step uses a Next button and shows no discard.
- **Games**, default level (Easy, 1 rival). Screenshots are local only.

| Size | Game | Result | Time | Dead taps |
|------|------|--------|------|-----------|
| 375x667 | 1 | You 30, Cobalt 27 | 4.1 min | 0 |
| 375x667 | 2 | You 61, Cobalt 16 | 4.0 min | 0 |
| 375x667 | 3 | You 52, Cobalt 24 | 4.1 min | 0 |
| 375x553 | 1 | You 36, Cobalt 29 | 4.0 min | 0 |
| 375x553 | 2 | You 54, Cobalt 48 | 4.3 min | 0 |
| 375x553 | 3 | stopped on the last tile (see below) | | |

  - 0 page errors, 0 console errors in any game.
  - The stopped game was my bot's limit, not a game bug: every legal square for the shown turn of the tile was **culled** (hidden at the board edge, `bf.js:116`). A person can still reach it with the "N more" edge chips or by panning.
- **Balance** (`carc/game/novice-bench.js`, 40 games each):

| Novice level (`pGood`) | vs | Novice wins | Average score (novice–computer) |
|------|----|-------------|-------------------|
| 0.25 | Easy | 83% | 43–30 |
| 0.5 | Easy | 100% | 67–29 |
| 0.5 | Normal | 0% | 66–104 |

  Easy is close to random, and Normal crushes a newcomer. There is no fair middle.
- Average wait for a rival turn: 4.4 to 4.8 s at normal speed.

## Phone (375x667 and 375x553)
- Smallest visible text: 13 px (tutorial bubble). In games, 14 px.
- **Glows shrink to 30x30 px** (one game 36x36) once the board is fitted. That is under 44 px, in every game at both sizes.
- **Header overlap at 375 wide:** `#seats` scrollWidth 162 > clientWidth 149. The second seat (x 83 to 170) runs under the tile counter `#left` (x 161 to 208), and "Cobalt 0" is clipped (see the hint screenshot). It is worse with Hints on.
- **Board under the status bar:** the status card covers the top ~110 px of the board. The bulb's suggested square sat half under "Your turn" at 375x553.
- The edge chips ("3 more", "5 more") and Recentre cover live board squares mid-game.
- The tutorial bubble overlapped the hand bar in 1 to 2 samples.

## Rows under 7: repro
- **Row 1 (6):** open the rules cards in a Merchants game (Hints on, place a follower, then the bulb, then "How does this work?") and read "The mason". Then add a tile to a road that holds a rival's mason: no extra turn, which contradicts the card. Also play the tutorial to step 12/13: the banner rule is shown on a town with no banner.
- **Row 4 (6):** in a default game, start a turn after Cobalt plays. The status says "Your turn / Cobalt placed a town." and does not say what to do. Glows give no points and there is no bulb until you find the "Hints" toggle (off by default).
- **Row 5 (5):** at 375x553, play to about turn 20 and tap Recentre. Glows are 30x30, the header seats overlap the tile count, and the top glows sit under the status card.
- **Row 6 (5):** run `node novice-bench.js 40 easy .25` and `node novice-bench.js 40 normal .5`: 83% and 0%. Easy scores 16 to 48, and its play looks random.
- **Row 8 (6):** run `VIS_rampart-and-vineS="," python3 games-src/scripts/build-all.py --quick ...` twice: visual diffs every time, and `story-scene` fails in about half the runs. `--full` gives sweep.js FAILURES: 1 (help kit never opened).

## Fix list (in priority order)
1. **Calm:** make `pulse2` (skin.css:208/head.html:46), `hpulse` (head.html:68), `fpulse` (skin.css:164/head.html:54), `pulse` (.pvhl, skin.css:149) and `tapg` (#ghost, head.html:58) finite (pulse 3 times, then rest, like gx-tutor). Re-run calm-audit and this sampler to reach 0.
2. **Rules text:** fix the mason wording in hlp.js:53, hlp.js:77 and ai.js:106 ("an extra turn when you add a tile to it; never twice in a row"). Fix story.js:22/tutor.js:89 to "Claim the town you just closed: it scores at once." Make the tutorial `pennant` step point at a town that has a banner, or drop it. engine.js:86: use the player's name, not "you".
3. **Expansion help:** add rules cards (phase-tagged) for tavern, basilica, champion and goods, with "unfinished scores 0".
4. **Phone:**
   - keep glows ≥ 44 px (a zoom floor when the board is fitted, or pad the tap target);
   - stop the header seats overflowing at 375 (shorten names or drop "tiles");
   - inset the board so no square sits under the status card or the edge chips.
5. **AI:** make Easy play sensibly (close its own features, claim on purpose) and place a level between Easy and Normal. Target: a novice wins about 55 to 65% on the default level, with the computer scoring ≥ 50.
6. **Turn clarity:** keep the action line ("Turn, then place on a glow") on your turn and put the rival recap on a second line. Consider Hints on by default for the first game.
7. **Gates:** refresh or verify the ui-baselines for title/menu/board after the calm pass; make `story-scene` stable; find and fix the sweep.js failure.
8. **Partial lines:** add "+1 per banner" to the unfinished-town lines (story.js:66, story.js:70, the tutorial `final` step), and the majority condition to the hog card.
