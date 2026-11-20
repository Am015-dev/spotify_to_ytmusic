# R86 strict gameplay review: wildmark

**Verdict: FAIL, average 6.8.** Three rows are below 7: rules text (1), phone (5) and rival/pacing (6). The clutter check also fails: there are 4 kinds of infinite animation, not 0.
No stopper. Every game reached the result screen with 0 errors and nothing got stuck.

- Commit reviewed: `f3c8282ad16c62f345f2d033dd147a342e5ff903` (origin/alex/brave-carson-rbpmlk; it contains cb812c16, the shell calm pass)
- Date: 20 Nov 2026. Played by touch only at 375x667 and 375x553, on a fresh build (`build-all --quick`, staged copy).
- Screenshots are in the reviewer's scratch folder (`shots/<mode>-<size>-*.png`) and are not committed.

## Gates (wildmark alone, nothing else running)

| Run | Command | Result |
|---|---|---|
| quick 1 | `VIS_wildmarkS="," build-all.py --quick --out /tmp/x wildmark` (as written in the brief) | FAIL, 82 s: scenarios 11/14. The 3 visual snapshots (title/menu/board) failed with "A snapshot doesn't exist at games-src/.baselines/...". |
| quick 2 | same | FAIL, 80 s: same 3 missing snapshots |
| quick 3 | `VIS_SLUGS="," ... --quick` (what the brief meant, I think) | PASS, 80 s |
| quick 4 | same | PASS, 81 s |
| full 1 | `VIS_wildmarkS="," ... --full` | PASS, 69 s (phone-check 58.6 s; rules-test: hard 67 % / easy 0 %) |
| full 2 | same | PASS, 68 s |

The quick failures come from the environment, not the game. `VIS_wildmarkS` looks like a find/replace slip for `VIS_SLUGS`, so the visual check ran, and there are no local baselines. Both quick runs pass once the real variable name is used.
Both quick and full print `[lab] WARN 3/8 checks`: the LAB rows do not match the scenario list. `games/lab.html` was rewritten by `--full`; I reverted it and did not commit it.

## Rules vs the original (from RULES-CHECKLIST.md, rules-notes.md and the published rulebook)

**Engine: matches.** I read `src/engine.js` and `src/cards.js` in full against the checklist. All of these are right:
- setup: 43/63/83 tiles, 100 tokens, 25 acorns
- the pair pick
- placement next to your tiles in any rotation, with edges that must match for habitats
- tokens only on tiles that show the animal, one per tile
- a token on a keystone gives an acorn, while the supply lasts
- both acorn powers
- the three-alike sweep: optional, once per turn
- the four-alike wipe: automatic and repeated
- 20 turns each
- A-card tables, and an exact elk split (`engine.js:159-179`)
- largest-corridor scoring
- 2p and 3-4p majority bonuses, including ties and second place
- solo: the farthest tile and token leave the game, the rest slide, +2 for 7+
- tie-break on acorns, then a shared win

**Every mismatch I found in player-facing text or notes:**

| # | file:line | Says | Truth | Severity |
|---|---|---|---|---|
| M1 | `src/score.js:177` (Goal card before turn 1) | "+2 if yours is the biggest" | With 3-4 players it is +3 for first and +1 for second (ties 2 or 1 each). Every 3- and 4-player game opens with a wrong rule. | high |
| M2 | `src/ui.js:449` (Rules, "Simplified on purpose") | "Elk lines are counted longest first (rarely a point less than the best split)" | The engine finds the exact best split (`engine.js:159`). The text is out of date and makes the game sound less faithful than it is. | medium |
| M3 | `src/ui.js:449`, `src/ui.js:547`, `src/ui.js:574` | Variant cards use "our own house tables" / "house point tables" | W507 checked every B-D table against a rules guide, and all match. The labels are out of date. (Also stale: the comment at `src/campaign.js:10` and the header at `src/cards.js:2` saying "guessed".) | medium |
| M4 | `src/ui.js:448` (Rules, Ties) | "Most acorns left wins a tie." | It should also say that if acorns are tied too, the win is shared (`engine.js:230`). | low |
| M5 | `src/cards.js:234-237` (Elk D, variant) | Scores only the largest ring per connected elk group; the other elk get 2 each | The card scores every ring formation, and each elk counts in one ring. A group holding two rings scores too low. The card text at `cards.js:195` ("Elk curled around one space") does not mention the 2-per-leftover-elk rule either. | low (variant only) |
| M6 | `src/cards.js:226-233` (Elk B, variant) | Greedy split: diamond, then triangle, then pair | Can miss the best split (the card scores each elk once, at its best). | low (variant only) |
| M7 | `rules-notes.md:5`, `:31`, `:33` | "elk lines split greedily", "solo removal returns the token to the bag", "B-D cards not yet implemented" | All three are out of date. The engine does the exact split, removes the token from the game (`engine.js:128`, checklist R61), and implements B-D. | low (notes) |
| M8 | `rules-notes.md:24` | A URL that contains the original game's name | Breaks the CLAUDE.md hard rule (never write the original's name in the repo). | hard rule |
| M9 | `src/tutor.js:63` (tutorial) | "Biggest land of a kind beats Bram: plus 2 points." | Right for the 2-player tutorial. But it is the only place the bonus is taught, and the Goal card repeats it for every table size (see M1). | low |

