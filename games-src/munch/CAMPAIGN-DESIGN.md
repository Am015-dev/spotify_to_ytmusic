# Doorkick Dungeon campaign: The Golden Boot

## Premise
Every year the doors under Crookhill swing open for the Delve, and the first hero to reach level 10 wins the
Golden Boot. Old Hobb the Doorwarden (the guide) takes a rookie through three floors: the Cellar Doors, the
Long Corridor and the Vault. The rivals are the game's existing heroes from `engine.js` `HERO_NAMES` and their
personas and barks in `coach.js` `PERSONA` / `BARKS`. Seating them by name keeps their table talk in the campaign.

## Rival bosses
The game has one AI with three levels (`easy`, `normal`, `hard`, `ai.js`) and no separate styles. Each `aiStyle`
in the data is a persona label that picks the hero's barks. It does not change the AI code.

| Boss | Chapter | Level | Personality |
|---|---|---|---|
| Grub the Mercenary | c3 (act 1) | easy | Helps anyone for a treasure and teaches you to ask for help and to run. No twist. |
| Morwen the Grudge-Keeper | c6 (act 2) | normal | Saves her curses for the leader. Twist: starts at level 2. |
| Wrenna the Schemer | c10 (act 3) | hard | Plans ahead and saves one-shots for your winning fight. Twist: starts at level 3, with three hard rivals. |

The non-boss rivals are Pip (plucky), Tansy (lucky) and Bodkin (braggart). Grub and Morwen come back at higher levels.

## Difficulty curve
- **Act 1 (c1–c3):** 3 heroes, every seat `easy`, hints on. Each chapter teaches one idea: c1 kick and fight, c2 wear items, c3 ask for help or run away. c1 is the game's easiest setup.
- **Act 2 (c4–c6):** 4 heroes, mostly `normal` with some `easy` seats, hints off. c4 stopping the leader (curses), c5 selling for levels, c6 the Morwen boss with a 1-level head start.
- **Act 3 (c7–c10):** `hard` seats. c7 has only one hard seat and no twist, so it is the gentle opener. c8 has 5 heroes and Bodkin moves first. c9 has every seat hard and you start light. c10 has every seat hard and Wrenna starts at level 3.
- **Easier offer:** every chapter's `easier` block drops one AI level (or swaps the `lvmix`) and turns the twist off. It allows at most 2 stars.

## Twists menu
The twists are wired into the campaign only, and the normal rules never change. `bossSeat` is the seat whose name equals `opponent.name`.

| id | where | Hook |
|---|---|---|
| `boss-head-start` | setup | After `engine.js:newGame` returns (the setup phase, before turn 1), set `P(bossSeat).lvl = min(9, 1+param)`. |
| `boss-extra-treasure` | setup | After `newGame`, call `drawTo(P(bossSeat),'treasure',param)` (`engine.js:drawTo`). |
| `boss-first` | setup | After `newGame`, set `G.active = G.first = bossSeat` and `G.setupOrd = seats rotated to start at bossSeat`, and fix the "rolls highest" log line. |
| `light-pack` | setup | After `newGame`, move `param` random treasure cards from `P(0).hand` to `G.td` (use `rnd()` so the seed replays). |

## Setup keys (verified levers)
- `mode` and `n`: these are the two arguments of `engine.js:newGame(mode,n)`. Use `"F"` for you against the computer, with seat 0 as the human. The UI allows `n` from 3 to 6 (`ui.js:startOpts`).
- `lvl`: `UI.lvl`, the default level for every computer seat (`engine.js:newGame`, `ui.js:startOpts`).
- `lvmix`: the per-seat level array `LVMIX` (`engine.js` globals, read in `newGame`). The campaign's opponent levels use this. Index 0 is ignored for the human.
- `names`: `UI.names` (`engine.js:newGame`). `null` at index 0 means the player's own hero name. The rival names must come from `HERO_NAMES` so that `coach.js` `BARKS` and `PERSONA` apply.
- `seed`: `engine.js:setSeed`. It is `null` for random.
- `hints`: `UI.hints` (`ui.js`, used by `coach()` suggestions and risk badges).
- Do not change these: `R.WIN` (10), `R.START` (4+4 cards) and `DEFEX` (no expansions exist; `cards.js` `EXPS=[]`).

## Metrics for `GXC.init({metrics})`
- `won`: `G.winner==='P1'`.
- `level`: `P(0).lvl`.
- `margin`: `P(0).lvl` minus the best rival's `lvl`.
- `rounds`: `ceil(G.turn / G.pl.length)`.
- From `P(0).st`: `kills`, `deaths`, `helps` and `runs` (this counts escape rolls).
- `cursesPlayed`: the sum over v of `G.rv[v][0].curse` (`engine.js:note`).
- `wornWin`: if won, the count of `P(0).eq` items that are on; otherwise 0.
- `soldWin`: if won, the levels gained by selling; otherwise 0. Count these by wrapping `engine.js:doSell` in the campaign glue and adding the level difference. `soldLevels` is the same count without the win check.
