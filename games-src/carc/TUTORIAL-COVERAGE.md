# Tutorial coverage: Rampart & Vine

The tutorial is the PROLOGUE of the story: one complete, fixed 11-tile game (stacked deck, seed 7) played from setup to the final
count and result against the real computer rival (named Hob in the tutorial). Old Tamsin (guide, portrait on every bubble) gives the
story reason, the player does the real action (the step only advances when it is done), then Tamsin or Hob reacts. Chapters are
shown on the first step of each chapter; the kit remembers the step, so the player can leave (Skip tutorial) and resume.
All text lives in `game/src/story.js` (`STORY.tut`). Proof: `game/tutor-test.js` (all 19 steps, 390x763 and 1440x860, wrong taps, spotlight
not covered) and `game/playable-test.js` (quick game and story chapter 1 by taps).

| Chapter | Step id | Rule taught (by doing or seeing) | Story beat |
|---|---|---|---|
| 1 Your first turn | goal | [x] goal, most points wins; the valley starts with one tile | "Vinemoor has no owner. Whoever builds the best valley gets the deeds. Hob wants them too." |
| 1 | turn | [x] draw a tile, turn it | "Hob is already measuring the land. Turn your tile." |
| 1 | place1 | [x] edges must match (road to road) | "Lay it where the road runs on." |
| 1 | fig_road | [x] follower on a road; you start with seven | "A follower makes it yours." |
| 1 | computer | [x] the rival's turn; a feature with a follower is taken (one owner only) | Hob takes a turn |
| 2 Roads, scoring | place2 | [x] closing a road | "Finished roads pay a point per tile." |
| 2 | fig_priory | [x] follower on a priory | "Eight tiles around it will pay 9." |
| 2 | road_done | [x] finished road scores 1 per tile; the follower goes home | payoff: "four points... Hob frowns." |
| 2 | place3 | [x] town meets town | "Close the wall before Hob can take it." |
| 2 | fig_town | [x] follower on a town | "Claim it before it closes." |
| 2 | town_done | [x] finished town scores 2 per tile; follower returns | payoff: "Hob grumbles." |
| 3 Special cases | place4 | [x] priory needs all eight neighbours | "Keep building around it." |
| 3 | fig_farmer | [x] a follower in a field is a farmer; 3 per finished town at the end; farmers stay | "A follower lying in a field is a farmer." |
| 3 | place5 | [x] no follower needed every turn | "No follower is needed." |
| 3 | place6 | [x] completing the ring | "The monks are ready to ring the bell." |
| 3 | skip | [x] skipping the follower | "Save your follower for later." |
| 4 Ending the game | priory_done | [x] priory ringed by eight tiles scores 9 | "The bell rings." |
| 4 | final | [x] end: open roads and towns 1 per tile, farmers 3 per finished town (animated count-up, tile by tile) | climax: "The valley is full." |
| 4 | winner | [x] most points wins; result screen | "The deeds are yours." |

## Not taught by doing in the tutorial (honest list)
These are explained in the lightbulb / Help drawer ("How a turn works", then rule cards) and by the coach bubbles in real games, but the
tutorial game does not contain them (it is a fixed 11-tile valley with no spare tiles):
- [ ] town banners (+2 each); incomplete priory scoring (1 + neighbours); incomplete town scoring detail
- [ ] ties and majority fights (several followers on one feature, tied players all score)
- [ ] a tile that fits nowhere is set aside and another is drawn
- [ ] end trigger detail (last tile) and tie-break (a tie is shared)
- [ ] The Riverlands (river start), Taverns & Basilicas (inns, cathedral, large follower, 0 when unfinished), Merchants & Masons (goods tokens, mason extra turn, hog +1 per town)
These need extra staged tiles; next step would be a second optional chapter ("Special tiles") with a stacked deck that contains them.

## Rules check (games-src/rules-check/rampart-and-vine.md)
WRONG 0, MISSING 1 (garden/abbot tiles belong to an expansion we do not have), SIMPLIFIED 4. Nothing to fix in the engine
(W391 added no commits for this game). The simplified items are stated in the Help drawer card "House rules" (first seat always starts;
builder extra turn counts even when its tile finishes the feature; tile art follows common open sets).
