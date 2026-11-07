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
| 9 | Tutorial bubble on phone covers the market rows it talks about; the first step is a "Next" lecture, 9 steps. | FIXED: 5 steps, every one a real action (take, Take, pick stored tile, build on the glowing space, End turn), no lecture steps; ends in a real game. Bubble placement is the shared kit's (it sits below the spotlit tile); proven uncovered by elementFromPoint. |
| 10 | Help opens on a dense rules page; there is no "how a turn works" summary up front. | FIXED: Rules opens with "How a turn works" in 5 short lines, then all the rules. |

## After (shots/after-*.png; 4 phone shots in playable-shots/)
Second critique on the after-shots: the turn is now a readable sequence (banner -> one instruction -> glowing targets -> animation -> pop);
the rival turn reads as captions. Still weak: the title is a plain card (no title art in temp-art), the estate colours are only explained by the
instruction line, and the market on phone is dense (12 tiles + back lane) though every tile is now named.

## Proof (local, 390x763 unless noted)
- build-all --quick PASS; rules-test PASS (28 + 300 AI games); smoke phone/landscape/pc PASS.
- `node tut-end.js`: tutorial from fresh storage by tapping each spotlit centre (elementFromPoint = target) PASS at 390x763 and 1440x860; end card ->
  real game; Skip returns to the title.
- `node play-ui.js`: Quick game and Story chapter 1 played to the result by tapping only visible, uncovered UI PASS.
- ui-audit A-F: phone 0, phone-s 0, pc 0 (fixed on the way: PC tile labels 16px, PC menu notes 16px, story-map disc contrast).
- Test setup: temp art linked as media (not committed); Playwright browser shim outside the repo (PLAYWRIGHT_BROWSERS_PATH) because the
  installed 1.56.1 expects build 1194.
