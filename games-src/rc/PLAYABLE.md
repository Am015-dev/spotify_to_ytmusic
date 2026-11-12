# Playable pass: Shipwreck Isle (W387, 7 Nov 2026)

Owner: "If I cannot understand it in a minute it is completely unplayable." Screens looked at: 390x763 and 1440x860 (title, tutorial steps,
first plan, jobs playing out, event/weather/night scenes, result). This game was already board-first on phones (guided plan table, story scenes,
a 25-step tutorial); the pass fixes what a newcomer could not read.

## The 10 worst problems found, and what happened

| # | Problem (before) | Fix (after) | Status |
|---|---|---|---|
| 1 | Supplies were icon-only (`🍖0 🪵0 ♥13`), 13.5 px, printed on painted frame art in the top bar: unreadable | `#bfres` strip under the bar: "Day 1 of 12 · Food 1 (eat 2) · Wood 1 · Life 13 · No shelter", 14 px phone / 16 px wide, solid backing, low values turn red | fixed |
| 2 | Numbers on the island (3, 7, 8, 12) with no meaning | Every readable place gets a pill: number + "Camp" / terrain name / "Unknown" (the job texts still say "place N") | fixed |
| 3 | Unexplored places drew as grey storms; nothing said they were unexplored | Violet "Unknown" pill on each; the tutorial `explore` and `found` steps point at one | fixed (art kept) |
| 4 | Pawn row was five unlabeled icons (hammer, pot, person) | Under each pawn: name, and the job once it has one ("Carpenter / Explore") | fixed |
| 5 | No sign of whose turn it is; one instruction line with no context | Banner above the one instruction line: "Your turn: plan the day" / "The island's turn: event card, threat, morale, weather, night" / "Your castaways at work" / "Your choice" | fixed |
| 6 | Job chips on the island were an icon, coloured dots and a tick or die with no words | Chip says the job ("Explore") and "✔ sure" / "🎲 risky" / "needs +1" | fixed |
| 7 | On a desktop-size window the tutorial could not start (it needs the board-first layout, desktop got the old planning table) | Board-first layout at every size (`?phone=0` keeps the old table); tutorial runs at 1440x860 | fixed |
| 8 | `tutor-test.js` was stale (title flow changed): reported "steps seen 0" | Starts through Play → "Learn in 5 minutes"; 25 steps seen at both sizes | fixed |
| 9 | Help opened with a wall of rules | Help opens with "How a turn works" in 5 short lines | fixed |
| 10 | Story chapters and the tutorial are hidden under "More ways to play" on the title; tutorial ends on an end card, not a result screen, and covers part of the rules (see TUTORIAL-COVERAGE.md) | not changed | explained: the title belongs to the shared start flow; the tutorial result screen needs a 10-12 day stacked game (next work in TUTORIAL-COVERAGE.md) |

## What was proven
Gates and results are in the commit message and the report; scripts: `tutor-test.js` (tutorial to the end, both sizes, elementFromPoint, wrong taps),
`play-ui.js` (Quick game and Story stage 1 played to the result by touch taps on visible uncovered UI only).

## Gate results (7 Nov, local staged build, 390x763 / 1440x860)
- `build-all --quick shipwreck-isle`: PASS (scenario si-board now reads the new supplies strip). rules-test: 28 pass, 0 fail (2 new rulebook cases).
- `tutor-test.js` clean run: 25 of 25 steps seen, end card reached, elementFromPoint and wrong-tap checks, at 390x763 AND 1440x860 (PASS).
  Still failing in the same script: "leave" (reopening a half-done tutorial offers no restart/exit) and, in the story run, "Story opens the chapter map / Tutorial replay button after the tutorial". Known gaps, not fixed.
- `play-ui.js quick`: PASS to a result (lost, day 8, 112 taps). `play-ui.js story`: PASS (chapter 1 rescued, day 3, 51 taps). Only touch taps on visible uncovered UI, 0 console errors.
- ui-audit (local server): phone A0 B8 C0 D0 E2 F0; phone-s A0 B14 C1 D0 E0 F0; pc A0 B6 C0 D0 E4 F0. **Not zero**: B (text on busy painted backgrounds: title offer, Rules drawer, More panel, campaign header) and E (state-toggle buttons in the More panel read as dead) sit on shared shell surfaces; C1 on phone-s unlooked at.
- Shots (phone, `playable-shots/`): title, first-turn, island-turn (event scene), day-summary, island-weather. The game-over screen itself was not captured.
- Rules: 2/2 differences found vs the rulebook fixed (Soldier Fortify cost 3, Defence plan puts the beast on top of the hunting deck). rules-check file (W384) listed 1 WRONG; the second was found by reading the rulebook.

