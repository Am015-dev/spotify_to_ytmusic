# Short Fuse: campaign design ("The Clockmaker's Calling Cards")

## Story arc
You join **Foreman Brix**'s demolition crew (Wren, Pike, Moss and Tally, the crew's counter, who narrates the fuse).
**Act 1, Boot Camp:** practice rigs in the yard: blue wires, then yellow, then the first red and the equipment
shelf, ending with the Graduation exam. That evening a brass clock key arrives in the post: "See you soon."
**Act 2, Calling Cards:** **Vesper Quill, the Clockmaker**, a showman bomb-maker, leaves signed devices around
town: a painted number that behaves like red, then a crewmate talked into lying, then a hidden **Weak Link** on
the crew. Unmasking the Weak Link turns up the address of the old clock tower.
**Act 3, The Clock Tower:** the Clockmaker's three floors: the seven o'clock floor, the floor where everyone holds
one wire backwards, and his "masterpiece", a device whose rules change each time a value is finished.

## Bosses / threats (co-op: the threat is the mission; `aiLevel` = difficulty band, `aiStyle` = flavour)
| Ch | Job | Threat | Personality |
|---|---|---|---|
| c4 | 8 Graduation | The Graduation Rig | Stern but fair examiner; decoy "?" markers for red and yellow. Boss rule `quiet-start`: the computer crew places no opening tokens. |
| c7 | 34 Mole Hunt | The Weak Link | A crewmate under the Clockmaker's spell, quiet and helpful-looking, bound by a secret constraint. Boss rule: one fewer equipment card. |
| c10 | 57 Self-Destruct | Vesper Quill, the Clockmaker | Theatrical, smug, polite; every finished value turns on a new rule. Boss rule: fuse 1 step shorter. |

## Difficulty curve (win rates: normal AI, all player counts, `game/ENGINE-REPORT.md`)
- **Act 1 (hints on, 3 crew):** Job 1 (16/16 wins), Job 2 (13/16), Job 3 (16/16) teach one idea each (cuts and
  solo cuts, yellow, red and equipment); boss Job 8 (13/16) adds the "?" candidate markers.
- **Act 2 (hints off, 3 crew):** Job 11 (15/16, newcomer-friendly opener), Job 17 (11/16), boss Job 34 (7/12,
  needs 3+ players) with `lean-kit 1`.
- **Act 3 (3 to 4 crew):** Job 46 (15/16: no reds, an easy opener for the act), Job 38 (Blind Spot, replaces Job 56, which was too harsh in simulation), final boss Job 57
  at 5 players with `short-fuse 1`. Avoided on purpose: real-time/audio jobs (10, 19, 30, 42, 54, 66) and
  the jobs the AI crew never won in 16 tries (29, 43, 45, 47, 51, 61, 64, 65, 66), because in this co-op game the
  computer teammates, not the puzzle, would lose those.
- **Easier offer:** in this game a lower AI level makes the *teammates* worse (easy 48% vs normal 73% on jobs 1-33),
  so `easier` never lowers the teammates. It switches them to `level:"hard"`, drops the twist and changes the crew
  size to the best band in the report: 2 players for jobs 1-3, 9-19 and 43-66, and 4 players for jobs 4-8 and 31-42
  (Job 34 needs 3+ players). Max 2 stars.

## Twists menu (campaign only, shown on the boss card)
| id | Where to implement | Effect |
|---|---|---|
| `short-fuse` | `src/engine.js` `newGame`, after `G.dial=…` | `G.dial=Math.max(1,G.dial-param)`. Used on c10. |
| `lean-kit` | `src/engine.js` `newGame`, after `setupEquip(M)` | move the last `param` cards of `G.eq` back to the front of `G.eqPool`. Used on c7. |
| `green-hand` | `ui.js` `startJob` options | pass `o.lv` with the last computer seat set to `'easy'`. Spare. |
| `quiet-start` | `src/engine.js` `infoSetup` | skip `later('infoStd',…)` for computer seats. Spare. |

## Levers verified in code
- Mission choice and crew size: `src/engine.js` `newGame(o)` reads `o.mission` and `o.np` (it throws if
  `MISSIONS[n].pl` lacks `np`). `setup.players` maps to `np` and `setup.mission` to `mission`.
- Teammate level: `newGame` `o.level` / per-seat `o.lv[i]`, which go to `seats[i].lv`. Levels are in
  `src/ai.js` `AILV` (easy/normal/hard) and read in `decide()`.
- Human seat: `newGame` `o.seats[i]==='human'` (`ui.js` `startJob` builds it). Hints: `UI.help` / `UI.coach`
  (`ui.js` settings, `tipHTML`).
- Fuse: `G.dial` set in `newGame` from `M.dial`; `advance()` burns it; `explode()` / `checkWin()` set `G.over.win`.
- Equipment: `setupEquip(M)` fills `G.eq` / `G.eqPool`. Opening tokens: `infoSetup(M)`.
- Metrics for stars (`GXC metrics`): `won=G.over.win`, `left=G.dial`, `misses=G.stats.miss`, `turns=G.turn`,
  `solos=G.stats.solo`, `eqUsed=G.stats.eqUse` (all counted in `src/engine.js`).
- Game id `short-fuse` (shelf folder `games/short-fuse/`). The old `sf_camp` progress in `ui.js` `recordResult`
  is a separate job-unlock tracker. The campaign does not replace it.

## Simulated win rates (`game/campaign-sim.js`, 30 seeds, teammates normal, human seat = easy AI plus random moves)
Newcomer model (20 % random moves): chapter 1 wins about 86 %. Steadier player (8 % random moves): c1 97, c2 90, c3 63, c4 boss 40,
c5 70, c6 53, c7 boss 43, c8 60, c9 43, c10 boss 23. The easier offer switches the teammates to `hard` at the same crew size (4 or 5 where
noted in `campaign.json`), drops the twist, max 2 stars.
