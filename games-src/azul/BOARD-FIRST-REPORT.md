# Sunglaze: board-first report (Oct 2026)

Preview: `games/sunglaze-next/` (built from `azul/game/src/`, UI layer `ui9.js` only). The rules engine, AI, online
code and saves are unchanged.

## Blind phone testers (drive-serve.js; they read only the first 8 words and decide in about 2 seconds)

| Run | Phone | Lost (after 1st min) | Lost (1st min) | Dead taps | Fun avg | Exciting moment | Goal in a sentence |
|---|---|---|---|---|---|---|---|
| Baseline | 390x763 | 1 | 0 | 0 | 3.3 | yes (rows slide onto the wall, 3→12) | yes |
| Round 1 A | 390x763 | 0 | 0 | 0 | 3.3 | yes | yes |
| Round 1 B | 375x553 | 3 | 0 | 0 | 3.3 | yes ("Chain +4") | yes |
| Round 2 A | 390x763 | 3 | 0 | 0 | 3.0 | yes | yes |
| Round 2 B | 375x553 | 3 | 0 | 0 | 3.3 | yes | yes |
| Round 3 A | 390x763 | 2 | 0 | 0 | 3.0 | yes | yes |
| Round 3 B | 375x553 | 2 | 0 | 0 | 3.5 | yes | yes |
| **Final 1** | 390x763 | 3 | 0 | 0 | 3.3 | yes (5→16 at round end) | yes |
| **Final 2** | 375x553 | 3 | 0 | 0 | 2.7 | yes (5-long row filled in one grab) | yes |
| **Final 3** | 390x763 | 2 | 0 | 0 | 3.7 | yes (rows slide on, 3→15) | yes |

Final 1 and 2 ran on the build before the last two small fixes (hinted tiles glow every round, red cross on
blocked rows, sun pop). Final 3 ran on the shipped build.

**Final against the bar:** dead taps 0 (pass), exciting moment 3/3 (pass), goal 3/3 (pass), lost moments 3/3/2
(fails for 2 of 3), fun average 3.2 (fails; needs 4).

## What changed
- **The combo is the centrepiece.** When a tile lands, the tiles it touches light up one by one, a counter climbs
  with a rising clink, and "Chain +N" shakes the board for 3 points or more.
- **Score is never a surprise.** Each chip shows the points still to come this round (green +N, red −N). The floor
  always shows what it costs so far. After breakage, one "Round score" banner gives everyone's net result. A
  rival's breakage is named on their chip.
- **One number per row.** Each row shows its net points, a "best" tag for the advised row, and a red ✗ when blocked.
- **Colours that fit nowhere look broken** (dimmed, with a red ✗). The hint says "No fit: take the fewest".
- **Building toward something.** The wall prints are brighter, and a full rack shows a pulsing ghost tile where it
  will land. Filling a rack cheers "Row full!".
- **Grab and slide.** The leftovers bounce as they land in the middle. A rival's pick lifts longer and flies
  slower, so you can watch it.
- Tips are shorter than 8 words. A tip says that unfinished rows wait for the next round. The sun token explains
  itself when you take it.

## Still weak
- Fun stays near 3/5. Testers like the loop but say they "follow the glow" and that big floor penalties late in a
  round feel unavoidable (they are, by the rules).
- The middle pile gets crowded late in a round.

## Shots
`board-first-shots/v2-before-1-pick.png`, `v2-before-2-round-end.png`, `v2-after-1-pick.png`, `v2-after-2-round-end.png`.

## Tests
`click.js` and `click-phone.js` (jsdom): TOTAL errors 0. `gauntlet.js` 20 games (2p base, 3p gray+prism): 0 errors,
0 stalls. `node --check x.js`: OK.
