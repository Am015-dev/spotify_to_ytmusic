# Shipwreck Isle: campaign design ("The Log of the Gull's Wake")

## Premise
The trading ship *Gull's Wake* breaks on a reef. The story is told through the ship's log, and the castaways
(the Carpenter, the Cook, then the Explorer and the Soldier, with Friday and the dog early on) speak in it.
**Act 1, Washed Ashore:** learn to eat, build a shelter and explore, then light the signal fire (Marooned). A ship
turns, but her captain saw a grey fog closing over the island. **Act 2, The Hexed Isle:** the fog is a curse. Find
the dark temple and raise five crosses. When the fog lifts they see their shipmate Ada stranded on a rock offshore.
**Act 3, The Way Home:** signal through an autumn gale, last a lean season in a real home (Settlers), then
rescue Ada and sail home in the Lifeboat (Stranded Friend).

## Threats (the "bosses")
This is a co-op game, so each chapter's opponent is the scenario threat. `aiLevel` is the difficulty band and
`aiStyle` is the threat's flavour.
| Chapter | Threat | Personality |
|---|---|---|
| c1 | Gnawing Hunger | Patient. It only bites at night, when the food pile is empty. |
| c2 | The Long Rain | Steady. It spoils food and wood stored above the roof. |
| c3 | The Night Prowlers | Curious beasts that wait at every new tile. |
| **c4 boss** | **The Empty Horizon** | Calm and vast. It never attacks; it lets the days run out. |
| c5 | The Whispering Fog | Sly. Fog makes every action on a tile cost one more pawn. |
| c6 | The Altar Shadows | Theatrical. Temple treasures, a wounding altar, fogged hideouts. |
| **c7 boss** | **The Grey Shroud** | Old and certain. It owns the curse, the fog and the clock. |
| c8 | The Autumn Gale | Loud and wasteful. More book events, storms. |
| c9 | The Lean Season | Thrifty and grim. Bad crops, wasteland, every mouth counted. |
| **c10 boss** | **The Undertow** | Relentless. Storms tear at the palisade while Ada's clock runs. |

## Difficulty curve
- **Act 1 (c1–c4):** `diff:'easy'`, 4 items, the dog and Friday, 2 castaways, hints on. c1–c3 are short
  checkpoint goals inside a Marooned game: survive 3 days, build the Shelter by day 5, explore 4 tiles by
  day 6. Each teaches one idea: food, building, exploring. c1 is three nights with 4 items and the dog, so a
  newcomer can win it. Boss c4 is the full Marooned scenario on Easier, with no twist.
- **Act 2 (c5–c7):** `diff:'standard'`, 2 items, no dog, hints off. c5 is short (2 crosses by day 6). c6 adds a
  third castaway and the temple. Boss c7 is the full Hexed Isle with 3 castaways, no Friday, and the
  `early-threat` twist.
- **Act 3 (c8–c10):** `diff:'hard'`, 1 item. c8 is Marooned on Harder with no twist (the act's way in). c9 is
  Settlers with `low-morale`. Boss c10 is Stranded Friend with `ada-adrift`.
- **`easier`** (offered after 2 losses on a chapter): one band down, no twist, more items, at most 2 stars.

## Twists menu (campaign only; applied after `newGame`, the rules engine stays unchanged)
| id | Where to hook | Implementation |
|---|---|---|
| `early-threat` | `engine.js:newGame`, after `G.ev.threat=[null,'crates']` (a campaign post-setup hook) | `G.ev.threat[0]=G.ev.deck.shift()`. The round-2 event pushes it off the left slot, so its threat effect fires. The deck still covers every round: 12 cards for 11 events in Marooned, 10 for 9 in Hexed. |
| `low-morale` | same post-setup hook | `G.morale=-param` (clamped to −3 like `engine.js:morale`). |
| `ada-adrift` | after `SCEN.stranded.setup` (`scen.js`) | `G.sc.ada=param`. `SCEN.stranded.night` already adds 2 a night and ends the game at `CHARS.ada.die` (11). |

**Checkpoint goals (`goal.type:"custom"`, c1, c2, c3, c5, c6).** The campaign wiring checks `goal.value` at the end
of each round (`phases.js`, the end-of-round frame before `G.round++`, ~line 279, or alongside
`SCEN.<scen>.endRound`). When the checkpoint is met, it sets `G.over={win:true,why}`. When `byDay` passes
without it, it sets `G.over={win:false}`. These keys are checked:
- `surviveDays`: `G.round>=n` with nobody dead;
- `build:'shelter'`: `G.camp.shelter`;
- `explored`: `G.stats.explored`, which counts the start tile;
- `crosses`: `G.sc.crosses.length`;
- `temple`: `G.sc.templeDone`.

The game's own rules for a day are untouched; the game just ends early.

**`metrics(G)` for the star tests:**
- `won: !!(G.over&&G.over.win)`;
- `rounds: G.round`;
- `wounds: G.stats.wounds`;
- `morale: G.morale`;
- `food: G.res.food+G.res.pfood`;
- `explored: G.stats.explored`;
- `crosses: (G.sc.crosses||[]).length`;
- `adaWounds: G.sc.ada`.

## Levers verified in code
- `engine.js:newGame(o)` takes these options:
  - `o.scen`: `marooned` (12 rounds), `hexed` (10), `stranded` (8) and `settlers` (12). See `data.js:SCENARIOS` and `scen.js`.
  - `o.chars`: any of `carpenter`, `cook`, `explorer`, `soldier`, 1–4 of them (`data.js:CHARS`).
  - `o.friday`: defaults on for 2 or fewer castaways.
  - `o.dog`: defaults on for solo.
  - `o.items`: the number of starting items.
  - `o.diff`: `easy`, `standard` or `hard`. It sets the book/adventure split of the event deck.
- `ui.js` (the `d.diff` handler, ~line 229, and `UI.setup`) shows the shipped bands:
  - Easier: 4 items, the dog and Friday;
  - Standard: 2 items;
  - Harder: 1 item.

  The campaign `setup` blocks use exactly these keys.
- Scenario state that twists and goals read: `scen.js:SCEN.*.setup` (`G.sc.pile`, `G.sc.crosses`,
  `G.sc.templeDone`, `G.sc.ada`, `G.sc.kids`) and the `G.stats` counters in `engine.js`.
- Loss at time-out: `phases.js` (`G.round>=G.rounds`). Wins: `scen.js:win()`.
- Shelf id: `shipwreck` (`games/index.html` shelf entry). It is used as `game` in `campaign.json`.
