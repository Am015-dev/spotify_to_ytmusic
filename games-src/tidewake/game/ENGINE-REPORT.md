# Tidewake: engine report (stage 1)

Rules engine, computer captains and headless tests for Tidewake (Tsuro of the Seas + Veterans of the Seas, renamed). No UI. All names are ours (currents, leviathans, junks, Rift Gate, Rogue Wave, Maelstrom, Deck Cannon); real names live only in `rules-notes.md`.

## Files
| File | What |
|---|---|
| `src/data.js` | board (6x6, `BW`), ports, 56 currents (35 distinct matchings + 21 chosen duplicates `EXTRA_TYPES`, a DESIGN CHOICE), precomputed rotations `ROTP`, 10 leviathans `LEV` with arrow layouts (GUESSED), Maelstrom arrows, ship colours |
| `src/engine.js` | state `G`, setup, turn agenda, path following, leviathans, all 4 expansion pieces, interrupts, win checks, `knowledge`, `checkInvariants` |
| `src/ai.js` | easy / normal / hard captains, decide from `knowledge(seat)` only |
| `gauntlet.js`, `cover.js`, `rules-test.js`, `hidden-test.js` | the four suites (`run-all.sh` runs them in parallel, `run-levels.sh` easy/hard + level-vs-level) |
| `tools/` | `load.js` (vm loader), `rand.js`, `dbg.js`, `rep.js`, `solo.js`, `vs.js`, `exp.js` (AI experiments) |
| `out/` | raw outputs of the last runs |

## Geometry and cards
Squares `(x,y)` x = column 0-5 (gold die - 1), y = row 0-5 (blue die - 1). Ports on a square run clockwise from the top-left: 0,1 top, 2,3 right, 4,5 bottom, 6,7 left; direction of port p = `p>>1` (0 N,1 E,2 S,3 W); `MATE=[5,4,7,6,1,0,3,2]` gives the entry port on the neighbour. A ship = `{x,y,e,on,alive,moved}`: `(x,y)` is its FRONT square (empty, where the next tile goes), `e` the port it enters that square by, `on` the tile square it sits on (null before its first move). Start marks = every edge port of every border square. Cards are ints: 0-55 currents (`CUR_TYPE[id]` = 0..34), 56 Rift Gate, 57-61 Deck Cannons. Board cells `G.bd[y*6+x] = null | [id, rot]`. Leviathans `G.mons=[{id,k:'L'|'M',x,y,r}]` (ids 0-9; 10 Rogue Wave in `G.wave`; 11 Maelstrom), `G.mdeck` (hidden order), `G.mgone`.

## API
| Call | Meaning |
|---|---|
| `newGame({players 2-8, seats?, level?/lv[], exp:{rift,wave,maelstrom,cannon}, variant:'solo'\|'easysolo'\|'teams', first?, seed?, noMon?, goalTurns?, soloLev?})` | `seats` = array of `'human'`/`'ai'`. Teams: seat%2, needs 4+ (2 teams). Solo/easysolo force 1 player. `noMon` = the official "no daikaiju" option. Phase `setup` first (ships choose start marks, in play order, before any tile) |
| `sideToAct()` | seat the game waits for: start-mark chooser, the question owner (`G.q.who`, may be an interrupter on someone else's turn), or the active player; -1 when over |
| `validMoves(seat)` | `{a:'start',x,y,e}` \| `{a:'place',t,r,s}` (hand index, rotation 0-3, ship seat; 4 rotations per tile; prohibited placements only when nothing else is legal) \| `{a:'gate',t,s}` \| `{a:'cannon',t,m,s}` \| `{a:'pass'}` \| `{a:'q',i,l}` (answer to `G.q`) |
| `legal(m,seat)` | `''` or a reason; `performMove(m,seat)` -> `{success,error}` (calls global `refresh()` if defined and `UI.sim` is 0) |
| `knowledge(seat)` | public view + own hand only: others' hands, deck order, monster-deck order (sorted), pool and seed hidden |
| `checkInvariants()` | array of problems (tile conservation 56+exp, monster conservation, hand sizes, no two ships on one port, no monster on a tile/gate, min-3 refill pending, ...) |
| `setSeed(s)`, `setAiSeed(s)`, `aiMove(seat,lv?)`, `aiStep(force?)` | deterministic deals / AI. `aiStep()` returns `{seat,m}` for the next AI seat (null for a human unless `force`) |
| `describeMove(m)`, `render_game_to_text(seat)`, `saveGame()/loadGame()` | text helpers, localStorage in try/catch |

State is one JSON-safe `G` (no functions): `phase` setup/play/over, `step` act/null, `cur`, `turn`, `ships`, `hands`, `deck`, `gone` (cannons shown/used, easy-solo discards), `bd`, `mons`, `wave`, `gates`, `dice`, `refill`, `over={win:[seats],why}`, `stats` (rule counters), `log`. Engine steps wait on the agenda `G.ag=[{h,d}]`; questions are `G.q={who,kind,title,opts:[{l,h,d}],ctx}` with handler keys in `QH`. Question kinds: `doom` (interrupt: Deck Cannon / Rift Gate / relocate / accept, asked of the ship's owner, also on other players' turns), `gateSq`, `gatePlace`, `gateWake` (Rift Gate transport choices), `bonus` (elimination swap, many `bSwap` then `bDone`), `cannonDraw` (keep or show-and-discard).

## Turn, as implemented
1 Roll 2d6 (skipped on a minimum-3 refill turn): 6/7/8 moves every leviathan in order of corner number (gold arrow breaks ties) with one die each (1-5 arrow, 6 = it stays and a new leviathan is placed); otherwise the Maelstrom moves. The Rogue Wave first moves if this is its placer's slot and a round has passed, then the active ship in the row rolls. A leviathan in front of the active ship eliminates it (interrupts first; an unmoved start may relocate along its edge). 2 Place a current (or Rift Gate / Deck Cannon) on the front square, any rotation. 3 Every ship whose front is that square follows its wake through chained tiles to the open end; edge or leviathan tile = elimination; two ships on one port = both sink; Rogue Wave rolls for ships passing the row. 4 Elimination bonus (swap), draw to 3 (a drawn cannon: keep or show-and-discard). Leviathans entering a tile destroy it (to the bottom of the pile; discarded in easy solo) and sink ships on it; a moving leviathan destroys a stationary one; leaving the board removes it; under 3 on board -> next player refills to 3 and does not roll. Last ship wins; ships lost in the same step share the win.

## Choices and guesses (flagged)
- 21 duplicate currents: `EXTRA_TYPES` (even spread). Leviathan arrow layouts and numbers: ours (two gold tie-breaks); setup draws until N leviathans (6/5/4) are down, the Rogue Wave / Maelstrom drawn on the way are extra.
- Collision: rules notes say ships pass through each other, but two ships forced onto one wake end in the same direction both sink (Tsuro rule; that placement is otherwise prohibited). A head-on link of two wakes sends each back along the other's wake (to the other's start edge), so both sink.
- Rift Gate interrupt placement: an empty square next to the doomed ship's last tile; own-turn play: on the front square. Transport rolls 2 dice (re-rolling squares with leviathans, gates, or empty with no tile to place), asks for a tile (empty target) then the wake and direction (not onto another ship's end if avoidable, no more than 2 gate loops). A gate on a front square sweeps every ship waiting there.
- Deck Cannon own-turn range: leviathans orthogonally adjacent to the front square or the ship's tile. Interrupt: any ship about to be lost to that leviathan (tile landing, path into its tile, blocked front, spawn). Not usable on the Maelstrom or Wave.
- Rogue Wave strength 2 / 3 after its first move / 4 from the fourth round; rolls for the active ship after its own move, when the wave moves, and for any ship moved through the row by a tile; a ship's square = its tile (start ships: front square).
- Easy solo: pile exhausted OR 24 turns survived (`goalTurns`): a 6x6 board holds only 36 of the 56 currents, so "play every current" is out of reach (0/100 for the AI). Solo: 6 leviathans, outlast all 10.

