# Tutorial coverage: Rampart & Vine (guided first game, owner rule 8 Nov 2026: gameplay first)

"Learn in 5 minutes" (and the Story prologue) is a GUIDED FIRST GAME (`tutStart` in `game/src/tutor.js`, shell/gx-tutor.js): a fixed 11-tile valley against Hob.
Each step is one sentence of 12 words or fewer (`STORY.tut` in `game/src/story.js`) and one highlighted tap: the glowing square, the follower circle, Skip, or Next on an
explain step. Every core rule is taught in order; nothing is put on a "learn later" list. The end card's "Play a real game" starts a normal game
(the prologue's button starts chapter 1).
Proof: `game/tut-walk-test.js` taps only the highlighted targets at 390x844 and 375x667. It checks that every step in `TUT_RULES` appears in order, that each is 12 words or fewer,
that no "learn later" list appears, and that a real game is running afterwards. `game/learn-touch-test.js` now runs this walk.

| # | Step | Rule taught | How |
|---|---|---|---|
| 1 | goal | lay tiles, claim with followers, most points wins | explain (Next) |
| 2 | turn | draw your tile and turn it | tap the tile |
| 3 | place1 | every touching edge must match (road to road) | tap the glowing square |
| 4 | fig_road | one follower on the tile just laid, or none; you have seven | tap the follower circle |
| 5 | computer | the rival lays a tile and may claim | explain |
| 6 | claimed | a claimed road, town or field takes no second follower | explain |
| 7 | place2 | followers go only on the tile just laid; closing a road | tap the square |
| 8 | fig_priory | priory: 9 when ringed by eight tiles | tap the circle |
| 9 | road_done | finished road 1 per tile, the follower comes home | explain |
| 10 | place3 | town meets town | tap the square |
| 11 | fig_town | claim a town before it closes | tap the circle |
| 12 | town_done | finished town 2 per tile, the follower comes home | explain |
| 13 | pennant | each banner shield in a finished town adds 2 | explain |
| 14 | place4 | the priory needs all eight neighbours | tap the square |
| 15 | fig_farmer | farmer in a field, never comes home | tap the circle |
| 16 | majority | most followers in a feature takes all its points | explain |
| 17 | tie | tied for most: each scores in full | explain |
| 18 | place5 | a follower is optional | tap the square |
| 19 | discard | a tile that fits nowhere is swapped | explain |
| 20 | place6 | completing the priory ring | tap the square |
| 21 | skip | skip the follower to keep it | tap Skip |
| 22 | priory_done | the priory scores 9, the follower comes home | explain |
| 23 | final | game end: open features 1 per tile (banners 1), farmers 3 per finished town | explain |
| 24 | winner | most points wins | explain, then "Play a real game" |

Honest limits: majority, tie, banner and swapped-tile rules are taught by an explain step on the real board, not by a move of their own. The scripted valley has no
contested feature or banner tile. The coached free game (`coach.js`, `coachStart`) is no longer launched from the menu. Its end no longer shows a "later" card.
`game/coach-test.js` starts it directly.

## Rules check (games-src/rules-check/rampart-and-vine.md)
WRONG 0, MISSING 1 (garden/abbot tiles belong to an expansion we do not have), SIMPLIFIED 4 (stated in the Help card "House rules"). Nothing to fix in the engine.

## History
The earlier 19-step forced-tap prologue (tutor.js, scripted rival) is no longer launched; its code stays in tutor.js unused.
