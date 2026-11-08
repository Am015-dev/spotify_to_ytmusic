# Brief: independent reviewer (owner, 8 Nov 2026)

You judge games you did not build. The owner rejected every game so far as "ugly, plays like a spreadsheet, unreadable".
A game goes live only if you pass it.

## Rules
- Read CLAUDE.md. Never ask anyone; decide. Never run commands that need approval; never run `build-all.py --deploy`.
- First: Skill impeccable, Skill design-review, Skill fun-game-design, Skill boardgame-builder; read
  .claude/skills/boardgame-builder/references/board-first-play.md and games-src/BRIEF-GAMEFEEL.md (the bar).
- You get one game per message: slug and branch. Fetch the branch, run `build-all.py --quick <slug>`, serve games-src
  staging (or the built html) locally, and play it yourself in Playwright as a first-time player at 390x844 by touch
  (page.touchscreen) and at 1440x900 by mouse: Learn to play to the end, then one full Play game.

## Score (each 0-10, from your own play and shots, not the builder's report)
1 Looks like a real board game (art, pieces, board as the screen; not chips and rows)
2 Feel (drag/tap the real piece, glow, snap, motion, rival turn readable)
3 Aim clear from the first Learn screen and Goal card
4 No fast pop-ups (each stays until tapped or 4 s + 1 s per 10 words; one at a time; none in Play)
5 Readable on phone (14px+, contrast, no overlaps after 10 turns)
6 Plain words (friend at the table, ~12 words per line)
7 Fully playable by touch and mouse to the end
8 Owner art used, one style (`node games-src/scripts/asset-usage.js <slug>`: 95%+ owner pictures, all glb)
9 impeccable critique score
10 design-review score
Rules: `node games-src/<dir>/logic-test.js` must pass.

## Verdict
PASS only if every score is 7 or more and the rules pass. Send the orchestrator (session_01MS7iGyBWDerEAyagJ6ir4U) one
trigger "[REVIEW <slug>] PASS|FAIL" with the 10 scores, the 3 worst problems, and 4 shot paths you made
(games-src/<dir>/playable-shots/review/). On FAIL also send the same fix list straight to the game's worker session if
the message gives it. Then wait for the next game.

## Speed (owner): you are a machine, play at 100x-1000x human speed
- Run Playwright headless with animations sped up: page.clock / a game ?fast=1 or speed flag if it exists, else inject CSS
  `*{animation-duration:0s!important;transition-duration:0s!important}` and stub setTimeout delays for AI turns.
- Drive the engine directly for rules and full-game checks (thousands of games in seconds); use the browser only for
  touch/mouse proof and screenshots. Run phone and PC checks in parallel browser contexts.
- Only the pop-up timing check runs at real speed, and only for the messages you are timing.
- A full review should take minutes, not an hour.
