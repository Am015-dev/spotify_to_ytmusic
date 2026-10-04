# Cauldron Fair campaign: The Golden Ladle

Data: `campaign.json` (shelf id `cauldron`, the id used by `games/index.html` and the online lobby; 10 chapters, 3 acts).

## Premise
You arrive at **Bramblemere Fair** as a new apprentice brewer with a plain bag of Fizzpods, one Marrow and one
Mossback. **Granny Hask**, the old fair warden, teaches you to stop before the boil and to spend your coins. Over
three weeks of market days you meet the fair-goers from the title screen. At the end comes the judging of the
**Golden Ladle**, held for nine fairs running by **Madame Vesper**.

## Rivals (all use the game's one AI style, `standard`; personality comes from level, books and twist)
| Rival | Chapters | Personality | Level |
|---|---|---|---|
| Wynne, the Moss Herbalist | c1, c2 (also the 3rd pot in c5) | Patient and kind. Stops early. | easy |
| Odo, the Root Dealer (boss act 1) | c3, c5, c9 | Loud and boastful. Pushes his luck. Bribes judges (c9 twist). | easy, normal, hard |
| Tamsin, the Feather Seer (boss act 2) | c4, c6 | Quiet and exact. Counts the bag. Brings rubies. | normal |
| Mirabel, the Fire Brewer | c7, c8 (also the 3rd pot in c9) | Brews to the brink. Slips a Fizzpod into your bag. | hard |
| Madame Vesper (final boss) | c10 | Cold and exact. She has earned a head start. | hard |

In 3-player chapters (c5, c9) the named rival sits in seat 1 and carries the twist. The other fair-goer sits in
seat 2 at the same level. `aiStyle` is `standard` everywhere: `ai.js` has levels only (no style parameter).

## Difficulty curve
- **Act 1, The Gates Open** (easy, hints on, book set 1). c1 asks only for 15 points; winning is not needed, and
  the opening fortune card is Lucky Seven, as in the guided game. c2 teaches the shop (buy 8 chips; winning is not
  needed). The c3 boss, Odo, is a plain win and has no twist.
- **Act 2, Market Days** (normal, no coach, book sets 2 and 3). c4 is a plain win with new books. c5 is the
  first 3-pot game: win with 40 or more, and Odo starts with a Mossback 2. In the c6 boss, Tamsin has +2 rubies and
  you must win by 5.
- **Act 3, The Golden Ladle** (hard, book set 4 or random). c7 is a plain win against Mirabel. In c8 your bag
  holds an extra Fizzpod 1. In c9, a 3-pot heat, Odo starts on 4 points. In the c10 final, Vesper's droplet starts
  1 space further on.
- Calibration (12 seeded games per pair, 2 players, set 1): easy vs easy averages 37 to 36 points. normal vs
  easy averages 46 to 40. normal vs normal averages 45 to 48. normal vs hard averages 46 to 51. The score
  thresholds (15, 40, 45, 50, 55) follow these numbers.
- Every `easier` block drops one AI level, removes the twist and caps the chapter at 2 stars.

## Twists (setup only; the rules engine is unchanged)
All twists run once, right after `CF.newGame(...)` returns, in the campaign `startChapter` (ui3.js `newGame`
wrapper). This happens before any chip is drawn. The boss is seat 1 and the player is seat 0.
| id | Implementation |
|---|---|
| boss-rubies | `G.players[1].rubies += param` |
| boss-chip | `CF._.give(G, G.players[1], param, true)` takes the chip from the supply and puts it in the bag at a random spot (`bagInsert`) |
| boss-droplet | `G.players[1].droplet = param`. `startPos(p)` reads the droplet each round. |
| boss-lead | `G.players[1].vp = param`. From day 2, `setRats` gives the trailing seats rat stones. |
| crowded-bag | call `CF._.give(G, G.players[0], 'W1', true)` param times |

All five were tested in node: `CF.checkInvariants(G)` is empty after applying them, and a full AI game runs to
the end.

## Metrics the integration must supply (`metrics(G)`)
- `won`: `G.winner === 0`
- `score`: `G.players[0].vp`
- `margin`: your VP minus the best rival's VP
- `winScore`: `won ? score : 0`. It is used for "win with at least N".
- `booms`: the number of `G.hist` rows with `seat 0` and `boom`
- `best`: the highest `G.hist[].space` reached by seat 0
- `bought`: the total `G.hist[].bought.length` for seat 0
- The c2 custom goal is star 1, `bought >= 8`.

## Levers verified in code
- `src/engine.js:newGame`: the options are `players` (2 to 4), `seed`, `setMode` (1, 2, 3, 4 or `'random'`),
  `sets`, `firstCard` (a fortune id, for example `lucky7`), `names`, `ai`, `chars` and `guided`.
- `src/ai.js:AI.levels` has three levels: `easy` (depth 0, noisy shop), `normal` (depth 1) and `hard` (depth 3
  plus Monte Carlo shop). `choose(G, seat, level)` defaults to `p.ai`.
- `src/engine.js:startRound` applies `G.force` (firstCard). `limitOf`, `startPos`, `setRats` and `finish` (the
  end conversion and tie-break) are unchanged.
- `src/engine.js` exports `CF._.give` and `CF._.bagInsert`, so the supply stays consistent.
- `src/ui3.js:newGame` builds the AI levels per seat (`lvBy`). `UI.coach.level` (`full`, `light` or `off`) is
  the `hints` switch.
