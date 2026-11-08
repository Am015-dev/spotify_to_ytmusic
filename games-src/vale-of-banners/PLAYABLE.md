# Vale of Banners - playable pass (W379)

Benchmarks: games/cauldron-fair, games/hollowbough (one plain instruction line, clear turn banner, named cards), and how digital
dice-and-estate euros present a turn (turn banner, highlighted legal moves, rival moves replayed one by one with a caption).

## First-minute critique (before, 390x763 + 1440x860; shots/before-*.png, not committed)

| # | Problem (as a newcomer) | Status |
|---|---|---|
| 1 | No turn banner: a Quick game can start with the rival moving and nothing says "Azure's turn"; the board just changes. | FIXED: big turn banner "Your turn" / "Azure's turn" (seat colour, ~1 s) at game start and every turn change; the rival waits for it. |
| 2 | Rival turn is unreadable: the dock title "Azure is playing" and the toast "Azure builds Keep" print on top of each other; the rival's dice and storage replace mine with no label. | FIXED: dock title reads "Azure's turn · tap to speed up"; rival steps go into the instruction line, never as a toast on top of the title; toasts hide the title while shown. |
| 3 | The instruction line is a menu, not an instruction: "Use a die: take, build, sell or workers." I don't know what to tap. | FIXED: concrete line from the real legal moves, max 2 lines: "Your dice: 2 and 5. Tap a glowing market tile to take it (its stall number matches a die)." / "...or in your storage to build it" / "Tap a glowing space on your estate (same colour, touching your land)" / "Both dice used. Tap End turn." |
| 4 | Tiles are glyphs with no names: a blue hex with a boat, a green hex "x4", a tan hex with a tower. Nothing says Barge / Pasture / Building, so the market is a wall of icons. | FIXED: every market, back-lane and storage tile has a name label on a solid backing (13px phone, 16px PC): Barge, Keep, Mine, Lore, Moot Hall, Inn, "4 Goats"... Worker cost badge is now "👷1" instead of "+1". Temp art kept (it already reads by colour + shape); glyph slot kept for real art. |
| 5 | Estate colours mean nothing: numbered coloured hexes, no hint that the colour must match the tile and the number must match the die. | PARTLY: the build step now dims the market and every non-target space and glows only legal spaces; the line says "same colour, touching your land". A colour legend on the estate was not added (no room on phone). |
| 6 | Rival actions are near-instant toasts (~0.6 s), there is no step caption you can read, no way to slow or speed up; rival builds are invisible (only a toast). | FIXED: rival plays step by step: the tile it picks pulses white for ~0.8 s with a caption ("Azure takes Moot Hall from stall 1", "Azure built Keep", "Azure: +3 region filled", "Azure ends the turn"); tap anywhere speeds the rest of that turn to ~0.16 s/step; never instant. |
| 7 | Score pops are small and vague ("+3 region done!" in a 12px pop) and vanish fast. | FIXED: score pops are 18px gold-on-dark pills that stay 1.7 s, plain reasons ("+3 region filled", "+2 goods sold", "+4 animals in the meadow"); each pop holds the sequence 0.55-0.9 s. |
| 8 | Dock counters are bare emoji + number (coin 1, worker 2, star 0, flag 0) and storage is three empty dashed boxes; "3 x2" goods chips are unlabeled. | PARTLY: counter labels under the chips pushed the estate down by 30px on phone, so reverted; chips keep tap-to-explain (toast + aria-label). Goods chips made compact so storage + goods fit on one row and the estate stays large. |
| 9 | Tutorial bubble on phone covers the market rows it talks about; the first step is a "Next" lecture, 9 steps. | FIXED: the tutorial is now one whole real game (5 rounds vs the real AI, 5 chapters, 32 steps), every step a real action or a short 'see' step; ends on the result screen, then a real game. Coverage list: TUTORIAL-COVERAGE.md. Proven by tut-end.js (both sizes, elementFromPoint at every target). |
| 10 | Help opens on a dense rules page; there is no "how a turn works" summary up front. | FIXED: Rules opens with "How a turn works" in 5 short lines, then all the rules. |

## After (shots/after-*.png; 4 phone shots in playable-shots/)
Second critique on the after-shots: the turn is now a readable sequence (banner -> one instruction -> glowing targets -> animation -> pop);
the rival turn reads as captions. Still weak: the title is a plain card (no title art in temp-art), the estate colours are only explained by the
instruction line, and the market on phone is dense (12 tiles + back lane) though every tile is now named.

## Story (ADDENDUM 3)
Tutorial = story prologue: Old Odo guides, Tobin Reed is the rival for the spring charter; each step has a story reason, Odo reacts in a
portrait bubble after the action; chapters Prologue / Market day / The keep / The moot / Harvest eve; the final count is the climax (count-up +
win/loss line). Quick game: Odo's flavour line at the start, a result line in the Vale's voice. Story: chapter intros/win outros/boss lines
(campaign.json) + a loss outro per chapter (src/story.js). STORY.md has the cast and 3-act arc.

