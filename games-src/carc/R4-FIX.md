# Rampart & Vine: fixes for the R4 gameplay review (6.9 FAIL)

| Finding | Fix |
|---|---|
| Easy rival won 54-16 and 59-35 | Easy (ai.js `EASYK`) now picks a random spot 75% of the time (else one of the 4 best), claims less, never sends a farmer, and keeps 2 followers back. Sim (novice-bench.js, 60 games): a random-spot player wins 28%, a player who takes a good spot 15% of the time wins 67%. Touch games: see below. |
| Nothing says what the rival did | One line per rival turn, e.g. "Cobalt placed a road and a follower: +3" (bf.js `rvTrack`/`rvFlush`). Shown for about 3 s, also on your turn. |
| Result screen shows only totals | Result table: Roads, Towns, Priories, Farms (and Goods with Merchants), Total. Winner's column first and tinted. |
| Tile and follower counters 13px | 15px followers, 16px tiles left, 14px "tiles" word. |
| End count ~8 s on a corner, label cut | Camera fits the whole valley, pops every 0.24 s (all done in about 3 s), pops kept below the status bar, a "Final count / Tap to skip" plate; any tap skips to the result. |
| Tutorial rule steps never say "tap" | Every lit-tile step now ends "Tap the lit tile(s)." The status reads "Learn: Tap the lit tile to go on." instead of "Your turn". A wrong tap says "Tap the lit tile." |
| "Tap Next." over a Finish button | The last step's nudge says "Tap Finish." |
| Follower-spot labels crowd the tile | Labels shortened: "road +2", "town +6 now", "priory 9", "farmer". |

Not done: majority and ties are still told, not shown on the board.

Test: `touch-games.js` plays full games by touch like a sensible new player (takes the normal computer's spot 35% of the time, otherwise a random glow; claims roads, towns and priories, never farms).
