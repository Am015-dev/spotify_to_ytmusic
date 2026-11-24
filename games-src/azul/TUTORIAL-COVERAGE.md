# Sunglaze lessons (scenario tutorials)

The old dimming guided game is retired. Lessons are short games on the real board (`game/src/lessons.js`, engine `shell/gx-scenario-tutor.js`):
one goal on a floating card (drag, minimise, close, never blocks taps), hint lightbulb (nudge then show), win/fail with a one-line why, stars, Retry.
Entry: title "New here? Learn by playing", Menu > Lessons, story map "Lessons". Lesson games are never saved over a real game.

| rule | lesson |
|---|---|
| take every tile of one colour from a kiln, the rest slide to the middle | take |
| a rack holds one colour and a fixed number of tiles; extra tiles fall to the floor | racks |
| a rack is shut for a colour its wall row already has | blocked |
| first take from the middle gets the Sun token (a floor space) and starts next round | sun |
| only a full rack sends one tile to the wall; others keep their tiles | tiling |
| a wall tile scores its row and column runs; alone = 1 | chain |
| floor costs 1,1,2,2,2,3,3; a score never drops below 0 | floor |
| a full row ends the game; bonuses row +2, column +7, colour +10 | end |
| most points wins; tie to most full rows; a short real round | game |

Not in lessons (setup facts, in How to play): 3-4 players use 7 and 9 kilns; sack refill from the shard box; the unmarked-wall and prism variants.
Proof: `node game/lessons-test.js` (402x874 and 1366x768): every lesson solved by real taps, wrong move fails with a message, Retry, tap-anything, 0 errors.
Contact sheets: `proof/lessons/`.
