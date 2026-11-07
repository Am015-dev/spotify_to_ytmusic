# Stitchwise: HANDOFF (W351, branch shelf/W351-stitchwise, not deployed)

Shelf name Stitchwise, slug `stitchwise`, folder `games-src/stitchwise/`. Original game, original names, no other game's folder touched.

## What plays
- Title: Story, Quick game (vs computer easy/normal/hard, or two players on one screen), Tutorial, How to play, Continue (saved game).
- Rules: 2 players, 9x9 quilts, 33 distinct polyomino patches in a ring with a neutral marker (offer = the 3 after the marker), buy (pay buttons, place, move time token) or Advance (jump ahead of the opponent, 1 button per space), further-back token moves next (tie: the one on top), 53-space track with 9 button spots (income = buttons printed on your patches) and 5 leather spots (free 1x1, placed at once), 7x7 bonus (+7), score = buttons + bonus - 2 per empty square. Engine: `src/engine.js` (JSON state `G`, `swApply`, `swMoves`, `swCheck`), data `src/data.js`.
- Centrepiece: tap a patch (shown large with its text on a second tap), a ghost appears on your quilt, drag it on touch or mouse, Rotate / Flip, it snaps cleanly to the nearest legal square on lift, "Sew it on". Button income moment: coins fly from each button spot to the counter, count bumps, chime per coin.
- Story "The Quilter's Year": 3 acts (Parish / County / Grand Fair), 10 stages, boss each act (Fernsby, Bodkin, Aurelia), twists (boss starts with extra buttons, your quilt has torn squares, boss quilt pre-patched), 3 stars each, easier offer after 2 losses, map screen, saved progress (`GXC`). `campaign.json` + `CAMPAIGN-DESIGN.md`. Tutorial (13 steps, staged seed) is offered on first launch and runs as Story chapter 0 until finished once.
- Help bulb (suggests the hard AI's move + why), coach bubbles, Rules drawer, All-patches drawer, Menu (Rules, Tutorial, Restart, Title, sound, Music picker, tips, shelf settings), synth sfx with mute, music slots (`gx-music.js`, silent until `games/stitchwise/music/*.mp3` exist).
- Layout: board-first. Phone portrait 390x763 and 375x553 (compact offers), landscape and PC 1440x860 (quilt left, track and players right, dock right). Touch + mouse + keyboard (arrows, R, F, Enter, Esc).

## AI (src/ai.js) and win rates (node games-src/stitchwise/rules-test.js 100)
Candidate moves are scored by board fit (small pockets and ragged edges penalised), economy (income x remaining button spots, buttons, time left) and, for Hard, a 2-ply look at the opponent's best reply. Gate vs a "first legal/affordable option" bot, 100 games each, alternating who starts:

| match | win % |
|---|---|
| Hard vs simple bot | 97% (gate 70%) |
| Normal vs simple bot | 89% (gate 55%) |
| Easy vs simple bot | 87% |
| Hard vs Normal | 66% |
| Normal vs Easy | 64% |

With the real patch table (second pass; the first pass used guessed values: 91 / 75 / 73 / 63 / 68). Average Hard score +22 against the simple bot's -8, 500 games, avg 40 moves, no illegal or stuck games.

500 AI games: no illegal move, no stuck state, `swCheck` invariants after every move, avg 33.6 moves. No hoarding: the AI buys whenever the value of the patch beats advancing (avg end buttons are spent, scores near 0 for Hard).

## Tests (all pass)
- `node rules-test.js 100`: data (33 distinct connected shapes), advance/income/tie/leather/overlap/7x7 rules, 500 AI games, gates.
- `node smoke.js [WxH] [--full] [--tut] [--story] [--anim]`: real-input (touch via CDP on phones, mouse on PC): title tap, quick game, real drag of the ghost then Sew, 3 turns, forced end, result totals match the engine, Play again, rules drawer. `--full` = a whole game to the result. `--tut` walks the 13 tutorial steps. `--story` plays Story stage 1 to its result and checks saved progress.
- `?scn=` scenarios (`src/scn.js`): sw-board, sw-place, sw-advance, sw-income, sw-leather, sw-zoom, sw-result, sw-torn (+ shared menu, story-scene). `build-all.py --quick stitchwise` PASS (11 scenarios).
- `build-all.py --full stitchwise`: PASS (build, 6 phone-check scenarios incl. rotations, all scenarios, rules-test sweep). `scenario-mutate.js stitchwise`: 34/35 killed = 97% (behaviour mutants 17/20); survivors are look-only scenarios (menu, story-scene, sw-zoom).
- Played with real taps/clicks to the result screen, twice per size: 390x763 (plain + with animations on), 375x553, 844x390, 1440x860 (each `smoke.js <size> --full` PASS, 15-17 checks), plus Story stage 1 to its result screen and the tutorial (13 steps) at 390x763.
- `art-test.js`: loader proof with 3 dummy webp files (made and deleted locally, never committed): bg-title, fabric-01 and a portrait fill their slots, others keep placeholders.
- UI audit (`scripts/ui-audit.spec.js`, phone + pc): C, D, F = 0. Remaining A/B/E rows are in shared surfaces only (see Known).

## Played like a player (real taps) and found -> fixed
1. `h('div#quilt')` created an invalid tag, so the quilt and track never drew -> helper parses `#id`.
2. Track spots used class `.btn`/`.lea`, picking up the shared button style (tall yellow pills) -> `.bspot`/`.lspot`.
3. On phones the dock covered the track (layout measured before the dock rendered) -> dock first, one row of two player pills, 2-row track (27 columns), compact offers when height < 640.
4. Wide screens used the portrait layout -> wide threshold 1.12 and a side column.
5. Top-bar prompt overlapped the hint button, track end glyphs hidden under tokens -> prompt only on wide, glyphs became border markers.
6. Torn squares counted as filled for the 7x7 bonus -> engine fix (value 99 = empty for score and bonus).
7. A tap right after a drag (< 300 ms) produced no click in the synthetic touch driver -> test waits 0.9 s after a drag; real hands are slower. Sew also works with the keyboard.
8. Tutorial "Their turn" step waited on a Next button that appears only after the scripted AI turn -> test polls for it.
9. Scenarios: leather scenario passed two leather spaces (needed one), sw.js 404 on localhost -> guarded like Hollowbough.
11. Phone check: tapping an already-selected segment was a "dead tap" -> setup is now one tap per opponent (Easy / Normal / Hard / Two players). Dock lines longer than 8 words shortened.
12. Landscape phone 844x390: the dock sheet covered the board and cut off Sew it on -> a side-column dock for short wide screens.
13. Scenario mutants: advance and place assertions now check the exact payment and time (mutation score 87% -> 97%).
10. Audit: teal buttons 4.16:1 -> darker teal; small text floors 13 px phone / 16 px wide.

## Known / not done
- **Patch data is now checked** (7 Nov, second pass): 31 of 33 patches agree exactly between two independent public implementations; track spots (5..53 step 6 income, 20/26/32/44/50 leather) and the other rules facts match them and a published study. 2 entries differ between the sources and use the more plausible one (see `rules-notes.md`, `cross-check.py`); confirm those two against the printed rulebook if available. Total 166 squares; the real set has duplicate shapes with different costs.
- Audit rows left in shared kit surfaces: settings chips and `.gxc-ib` flagged "dead" (they scroll or toggle without a DOM change; a small attribute marker was added but the audit still reports them), Story map disc and emoji contrast (`gx-campaign.css`), kit helper text "Short buzz..." contrast. Not editable here (shared files read-only).
- Every slot in `assets.json` is now wired (bonus-tile on the result screen, icon-bonus on the player pill, icon-leather on the track, fx-sparkle at the income moment, fx-stitch when a patch is sewn, ui-offer-card behind offers, bg-map behind the Story map).
- **Temporary art:** `temp-art/make-temp-art.py` draws 49 of the 63 pictures by code (33 fabrics, tokens, icons, leather, torn square, bonus rosette, fx, offer card, quilt and track frames, table and title cloth), original, no third-party pictures, written to `temp-art/media/*.webp` (committed, ~200 KB). **Deploy copy step:** copy `games-src/stitchwise/temp-art/media/*.webp` into `games/stitchwise/media/` with the deploy (skip any stem the owner has already delivered), then rebuild so `SW_HAVE` lists them. Missing temp art: bg-map, result-win, result-lose and the 11 portraits (emoji badges and CSS fills show). Tested: smoke at 390x763 and 1440x860 with the files served.
- Offline: one self-contained `index.html` (+ optional `media/`, `music/`); `offline-manifest.py` and `offline-test.js` need the game deployed under `games/` and its slug in `games/sw.js` SLUGS and `games/sync.html` PREFIX: orchestrator step at deploy.
- No online play, no undo (placing is a cancelable ghost), no Solo puzzle stages (Story uses the real game). Hot-seat has no pass-the-device screen because nothing is hidden.
- `guard.py --update-baseline` has not been run for the new game (orchestrator at merge). `register-assets.py` not run (orchestrator at merge).
- Playwright note: the installed browser is chromium 1243 but `playwright@1.56.1` expects 1194; build-all/phone-check worked with a scratch shim dir via `PLAYWRIGHT_BROWSERS_PATH` (symlinks only, outside the repo and /opt).
