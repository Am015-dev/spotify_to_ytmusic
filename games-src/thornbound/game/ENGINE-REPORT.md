# The Thornbound Throne - engine, AI and tests

Files (all under games-src/thornbound/game): src/data.js, src/engine.js, src/ai.js, rules-test.js, gauntlet.js, cover.js, hidden-test.js, this report. Plain JS, global `TB`, node + browser. Load order: data.js, engine.js, ai.js.

## API
- `TB.newGame({players:[{faction,name,ai:'easy'|'normal'|'hard'|null}], length:'short'|'standard'|'extended', seed, order?})` -> G (2-4 players; solo throws, deferred). Factions: nobility (Gilded Court), clans (Heathbound Clans), uprising (Lantern Rising), gathering (Pale Choir).
- `TB.pending(G)` -> `{seats, kind, title, simul, type}` or null (game over). Seats listed are those that still have to answer; for simultaneous questions (bids, face-down cards, Grand Joust) answered seats drop out and nobody sees their choice until the engine reveals.
- `TB.moves(G,seat)` -> legal moves `{seat,t,k,label,...fields}`; empty if the seat is not asked. `TB.apply(G,move)` -> `{ok,log}` or `{ok:false,err}` (state untouched on refusal). Pass back one of the moves (seat + k are what matter).
- `TB.question(G,seat)`, `TB.stripView(G,seat)` (alias `TB.view`; hidden cards become `-(owner+1)`, deck/RNG hidden), `TB.scores(G)`, `TB.winner(G)`, `TB.cardInfo(G,id)`, `TB.kingdomInfo(n)`, `TB.votes`, `TB.invariants(G)`, `TB.poison(G,seat,rng)` (scrambles everything a seat may not know), `TB.test.*` (scene helpers for tests).
- `TB.AI.choose(G,seat,level,{budget,samples})`, `TB.AI.step(G)`, `TB.AI.run(G,{humans})`.
- G is plain JSON (save/load = JSON round trip, tested); seeded RNG inside; same seed + same moves = same game.

### Question kinds (move `t`)
`menu` (act/done: Spring, Day and Autumn action steps, fields `a`,`p`), `bid`, `bidRes` (take/steal/return), `place` (face-down card per Region), `herald`, `clashOrder`, `tie`, `location`, `castle`, `wilderness`, `harvest`, `shrine`/`ossuary`/`siteBuy`/`retreat`/`relics`/`rally`/... (`sel` + `seldone` multi-select, ordered), and about 40 smaller picks (slot, occupier, flank, edict, favour choices, councils...). `TB.moves` labels are plain English. Menus with only "done" available are skipped automatically.

## Tests (node, final run)
| Test | Result |
|---|---|
| rules-test.js | 114 tests passed, 0 failed |
| cover.js | 221/221 items fired (51 Kingdom Cards x slot/Great Road mode, 16 Tactics, 4 Favours, 14 Advanced + 6 HQ cards, 56 basic cards, 3 Councils, 6 Locations, 21 rules); 17,548 applies, 0 invariant violations |
| gauntlet.js 1500 (normal AI, 2/3/4 players, all faction combinations) | 0 errors, 0 stalls, 0 invariant violations |
| hidden-test.js 24 | 4,440 poison checks: 0 view / move-label / AI-decision differences (easy, normal, hard), 0 structural or simultaneous-secret leaks; control cheater caught 1096/1745; PASSED |
| hard AI timing | mean 56 ms, p95 208 ms, max 236 ms per decision (budget 200 ms) |

Gauntlet win rates (500 games each; fair share in brackets): 4 players (25%): Gilded Court 25.4, Heathbound Clans 20.8, Lantern Rising 27.8, Pale Choir 26.0 (an earlier 800-game run gave 31.9/20.1/27.4/20.6) - all inside 15-35%. 3 players (33%): 44.0 / 26.1 / 30.9 / 32.3. 2 players (50%): 63.3 / 40.0 / 46.8 / 49.8. Seat and Order-Track-position splits are flat (4p seats 25.6/26.0/23.8/24.6). Average length: 5 rounds, ~218 / 311 / 396 decisions (2/3/4p); average winner score 20.1 / 16.4 / 15.0. Honest note: the Gilded Court is clearly strongest at 2-3 players (the Doctrine of Masonry keeps Supporters on the Map; the AI of other factions uses the Council of Pledges only moderately). Level strength: hard won 81.7% against three normal AIs (60 games); normal beats easy comfortably.

## New assumptions (beyond rules-notes.md)
Start hand size 6; Ruse is one use of Ambush OR Retreat per Clash; "place Supporters" may be done in several steps; Retreat returns only Supporters still fresh in the Region; Attrition happens at most once per draw event, still lowers hand size with an empty discard, and a Veiled Patron absorbs it compulsorily; Necropolis shuffles the Discard in place and draws as many as 3 that fit; Rite of the Watcher with no total above 0 is an ordinary tie; Martial Writ blocks rivals' Ambush during that Region's first Clash and Flank/swap into it until then; Tempests "most" means strictly most; Location text is resolved before the Herald Reward; Council of Whispers must place all markers, several 4+ Locations resolve in Location order; Council of Pledges/Rally Standard take Supporters from the Map first, then the Lost Pile; Grand Joust uses printed Strength, the winner picks any of 6 Locations with Influence but no Herald reward; Dead King's Gaze lets the holder take either of the top two Kingdom Deck cards; Honour Guard: once without the disc, twice with it; Wax Pretender once per Round, never rotates; Mirror copies archetype, traits, commands and text (not Strength); Rite of the Fang adds all of the burned card's printed powers; Rumours Underground orders only up to 4 cards (larger hands random); Deploy tokens are counters, not Influence in Supply; Kingdom Card 47 (Broken Gnomon) is acquired normally and placed by its Spring action; Crown's Edict is offered at every bid reveal while unexhausted; Riverbank Raiders is barred for a Sentinel Towers holder.

## Known gaps
Solo mode (rules unavailable); optional Advanced Setup; Wild Kingdom expansion; no art. Internal ids for councils/suits remain `relics/secrets/oaths` (not shown to players; UI maps them to Coin/Whispers/Pledges). Hard AI plays the big hidden-information decisions by rollouts but uses heuristics for small picks.