## R8 fix 3 (12 Nov 2026)
- ✨ plans toward the win: from day 3 the advisor puts spare wood on the signal pile whenever the pace line says behind (PACE_T now lives in
  advisor.js and is shared with the pace line), and keeps the shelter's wood back (`shelterReserve`). Fire and pile-wood priorities start on day 3.
  Headless Easy (`easy-sim.js 80`): 63% → 78-88% wins, avg pile 14.5; on pace on days 5-7 in every game.
- Camp pop-up: the pile row says "(no pawn)" and "+N wood", warns "uses your shelter wood", and the first tap that would eat shelter wood only
  warns (tap again to add). After adding, the bar says which pawn still needs a job. The ✨ pick (⭐ row) is listed first in every place's pop-up.
- Day summary: plain words ("Food -1", "Cook -2 life"), and danger lines first (no shelter, food short for tonight, someone at 3 life or less);
  "on track" only shows with no danger.
- Learn to play: 46 steps (was 57). The guide picks the pawn itself where a step only said "Tap the Cook". The roll step waits for the
  explore roll. A scene that one of the next steps explains is held on screen.
- FLAG `?hint=1` (off): ✨ becomes a per-pawn hint (finger on the place, ⭐ row) and the player places every pawn. Open problem: touch games that
  follow the hints lost 4 of 4 (piles 3-14), while the same plan placed at once wins. The hint map equals suggestPlan's (probe), so the gap is in
  how the hints are followed (pawn order, rows); `HINT=1 node taps-test.js` reproduces it.

## Fix 4 (12 Nov 2026)
- Gate (`build-all --quick`, VIS_SLUGS=","): 6/8 → PASS. Both failures were new on this branch (live build has neither):
  day token printed "1/12" (the scenario read 112): now big "1" with "of 12 days" under it; the closed "Game setup" `<details>`
  still gave its buttons boxes under the next summary: setup is open by default (live had the rows visible; rc-uibar wants 3 rows)
  and closed `<details>` on the start screen now hide their content (display:none).
- Own plan stall: a far place needs one more pawn (distance rule); Start day was refused with a toast that is hidden on phones.
  Now the refusal speaks on the board line; when a free pawn (Friday, Dog) can fill the job it is picked and the line says
  "Friday: tap place N to help"; when none can, the lone pawn comes back ("Too few pawns for place N: pawn back"). Not in Learn to play.
- Touch results: own plan 390x844 s11 lost day 5 (finished), 375x667 s15 lost day 5 (finished), 375x667 s12 still loops on day 2
  until 900 s (1206 decision taps, cause not found yet: next fixer, dump planProblems/BF.msg/#ppop when dec>200). Sparkle plan
  390x844 s13 RESCUED day 10, 375x667 s14 RESCUED day 11. 0 page errors.
- `?hint=1` left OFF (not debugged this round).

## Fix 5 (12 Nov 2026)
- The 375x667 s12 own-plan stall was the driver, not the game. The place pop-up shows ~2 of its rows at 375x667 (145 of 622 px,
  the next row peeks) and the driver tapped rows by their box without scrolling: a row below the fold put the tap on the board line
  (#phlabel), which opens Camp status; the driver then tapped hidden glows under the sheet for 900 s. A player scrolls the rows, and
  the sheet has a clear ×. taps-test OWN now scrolls the chosen row into view and closes an open Camp status sheet first. No game change.
- Own-plan touch games, seeds 11-16 at 375x667 and 390x844: 12/12 finish (lost days 5-9, 54-134 decision taps, ≤34 non-decision), 0 errors.
- Full gate (`--full`) was failing before this fix (the last round ran `--quick`):
  phone-check "skin changed box" on the small "Add N wood to the pile" button: the skin gave every `.btn.sm` full-size padding plus a
  4px plate border (+10px). skin.css now keeps `.btn.sm` at its unskinned box (0 7px; dock 0 9px).
  sweep: 375x553 had the ✨/Start day row below the screen (board floor 0.9x width beat the space left). The board now gives way down
  to 200px; on a board under 300px (`html.phshort`) the zoom buttons hide (pinch and drag still work) and the phone camera fits the
  island under the supplies strip. The sweep now reads food/wood from the token strip (the chip shows the day) and counts the
  status line, not the turn banner. Sweep (QUICK, 4 games): 123 problems at 93fa1182 → 5.
- Left (all were there at 93fa1182 too): a "tap a glowing space" story question can stall the sweep (taps land on #bfscene);
  place 3 at 390x763 s102 sometimes misses; one "tapping the bulb changed the game" at 375x553 s102. At 375x667 the place pop-up
  shows ~2 rows (a peek says there are more).