Rules verdict: **the engine is faithful; the text is not**. There are 4 text mismatches a player sees in A-card play (M1-M4), 2 variant scoring gaps (M5, M6), and the notes have stale lines plus a hard-rule break (M7, M8).

## Clutter

I sampled once a second through 2 tutorials, 6 full games and one Hint/bulb run (15 s idle after the tap). The count uses the calm-audit definition plus glows by class: coach bubble, `.tuthl`, `#map .ring`, the `#pv` strip, toast, goal card, the `#edgea .ea` arrows.

- **Infinite animations: 4 kinds, up to 25 looping elements on screen at once.** The target is 0.
  - `skin.css:16` `#map .spot` → `wmglow` (every legal spot pulses while you place a tile; seen in 993 and 1122 samples)
  - `skin.css:19` `#map .ring` → `wmglow`
  - `skin.css:394` `#edgea .ea` (edge arrows) → `eaPulse`
  - `skin.css:356` `button.tuthl` → `tutp` (already known)
  - `skin.css:357` `#map .tuthl` → `tuts` (tutorial target hex)
  - The calm-audit only reports `tutp` because its start scenario never reaches the tile step.
- **Helpers, calm-audit definition:** at most 1. After the bulb, the hint bubble and its ring stay open the whole 15 s; that counts as one helper.
- **Helpers by class: at most 2 in games and 4 in the tutorial.** The target is at most 1.
  - In games:
    - goal card + toast, at the start of every game: the flavour caption "The thaw is here..." covers the goal card's Start button (`goal` screenshot). The "Your turn" banner also sits on top of the header.
    - `#pv` strip + toast
    - edge arrows + strip
    - ring + toast
  - In the tutorial: coach + `.tuthl` + ring + toast, and coach + edge arrows.
  - After the bulb: the hint ring sits on column 4 while the market's own "best" gold frame and gold "up to +4" badge sit on column 1 (`bulb-375x667-bulb15.png`). That is two conflicting "take this" signals at once.

## Phone (375x667 and 375x553)

- Text: nothing under 11 px at either size.
- Tap targets: the seat chips (`button.seat`, `skin.css:31`, `min-height:40px`) are 40 px tall at both sizes. Every turn of every game had chips under 44 px.
- Overlaps at 375x553:
  - The tutorial's `#tutNext` covers `#zoutB` (14 samples).
  - The edge arrows `.ea-r` and `.ea-t` overlap each other.
  - A tap on the legal spot `-3,3` landed on an edge arrow's `<small>` label instead, twice in one game. The arrow panned the map, so the tap was misdirected.
  - On the result sheet the zoom buttons sit under Play again / Title. That is harmless: the sheet is on top.
- Header at 375: the Hint bulb and the Hints switch show nearly the same bulb icon and neither has a visible label. A new player cannot tell them apart.
- Nothing clipped off-screen. The board is first and fits at both sizes.

## First-timer play

- The title shows "New here? Learn in 5 minutes" first. It is clear.
- Tutorial: 53 steps over a 7-turn game, one line and one tap each. It teaches every core rule in order:
  - pick, place, settle, keystone, rival
  - bears, turning a tile, habitats, the three-alike sweep, elk
  - acorn free pick, salmon, the four-alike wipe, hawks
  - acorn replace, fox, majority, return to bag, 20 turns
  - It took 44 s with instant taps at both sizes, then showed the result, a score walk-through and "Play a real game". No stuck step, no "learn later" list.
  - Small gap: the last two lines, "Every acorn you still hold is worth 1 point" and "Tied on points? More acorns wins" (`tutor.js:69-70`), appear while Bram plays his final turn. If you don't tap Next quickly, the game ends and the result sheet replaces them. My run ended at step 49 of 53.
- 3 games at each size against the default "Gentle" rival:

| Size | Me (strategy) | Rival | Result | Real time (bot taps) |
|---|---|---|---|---|
| 667 | 101 (follow the badges) | 58 | win | 108 s |
| 667 | 65 (always the first option) | 57 | win | 103 s |
| 667 | 92 (badges) | 53 | win | 116 s |
| 553 | 91 (badges) | 57 | win | 113 s |
| 553 | 66 (first option) | 56 | win | 105 s |
| 553 | 94 (badges) | 41 | win | 111 s |
| 667 (bulb run) | 99 (badges) | 57 | win | 138 s |

Whose turn it is and what to do is always clear: the "Your turn" banner, the "2/3 Tap a glowing spot" line and "up to +N" badges on each market column. But the default rival is not a real opponent. Taking the first legal option every time still won. Following the badges won by 35 to 53 points. Gentle takes a random pair and places its animal at random half the time (`ai.js:23`, `:57`, `:70`). Its 41-58 points are far below a sensible valley, so a first game has no tension.

