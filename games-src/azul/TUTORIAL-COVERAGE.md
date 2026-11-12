# Sunglaze tutorial coverage (W501, guided first game)

Owner rule (Nov 2026): a guided first game that teaches EVERY core rule in order, one sentence of 12 words or fewer and ONE highlighted
tap per step, then a real game. No "learn later" lists.

The tutorial uses the shared step kit (`shell/gx-tutor.js`): a spotlight, one bubble, and only the glowing thing takes the tap.
The board is staged as the last round of a game. You have 12 tiles on your wall and five loaded kilns. Tamsin's four moves are scripted,
so every lesson comes up in the same order every time. The scoring, the game end and the bonuses all happen for real (you finish on 58).
After the end card, "Play a real game" starts a fresh game against an easy computer, straight on the board.
Code: `game/src/tutor.js` (`tutSteps`, `TUT_RULES`, `TUT_K`, `TUT_RIVAL`).

The proof is `game/tutor-e2e.js`. It runs at 390x844 and 375x667, using real touch taps on the highlighted spot only. It checks that every
step below is shown in order, that each one is 12 words or fewer with exactly one highlight, and that scoring ends at 58. It then plays a
full real game by touch to the result with 0 errors.

## Steps (id: sentence → the one tap)
1. `goal`: Fill one row of your wall to end the game. → your top wall row
2. `take`: Kilns hold four tiles. Tap red: you take every red. → a red tile in kiln 1
3. `rows`: Rack 2 holds two tiles of one colour. Tap it. → rack 2
4. `slide`: The leftover tiles slid to the middle. Tap the middle. → the middle (then Tamsin takes four snowflakes)
5. `rival`: Tamsin took four snowflakes. Now tap a red in kiln 3. → a red tile in kiln 3
6. `blocked`: Rack 3 is shut: its wall row has red. Tap rack 4. → rack 4 (then Tamsin takes three blues, a yellow slides over)
7. `middle`: Tap a yellow in the middle. First one there gets the Sun. → a yellow in the middle
8. `sun`: Tap rack 3. The Sun token goes on your floor. → rack 3
9. `keep`: Rack 3 is not full. It keeps its tiles for later. → rack 3 (then Tamsin takes a blue from kiln 5)
10. `again`: Tamsin's leftovers joined the middle. Tap the two yellows. → a yellow in the middle
11. `overflow`: Rack 3 has one space. The extra yellow falls to the floor. → rack 3
12. `floor`: Floor tiles cost points: −1, −1, −2, −2, −2, −3, −3. → your floor (then Tamsin takes the last blue)
13. `last`: Tap the snowflake in the middle. It fits rack 1. → the snowflake
14. `roundend`: Tap rack 1. When all tiles are gone, the round ends. → rack 1
15. `tiling`: Each full rack moves one tile to its wall spot. → row 1 (the tiling animation waits)
16. `chain`: Touching tiles score: 5 across + 5 down = 10 points. → the new top-right tile
17. `alone`: A tile touching nothing scores just 1 point. → the new red tile in row 4
18. `floorpen`: Your floor costs 2 points. Scores never go below 0. → your floor
19. `gameend`: Your top row is full, so the game ends now. → row 1
20. `bonus`: Bonus: full row +2, full column +7, all five snowflakes +10. → your board
21. `win`: Most points wins. A tie goes to the most full rows. → your board

## Not taught in the guided game (setup facts, shown in How to play and the start screen)
- 3 and 4 players use 7 and 9 kilns. An empty sack is refilled from the discarded tiles.
- The unmarked-wall and prism variants (off by default) have their own rule cards.