## Numbers (normal AI, equal captains; `out/`)
- gauntlet: 6,000 + 2,400 games (2-8 players x base/rift/wave/maelstrom/cannon/all, + solo, easy solo, teams): 0 errors, 0 stalls, 0 invariant failures; easy and hard 720 games each also clean.
- 2p win split by seat (150 games per config): 53/47, 48/52, 56/44, 49/51, 51/49, 60/40 (base, rift, wave, maelstrom, cannon, all) - inside 40-60. 3p ~ 29-39% per seat, 4p 18-31%, 5-8p roughly even (seat 1 is first player).
- Average turns (all captains' turns): 2p 8-11, 3p 14-17, 4p 15-22, 5p 16-22, 6p 19-26, 7p 20-28, 8p 23-28 (max 51).
- Solo (hard/normal AI): outlast-all-10 won 3-6% (the 6x6 board puts ~10 leviathans on 36 squares; recommend 7x7/8x8 or a lower goal if a human-friendly solo is wanted: `BW` is one constant, dice still reach only 6x6); easy solo 25% (normal), 32% (hard), 15% (easy).
- AI levels (2p, 1,500 games): hard 53% vs normal, normal 57% vs easy, hard 58% vs easy (4p). Luck dominates: most deaths are leviathans (~65%).
- cover.js: 1,620 mixed AI/random games, 38.7k moves, invariants after every move, 0 errors; all 42 rule/piece counters fired (chains, collision, edge, tile destroyed, spawn on 6, min-3 refill, bonus swap, cannon keep/discard/interrupt/own-turn, gate play/rescue/transport/enter, wave spawn/move/capsize/off, maelstrom spawn/move/kill/off/eats-leviathan).
- rules-test.js: 34 named scenarios pass (chain, head-on, same-wake collision, edge, tile destroyed with ship, leviathan vs leviathan/off-board/rotate, spawn on 6, blocked front, start relocation, min-3, bonus swap, last ship / shared win, solo, easy solo, teams, gate own-turn + interrupt, cannon interrupt + own turn + draw, wave strength/move/off/rolls, maelstrom).
- hidden-test.js: 1,935 poisoned decision points (others' hands, draw pile, monster-deck order, bonus pool, seed scrambled): 0 knowledge differences, 0 decision differences; a control chooser that peeks at G is caught in 1,023 of 1,935.
- Speed: 25-110 ms per game.

## For stage 2 notes
Show `G.q` to `G.q.who` even on another player's turn (interrupts). The human hand is `G.hands[seat]`; for online play send `knowledge(seat)`. `UI.sim` suppresses `refresh()`. `G.stats` and `G.log` (newest first, `{t,c,i,turn}`) are for the coach/HUD.
