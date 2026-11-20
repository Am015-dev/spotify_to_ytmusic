# Vellum Shire: rules notes (2 players, you vs the computer)

An adaptation of the top-ranked medieval estate-building dice-and-hex-tile game. Mechanics and numbers follow the original
edition one for one; only names, wording and art are ours. Sources: the official rulebook (2011 English edition, all 12 pages),
two independent fan implementations of estate board 1 that agree cell by cell, and the rules of a licensed online version for the
corrected tie-break. Research notes with the real names stay outside the repo.

## Our names
| original role | Vellum Shire |
|---|---|
| game board depots 1-6 / central black depot | stalls 1-6 / the ink stall |
| castle (dark green) | keep |
| ship (blue) | barge |
| animal tiles (light green: sheep, cattle, pigs, chickens) | sheep, cows, pigs, hens on a pasture |
| mine (grey) | quarry |
| knowledge tile (yellow) | lore tile |
| building (beige) | town building |
| silver coins | silver |
| phases A-E | chapters I-V |
| bonus tiles (large/small) | gilded seals (big/small) |
| turn-order track | procession |

Building roles: warehouse = Granary, watchtower = Bell Tower, carpenter's workshop = Joinery, church = Chapel, market = Fair,
boarding house = Hostel, bank = Counting House, city hall = Guildhall. Goods kinds 1-6: Wool, Rose dye, Grain, Wine, Woad, Honey.

## Setup (2 players)
- Both players use estate board 1 (37 spaces), a keep on the centre 6. 1 silver each, 3 random goods each from the 17 left
  after the 5 chapter piles of 5 goods are made. Start player 1 worker, other player 2 workers.
- Every chapter: clear the stall tiles (goods stay), deal 2 plain-back tiles to each numbered stall in the fixed 2-player colours
  (1 barge+town, 2 keep+lore, 3 animal+town, 4 barge+town, 5 quarry+lore, 6 animal+town) and 4 ink-back tiles to the ink stall.
  The chapter's 5 goods wait on the 5 round spaces.

## A round
1. Everyone rolls 2 dice; the start player rolls the white die: the round's goods tile goes to the stall with that number.
2. In procession order (furthest ahead first; on a shared space the later arrival first), each player uses both dice, one action each:
   - **Take a tile** from the stall matching the die into one of 3 storage spaces (full: drop one stored tile from the game first).
   - **Place a stored tile** on an empty estate space with the die's number and the tile's colour, touching a placed tile.
     A town (beige region) may hold only one building of each kind.
   - **Sell goods**: all goods of the die's number; 2 points per tile (2 players), 1 silver; the sold goods are kept for lore scoring.
   - **Take 2 workers** (any die).
   - Each worker turns a die by 1 (6 and 1 wrap). Once per turn, any time: pay 2 silver for an ink-stall tile (to storage).
3. After 5 rounds the chapter ends: 1 silver per quarry. After chapter V the game ends.

## Tiles
- Keep: one extra action with a die of any number. Barge: load all goods from one stall (max 3 kinds in storage) and step 1 up the procession.
- Animals: score the animals shown, plus every same-kind tile already in that pasture. Quarry: silver at each chapter end.
- Lore: 26 tiles, all different (powers 1-14 work from placement; 15-26 score at the end). Town: one-off effect on placement
  (Granary sell goods; Bell Tower 4 points; Joinery take a town tile; Chapel take a keep/quarry/lore; Fair take a barge/animal - all from
  numbered stalls; Hostel 4 workers; Counting House 2 silver; Guildhall place one more tile ignoring the die number).

## Points
- Completed region: 1/3/6/10/15/21/28/36 for 1-8 spaces, plus chapter bonus 10/8/6/4/2.
- First to fill every space of one colour: big seal 5; second: small seal 2 (2-player values; all 12 seals in play).
- End: +1 per goods tile left, +1 per silver, +1 per 2 workers, lore end powers. Stored tiles score nothing.
- Tie: the tied player with MORE empty estate spaces wins (the printed English rulebook says "fewest": a known translation
  error, corrected in the original-language rules); then the later player in turn order.

## Simplified on purpose
- Nothing in the rules is simplified. Interface-only choices:
  - When a barge brings more new goods kinds than storage can hold, the game keeps the kinds you already hold first, then the
    biggest piles (the original lets you choose; the extra goods stay on the stall either way).
  - All 9 estate boards are in. Standard game: both on board 1 (the rulebook's standard). "Random boards" on the title page is the
    original's advanced setup: each player gets a different random board and picks a keep space for the start keep, in turn order
    (the original also allows a secret simultaneous pick; we use the open turn-order pick). Layouts of boards 2-9 come from a fan
    implementation read off the board images; every board has the same colour counts (12/6/6/6/4/3), which rules-test asserts.

## Uncertain
- [unverified] Region points for sizes 5-8 and chapter bonuses II-IV are read from the board print by implementations
  (the rulebook text gives the 1-36 range, sizes 3 and 4, and A=10, E=2). They follow the printed series exactly.
- [unverified] Ink stall count 4 for 2 players (rulebook prints "2 to 8"; three sources use 4/6/8).
- [unverified] Which lore numbers 16, 18-21, 23 map to which building (17 = bell tower and 22 = counting house are confirmed).
- [unverified] Whether the start keeps come from the 16 keep tiles (we take them from the plain-back keeps).
- Guildhall: "regardless of the die" read as "any number, but the colour and touching rules still apply".
