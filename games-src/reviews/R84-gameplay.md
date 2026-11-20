# R84 strict gameplay review: final-approach

**Verdict: FAIL, average 6.5.** Rows 1, 4 and 5 are under 7. No stopper.

- **Commit reviewed:** `f3c8282ad16c62f345f2d033dd147a342e5ff903` (origin/alex/brave-carson-rbpmlk; contains cb812c16, the shell calm pass).
- **Date:** 20 Nov 2026.
- **Build:** `build-all.py --quick` output (game/final-approach.html at that commit), served with gx-serve. All play was by touch (Playwright touchscreen) at 375x667 and 375x553.

## Gates (each run alone, 2 runs per mode)

| Command | Run 1 | Run 2 | Why |
|---|---|---|---|
| `VIS_final-approachS="," build-all.py --quick --out /tmp/x final-approach` (as written in the brief) | FAIL | FAIL | 13/16 scenarios pass. The 3 failures are only visual.spec "A snapshot doesn't exist at games-src/.baselines/final-approach-{title,menu,board}-phone.png". The variable name in the brief is not read by anything; visual.spec reads `VIS_SLUGS`. |
| Same with `VIS_SLUGS=","` (what the brief meant) | PASS | PASS | 13/13 scenarios, look check ok. |
| `--full` (both variants, 4 runs) | FAIL | FAIL | phone-check and LAB pass (LAB warns 9/12). The sweep fails every landing (4/4) with: "no ghost finger on the first move", "no coach bubble for phase sys-*", "bulb tapped, no finger", "bulb: nothing glows at the suggestion", "bulb why 0 words: null", "bulb bubble has no 'How does this work?'". |

Wins and losses inside those sweeps: 3/4, 4/4, 3/4 and 4/4. The sweep checks expect helpers that the calm pass removed: the game now shows a looping `div.gh.tap` ghost hand on a die, not the kit finger, and no bubble. So either the sweep's expectations are stale or the bulb lost its explanation. Either way the full gate is red and must be fixed before the next deploy.

`games/lab.html`, rewritten by `--full`, was restored and not committed.

Logic tests: `node game/logic-test.js` 172/172 pass; `node game/rules-test.js` 75/75 pass.

## Rules check against the original (repo notes: rules-notes.md, RULES-CHECKLIST.md, rules-check/final-approach.md)

**Engine: no mismatch found.** Spot-checked: radio uses one `removePlane(G, val)` for all three radio spaces (engine.js:253), the reroll pick mask, the landing-speed freeze and the trainee return. The logic tests cover the 172 checklist rules.

**Player-facing text: 3 mismatches**

| # | File:line | Text the player sees | Rule |
|---|---|---|---|
| T1 | `game/src/ui11.js:133` (axis space tooltip and reason, `slotNeedLong`) | "Must match X's axis die within 1, or the plane tilts." | Any difference tilts the plane, by the difference. A difference of 1 tilts by 1; only equal dice keep it level. The text teaches that a difference of 1 is safe. |
| T2 | `game/src/ui11.js:135` (radio tooltip) | Co-pilot radio: "(counting from the next space)", pilot radio: "(counting this space as 1)". | Both radios count the same way: value 1 = the plane's own space (rules-notes section 3; the engine already does this for all three spaces). The co-pilot text is off by one space. |
| T3 | `game/src/ui10.js:85` (Rules / help card) | "A reroll token rerolls all unplaced dice, for both crew." | Each player may reroll ANY of their unplaced dice, including none (the engine and tutorial step `rrgo`, "Only the dice you picked change", agree with the rule). |

**Wording that is not wrong but misleads**
- `game/src/ui8.js` die hint "radio the plane on 7" (seen R4, 375x553, seed 1): space 7 is labelled "Airport" on the board, so no "7" is shown anywhere.
- The board labels the engine spaces "Speed" while the help, tutorial and logs say "Engines".
- The tutorial flies a 4-round approach from 3000 ft, not 7 rounds. This is fine as teaching, and the goal card of the real game says round 7.

## First-timer play

