# R83 strict gameplay review: crown-city-smash

- Reviewed commit: `f3c8282ad16c62f345f2d033dd147a342e5ff903` (origin/alex/brave-carson-rbpmlk, includes cb812c16 shell calm pass)
- Date: 2026-11-20 (UTC). Reviewer did not edit game code.
- **Verdict: FAIL**, average **7.4**. Two rows are under 7 (5 Phone play, 6 AI and pacing), and the clutter bar fails with 4 infinite loops (the bar is 0). No stopper found.

## Gates
| Gate | Run 1 | Run 2 | Note |
|---|---|---|---|
| `--quick` | PASS | PASS | The brief's env name `VIS_crown-city-smashS` is not a valid shell name. Run as written (via `env`), the visual spec asks for missing baselines (`.baselines/crown-city-smash-*-phone.png`) and fails 12/15. Run with `VIS_SLUGS=","` (clearly what was meant): PASS both times. |
| `--full` | PASS | FAIL → PASS | Run 2 failed phone-check `slow 838ms; slow 905ms`, but the reviewer's tutorial walks were running at the same time (not alone). Re-run alone (run 3): PASS. Treat as load-sensitive, not a game bug. `games/lab.html` restored, not committed. |
| logic-test.js | 147/147 | | One assertion per RULES-CHECKLIST rule |
| rules-test.js | 8/8 | | |
| calm-audit.js (20 s) | loops=2, maxHelpers=1 | | `b.bm.hit {bmPulse}`, `button.btn.primary {nudge}` on both the play and guided paths |

## Rules vs the original (from rules-notes.md, RULES-CHECKLIST.md, and the published 2016 rulebook)
The engine matches the core game: 6 dice, 3 rolls, number sets, no healing in the city, +1 for entering, +2 at turn start in the city, yield after claw damage, the Harbor at 5-6 monsters, 2-energy sweep, the win at 20 stars or last standing, all simultaneously out = no winner. All 66 base cards checked against the published costs, types and effects in `kot/data.js:3-67`: no mismatch. The house rules (random first player, the 20-star win checked at the end of the turn, automatic dice order) are shown in the Rules screen (`kot/ui.js:156`).

Mismatches (all text, none in the engine):
1. `kot/tut-story.js:37`: "First to the goal wins at once". The engine (`kot/engine.js:513`), the Rules screen (`kot/ui.js:154`) and the tutorial's own `win20` step say you win when your turn ends. This step text is not used by the live tutorial today (only `TUT_STORY.guide` is read, `kot/playable.js:56`), so it is dead text with a wrong claim. Fix it or delete it.
2. `kot/tutor.js:154` "First to 20 ★ or last standing wins" and the title tagline "First to 20 ★ wins": they leave out "and survive your turn". This is acceptable shorthand next to `tutor.js` step 25 ("You win when your turn ends"). Low priority.
3. `kot/tut-story.js:31` score2 "Both rivals bled": in the scripted turn (`kot/tutor.js:42`) Shroomhulk is knocked out. Dead text, low priority.
4. Not player-facing: `kot/engine.js:505` comment says the coached game goal is 10, but `rules-test` and `tut-story.js` use 6. `RULES-CHECKLIST.md` rule 75 shows "Corner Kiosk (1)", but the card costs 3 (`data.js:51` is correct).

Rules verdict: **engine faithful; 1 wrong player-facing claim (dead text) plus 2 shorthand lines.**

## First-timer play (touch only)
- Tutorial: 26/26 steps, 22/22 rules, reaches a winner and then "Play a real game", at **375x667 and 375x553** (`kot/tut-walk.js`, staged build). One short line and one tap per step, and the spotlit target is never covered. It teaches keep, reroll, a triple, an extra die, energy, buy, card types, end turn, rivals, stay, the +2 start bonus, hitting from Downtown, knockout, no healing in Downtown, sweep, yield, healing outside, and the win. It does not teach the Harbor (it never comes up in the default 4-monster game).
- 4 full games by touch from a fresh load (3 asked for plus 1 extra to check the buy screen): 375x667 ×2 and 375x553 ×2. Newcomer policy: keep pairs, claws and energy, keep hearts below 7 ♥ outside the city, use every roll, buy the first affordable card, stay in Downtown until ≤5 ♥. Every game reached the result screen with **0 page errors, 0 stuck screens**.

| Game | Size | Length | Result | Rival turn avg / max | Wait between my turns |
|---|---|---|---|---|---|
| g1 | 375x667 | 3.3 min | lost (KO, 13★), Glacyx last standing | 3.5 s / 4.5 s | 7.0 s |
| g2 | 375x553 | 2.2 min | lost (KO, 12★), Magmaw last standing | 3.4 s / 4.6 s | 9.5 s |
| g3 | 375x667 | 2.8 min | lost (KO, 11★), Magmaw 21★ | 3.3 s / 5.4 s | 9.1 s |
| g4 | 375x553 | 2.7 min | lost (KO, 7★), Magmaw last standing | 3.0 s / 4.3 s | n/a |

The default level is Easy ×3. The newcomer was knocked out in **4 of 4** games, and 3 of the 4 ended by elimination before anyone reached 20.

