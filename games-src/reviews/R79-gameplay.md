# R79 strict gameplay review: sunglaze

- Reviewed commit: `f3c8282ad16c62f345f2d033dd147a342e5ff903` (origin/alex/brave-carson-rbpmlk head; contains cb812c16, the shell calm pass). Built html = the build-all staged page.
- Date: 2026-11-20 (UTC). Reviewer: R79. No game code edited.
- **Verdict: FAIL. Average 6.5. Rows under 7: Rules fidelity (6), Phone play (5), Feel/calm (6).** No stopper.

## Gates (run alone, 2 runs each)

| Gate | Run 1 | Run 2 | Note |
|---|---|---|---|
| `--quick` | FAIL | FAIL | scenarios 10/13. The 3 failures are the phone **visual baselines** (title, menu, board): `toHaveScreenshot` differs by 8639 px (3 %), the same in both runs. Baselines pulled with `baselines.sh pull`. The look probably changed in the shell calm pass and the baselines were never re-approved. Either re-approve them after an orchestrator look, or the look really regressed. |
| `--full` | PASS | PASS | phone-check + quick sweep pass. LAB-test WARN only (LAB rows list != scenario list, report-only). `games/lab.html` rewritten by the run and restored, not committed. |

`node games-src/azul/logic-test.js`: 61/61 rules pass.

## What I played (touch only, `page.touchscreen.tap`, fresh storage)

| Run | Size | Result | Length | Errors / stuck / dead taps |
|---|---|---|---|---|
| Guided game | 375x667 | 21/21 steps, end card, real game offered | 38 s of steps | 0 / 0 / 0 |
| Guided game | 375x553 | 21/21 steps | 38 s | 0 / 0 / 0 |
| Game 1 (default level) | 375x667 | You 63, rival 17. Win, 5 rounds | 120 s, 26 takes | 0 / 0 / 0 |
| Game 2 (default level) | 375x553 | You 38, rival 27. Win, 5 rounds | 120 s | 0 / 0 / 0 |
| Game 3 (default level) | 375x667 | You 66, rival 28. Win, 5 rounds | 121 s | 0 / 0 / 0 |

How I played: a newcomer-style greedy (fill a rack, avoid breakage, small noise), tapping the tile and then the rack. 40 engine games with the same player: **33/40 wins against the default level** (a fresh first visit has `easy` set: `UI.setup.lv` reads easy x4 after load), avg 55.6 vs 36.3. Against `normal` it wins 18/40 (45.4 vs 46.9). Every game lasts 5 rounds.

Shots (local, scratch): tutorial steps `tut375x553/01..21`, games `g1/g2/g3` (turn-N, selected, result), `bulb375x553.png`.

## Clutter (one sample a second, the whole session plus 16 s after a result or a bulb tap)

| Path | Max helpers at once | Max infinite animations at once | Which loops |
|---|---|---|---|
| Guided game (both sizes) | 1 (the step bubble) | **12** | `bf-c ready {bfReady}` wall cells (63 samples), `bf-t gh {bfGh}` ghost tiles (91), `bf-rack {bfGlow}` (13), `bf-pool rv-src {rvSrc}` |
| Real games (3) | 0 (no glow classes either) | **3** | `bfReady`, `bfGh` (~100 samples per game), `bfGlow`, `rvSrc` on `bf-pool` / `bf-k` |
| 15 s after the Hint bulb (both sizes) | 1 (bulb bubble + its own target ring) | 0 | none |

Sources: `azul/game/src/ui9.js:60-61` bfGh, `ui9.js:62` and `:75` bfGlow, `ui9.js:105` bfReady, `ui9.js:122` bfTap (the finger; not seen in these runs), `azul/game/src/extra.css:169-170` rvSrc. **The bar is 0 infinite animations: this fails.**

## Rules vs the original (engine and every player-facing text)

Engine: correct on all 61 checklist rules (setup 5/7/9 kilns x4 tiles, take all of a colour, rest to the centre, first centre taker takes the Sun token onto the floor, one rack per take, the rack/row colour restrictions, overflow to the floor and then the lid, top-to-bottom tiling, adjacency scoring, floor -1 -1 -2 -2 -2 -3 -3 clamped at 0, the lid refill, the end after the round with a full row, +2/+7/+10, tie on the most full rows). Documented assumptions (`rules-notes.md`, Assumptions 2, 3, 6) are reasonable.