## Scores (GAMEPLAY-RUBRIC.md)

| # | Row | Score | Why / repro for anything under 7 |
|---|---|---|---|
| 1 | Rules fidelity | **6** | The engine is right. The text is wrong in 4 places. Repro: Title → Table for 3 → Play. The Goal card says "+2 if yours is the biggest" (the rule is 3 first / 1 second). Also: Rules → "Simplified on purpose" claims a greedy elk split and house tables, and both are false. Elk D and Elk B variants under-score (M5, M6). |
| 2 | Tutorial teaches | 8 | Every core rule in order, one line and one tap each, then a real game. The acorn-points and tie-break lines can be skipped by the game ending (above). |
| 3 | First 10 seconds | 7 | The title and Goal card are clear. The Goal card has the "Your turn" banner and the flavour caption over it, and the caption covers its Start button. |
| 4 | Turn clarity | 7 | Clear step line and badges. Two look-alike bulb icons without labels. The Hint and the market badge can point at different columns at the same time. |
| 5 | Phone play | **6** | Repro: any game, either size. Seat chips are 40 px tall. At 375x553: the tutorial Next button covers zoom-out; edge arrows overlap each other and catch taps meant for border spots (spot -3,3 → panned instead). Plus 4 kinds of infinite pulse and up to 4 helpers at once. |
| 6 | AI and pacing | **6** | Repro: Title → Play (Gentle default) and always take column 1 / the first spot / the first target. You still win (65-57, 66-56). With the badges you win by 35-53. Pacing is good: AI turns take about 2.4 s, a game about 2 min of bot time. |
| 7 | Feel | 7 | Tiles drop, tokens hop, there are score pops and a verdict toast after each turn, and the painted art and result sheet are clear. |
| 8 | Bugs | 7 | 6 games + 2 tutorials + 1 bulb run: 0 page errors, 0 stuck states. One misdirected border tap at 553 (counted in row 5). Once, after a second bulb tap, `.gxh-rules` caught a market tap; I could not reproduce it in a clean retry. |

**Average 6.8 → FAIL** (rows 1, 5 and 6 are under 7; no stopper).

## Fix list (in order; each is one fix and one file)

1. **`src/score.js:177`**: make the Goal card's land line depend on table size: 2p "+2 if yours is the biggest (tie +1)", 3-4p "+3 for the biggest, +1 for second", solo "+2 at 7 or more". (M1)
2. **`src/ai.js:23/57/70`**: the default "Gentle" rival needs a real plan. Keep the pair choice loose, but stop placing tokens at random (lower `GENTLE_TOK`, e.g. 0.1, and use less noise). Gate: someone taking the first legal option should lose about 50 % of the time, and badge-following should win by 10-25, not 40+. Test with `newplayer-bench.js` / `ai-gate.js`.
3. **`src/skin.css:16, 19, 394, 357`**: replace the infinite `wmglow` / `eaPulse` / `tuts` with a still highlight, or 2 pulses and then stop (`animation-iteration-count: 2`). Do the same for `tutp` at `:356`. Run calm-audit with a tile-step scenario so `.spot` gets measured.
4. **`src/skin.css:31`**: raise the seat chips to `min-height:44px` (or make the whole chip row a 44 px hit area).
5. **One helper at a time** (`src/ui.js:69` flavour toast, `src/score.js:171-183` goal card, `src/ui.js:96` turn banner):
   - Don't show the flavour toast and the turn banner while the goal card is open.
   - Hide the market's gold "best" frame while a Hint bubble is open.
   - Hide `#edgea` arrows while the coach bubble is up.
6. **375x553 layout**:
   - Move `#zoom` up, or hide it, while `#coachb` / `#tutNext` is shown.
   - Keep the `#edgea .ea` arrows off legal spots, and off each other (`skin.css:394`).
7. **Rules text** in `src/ui.js:448-449, 547, 574`:
   - Remove the greedy-elk line.
   - Rename "house tables" to "Variant cards B-D".
   - Add "still tied: shared win".
8. **Header icons** (`src/body.html` `#hintsB` vs `#bulbbtn`): give the Hints switch a different icon (a toggle or a badge) or a visible short label at 375 wide.
9. **`src/tutor.js:68-72`**: show the end20, acornsEnd and tiebreak lines before the final turn, or on the result sheet, so the game ending cannot skip them.
10. **Variant cards** (`src/cards.js:226-237`): score Elk B with an exact best split (like `engine.js:159`), and let Elk D score every ring in a group.
11. **Notes** (`rules-notes.md:5, 24, 31, 33`): remove the original's name from the URL (hard rule) and fix the 3 stale lines.
12. **Gate tooling**: fix the brief template's `VIS_wildmarkS` to `VIS_SLUGS`, and line up the LAB rows with the scenarios (the `[lab] WARN 3/8`).
