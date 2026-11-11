# Tidewake campaign: The Lantern Reach

## Premise
The haunted archipelago called the Reach is ruled by **Admiral Ysolde**, who pays captains to keep lantern-junks out of
her waters. You are a new lantern-junk captain trained by **Grandmother Osk**, an old pilot. Across three acts you learn to
lay currents, dodge the leviathans (Brinemaw, Gloomfin, Saltshade, the Abyssal Crown and the rest), use Deck Cannons and
Rift Gates, ride the Rogue Wave and the Maelstrom, and finally beat the Admiral's fleet. Every chapter is a normal
Tidewake game: last junk afloat wins (or, in the two watch chapters, the existing solo variants).

## Rivals and bosses
The engine has three AI levels (`easy`, `normal`, `hard`, `game/src/ai.js` `AILV`) and **no styles**, so every
opponent uses `aiStyle: "default"`; personality comes from the level, the setup and the boss rule.

| Who | Where | Personality | AI |
|---|---|---|---|
| Wick | c1, c2, c3 (extra rival) | cheerful cabin hand, plays the top tile | easy |
| **Gull Harrow** (Act 1 boss, c3) | 3-player channel | swaggering toll-taker, crowds rivals into corners | easy, no twist |
| Brann Ashkeel | c4, c6, c8 | loud cannoneer, keeps every Deck Cannon | normal / hard |
| Saltshade | c5 (sea threat) | patient leviathan of the night watch | easy-solo variant |
| **Sabel Riftwright** (Act 2 boss, c6) | 3 players, Rift Gate + cannons | calm navigator, saves the gate for escapes | normal + `boss-cannon` 1 |
| Corsair Vey | c7, c8, c10 | cold, plans a turn ahead | hard |
| The Abyssal Crown | c9 (sea threat) | eldest leviathan | solo variant |
| **Admiral Ysolde** (final boss, c10) | 4 players, every hazard | ruthless, herds rival junks to the edge | hard + `harrier` 30 |

Seat 0 is always the player, the boss (or main rival) is seat 1; extra rivals use the same `aiLevel`.

## Difficulty curve
- **Act 1 Calm Shallows (c1–c3)**: easy AI, hints on. c1 has no leviathans (`noMon`) and teaches "follow your line, keep
  off the edge"; c2 wakes the six leviathans; c3 (boss) teaches steering a rival off the board with your own current.
- **Act 2 Open Water (c4–c6)**: normal AI, hints off. c4 adds Deck Cannons only, c5 is the 18-turn easy-solo watch,
  c6 adds the Rift Gate and a 3-captain table with a gentle boss rule.
- **Act 3 The Deep Reach (c7–c10)**: hard AI. c7 adds only the Rogue Wave (no twist), c8 all four expansion pieces,
  c9 is the full solo "outlast all 10 leviathans", c10 is a 4-captain final with a boss rule.
- After 2 losses `easier` drops the AI one level, removes the twist and in some chapters drops a rival or shortens
  the watch (max 2 stars).

## Metrics the stars read (`metrics(G)` in the integration)
`won` (G.over.win includes 0), `turns` (G.turn, all captains' turns; 2-player games run 8–11 per ENGINE-REPORT.md),
`sunk` (rivals eliminated on the player's own placement: count `G.placeElim` plus collision victims when `G.cur===0`),
`cannons` (Deck Cannons the player fired: `cannonPlay` or `QH.dCannon` for seat 0), `hintsUsed` (presses of
"Show me the safest move", `data-a="hint"` in ui.js). `goal.type:"custom"` in c3 = `sunk >= 1` and won.

## Twists menu (campaign only; the rules engine is unchanged)
Setup twists need one optional `o.twist` read inside `engine.js:newGame` (before `flow()` runs at its end).
- `boss-first` (setup): pass `first: 1` to `newGame`; already supported (`G.first=o.first%np`).
- `boss-cannon` (setup, param = 1–2, needs `exp.cannon`): in `newGame` after the `draw` agenda has run (or in
  `startChapter` right after `newGame` returns, while phase is `setup`), move param cannon ids (57–61) out of `G.deck`
  into `G.hands[1]` and put the same number of its currents at the bottom of `G.deck`. Respects the 2-cannon limit.
- `deep-stir` (setup, param): in `newGame`, `later('setupMon',{n:Math.min(10,LEV_AT_START[np]+param),placed:0})`.
- `wave-early` (setup, needs `exp.wave`): in `newGame`, after `G.mdeck=shuffle(mids)`, move `WAVE_ID` to index 0.
- `harrier` (ai, param): in `ai.js:decide`, when `seat` is the boss use `Object.assign({},AILV.hard,{push:param})`;
  `evalPos` already scores `L.push` for rival junks next to the edge (it is 0 at every level today).
`deep-stir` and `wave-early` are on the menu but unused in v1 (spares for tuning c8/c10).

## Levers verified in the code
- `game/src/engine.js:newGame(o)`: `players` (2–8), `seats` ('human'/'ai'), `lv[]` / `level`, `names[]`,
  `exp:{rift,wave,maelstrom,cannon}`, `variant` (null | 'solo' | 'easysolo' | 'teams'), `noMon`, `goalTurns`
  (easy-solo target, default 24), `soloLev`, `first`, `seed`.
- `engine.js:checkEnd`: solo wins when no leviathan is left to rise or on board; easy-solo wins at `goalTurns`.
- `game/src/ai.js:AILV` + `decide(K,seat,lv)`: levels easy / normal / hard; `push` knob present but unused.
- `game/src/data.js`: `LEV_AT_START`, leviathan names, `WAVE_ID`, `MAEL_ID`, cannon/gate ids.
- `game/ui.js:startGame` builds the `newGame` call; `UI.guide` / `UI.hint` drive the hint coach (`hints:true`).
- No `GNS` call exists in the game yet; the id `tidewake` matches the shelf (`games/index.html`).
