# Lantern Dive: campaign design ("The Drowned Road")

## Story arc
Saltmere Base sits on the sea floor, run by Chief Ottilie Brack over the radio. The player is a new diver beside
the game's own teammates: Nerea (careful planner), Bram (pump fixer), Sumi (loves a good ping), Dag (cheerful
rookie) and Echo, the drone. Two carved stones come up in a fishing net (the logbook brief of dive 2). They lead
to an old wreck, then a broken tablet that describes a coast that does not exist, then a maze of tunnels, an
archive nobody built, a road paved by hand, and finally a corridor where all light goes out. The campaign
follows the logbook's own briefs, so each chapter is a real dive in order.

- **Act 1, The Bay** (learn): one job, then jobs in turn, then the ping, then murky water.
- **Act 2, The Carved Wreck** (normal): Commander's call, shared narcosis tokens, unknown waters.
- **Act 3, The Drowned Road** (hard): heavy job loads, open briefing, the fixed final corridor.

## Bosses (the dive's threat speaks; in a co-op game nobody plays against you)
| Ch | Dive | Threat | Personality | Twist |
|---|---|---|---|---|
| c4 | 9 The Old Wreck (diff 7, murky water) | The Grey Undertow | Patient and smothering; blurs every signal | none (act 1) |
| c7 | 20 The Labyrinth (diff 10, unknown waters, 1s limit) | The Thousand Turns | Playful endless maze; loves guessers, hates counters | `no-flare` |
| c10 | 32 The Last Corridor (4 fixed jobs) | The Lampless One | Old, cold, curious; it simply eats light | `air-limit` 4 |

## Difficulty curve (logbook dive numbers and job difficulty)
c1 dive 1 (guided stacked deal, cannot be lost) → c2 dive 2 (2) → c3 dive 5 (5) → **c4 dive 9 (7, murky)** →
c5 dive 10 (4, gentle act opener) → c6 dive 11 (8, narcosis) → **c7 dive 20 (10, unknown + limit, no flare)** →
c8 dive 22 (11, no limits; act opener) → c9 dive 28 (14, open briefing) → **c10 dive 32 (fixed jobs, 4 attempts)**.
Act 1 is 3 divers with "hard" (strongest) teammates and hints on; acts 2 and 3 are 4 divers, normal teammates,
no hints. `aiLevel` is the mission's difficulty band (easy/normal/hard); the teammates' own level is
`setup.mates`, because weaker teammates make a co-op dive harder, not easier. `easier` drops to 3 divers with
strongest teammates, removes the twist, and for c4/c9 swaps in an easier dive (7 / 24), max 2 stars.

## Twists menu (campaign only, explained on the boss card; normal rules unchanged)
| id | where | how to implement |
|---|---|---|
| `air-limit` | scoring | `isWon: G => G.result.ok && G.att <= param` in `GXC.init` (G.att counts attempts across `LD.nextAttempt`). |
| `no-flare` | scoring | `isWon: G => G.result.ok && !G.distress`; optionally hide the flare button in the distress phase UI. |
| `rookie-mates` | setup | pass `lv: [param x4], level: param` to `newGame` (ui3.js), which feeds the `ai` array of `LD.newGame`. |
| `big-team` | setup | pass `np: param` to `newGame` (ui3.js) → `LD.newGame({players})`. |
| `clock-on` | setup | pass `timer: true` to `newGame`; only matters for dives 14, 15, 16, 26 (`startAttempt` uses `base.timer`). |

## Levers verified in code
- Mission choice: `game/src/data.js` `MISSIONS` (ids 1-32, `d`, `cmt`, `sel`, rules); `engine.js:missionInfo({kind:'log',id})`.
- New game options: `game/src/ui3.js:newGame(mode, {np, kind:'log', mission, timer, level, lv})`; `mode:'guided'`
  forces 3 divers, dive 1 and the stacked deal (`guidedStack`). Engine: `engine.js:newGame({players, ai, mission, timer, stack})`.
- Teammate levels: `ai.js` `AI.params` easy / normal / hard; `ui3.js:lvAt`.
- Attempts and flare: `engine.js:startAttempt` (`G.att++`), `nextAttempt`, distress phase in `apply` (`G.distress`).
- Result: `engine.js:finish` sets `G.phase='over'`, `G.result.ok`.

## Metrics the stars read (`metrics(G)` for `GXC.init`)
`won: G.result.ok (and the twist check)`, `attempts: G.att`, `flare: G.distress ? 1 : 0`,
`pings: G.pings.filter(p => p.seat === 0).length`, `myJobs: G.tasks.filter(t => t.owner === 0).length`.
