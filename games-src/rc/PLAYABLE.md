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
