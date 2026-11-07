# Sunglaze tutorial coverage (W407, coached first game)

The tutorial is ONE real game against Tamsin with free choices from the first tap (no forced taps). Mother Ochre speaks in one small bubble at a time
(never blocks input, dismissable): she explains each rule the first time it matters, reacts to good or poor moves in one line, comments on the rival's
turns, and walks the end-of-round and final scoring with the player's real numbers. Rules that never came up are listed on the end card ("Things you'll meet later").
Stacked start: the last round of a game (12 tiles on your wall, five loaded kilns) so scoring, bonuses and the end can come up. Code: `game/src/tutor.js` (`CG_RULES`, `cgBefore`, `cgBeat`).
Proved by `game/tutor-e2e.js` (random legal UI taps to the end card, both sizes): every id below must be said in play or be listed on the end card.

## Rules (id: when it is explained)
- `goal` `kilns` `take`: the opening bubble (tile the wall, kilns hold four, take every tile of one colour); `take` again on your first pick
- `rows`: first perfect fit (or a part-filled row); `keep`: a row that is not full; `overflow`, `floor`: first tiles that crack onto the floor
- `slide`: after your take (the leftovers slid to the middle) or a rival take that leaves tiles
- `rival`: Tamsin's first move; `middle` and `sun`: your first pick from the middle (or Tamsin's Sun token), then the token on your floor
- `blocked`: picking a colour already on a wall row; `nofit`: nothing fits, tap the floor
- `roundend`, `tiling`: the round-end beat; `alone`, `chain`: each of your tiles as it lands, with the real numbers (e.g. 2 + 2 = 4)
- `floorpen`: your floor at round end with the real cost; `gameend`, `bonus`: the closing row and your real bonuses; `win`: final scores, ties
- `players`, `shard`, `variants`: cannot come up in this staged 2-player game; always on the end card
