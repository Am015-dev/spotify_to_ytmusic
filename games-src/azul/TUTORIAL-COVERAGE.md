# Sunglaze tutorial coverage (W388)

The tutorial is two short guided games against the real AI, played with real taps (proved by `game/tutor-e2e.js`, both sizes).
- **Chapters 1-2 (part A)**: a real round 1 from empty boards and a fresh sack (fixed kilns, scripted rival). Take, place, rival turn, middle, Sun token, floor, round scoring.
- **Chapters 3-4 (part B)**: the last round of a game (12 tiles already on your wall). Blocked colours, big chains, all end bonuses, the winner.
Each part ends on a card; part A offers "Next: chains and the end". After one full run the menu lets you replay either part. Skip works at every step.
Every step id in backticks must be shown by the script; a rule with no id is NOT taught (listed honestly below).

## Taught (by doing or seeing it once)
- [x] Goal: tile the palace wall, most points wins — `a_goal`, `goal`
- [x] Kilns hold four tiles; take from a kiln or the middle — `a_kilns`, `kilns`
- [x] Take EVERY tile of one colour from one kiln — `a_take`, `take1`
- [x] Pattern rows: row n holds n tiles of ONE colour; put all tiles on one row — `a_place`, `take1b`
- [x] The rest of the kiln slides to the middle — `a_slide`, `slide`
- [x] The rival's turn (watched step by step) — `a_olive1`, `a_olive2`, `olive1`, `olive2`, `olive3`
- [x] Take from the middle; the first to do so takes the Sun token — `a_middle`, `middle`
- [x] Overflow falls to the floor — `a_overflow`, `middle2`
- [x] Floor spaces cost -1 -1 -2 -2 -2 -3 -3 — `a_floor`, `floor`
- [x] The Sun token costs a floor space and makes you start the next round — `a_sun`, `sun`
- [x] A row that is not full keeps its tiles for later — `a_keep`, `a_keep2`, `last2`
- [x] The round ends when every kiln and the middle are empty — `a_tiling`, `tiling`
- [x] Each full row sends ONE tile to the wall, the rest is discarded — `a_wall0`, `chain2`
- [x] Scoring: alone = 1 — `a_wall0`, `chain2`
- [x] Scoring: touching tiles = row line + column line — `a_wall1`, `chain0`, `chain1`
- [x] Floor penalty applied at round end (score never below 0, stated) — `a_pen`, `floorpen`
- [x] A colour already on a wall row blocks that row (rows do not glow) — `take2`, `take2b`, `last`
- [x] A row of exactly the right size fills in one take — `take2b`
- [x] The game ends after the round in which a wall row is complete — `bonus`
- [x] End bonuses: row +2, column +7, all five of a colour +10 — `bonus`
- [x] Most points wins; tie goes to the most full rows — `final`

## Not taught in the guided game (honest list)
- [ ] Setup for 3 and 4 players (7 and 9 kilns); the tutorial is a 2-player game.
- [ ] Refilling from the shard box when the sack runs out (seen only as a one-line rule in Help).
- [ ] Dropping tiles on the floor on purpose / "nothing fits" (the instruction line says "Nothing fits: tap the floor" in real games).
- [ ] Tie-break shared win (stated in the final step, not played).
- [ ] Variants: unmarked (grey) mosaic and prism tiles. They have their own rule cards under the lightbulb and are not part of the base game.
