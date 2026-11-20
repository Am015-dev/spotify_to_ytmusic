# [FIXED14 vinegrave] report (20 Nov 2026)

The report trigger was refused, so the report is this file.

Branch `shelf/W490-vinegrave-bench`. Before I started I merged `origin/alex/brave-carson-rbpmlk` and the remote F13 commit 43347024. Fix commits: 13631317 (rules and structure, bottom sheet, map), 1be30a1c (map grid, track costs, calm tutorial, game over), fe29c8e5 (proof). Nothing is deployed.

## Gates
| Gate | Result |
|---|---|
| `--quick` | PASS (8/8 scenarios) |
| `--full` run 1 | PASS (phone-check, rules-test 200 AI games). Lab WARN 3/8 (rows != scenarios), the same as before. lab.html restored, not committed |
| `--full` run 2 | PASS |
| logic-test | 147/147 |
| guided-tut-test | PASS: 35/35 steps, 0 page errors, at 390x844 and 375x667 |
| dock-fit-test | PASS: 239 checks |

## Structure, now matching the original
Checked against the text of the original rulebook. COMPONENTS.md lists every type, its count and how ours maps to the original. The new COMPONENTS block in rules-test asserts them.

- **Research track**
  - It is now a path map: 2 start spaces, then rows of 2, 2, 2, 1, 2, 2 and 1 spaces, joined by bridges. Each bridge shows the cost of moving into its space.
  - There are 18 research bonus tiles. The first token into a space takes its tile. 8, 10 or 12 spaces get a tile at 2, 3 or 4 players. The Lost Temple stack (one tile per player) is dealt from the same 18.
  - Every arrival still gets the row effect.
  - The ladder and the old first-arrival rewards are gone.
- **Buying an artifact**: using its effect is optional. The card sheet offers "Buy and use it" and "Buy, keep for later".
- **Level-II sites** hold a face-up and a face-down idol. You take both but get only the face-up idol's gift.
- **Idols**: 16, in 4 kinds of 4.
- **Solo rival**: 15 tiles, 5 dig tiles plus 5 green/red pairs (discover, research, guardian, item, artifact).
  - The stack is 10 tiles each round. The number of red tiles is the difficulty: Easy 0, Steady 1, Normal 3, Hard 5.
  - The rival starts every round and never passes before its 10 tiles are used. It gains no resources and no Dread.
  - Green item and artifact tiles take the card with the fewest points; red tiles take the most.
  - Idols score 3 per new kind and 2 per duplicate or face-down idol.
  - At the temple the rival takes a 6-point tile. Its research also removes an assistant.
  - Solo uses the 2-player setup (stacks of 2).
- **Asserted counts**:
  - temple stacks: one 11, two 6, three 2, each with one tile per player;
  - assistants: 12, in 3 stacks of 4;
  - blocking tiles;
  - box counts: 40 items, 35 artifacts, 15 guardians, 10 + 6 sites, 16 idols, 12 assistants, 19 Dread.
- **Rules drawer**: "Simplified on purpose" is removed. It now says the rules, counts and board shape follow the original and the card designs are ours.
- **[unverified]** These are printed only in board and tile art, not in the rulebook text:
  - research board: the exact path layout and bridge costs;
  - tile values: the bonus tiles and idol gifts;
  - idol slots: their effects and empty-slot points;
  - temple: tile costs and arrival points;
  - discovery costs (3 / 6 compasses);
  - solo rival: which resource each dig tile shows, which tiles do nothing in round 5, the rounds a site it discovers gets a guardian, and how the red research and guardian tiles differ.
  - The supply is unlimited, which I read as what the 10 reserve tiles are for.

## Win rates
Two-player games, headless. The follower plays the move that glows and also uses free plays that help.

| Level | Follower wins | Avg score: follower vs bot | Before |
|---|---|---|---|
| Easy | 42/70 (60%) | 76 vs 69 | 10/10 for the follower, 25-81 |
| Normal | 13/30 | 73 vs 72 | |
| Hard | 5/20 | 72 vs 92 | |

- Normal now uses the same logic as Easy but stronger; before this it scored below the new Easy.
- No extra level was needed between Easy and Normal: Easy alone is within about 7 points.
- Solo rival vs a Normal-level computer player, 20 games each:

| Rival level | Player vs rival (avg) | Player wins |
|---|---|---|
| Easy | 78 vs 50 | 19/20 |
| Steady | 74 vs 55 | 16/20 |
| Normal | 75 vs 68 | 15/20 |
| Hard | 67 vs 84 | 5/20 |

## UI changes
- **Choosers**: any chooser with 2 or more buttons is a bottom sheet over the hand, with a title line and the cards left-aligned (no left clip). The board is never squeezed away.
- **Map height in real play**: at least 163 px at 375x553, 155 px at 360x640, 180 px at 375x667.
- **Compact map**: travel icons 16 px, loot text 14 px, 0 overlapping pills (measured).
- **Tutorial**: the ring and the dot pulse twice, then stay still. After 9 s they are still for good.
- **Game over**:
  - no toast or caption over the score pills;
  - duplicate pills are dropped, and a pill that would clash moves down a step;
  - the result card opens clean.
- **Text**: the goal card now says "Each Dread card is -1 point".

## Proof
- `games-src/vinegrave/proof/first-3min-375x667.webm`: 183 s, covering the title, the guided game and rounds 1-2 of a real game, with 0 page errors.
- Shots `01` to `04` are in the same folder. The recorder is `proof-video.js`.

## Cold-play verdict (independent tester, no knowledge of the game, touch only; quoted as-is)
"It looks great and is playable start to finish, but as a first-timer I did not understand the scoring, so I lost by a mile and didn't feel it was my fault in a useful way. I'd want a short "here's how you score" recap before round 1 or a clear end-of-round breakdown, and the bottom card tray needs to be less cramped."

- Could play: PARTLY (leaning yes). Enjoyed: PARTLY, fun 2.5/5.
- Final score: Tamsin 87, tester 30, on Easy.
- What confused it:
  - the market's "need N" and star badges;
  - travel costs and when a Plane is needed;
  - research choices it could not evaluate;
  - assistants, which came with no explanation;
  - the rival's score jumps, which it could not follow.
- Hand card names were clipped by the fan.
- The map changed layout when it went compact mid-game.
- Nothing crashed or froze, and no taps were swallowed.

## Still open (not fixed this round)
- **Scoring**: a scoring recap before round 1, or an end-of-round breakdown.
- **Market**: explain the market badges once.
- **Hand**: the hand fan clips card names.
- **Map**: it switches layout when its height crosses 205 px.
- **Easy**: a player who does not follow the glow still loses badly (30-87).
