# R46 strict gameplay review: Shipwreck Isle

- Build reviewed: `origin/shelf/W468-shipwreck-lean` @ `51cb20c7b733dd4d9f9edd00ecd13bd04ee9c535` (includes fixer commit 6cb30355)
- Date: 13 Nov 2026, reviewer R46. Rubric: games-src/reviews/GAMEPLAY-RUBRIC.md (8 rows)
- Previous: R44 7.0 FAIL (Turn clarity 6 only)

## Gates (run alone, one after the other)
- `--quick`: PASS, 8/8 scenarios (149 s)
- `--full`: PASS, phone-check 172 s, lab WARN 9/12 (lab rows list vs scenarios list, not a game fault), sweep ok

## How it was tested
Staged build (/tmp/xf) served locally, Playwright touch only (`touchscreen.tap`, hasTouch, isMobile), no console calls that change state.
- Tutorial, start to end: 375x667 and 375x553. 55 steps over 3 days, every ringed target tapped, ends on "You know the rules!" then a real game. 0 errors, 0 stuck.
- Full games to the result screen, default setup (Marooned, 2 players, Easy):
  - g2 375x667 no ✨: lost on day 6 (Cook died)
  - g3 375x667 no ✨: lost on day 9, result screen shown
  - g4 375x667 ✨ tapped for every pawn and followed: lost on day 8 (low morale), result screen shown
  - g5 375x553 no ✨: lost on day 7, result screen shown
  - g6 375x667 no ✨: lost on day 7, result screen shown
  - g1 (first run, cut short on day 3 because my script tapped cards hidden under the tray; not a game fault)
  - The players were scripted and partly random, so losing is expected. Headless `easy-sim.js 60` with Plan-it-for-me wins 52/60; with first-option answers it wins about 46/60.
- Page errors over all runs: 0. Stuck states: 0. Dead taps: 0 (every tap on a visible target did something).
- 14 px audit (all visible text nodes): menu, plan, job sheet, rules drawer at both sizes: none under 14 px.

## R44 fixes checked
| R44 finding | Now |
|---|---|
| Day 2 started with a helper picked and nothing glowing | Fixed. 37 of 37 day starts across 6 games began with a castaway in hand and 4 to 8 places glowing. |
| Status line asks you to tap a glowing place, but nothing glows | Fixed for castaways and Friday: in 267 placements a castaway never had nothing to tap. Only the last optional helper (Hammer/Dog) can be in hand with nothing glowing (28 of 267), and 17 of those say "No job for Dog/Hammer now". |
| ✨ why repeated the job label | Fixed: the why is now the job's own reason ("Build Fire: half of the rescue", "Rest: heals 1 life", "Build a shelter: stops night wounds"). |
| 13 px tags | Fixed: no visible text under 14 px. |
| R42/R44 phone fixes (plates, zoom over glow, 375x553 board) | Hold: plates never covered a glow in the screenshots, zoom buttons step aside, the board is readable at 375x553 (g5_d2). |

## Scores
| # | Row | Score | Notes |
|---|-----|------:|-------|
| 1 | Rules fidelity | 7 | Unchanged since R44: day order, eat 1 food or take 2 wounds, sleeping out without a shelter wounds, 2 pawns = sure, explore dice, threats, adventure tokens, fire + 15 wood. |
| 2 | Tutorial teaches | 7 | Every core rule in order, one line + one tap each, ringed target, works at 375x553. Long (55 steps) for "5 minutes". |
| 3 | First 10 seconds | 8 | Goal line on the menu, big Play button, a "learn first?" offer, then glowing places and "Carpenter: tap a glowing place". |
| 4 | Turn clarity | 7 | Every day starts with something glowing; plates show pawns, sure/risky and cost; whose turn is always named. Small gaps listed below (T1-T3). |
| 5 | Phone play | 7 | 44 px+ targets, 14 px+ text, board first at both sizes. The job sheet covers the board and shows only 2 rows at 375x553 ("Scroll for more"). |
| 6 | AI and pacing | 7 | Island turn is brisk; a game runs 8-15 min. Easy wins 87% with the advisor (sim). My per-pawn ✨ game still lost on day 8 to low morale. |
| 7 | Feel | 7 | Plates fly to places, dice, ghost finger, floating gains, event cards. |
| 8 | Bugs | 7 | 0 errors, 0 stuck states, 0 dead taps over 2 tutorials and 5 complete games. |

**Average 7.1. Every row >= 7, no stopper: PASS.**

## Fixes for the next round (none blocks the pass)
- T1 (Turn clarity) ✨ drops the reason on the most common jobs. 9 of 30 job hints had no why: "✨Carpenter → Gather wood", "✨Cook → Gather food", "✨Carpenter → Explore place 12 🎲". It looks like the 8-word cap cuts "so nobody goes hungry tonight" and "fuel for the fire and pile". Use shorter whys ("food for tonight", "wood for fire and pile", "new land") so they always fit. Repro: Easy game, day 2, tap ✨ with the Carpenter in hand (g4_spk2_c0_0.png).
- T2 (Turn clarity) A helper is in hand with nothing glowing, and the line explains something else. With the Dog or Hammer as the last free pawn and no job for it, the status shows the pile hint "🔥 ✨ adds 3 wood to the pile" or "Too few pawns for place 2: pawn back" instead of "No job for Dog now". Repro: g6 day 4 (g6_noglow_d4_dog.png), g5 day 3 at 375x553 (g5_noglow_d3_hammer.png). Fix: when the last free pawn has no job, show "No job for X: Start day" and don't keep it selected.
- T3 (Turn clarity) ✨ with Friday in hand says "Every pawn has a job: Start day" while Friday and the Dog are unplaced and 3 places glow (g4_spk1_fri.png). Say "Friday is optional: tap a place or Start day".
- P1 (Phone) At 375x553 the job sheet shows only 2 job cards above "Scroll for more" (f_553_sheet.png). Smaller cards there would show 4 at once.
- A1 (AI/pacing) Even when every ✨ hint was followed, morale ran out on day 8 (g4). Check that ✨ suggests Arrange the camp when morale is low.

Screenshots (local to the reviewer session): /tmp/claude-0/r46/ (g4_spk2_c0_0.png, g4_spk1_fri.png, g5_noglow_d3_hammer.png, g6_noglow_d4_dog.png, g5_d2.png, g5_result.png, f_553_sheet.png, tB_01..74.png tutorial at 375x553).
