# R92 strict gameplay review: tidewake

Reviewed commit: `f3c8282ad16c62f345f2d033dd147a342e5ff903` (origin/alex/brave-carson-rbpmlk, includes cb812c16 shell calm pass). Review date 20 Nov 2026, UTC.
Reviewer only: no game code changed.

**Verdict: FAIL.** Row average 6.1, capped at 4.0 by a stopper: the full gate's touch sweep fails 2 of 2 runs, and 2 of 2 again when run alone, on gold-mark taps that open nothing. Rows under 7: Rules 6, Phone 5, AI/pacing 5, Bugs 4.

## Gates (run alone, one after another, staged in /tmp/x)
The brief's `VIS_tidewakeS=","` is not a variable the build reads (visual.spec.js reads `VIS_SLUGS`), so the visual-baseline tests still ran. They fail only because this machine has no `.baselines/` folder (title, menu, board: "snapshot doesn't exist"). They are not counted against the game.

| run | result | detail |
|---|---|---|
| --quick #1 | FAIL (visual baselines only) | scenarios 8/11: the 7 game scenarios + ui-audit pass (ui-audit phone A0 B2 C0 D0 E0 F0); the 3 failures are missing visual baselines. 88 s |
| --quick #2 | FAIL (visual baselines only) | same. 83 s |
| --full #1 | **FAIL** | phone-check PASS at all 6 sizes (390x763, 375x553, 844x390, rotations, stale). lab WARN 9/12 (dev lab page is missing the menu row). **sweep.js: "375x553 g1: dead tap on the enabled Place button"**. 137 s |
| --full #2 | **FAIL** | **sweep.js: 61 problems: "375x553 g1: tap on a gold mark opened no start pop-up" (84 start taps in one game) and "tapping the bulb finger did not open the advised start mark"**. 159 s |
| sweep.js alone (`QUICK=1 node sweep.js`) x2 | **FAIL x2** | 51 and 38+12 "gold mark opened no start pop-up" in g1 (the 3D-board game: seed 300, 2 players, anim speed 40), at 390x763 and at 375x553 |

`--full` rewrote games/lab.html. I restored it and did not commit it.

## Rules vs the original (from rules-notes.md, RULES-CHECKLIST.md, rules-check/tidewake.md)
**Engine: no wrong core rule found.** Checked in engine.js: hand of 3; 6/5/4 leviathans at start; dice placement with re-roll; all junks placed before any tile; roll 6/7/8 wakes the leviathans, in corner-number order with the gold tie-break, one die each, 6 = a new one rises; off board = gone; onto a tile destroys it (bottom of pile) and sinks the junks on it; moving onto a standing leviathan destroys it; a leviathan in front of the active junk sinks it; minimum 3 (next player refills and skips the roll); prohibited placements only when nothing else is legal; draw to 3; elimination swap bonus only for the placer; shared win when the last junks sink together. Board size, tile repeats and leviathan arrows are documented guesses (unchanged from rules-check).

