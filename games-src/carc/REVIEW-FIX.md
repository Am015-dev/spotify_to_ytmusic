# Rampart and Vine: reviewer R2 FAIL (8 Nov 03:01 UTC). Fix all, in order.
Scores: look 5, feel 5, aim 7, pop-ups 6, readable 5, words 7, playable 9, owner art 3, impeccable 5, design 5. logic-test 70/71 (rule 5).
1. Owner 3D: 0 of 8 .glb load (no THREE, no canvas); followers are flat 2D icons. Wire the owner glb models (followers, castle etc.) as W461/W460 did in other games; wire the unwired Wave 7 inbox art (end-*-b/c, table-castle-hall, table-vineyard-dusk, tex-*-b/c). Never replace owner art.
2. Camera: aiming zooms so far in only 2-4 tiles show. Keep the whole valley readable, follow the new tile gently. PC: board is a small cluster on an empty table, tiles cut under the top bar -> fill the screen.
3. Tiles read as flat swatches with a pale road stripe: use the painted owner tile textures so it reads as a painted board.
4. Rival turn: two quick lines (~1.2 s): show the tile fly from the bag, rotate, land, follower drop, score pop, step by step at readable speed.
5. Phone overlaps: follower tags ("road", "priory", "field") over the spots; end score pops overlap; a Tamsin bubble cut off with "…"; "left" label 13px; "Valley complete" pill white on cream; status box stacks two messages.
6. Fix logic-test rule 5.
Shots: games-src/carc/playable-shots/review/r2-*.png
