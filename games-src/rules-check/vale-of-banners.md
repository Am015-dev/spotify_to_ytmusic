# Rules check: vale-of-banners

Adapts: a 2011 dice-driven estate-building game (hex estate of 37 spaces, 6 coloured tile kinds, 2 dice per round, 5 phases of 5 rounds, workers, silver, goods selling, turn-order track).
Read from the read-only side-branch worktree of this game.

## Sources checked
- rulespal.com rulebook summary (setup, actions, bonuses, end scoring, tie-break, buildings)
- officialgamerules.org page returned no content.
- games-src/vale-of-banners/rules-notes.md (already cross-checked once). Engine: src/engine.js, src/data.js.

WRONG 0, MISSING 2, SIMPLIFIED 5

## Findings
| Class | Code | What the code does | Correct rule | Conf. |
|---|---|---|---|---|
| MISSING | newGame (n clamped 2-4) | No solo mode. | Solo game: 1 silver, 2 workers, 3 goods, no limit on goods kinds, 25 rounds, win by filling all 37 spaces. | high |
| MISSING | newGame | No team (2 v 2) mode. | Team variant with shared workers, silver, goods. | med |
| SIMPLIFIED | data.js:7-11 | Estate map is our own 37-space layout and number placement. | Fixed printed board (two board faces). | documented |
| SIMPLIFIED | data.js:77-85, engine.js:67 | Tiles drawn at random from one 164-tile pool into the 6 depots. | Each numbered depot is filled from a tile set tied to that depot (matching back colour); fixed tile counts per kind (code counts 12 keeps, 12 mines, 56 buildings, 36 pastures, 22 barges are our own). | med |
| SIMPLIFIED | data.js:36-62 | 26 lore tiles are our own text. | Published set differs (same count). | documented |
| SIMPLIFIED | engine.js:62 | A fourth goods kind that cannot be stored is lost. | Storage holds three goods kinds; the player must choose what to keep or may decline. | documented, low |
| SIMPLIFIED | engine.js:43,69 | Goods drawn from a single 42-tile bag; start goods and phase goods share it. | Start goods drawn from the 42; five stacks of 5 set aside by phase and 17 left unused; effect same. | low |

## Checked and matching (high unless noted)
5 phases x 5 rounds; each player rolls 2 dice per round, white die places the round's goods tile on that depot; one action per die: take tile into 3-slot storage, place tile on empty space of its colour and die number touching own land (first next to the castle), sell all goods of one kind (1 silver + 2/3/4 points per tile for 2/3/4 players), or take 2 workers; each worker moves a die 1, 6 and 1 adjacent; black depot buy for 2 silver once per turn, sizes 4/6/8; depots 2/3/4 tiles per number; castle = extra action any number; mine = 1 silver per mine each phase end; barge = take all goods of one depot and +1 on the track; pasture = animals of that kind in that meadow including this tile; the 8 building effects (hall, carpenter, church, market, inn 4 workers, bank 2 silver, watchtower 4, warehouse) and one building kind per town; region points 1/3/6/10/15/21/28/36 plus phase bonus 10/8/6/4/2; colour bonus first 5/6/7 and second 2/3/4 (2/3/4 players), later none; end: 1 per silver, per unsold goods, per 2 workers; tie-break fewer empty spaces then further back on the track; turn order by track, newest arrival first; start 1 silver, 1-4 workers by order, 3 goods.

## Not verified
- Exact per-kind tile counts and depot assignment (see table). low.
- Whether the phase bonus applies to every completed region (source text says "per completed area"). high.
- Number of ship/livestock/building tiles per depot at phase start in 3p games. low.
- The starter overflow rule when storage is full (code forces a discard of any tile, source says you must discard). med.