Text mismatches (fix the text, not the engine):

1. `azul/game/src/rules-html.js:11`: "count the unbroken line left-right… Count the unbroken line up-down too. **Add both.**" Wrong for a tile that touches only one way: the other line (length 1) is not added. The REF card at `rules-html.js:36` says it correctly ("if 2 or more"). Copy that wording.
2. `azul/game/src/hlp.js:31` and `hlp.js:33`: "A touching tile scores its row line plus its column line." Same error (a tile with only horizontal neighbours scores the row line only).
3. `azul/game/src/ui9.js:212` tip `sun`: "☀ costs 1, but you start next." The token takes the next free floor space, so it costs -1, -2 or -3 depending on what is already there. Say "☀ takes a floor space, but you start next."
4. `azul/game/src/ui9.js:211` tip `tiling`: "Full rows slide onto the wall!" Only ONE tile of a full rack goes to the wall; the rest go to the shard box.
5. `azul/game/src/rules-html.js:12`: "The Sun token goes to its holder." The holder starts the next round, and the token goes back to the courtyard (engine `scoreFloors` sets `markerIn='ctr'`). Say exactly that.
6. `azul/game/src/tutor.js:52` (first tutorial line) and `hlp.js:34`: "Fill one row of your wall to end the game." / "Fill your wall with tiles." These present the end trigger, or filling the wall, as the goal. The goal is the most points; a full row only ends the game.
7. Rack and row are mixed up (a newcomer can't tell a drying rack from a mosaic row): `ui9.js:379` "Tap a glowing row" (means rack); `hlp.js:26` "Each full row sends one tile to your wall"; `hlp.js:28` "Row 3 holds three tiles"; `hlp.js:29` "A row is blocked if its wall row…"; `hlp.js:47-48` "Fills row N" / "Row N grows" (both mean rack); the first-visit story card "Fill a row: one tile moves to your wall" (ui9.js story override ~:457). The rules text and the tutorial say "rack". Use "rack" everywhere for the left side and "wall row" for the mosaic.
8. Colour names: the tutorial says red / yellow / blue / snowflake (`tutor.js:53-64`), but the turn line and log say Garnet / Saffron / Cobalt / Frost (`ui9.js:245`, `engine.js:56`), and the rules use the glaze names. Pick one set; the plain colour words are easier.
9. Floor vs breakage vs "broken tiles": the rules say breakage (`rules-html.js:12`), the tutorial and help say floor (`tutor.js:59,63,69`, `hlp.js:30`), and the board label and banner say "Broken tiles" (`ui9.js:300`). Middle vs courtyard is mixed the same way (`rules-html.js:3` against `:7`). One word each.

Verdict: no rule is broken in play, but the scoring rule is stated wrongly in two player-facing places (1, 2), and items 3-6 mislead. Row 1 = 6.

## Scores (GAMEPLAY-RUBRIC, 8 rows)

| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | **6** | Engine 61/61 correct; text mismatches 1-9 above, two of them misstate scoring. |
| 2 | Tutorial teaches | 7 | 21 one-line, one-tap steps cover every core rule in order, the staged round ends in real scoring, then a real game. Minus: the first line teaches the wrong goal, the colour words differ from the game, and the bubble covers the floor line at 553 (step 6 "blocked", bubble at y 465-516 over the breakage row). |
| 3 | First 10 seconds | 7 | Title: big "New here? Learn to play" and "Begin". A one-card intro; then "Your turn: tap a colour" with the board. The intro card's "Fill a row" is ambiguous (item 7). |
| 4 | Turn clarity | 7 | The line always says whose turn it is ("Tamsin is choosing…", "Tamsin takes 3 Obsidian", "Your turn: tap a colour"). The selected count chip, +N chips on racks, red ✗ on blocked racks and the -N breakage chip show cost and gain. Rack/row wording hurts (item 7). |
| 5 | Phone play | **5** | See repros P1-P4: tap targets far under 44 px, the right kiln cut off, the hint bubble crushed to one word per line. Text >= 11 px everywhere (0 smaller nodes found). No horizontal scroll. |
| 6 | AI and pacing | 7 | The rival plays sensibly and briskly; games are 5 rounds, ~2 min by touch. A newcomer wins 82 % on the default (easy) level: winnable, maybe soft (rival 17-28 points in my games). |
| 7 | Feel | **6** | Tiles fly, scoring counts up per row, banners and sounds: it feels like a game. But the owner's calm bar fails: 3 infinite loops in normal play and 12 in the tutorial (see Clutter). |
| 8 | Bugs | 7 | 0 errors, 0 stuck, 0 dead taps over 2 tutorials + 3 games. Minus: the bulb bubble layout bug (P3) and the quick gate failing on its visual baselines. |

**Average (6+7+7+7+5+7+6+7)/8 = 6.5. FAIL** (rows 1, 5, 7 under 7).

## Repro steps for rows under 7

- **R1 (rules text):** Open the Menu, then the rules: rules-html.js:11 "Add both". Then a tile with one left neighbour and nothing above or below: the text gives 2 + 1 = 3, the engine gives 2. Help card "Touching scores" (bulb → How does this work?) has the same wording.
- **P1 (taps):** 375x553, Begin, Play, your first turn. Kiln tiles are 27x27 px (`[data-k=f1_0]` … `f4_3`); courtyard tiles 17-20 px (`c_*`), the Sun 17-20 px; at 375x667 the courtyard tiles are 27-28 px, kiln tiles 41 px. Rack hit areas are 145x29 (`.bf-rack`), the breakage line 224x32 (`.bf-fl`), wall cells 31x31. All need a 44 px hit area (an invisible padding hit box is fine).
- **P2 (clipping):** 375x553 and 375x667, any turn: the right-hand kiln (2-player game) sits half off the board frame at x≈330-375 and under the sack counter; see `g2/selected.png`.
- **P3 (hint bubble):** 375x553 or 375x667: Begin → Play → your turn → tap the bulb. The bubble `.gxh-bub.gxh-bulbb` is squeezed into a ~70 px column right of the bulb, one word per line ("Fills / row 3: / about / +1 / when / the / round / ends."), and covers the wall. See `bulb375x553.png`. Shell file `shell/gx-help.css:60-73` (bulb bubble width when anchored near the right edge).
- **P4 (tutorial bubble):** 375x553, Learn to play, step 6 "Rack 3 is shut…": the bubble covers the breakage line and the bottom of the board; step 2 "Tap red" covers the whole kiln row except the target.
- **F1 (loops):** any real game: the wall-cell `bfReady` outline, the ghost tiles `bfGh`, `bfGlow` on the target rack and `rvSrc` on the rival's source kiln run forever until the state changes (seen in ~100 of ~130 samples per game).

## Prioritised fix list

1. **Loops to 0** (row 7): make `bfReady` (`ui9.js:105`), `bfGh` (`ui9.js:60-61`), `bfGlow` (`ui9.js:62`, `:75`) and `rvSrc` (`extra.css:169-170`) run 2-3 iterations and then hold a static glow. Same for `bfTap` (`ui9.js:122`). Re-run `node games-src/scripts/calm-audit.js /tmp/x sunglaze` and check the tutorial path too.
2. **Tap targets >= 44 px** (row 5): add an invisible hit area (padding or `::after` inset -8 px) on `.bf-t` tiles in kilns and the courtyard, on `.bf-rack` rows (29 px tall now), on `.bf-fl` (32 px) and on wall cells in the wall phase. At 375x553 make the kilns bigger or put them in 2 rows so tiles reach at least 36 px with the hit box at 44.
3. **Hint bubble layout** (rows 5, 8): `.gxh-bulbb` needs a min-width (~220 px) and must flip left when the bulb is near the right edge.
4. **Rules text** (row 1): fix items 1-6 (exact lines above). Then the terminology: rack / wall row / floor / middle, one word each and one colour naming (items 7-9) across `rules-html.js`, `hlp.js`, `tutor.js`, `ui9.js` tips and the say line, `ui8.js` phone preview.
5. **Board framing at 553/667** (row 5): keep all 5 kilns inside the board frame, not under the sack counter.
6. **Tutorial bubble placement** at 375x553 (row 2): anchor it above the board when the target is the bottom rows, never over the floor line it explains next.
7. **Visual baselines**: after 1-6, the orchestrator looks at the shots and re-approves the 3 phone baselines so `--quick` goes green.
8. Optional (row 6): the default level for a fresh player is easy and a newcomer wins 82 %; fine for a first game, but consider making the tutorial's real game easy and the Begin default normal (newcomer 45 %), or an easy with fewer slips.