## Rules (ADDENDUM 2)
rules-check MISSING 2/2 fixed in the engine with rules-test cases: solo mode (1 silver, 2 workers, 3 goods, no goods-kind limit, 25 rounds,
win only with all 37 spaces) and 2 v 2 teams (shared silver, workers, goods; team total wins; pool scores once). WRONG: 0 listed.
SIMPLIFIED-ON-PURPOSE (5) are listed in the Rules drawer under "Simplified on purpose".

## Phone layout redo (owner bug, 7 Nov 21:49)
Before (shots/free-phone-6myturn.png): market (12 tiles + back lane) and estate squeezed on one screen, estate hexes ~36 px.
After (shots/tabs-phone-6myturn.png, tabs-phone-3market.png): portrait phone shows ONE main view at a time behind three tabs under the
score strip: Your estate (default, hexes ~52 px), Market (3x2 stalls + back lane, tiles 40-58 px with names), Rival (their estate, read-only).
Dice, storage, goods and actions stay in the bottom dock; one instruction line (max 2 lines). A tab glows when it holds a legal move; the
view switches by itself at natural moments (after you take a tile -> your estate; when the rival takes -> market; your turn -> estate).
Landscape phone and PC keep the side-by-side layout. QA bot: 0 blockers, 0 majors.

## Coached first game (ADDENDUM 4)
The tutorial no longer forces 32 taps: only the first action is spotlit (2 steps), then it is a free real game against Tobin; Odo explains
each rule when it first matters, comments on good/poor and rival moves (one dismissable bubble, never blocking), and the result card walks
through the final count with your numbers plus a "Things you'll meet later" card. See TUTORIAL-COVERAGE.md.

## Free art kit
Merged and tested with `free-art/install.py --force` (92 pictures): the title now has a painted scene, tiles show their pictures. Code only hides
the emoji glyph when a picture exists; labels sit on the lower edge; the dim on not-playable tiles was lightened (opacity .6) so pictures stay
readable. Gate re-run with the kit installed: same results as below.

## Proof (local, 390x763 unless noted)
- build-all --quick PASS; rules-test PASS (28 + 300 AI games); smoke phone/landscape/pc PASS.
- `node tut-end.js`: tutorial from fresh storage by tapping each spotlit centre (elementFromPoint = target) PASS at 390x763 and 1440x860; end card ->
  real game; Skip returns to the title.
- `node play-ui.js`: Quick game and Story chapter 1 played to the result by tapping only visible, uncovered UI PASS.
- ui-audit A-F (final build): phone-s 0, pc 0, phone A0 B2 C0 D0 E0 F0. The 2 phone B items: Rules drawer "Buildings" 2.81:1 (the audit
  measures it off-screen; not reproducible by hand, same finding the previous worker could not trace) and the "3 Goats" market label scored
  "busy" (0.95, marginal; my crop of that spot shows another surface over the board). Turn banner and Odo's bubbles are switched off under
  ?scn= so the audit measures the still board.
- Note: the turn banner never showed in the first commits (an id helper bug); fixed in the story commit, now visible (shots/after-phone-3banner.png).
- Test setup: temp art linked as media (not committed); Playwright browser shim outside the repo (PLAYWRIGHT_BROWSERS_PATH) because the
  installed 1.56.1 expects build 1194.

## Turn flow and visible scoring (W421, owner: "not easy to understand what I have to do, how I collect points, when my turn ends and why")
- Turn tracker on top of the board: "Round 2 of 5 · Your turn · 2 dice left: [4] [6]"; dice are tokens that get struck out when spent; the top bar keeps only the season.
- Beat cards (tap to skip): "Turn over: you used both dice" + a good / okay / poor rating against the greedy best action at each step ("Stronger was: build Keep with a 3");
  "Azure's turn is over"; "Round 2 of 5 done · white die 5: a Honey crate goes to stall 5"; season end (mines paid, new region bonus). Then the banner "Your turn: you rolled 3 and 5".
- One instruction that names the die: "Use your 4: take a tile from stall 4, or build a stored tile on a 4-space. Or tap your 6."
- Previews: a selected storage tile (or a selected die alone) lights every legal space with a badge: gold +N = points now (region, animals, beacon), 2/4 = region progress; a star marks the best spot.
  Market: a ★ Best badge on the best pick for you (AI evaluation); the tile card says best / nearly as good / worth less.
- Score chips under the tracker: you vs rival, ★ leads, points by source (regions, goods, animals, ...). Region pops say why: "+11 region filled (size 1: 1 + spring bonus 10)".
- Coached game: 1 season of 3 rounds (engine option `rounds`); Odo explains the preview badges and the turn-over card the first time they show.
- Shots: playable-shots/v3-{phone,pc}-{1yourturn,2preview,3market,4turnover,5rival,6roundend,7result}.webp (`node shoot-v3.js`).