Turn clarity is good. A top pill gives the step ("Roll 1/3 · Keep dice, then Roll", "Buy · Not enough ⚡: End turn"). The active chip is highlighted, and a rival's result shows as one line ("Glacyx: +2⚡ · hit 3 rivals"). The footer reads "Goal 20★ · You N★ · leader". The cards for sale show only name and cost, and you tap to read them (accepted).

## Clutter (sampled every second through all 4 games, plus calm-audit)
- Helpers: **max 0** during normal play (hints are off by default), and **max 1** on the guided/bulb paths (calm-audit). PASS.
- Infinite animations: **4 distinct loops, bar is 0 → FAIL**:
  - `button.btn.primary {nudge}`: visible in 19–33 samples per game (`kot/extra.css:14`, `kot/skin.css:40`).
  - `div.pchip.hasn.on/.city/.hot {hotPulse}`: the score chips (`kot/board.css:142`).
  - `button.btn.primary.pulse {obGlow}`: the SMASH! / big button (`kot/onboard.css:17`, `:20`, `kot/playable.css:110`).
  - `b.bm.hit {bmPulse}`: the board hit mark (`kot/board.css:10`), from calm-audit.

## Phone (375x553 and 375x667)
- Text: nothing under 11 px in any sample. No horizontal scroll.
- Taps: the board-roll dice `button.die.bfroll` measured **41–43 px**, under 44 (g1, g4).
- Overlap: at 375x667 (g3, a buy step) the "Buy · Tap a card to read it" pill sits on top of the blue "3 monsters left in Crown City." banner, and both are hard to read. On the result screen the "Glacyx is down!" ticker shows half-hidden behind the result card, under the crab art (g4 result).
- Dead taps: none found (every scripted tap changed state).

## Scores (games-src/reviews/GAMEPLAY-RUBRIC.md)
| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | 8 | Engine and all 66 base cards match; 147/147 rule checks; only text slips (above) |
| 2 | Tutorial teaches | 8 | Every core rule in order, one line + one tap, both sizes, ends in a real game |
| 3 | First 10 seconds | 8 | The title says the goal; one recommended Play button plus Learn |
| 4 | Turn clarity | 7 | Clear step pill and whose turn it is; dragged down by the buy pill / banner overlap and the constant pulsing |
| 5 | Phone play | **6** | Dice targets 41–43 px; pill/banner overlap at 375x667; the ticker sits behind the result card; 4 infinite loops (calm bar 0) |
| 6 | AI and pacing | **6** | Brisk (rival turns ~3.3 s, games 2–3 min), but a newcomer lost 4/4 on the default Easy, knocked out every time |
| 7 | Feel | 8 | 3D arena, dice, pop-up results, knockout banners, sound |
| 8 | Bugs | 8 | 0 errors, 0 stuck states, 0 dead taps over 2 tutorials + 4 games; one load-sensitive phone-check timing flake |

**Average 7.4. FAIL** (rows 5 and 6 are under 7, and the clutter loop bar fails).

## Repro for rows under 7
- Row 5:
  - Loops: fresh load at 375x667, Play now. Sample `document.getAnimations()` once a second: `.btn.primary` runs `nudge` forever, the score chips run `hotPulse`, and SMASH! runs `obGlow` (or run `node scripts/calm-audit.js <stage> crown-city-smash`).
  - Overlap: 375x667, play until a monster is knocked out during your turn, then reach your Buy step. The step pill overlaps the "N monsters left" banner.
  - Dice targets: 375x553, your roll. The dice drawn on the board (`.die.bfroll`) are 41–43 px.
- Row 6: fresh storage, Play now (default Easy ×3). Play as above (stay in Downtown until ≤5 ♥, keep claws). You are knocked out in about 2–3 minutes. Seen in 4 of 4 games at both sizes.

## Fix list (priority order)
1. **Remove the 4 infinite loops** (calm bar): change `nudge` (extra.css:14, skin.css:40), `hotPulse` (board.css:142), `obGlow` (onboard.css:17/20, playable.css:110) and `bmPulse` (board.css:10) to play 2–3 times and then rest, or to run only on a state change. Re-run calm-audit and expect loops=0. (Sonnet)
2. **Newcomer survival on Easy**: make Easy rivals pile on the Downtown holder less, or yield less greedily. Add a Downtown hint that triggers at ≤6 ♥ (the yield tip in story.js:97 only says ≤3 ♥). Gate: a scripted newcomer (game-walk policy) wins ≥1 in 5 on Easy, and is knocked out in fewer than half the games. (Opus, it is a feel/balance call)
3. **Banner vs step pill**: queue the "N monsters left" / knockout banner so it never shows at the same time as the top pill, or move it below the pill. Keep the result-card ticker from showing behind the modal. (Sonnet)
4. **Dice targets ≥ 44 px** at 375x553/667 for `.die.bfroll`. (Haiku: a CSS min-size)
5. Text: fix or delete `tut-story.js:37` and `:31`. Optionally add "and survive your turn" to the title tagline. Fix the comment at `engine.js:505` and the checklist's "Corner Kiosk (1)". (Haiku)
6. Brief template: the gate command should read `VIS_SLUGS=","`. As written, the variable name is invalid in bash, and the visual spec fails on missing baselines.

Screenshots (reviewer's machine, not committed): the tutorial at 553 (tut-1..27), games g1–g4 (first-turn, mid-game, buy, result, t1). The overlap is in g3/t1.png, and the ticker behind the result card is in g4/result.png.