**Tutorial:** tutor-test (copied, pointed at this build) at 375x667 and 375x553 had 0 problems. It runs 27 steps and teaches 18 rules in order (together, secret, axis, turns, engines, coffee, gear, altitude, radio, reroll, coffee-spend, tilt-crash, flaps, overshoot, brakes, final, speed, win). Each step is one short line and one tap. Wrong taps are refused (108 tried), and the rotate, leave-and-return and skip paths all work.

**Games:** 12 full games by touch, all 7 rounds, the computer partner on the default level `normal`, scenario g1.

| Size | Player policy | Seeds | Result |
|---|---|---|---|
| 375x667 | follows "What should I do?" | 1, 2, 3 | WIN, WIN, WIN |
| 375x553 | follows "What should I do?" | 1, 2, 3 | WIN, LOSE spin (R7), LOSE "The landing failed." |
| 375x667 | newcomer (easy-level choices, no hints) | 11, 12, 13 | WIN, WIN, LOSE "The landing failed." |
| 375x553 | newcomer (easy-level choices, no hints) | 11, 12, 13 | WIN, WIN, WIN |

- 0 page errors, 0 stuck states, 0 dead taps, 66-77 taps per game.
- A newcomer can win on the default level (5/6).
- The partner plays sensibly and quickly. It also gives strategy lines but never dice values.

**Whose turn and what to do:** a "Your turn" pill plus a bottom line naming a die and its best two spaces ("Your 4: engines, or coffee."). Previews on the spaces ("5 first", "+1 coffee", "down") are good. Problems:
- The turn and partner banners ("Your turn / Your 4: ...", "Ravi used Radio") sit on top of the approach track and hide the planes you need to see: shots r1 and r4, at both sizes.
- A failed landing says only "The landing failed." It does not say which check missed (planes, gear, flaps, axis or speed).
- Following the advice every turn still lost 2 of 6 games, one of them a spin in round 7. The advice never warned about the tilt.
- The goal card shows every win condition already ticked (green checks) before the flight starts.

## Clutter (sampled every second; helpers per the calm-audit rules, glows counted by class `.legal/.need/.cpt` too)

| Path | Max helpers (kit count) | Max glowing elements | Max infinite loops at once |
|---|---|---|---|
| Tutorial, 375x667 and 375x553 (285 samples) | 1 | **8** | **7** |
| 12 games | 0 | **7-8** | **7-8** |
| 16 s after the Hint bulb | 0 | 0 | **1**: `div.gh.tap {ghtap}`, still running at 16 s |
| 15 s after "What should I do?" | 0 | **8** (7 legal spaces + the suggested die) | **7**: `pulse` x6 and `fa-cpt` x1, still running at 15 s |

These are the game's own infinite loops, which calm-audit did not catch (its start scenario has no die lifted):
- `.slot.legal { animation: pulse 1.2s infinite }`: every legal space while a die is lifted.
- `.slot.need { animation: needp 1s infinite }`: red pulse on unfilled Axis/Engines.
- `#pz .slot.cpt { animation: fa-cpt 1.1s infinite }`: the suggested space, `game/src/ui11.js:284`.
- `div.gh.tap { animation: ghtap infinite }`: the bulb's ghost hand.

Result: 0 loops and at most 1 helper fails clearly.

## Phone (375x667 and 375x553)

- **Text:** smallest computed size 14 px. OK.
- **No horizontal scroll and nothing clipped off-screen.**
- **Tap targets under 44 px:**
  - At 375x553 every board space is **42x42** (1480 samples).
  - The altitude strip under the track ("R1/7 · 6000 ft · Your turn") is a tappable 362x27 (26 px tall at 553).
  - The partner's covered dice are 27x27 buttons; they are inert, so this is minor.
- **Overlap:** the turn/partner banners cover the approach track (see above).
- **Stale feedback:** a "Speed 2: holds position." bubble covered the Axis gauge at the start of R7 at 375x667. It was left over from R6; in R7 the plane never moves.

## Scores (GAMEPLAY-RUBRIC.md)

| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | **6** | The engine is exact (247 tests), but 3 player-facing texts teach wrong rules: axis "within 1", co-pilot radio counting, reroll "all dice". |
| 2 | Tutorial teaches | 7 | 18 rules in order, one line + one tap, robust. Behind the bubble up to 7 spaces pulse forever, so it is not one helper. |
| 3 | First 10 seconds | 7 | A clear title, then a goal card. The pre-ticked checklist on the goal card is confusing. |
| 4 | Turn clarity | **6** | Banners hide the track; "plane on 7" names a space the board labels Airport; a loss says only "The landing failed."; following the advice can still spin. |
| 5 | Phone play | **5** | 42 px spaces at 553, a 26-27 px tappable strip, banners over the track, and 7-8 infinite pulses plus 8 glows at once (calm rule failed). |
| 6 | AI and pacing | 7 | The partner is sensible and fast; a newcomer wins 5/6; 7 rounds is a good length. A hint-follower loses 2/6. |
| 7 | Feel | 7 | Dice fly, axis and gauge animate, plane art, landing scene. |
| 8 | Bugs | 7 | 12 games + tutorial: 0 errors, 0 stuck, 0 dead taps. The full gate (sweep) is red. |

**Average 6.5. FAIL** (rows 1, 4 and 5 are under 7). No stopper: nothing stuck, no engine rule broken.

### Repro for rows under 7
- **Row 1:**
  - Start a Computer game and long-press or inspect the Pilot Axis space: the tooltip reads "within 1, or the plane tilts".
  - Inspect a Co-pilot Radio space: it reads "counting from the next space".
  - Open Rules (book icon): the reroll line reads "rerolls all unplaced dice".
- **Row 4:**
  - 375x553, seed 1, round 4: the "Ravi used Radio" banner covers spaces 2-6 of the track, and the bottom line reads "radio the plane on 7".
  - 375x667, seed 13, newcomer policy: the result says "The landing failed." with no reason.
- **Row 5:**
  - At 375x553 measure `#pz .slot`: 42x42.
  - Lift any die: all legal spaces pulse (`pulse` infinite).
  - Tap the bulb: `div.gh.tap` loops for at least 16 s.

## Fix list (in priority order)

1. **Clutter (row 5, calm rule).**
   - Make `pulse`, `needp`, `fa-cpt` and `ghtap` finite (at most 3 iterations, then a static ring).
   - When a die is lifted, show legal spaces as a still outline. Only the suggested space may get one short pulse.
   - The 15 s after "What should I do?" or the bulb must end with 0 running loops.
   - Then add a lifted-die state to calm-audit so this cannot come back.
2. **Rule texts (row 1).**
   - `ui11.js:133`: "Any difference tilts the plane toward the higher die; equal dice keep it level."
   - `ui11.js:135`: use "counting this space as 1" for every radio space.
   - `ui10.js:85`: "...lets both crew reroll any of their unplaced dice, once."
3. **Full gate.** Either update sweep.js to the calm-pass helpers (the `gh.tap` ghost and the bottom-line advice), or restore a short bulb explanation. `--full` must be green. Also fix the brief/gate env name (`VIS_SLUGS`), or record the 3 phone baselines.
4. **Track visibility (rows 4/5).** Move the turn/partner banner off the approach track (over the board's top-centre gauge area or into the bottom line), or shorten it to under 1.5 s.
5. **Tap sizes at 375x553.** Board spaces must be at least 44 px. Make the altitude strip at least 44 px tall, or not tappable.
6. **Loss reason.** Replace "The landing failed." with the failed checks ("2 planes still on the track", "Flaps 3/4").
7. **Hint text.** Say "the plane at the airport" instead of "on 7". Make the advice warn when the axis will reach a tilt of 2 or more before round 7.
8. **Minor.**
   - Goal card: show empty boxes, not pre-ticked ones.
   - Clear the last-round engine bubble at round start.
   - Label the engine spaces "Engines", or say "Speed" everywhere.

Screenshots were taken locally in the reviewer's scratch folder: title, goal card, turns at R1/R4/R7, bulb, ask and result, at both sizes. They are not committed.
