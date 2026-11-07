# Vale of Banners - tutorial coverage (W379)

The tutorial is one real game: 2 players, 1 season = 5 rounds, against the real easy AI (seed 77), from setup to the final count and the
result screen. Before each of your turns the table is stacked (tiles moved between the bag and the stalls, your dice set) so each case comes
up. Every step needs the real action (tap the spotlit element), except the "seeing" steps marked (see). Proof: `node tut-end.js` plays the
whole guided game by tapping each spotlit centre (elementFromPoint = target) at 390x763 and 1440x860 and asserts all 32 steps were shown.

Chapters: 1 Your first turn (hi..end), 2 Rival turn, goods, workers (white..end2), 3 Special tiles and actions (bend..end3),
4 Chains and scoring (hall..end4), 5 Last round and the end (pas..result).

| Rule | Taught by step | How |
|---|---|---|
| [x] Setup: home keep in the centre, 1 silver, workers by turn order, 3 goods | hi | see |
| [x] Two dice per round, one action per die | take | do |
| [x] Take a tile from the stall with the die's number into storage (3 spaces) | take, take2 | do |
| [x] Build: same colour, the die's number, touching your land | pick, cell | do |
| [x] End turn | end, end2..end5 | do |
| [x] Rival turn played step by step (turn banner, captions) | white, bend, hall, pas, result (each runs the real rival turn first) | see |
| [x] Turn order follows the banner track | white | see |
| [x] White die places the round's goods on its stall | white | see |
| [x] Sell all goods of one number: 2/3/4 points per tile (2/3/4 players) + 1 silver | sell, sell2 | do |
| [x] At most 3 kinds of goods held | sell | see (text) |
| [x] Take 2 workers with any die | wk, wk5 | do |
| [x] A worker turns a die up/down by 1; 6 and 1 are neighbours | bend, bend2 | do |
| [x] Back lane: buy once per turn for 2 silver, no die | buy, buy2 | do |
| [x] Keep: one free extra action with any number | keep, keepc, free, free2 | do |
| [x] Buildings act at once; never two of a kind in one quarter | pick/cell (Beacon +4), hall | do + see (text) |
| [x] Moot Hall: build again at once with any number (chain) | hall, hallc, chain, chainc | do |
| [x] Lore: bends one rule for you for the rest of the game | chainc (the bought tile is Lore) | do |
| [x] Mine: 1 silver at each season end | mine, minec, end5 (season end pays) | do |
| [x] Region complete: size points + season bonus | minec (the Mine fills a one-space region) | do |
| [x] Pasture: scores every animal of that kind in that meadow | pas, pas2 | do (take) + see (text) |
| [x] Storage full: you must drop a tile | pas2 | see (text) |
| [x] Game end after the last season; +1 per silver, per goods, per 2 workers, Lore end scrolls | end5, result | do + see |
| [x] Tie-break: fuller estate, then further back on the track | result | see (text) |
| [ ] Barge: take all goods of one stall + move up the banner track | - | not covered: no Barge space touches the start estate in 5 rounds; Rules drawer + tile card explain it |
| [ ] Colour bonus (first/second to fill every space of a colour) | - | not covered by doing (impossible in 5 rounds); Rules drawer |
| [ ] The other 6 Building effects (Joiner, Chapel, Fair, Inn, Mint, Granary) | - | not covered one by one; each tile card (tap a tile) states its effect |
| [ ] Solo and 2 v 2 team modes | - | Quick game setup + Rules drawer |

Not done: leaving and resuming at a chapter (the shared tutorial kit restarts from step 1 when you come back; read-only for this worker).
