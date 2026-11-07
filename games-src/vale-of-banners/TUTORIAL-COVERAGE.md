# Vale of Banners - tutorial coverage (W379, coached first game)

The tutorial is a coached first game: a real 2-player game, 1 season (5 rounds), against the real easy AI (seed 77), from setup to the final
count. Only the very first action is spotlit (2 forced steps: take a tile, Take). After that every legal move is allowed. Before each of your
turns in rounds 2-5 the table is stacked (your dice set, a Keep / Moot Hall / Lore / Pasture put in the stalls) so the cases come up, but you
choose. Old Odo (the guide, STORY.md) explains each rule the first time it matters, comments on a good or poor move and on rival moves worth
learning: one bubble at a time, it never blocks input (only its × is tappable), it closes by itself. Lines live in `src/story.js` (coach).
At the end the result card walks through the final count with your real numbers, then a "Things you'll meet later" card lists every rule that
did not come up. Proof: `node tut-end.js` plays the coached game with any legal move through visible, uncovered UI (no scripted tap list) at
390x763 and 1440x860, and asserts every rule below was explained in play or on the later card. Last run: 14/20 in play, 6 on the later card.

| Rule (coach id) | Explained when | Story beat / line |
|---|---|---|
| [x] Two dice, one action each; take a tile into storage | forced steps 1-2 | "Your two dice are your two hands today..." |
| [x] Build: colour, number, touching land (build) | first time a stored tile can be built | "That tile wants a home..." |
| [x] End turn (end) | first time both dice are used | "Both dice spent..." |
| [x] Rival turn + turn order by banner track (rival) | first rival turn | "Tobin's turn. The banner track decides..." |
| [x] White die places goods (white) | round 2 | "See the white die?..." |
| [x] Sell goods: points per crate + silver (sell) | first time a sale is legal | "You can sell!..." |
| [x] Max 3 kinds of goods (kinds) | when you hold 3 kinds | "Your barn holds three kinds..." |
| [x] Workers: take 2, each bends a die by 1, 6-1 wrap (workers) | first workers move | "Workers! Each one nudges a die..." |
| [x] Bend a die to reach a tile (bend) | first take that costs a worker | "Tiles marked with a worker..." |
| [x] Back lane: 2 silver, once per turn, no die (back) | first time a buy is legal | "You have 2 silver..." |
| [x] Keep: free action (keep) | when you build a Keep | "A keep! One free action..." |
| [x] Buildings: instant, one kind per quarter (bld) | when you build a Building | "Buildings act the moment they land..." |
| [x] Moot Hall chain (hall) | when you build a Moot Hall | "Moot Hall: build again at once..." |
| [x] Lore (lore) | when you build Lore | "Lore bends one rule..." |
| [x] Mine: silver at season end (mine) | when you build a Mine | "A mine pays you a silver..." |
| [x] Pasture scoring (pas) | first Pasture you can take or build | "Pastures score every animal..." |
| [x] Barge (barge) | when you build a Barge | "A barge loads every crate..." |
| [x] Region scoring + season bonus (region) | first region filled (yours or the rival's) | "A whole region filled!..." |
| [x] Colour bonus (colour) | first colour completed | "Every space of one colour filled..." |
| [x] Storage full: drop a tile (discard) | first discard question | "Storage is full..." |
| [x] Season end, game end (season) | end of the season | "The season ends: mines pay out..." |
| [x] Final count: silver, goods, 2 workers, Lore; tie-break | result card, with your numbers | "How your score was counted" |
| [x] Good / poor move, rival lessons | chain, region; workers when a build was possible; rival region/sale/chain | coachGood / coachPoor / coachRival |
| [x] Anything not met in this game | result card | "Things you'll meet later" (rule text from story.js) |
| [ ] Solo and 2 v 2 teams | - | Quick game setup + Rules drawer |
