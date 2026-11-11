# Hollowbough campaign: The Long Winter of Hollowbough

## Premise
The snow is melting under the Elderheart Oak and the valley of Hollowbough needs a new city. Hazel Quickpaw, an
old hare who has watched many cities rise and fall, guides the player from the spring thaw to the first frost. Over
three seasons the player's city earns its place among the valley's neighbours: the friendly ones (Bramble, Fern), the
sly ones (Quill), the grumpy hermit on the hill (Old Grimbeard, the game's existing solo rival) and finally Thistle, the
proud regent whose gate closes the valley before winter. All names are this adaptation's own: rival names come from
`PNAMES` in `game/ui.js`, and Old Grimbeard with his levels Grumpy / Gruff / Ghastly comes from `DATA.soloName` /
`DATA.soloLevels`.

## Rivals and bosses
| Who | Personality | How the engine plays them |
|---|---|---|
| Bramble (hedgehog) | Cheerful, grabs whatever is closest | `vs` seat, AI `easy` |
| Fern (vole) | Thrifty in Act 1, then methodical and sharp | `easy` (Act 1), `normal` (Act 2), `hard` (c8) |
| Quill (crow) | Sly meadow snatcher; ends up as Thistle's ally | `normal` (Act 2), `hard` (c10) |
| **Old Grimbeard** (badger), Act 1 boss (c4) and c9 | Grumpy and set in his ways; rolls for the meadow | solo mode, `solo: 1` Grumpy, then `solo: 2` Gruff |
| **Thistle** (squirrel), Act 2 boss (c7) and final boss (c10) | Proud, patient, hoards cards for a big final score | `normal` + extra hand, then `hard` + extra pantry |

The AI has **no styles**: `ai.js:choose(G, seat, level)` takes only a level. So every chapter has `aiStyle: null`
(Grimbeard chapters say `"solo-rival"`), and each rival's character comes from the dialogue, the level and the twist.
In solo chapters `aiLevel` is the solo level name (Grumpy / Gruff), and each `easier` block says what to fall back to.

## Difficulty curve
- **Act 1, Thaw (c1 to c4):** easy AI, hints on, no twists. Each goal teaches one idea: c1 place workers and build
  (just win), c2 free critters (link a critter to its building), c3 green Production engine (3 players), c4 events,
  in the boss game against Grimbeard on Grumpy. If the player loses twice, c4's easier version swaps Grimbeard for
  an easy 2-player game.
- **Act 2, Midsummer (c5 to c7):** normal AI, hints off. c5 is a plain 2-player game against Quill (a fair start
  for the act). c6 uses 3 players and the symmetric thin-forest rule, with the goal of claiming 2 events. In c7,
  Thistle starts with 2 extra cards and the goal is to win with 40 or more points.
- **Act 3, First Frost (c8 to c10):** hard AI. c8 is a fair 2-player game against hard Fern. c9 is Grimbeard on
  Gruff, where the player must claim special events first. c10 is Thistle and Quill, both hard, at 3 players, and
  Thistle starts with an extra pantry.

## Twists (campaign only, shown on the boss card)
All are applied in the campaign's `startChapter` right after `HB.newGame(...)` returns (`game/src/engine.js:newGame`,
called from `ui.js:newGame(mode, o)`). The boss seat is the opponent seat (seat 1). No rule code changes.
| id | where | how / hook |
|---|---|---|
| `thin-forest` | setup | `G.forest = G.forest.slice(0, param)`, so only `param` forest locations are open to everyone. The solo routine already indexes `gr.fi` modulo `G.forest.length`. |
| `boss-extra-hand` | setup | The boss seat draws `param` cards from `G.deck` into its hand (stop at hand limit 8). It is the same as engine `draw(seat, n)`, which is internal, so pop from `G.deck` in the hook or expose `draw`. |
| `boss-pantry` | setup | `G.players[1].res.twig/resin/berry += param`. |

## Levers verified in code
- `engine.js:newGame(o)` takes `o.players` (2 to 4, each `{name, ai}`), `o.solo.difficulty` (1 to 3 or a level name)
  and `o.seed`. It sets up 3 forest locations for 2 players and 4 for 3 or 4, plus 4 special events.
- `ui.js:newGame(mode, o)` accepts mode `vs` / `solo` / `guided` / `hot` / `ai` and `o.np`, `o.level`, `o.solo`,
  `o.levels`. These are the campaign's `setup` keys. To use the campaign's names instead of `PNAMES`, pass
  `o.names` or override `players[i].name`.
- `ai.js:choose`: levels are `easy` (weighted random), `normal` (one-ply ranking) and `hard` (lookahead with a time
  budget).
- `engine.js:finish`, `scoreOf` and `grimScore`: in solo, you win only with strictly more points than Grimbeard.
  Unclaimed special events are worth 3 points each to him on Grumpy and 6 on harder levels.
- **Metrics for stars** (`metrics(G)` for the human seat 0):
  - `won`: `G.over.winner === 0`
  - `score`: `G.over.scores[0].total`
  - `margin`: score minus the best rival's total, or minus `G.over.grim.total` in solo
  - `city`: `HB.cityCount(G, 0)`
  - `events`: basic plus special events owned
  - `specialEvents`: special events owned
  - `occupied`: city entries with `occ`
  - `green`: green cards in the city
  - `journey`: `scores[0].journey`
  - `left`: `scores[0].left`