**Player-facing text: 13 mismatches.**
| # | file:line | text says | rule / engine |
|---|---|---|---|
| 1 | game/ui9.js:56 | "Dice wake leviathans each turn" | only a total of 6, 7 or 8 wakes them (44% of rolls) |
| 2 | game/ui9.js:55 | "...onto another junk's wake, and you sink" | junks pass through each other; you sink only by ending on the same wake in the same direction |
| 3 | game/ui9.js:65 | "When a junk sinks, its tiles go to a pool. You may swap" | only when YOUR placed tile sank it; otherwise its tiles go to the bottom of the pile |
| 4 | game/ui10.js:61 (tutorial `swap`) | the swap is taught right after Cobalt is sunk by a leviathan | a leviathan sinking gives no bonus; the lesson shows the wrong trigger |
| 5 | game/ui10.js:45 (tutorial `never`) | "never into a loop, a leviathan or a rival's path" | only forbidden: ending two junks on one wake in the same direction (crossing a rival's path is fine) |
| 6 | game/texts.js:30 (Our guesses) | "head-on wakes sink both" | engine (collideSweep, engine.js:260) sinks only same square + same port; head-on never sinks both |
| 7 | game/texts.js:30 (Our guesses) | "a 6 by 6 board can never hold the whole pile" | the board is 7x7 (49 squares) |
| 8 | game/texts.js:59 (OSK `collide`) | "Two junks on one wake both sink" | only when they end on it heading the same way |
| 9 | game/ui9.js:63 | Deck Cannon "even on a rival's turn" at a leviathan next to you | out of turn only when that leviathan is about to sink you |
| 10 | game/ui9.js:61 | rescue: "...or move to a safer square" | the only move is relocating a blocked START to another free mark on the same edge |
| 11 | game/ui9.js:57, :40 | "No tile fits... you may pass" | every tile always fits; you must place (even a sinking one). Pass only with no tiles |
| 12 | game/texts.js:70 (OSK `tie`) | "it is a draw" | the rule: they all win (engine: "share the win") |
| 13 | game/ui6.js:118 (sunk card) | "Watch the rest, see the result now, or start a new game" | in a 2-player game the game is already over and the card has one button (Continue) |

Also minor: game/ui10.js:37 `reloc` omits "on the same edge"; texts.js:23 Rogue Wave says any junk in the row rolls (only the active junk, plus junks moved through it).

## First-timer play (touch only, 375x667 and 375x553, default 3D page, fresh storage)
Path: title, then "New here? Learn in 5 minutes", the tutorial, then "Play a real game", then Play again x2. Newcomer policy: the first tile/turn the game marks safe; Hint tapped once per game (then 15 s watched).
| size | tutorial | game 1 | game 2 | game 3 | errors | dead taps |
|---|---|---|---|---|---|---|
| 375x667 | 30 steps, 78 s, to "You win" | lost, turn 18, 85 s (blocked in by Krakenreach) | lost, turn 8, 46 s (ran into Krakenreach) | lost, turn 18, 78 s, **identical to game 1** | 0 | 0 |
| 375x553 | 32 steps, 76 s | lost, turn 18, 81 s | lost, turn 8, 47 s | lost, turn 18, 76 s, identical | 0 | 0 |

- **Every game after the tutorial uses seed 11.** ui10.js:101 calls `setSeed(TS.seed)` and `setAiSeed(3)`, and nothing resets `DEFSEED` (engine.js:8, :80). Same 6 leviathans on the same squares (`9@4,1 3@2,5 8@0,3 0@0,2 1@5,5 6@3,2`), same hand (53,16,36), same dice, same rival moves in all 6 games, until the page is reloaded. The tutorial's names (Vermilion/Cobalt) also carry into these games.
- Whose turn / what to do: clear ("Your turn: lay a current", tick/cross badges, star = safest, "Krakenreach: 6-8 reaches you").
- Fair AI (engine sim, 150 random seeds each, default Easy rivals): random-but-safe newcomer wins 23% of 3-player Quick games (fair share 33%), 35% following hints, 42% heads-up. So a newcomer can win on random seeds. The fixed seed hides that: my newcomer lost the same sea 6 times.
- Games are short (8-18 turns, 45-85 s). That's fine for this genre.

## Clutter (sampled every second over the whole path)
- Helpers (calm-audit definition): **max 1** at both sizes. calm-audit.js on the stage: `loops=3 maxHelpers=1`.
- Glows by class: **up to 4 at once** (tutorial: div.oring + Place .pb.pri + .btn.pri + .gxt-ring). After Hint: hint bubble + ship .oring + glowing Place + star tile.
- **Infinite animations: up to 51 visible at once** (setup and tutorial): every gold mark `div.opip` pulse2 (head.html:212), `.omark b` pulse (head.html:216), `.oring` pulse2 (head.html:209), route `polyline` dashf (head.html:190), dice `tumble` while rolling (head.html:106), `rect` tw2pl / tw2spin (kit/kit.js:1170). In the 15 s after Hint: 2 loops (dashf, oring). In play after setup: 1-3 (dashf, oring, tw2pl).
- The "Your start / Tap a gold mark" coach bubble appears again in the first real game right after the tutorial taught it.

## Phone
- Text: 0 elements under 11 px, 0 under 14 px on every sampled screen (title, tutorial x7, setup, my turn, after Hint, mid-game, result).
- Taps: every button is 44 px or more, **except the gold start marks: about 51 `div.opip` targets of 22x22 px, 12 px apart**. At 375x553 neighbouring marks overlap (elementFromPoint at a mark centre returns the next mark). With proper closing, all 46-52 marks did open a pop-up by hand.
- Clipping: none in play. On the title, "Custom game" (375x667) and "Play with friends" (375x553) sit below the fold (the page scrolls; acceptable).
- Board art is dark: dark-blue leviathans on a dark teal sea are hard to pick out at 375 px (shots g1-06-mid, g1-99-over).
- Dead taps: 0 in my 6 touch games. The game's own sweep finds them (see Gates). I could not reproduce them by hand on the 2D or 3D board, at speed 1 or 40, with or without Hint.

## Scores (GAMEPLAY-RUBRIC.md)
| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | **6** | Engine right; 13 player-facing texts contradict the rules (table above), several in the help a newcomer reads first (#1, #2, #3) |
| 2 | Tutorial teaches | 7 | One line + one tap, 30-32 steps in about 75 s, rules in order, 0 dead taps, ends in a win and "Play a real game". The swap lesson shows the wrong trigger (#4), "never a rival's path" is wrong (#5), and the board is dimmed so dark under the tutor shade that the tile and leviathans are hard to see |
| 3 | First 10 seconds | 8 | Goal card + one big "New here?" button; the board says "Tap a gold mark" |
| 4 | Turn clarity | 7 | Clear turn line, tick/cross, safest star, threat warnings. Jargon "14% risk, keeps 7 moves open"; "Can't: no room ahead" means "off the edge" (ui7.js:37); the sunk card promises buttons that aren't there (#13) |
| 5 | Phone play | **5** | 51 gold marks at 22 px, overlapping at 375x553; up to 51 pulsing loops on the setup screen; dark board; the gate's sweep dead taps are at phone sizes |
| 6 | AI and pacing | **5** | AI fair on random seeds, brisk games. But after the tutorial every game is the same seed-11 sea with the same rival moves: a newcomer replays one identical game until reload (lost 6/6 here) |
| 7 | Feel | 7 | Dice tumble, ships sail, leviathans move, sunk cards with a red mark, result card. The dark board mutes it |
| 8 | Bugs | **4** | Full gate FAIL 2/2 and sweep FAIL 2/2 alone (dead gold-mark taps, a dead Place tap, the bulb finger not leading to its mark). Fixed-seed leak. 0 page errors in my games |

Average 6.1; **stopper (gate sweep: gold-mark taps stop responding in game 1) caps the total at 4.0. FAIL.**

## Repro steps for rows under 7
- R1: open How to play (bulb, then "How does this work?" while laying a tile) and read "Dice wake leviathans each turn" / "onto another junk's wake, and you sink"; Rules drawer > Our guesses says "head-on wakes sink both" and "6 by 6 board".
- R5: Quick game, at 375x553, setup screen: around 51 pulsing 22 px gold marks; in DevTools `document.elementFromPoint` at a mark centre returns its neighbour.
- R6: fresh storage, then the tutorial, then "Play a real game": `G.seed===11`. Play again: `G.seed===11` again, same leviathans and hand.
- R8: `cd games-src/tidewake/game && QUICK=1 node sweep.js` (needs a fresh `tidewake.html` from `build-all --quick tidewake`): g1 prints "tap on a gold mark opened no start pop-up" dozens of times.

## Prioritized fix list
1. **Stopper: make `sweep.js` pass 2/2 on `--full`.** Root-cause g1 (3D board, seed 300, 2 players, ANIM speed 40, tips on): gold-mark taps stop opening `#ppop`, the bulb finger does not lead to the advised mark, and once a Place tap was dead. Lead: after Hint in setup, `.gxh-finger` is `gxh-off` at 0,0 (0x0) while only the ring shows the mark. Check what a tap on the finger spot does, and check pop-up state (`PH.pop`) after a pip tap while a coach bubble is open.
2. **Reset the seed after the tutorial**: clear `DEFSEED` (and the AI seed and the tutorial names) when the tutorial ends or when any non-tutorial game starts (ui10.js:101, engine.js:80). Test: play the tutorial, then "Play a real game" twice, and expect different `G.seed`.
3. **Calm: 0 infinite animations.** Make `.opip` pulse2 (head.html:212), `.omark b` pulse (:216), `.oring` pulse2 (:209), `dashf` (:190), `.die.roll` tumble (:106, finite while rolling) and kit.js:1170 tw2pl/tw2spin finite (2-3 iterations) or static. Show only the advised gold mark glowing, not all 51.
4. **Gold marks >= 44 px**: make the tap target the whole edge square (or a 44 px hit area per mark, never overlapping), keeping the 22 px dot as the visual. Check at 375x553.
5. **Fix the 13 texts** in the Rules table (ui9.js:40,55,56,57,61,63,65; ui10.js:37,45,61; texts.js:30,59,70; ui6.js:118). Reorder the tutorial swap demo so it follows a sinking caused by your own tile, or say "if YOUR tile sinks a rival".
6. Don't show the "Your start" coach bubble in the first game after the tutorial.
7. Clarity: "Can't: off the edge. Turn the tile." instead of "no room ahead"; explain or drop "keeps N moves open".
8. Lighten the board (or outline the leviathans) so they read at 375 px; lighten the tutor shade over the board.

Evidence (session-local, not committed): shots of title/tutorial/turns/Hint/result at both sizes, per-second clutter JSON, newcomer sim results.
