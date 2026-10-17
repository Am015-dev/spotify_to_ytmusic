# Short Fuse: engine report (stage 1)

Stage 1 of the browser version of the original co-op deduction game, here called **Short Fuse** (a cartoon demolition crew defusing rigged charges). It covers the rules engine, all 66 jobs, the computer crew and headless tests, plus a minimal 2D debug page. All names and texts are our own; the real card names are not kept in this repo and appear nowhere in `src/` or `debug.html`.

## Files

| File | What it is |
|---|---|
| `src/data.js` | Wires (70), info tokens (26), 18 equipment cards, 9 crew + 5 tools, restrictions A-L, challenges 1-10, the bunker map, timed prompt scripts for the 5 narrated jobs, and all 66 jobs (`MISSION_SETUP` numbers generated from `missions.json` by `tools/gen_setup.js`; `MISSION_INFO` names, our text and structured `rules`) |
| `src/engine.js` | The rules engine: state `G`, setup, turns, actions, equipment, crew tools, the rule handlers `RH`, knowledge view, invariants, text view |
| `src/ai.js` | Computer crew (easy / normal / hard), the deal sampler, the driver `aiStep()`, the "what we know" helper |
| `src/debug.html`, `src/debug-ui.js`, `build.py` | Minimal 2D debug page; `python3 build.py` writes `debug.html` (self-contained) and `x.js` (for `node --check`) |
| `gauntlet.js`, `cover.js`, `rules-test.js`, `hidden-test.js` | The four test suites (Node, vm context like `SP/ft`); `tools/load.js` loads the scripts |
| `tools/` | `calib.js` (AI calibration), `trace.js` (one game's log), `one.js`, `speed.js`, `debugpage.js` (jsdom check of the debug page) |
| `rules-notes-impl.md` | Rule-by-rule implementation map, every cut and every added assumption |
| `out/` | Raw outputs of the last runs |

## API for stage 2

All state is one JSON-safe object `G` (no functions; save/load with `saveGame()` / `loadGame()`, every localStorage access in try/catch). Load order: `data.js`, `engine.js`, `ai.js`, then the UI. The engine calls a global `refresh()` after every move if one exists and `UI.sim` is 0.

### Lifecycle and globals

| Call | Meaning |
|---|---|
| `newGame({np, mission, seats?, mode?, level?, lv?, chars?, captain?, seed?, turnSec?, realtime?})` | `np` 2-5, `mission` 1-66. `seats` = array of `'human'`/`'ai'` (or `mode:'ai'|'hot'|'solo'`). `level`/`lv[i]` = `'easy'|'normal'|'hard'`. `chars[seat]` = crew id from `allowedChars(mission,np)`. `captain` = foreman seat (pass the next seat to the left for the rotation between jobs; random if absent). `realtime:true` means the UI drives the clock with `tick(sec)`; otherwise each turn adds `turnSec` (default 12). Throws if the job does not allow that player count (jobs 34 and 65 need 3+). |
| `setSeed(s)`, `setAiSeed(s)` | Deterministic deals / AI decisions |
| `sideToAct()` | The seat the game is waiting for (question owner, actor, default claimer), or -1 |
| `validMoves(seat)` | Legal moves for that seat now (see listing notes below) |
| `legal(move, seat)` | `''` if legal, else a plain-English reason. Use it to grey out clicks. |
| `performMove(move, seat)` | `{success:true}` or `{success:false, error}` |
| `tick(seconds)` | Real-time jobs: advance the play clock (pause it while narration plays) |
| `checkInvariants()` | `[]` or a list of violations |
| `render_game_to_text(seat?)` | Compact JSON text; with a seat, unseen wires show as `??` |
| `knowledge(seat)` | The per-seat view (below) |
| `describeMove(m)` | One-line English description of a move |
| `G.over` | `null` or `{win, why}`; `G.winText` |
| `G.log` | Public log, newest first: `{t, c, i, turn}` (`c`: `big`, `good`, `bad`, `turn`, `eq`, `prompt`) |
| `G.prompt` | Latest narrator prompt `{say, t}` for the timed jobs |
| `ANIM`, `AIDELAY`, `UI.sim` | Test hooks as in the reference build |

State the UI will read most: `G.st[i]` = stand `{i, pos, w:[slot], side:[token]}`; `slot = {id, u, cut, tok:[], not:[], x, flip, na}` (`u` = public slot uid, `id` = wire, hidden from other seats); `G.seats[i] = {nm, human, lv, ch, chUsed, chDown, role, con, conDown, ox, cards}`; `G.dial` (fuse, `null` in job 53), `G.eq = [{id, st:'locked'|'ready'|'used', down, cover, perm}]`, `G.valid`, `G.markers`, `G.ms` (job state), `G.clock`, `G.cur` (whose turn), `G.actor` (who acts now: differs in jobs 18/45/51), `G.step` (`act`, `claim`, `snip`, otherwise engine-internal), `standsOf(seat)`, `ownerOf(stand)`, `cv(id)` (play value 1-12, `'Y'`, `'R'`).

### Move shapes

Wires are addressed by position: stand index `st`/`s` and slot index `k` (0 = left end).

| Move | Shape |
|---|---|
| Dual cut | `{a:'dual', st, ks:[k], v}`; `v` = 1-12 or `'Y'` |
| ... with a probe | `tool:'dd'` (Twin Probe, 2 wires) / `'pt3'` (crew Triple Probe) / `'eq3'` (Triple Probe card, 3 wires) / `'eq5'` (Full Scan: `ks` = every uncut non-X, non-flipped slot of the stand) |
| ... naming two values | `two:'eq10'|'pt10', v2` (combinable with `tool`) |
| ... with your own flipped wire (38, 56, 64) | `own:'flip', fu` (`fu` = the uid of the flipped slot you mean; no probes) |
| Job extras | `calc:[a,b,'+'|'-']` (47), `oxTo:seat` (49); `validMoves` fills both with sensible defaults |
| Solo cut | `{a:'solo', v}`; `ep:1` (Express Pass: two identical wires); `flip:1, fu` (include that flipped wire of yours) |
| Reveal reds | `{a:'reveal'}` (normally automatic at the start of the turn) |
| Equipment | `{a:'eq', id, ...}`: `eq1`/`eq12` `{s,k}` (tags slots k and k+1 of your stand s); `eq2` `{s,k,to}`; `eq4` `{s,k}` (+`fv` in job 52); `eq6` `{}`; `eq7` `{who:[seat, seat?]}`; `eq8` `{v}`; `eq9` `{}`; `eq11` `{next}`; `eq22` `{s,k}`; `eq1111` `{ts,tk,s}` (take crewmate slot ts/tk into your stand s). Instant cards (`eqY`, `eq33`, `eq1010`) fire by themselves. |
| Crew tools (not probes) | `{a:'item', k:'sweep', v}`, `{a:'item', k:'handsets', s, k2, to}` |
| All-at-once actions | `{a:'multi', kind, tg:[{s,k},...]}`; kinds `red3` (13), `four` (23, 39), `sevens` (46), `y3` (48), `lever` (66), `rush` (30) |
| Other job actions | `{a:'trip', s, k}` (41), `{a:'redcall', s, k}` (55/60 challenge 1), `{a:'accuse', who, con}` (34), `{a:'swapCon'}` (61), `{a:'pass'}` (44, 47, 49), `{a:'claim'}` (10), `{a:'snip'}` / `{a:'nosnip'}` / `{a:'snipReveal'}` (45), `{a:'tada'}` (42), `{a:'signal'}` (44, 49, 63: "I need oxygen") |
| Answer a question | `{a:'q', i}` |

Listing notes: `validMoves` lists triple-probe moves for adjacent triples only, does not list Two-Value + multi-probe combinations, and lists each all-at-once action once as an example (`example:1`). `legal()` and `performMove()` accept every valid combination, which is what the UI builds from clicks.

**Timing windows.** Any-time cards and crew tools (`eq1, 2, 4, 6, 7, 8, 12, 22, 1111`, Pocket Sweep/Handsets) are legal for ANY seat whenever the game waits for an action, a claim or a volunteer (`G.step` is `act`, `claim` or `snip`) and no question is pending: the UI can offer them off-turn. Turn cards (probes, Coffee Break, Express Pass) belong to the actor's action; the Damper is legal only before the actor's action.

### Pending questions

`G.q = {who, kind, title, opts:[{l, h, d}], ctx}`: `l` = button label, `h` = handler key, `d` = plain data. No closures. Answer with `{a:'q', i}`. Kinds: setup `infoStd`, `infoNeg`, `infoFalse`, `draftCon`, `lineEnd`; resolution `pickMatch` (which matching wire to give up), `tagPick` (which pointed wire gets the token), `swapPick` (Handsets partner), `robotStand`, `leakStand`; job steps `designate` (18, 45, 51), `lackTag`, `declare` (26), `mindCard` (29), `replaceCon` (32), `rotateCon` (61), `lineFlip` (36), `giftTok` (22), `ydraft` (27), `numInfo` (39), `magic` / `juggle` (42), `transfer` (54), `robotGo` / `robotTurn` (59), `potato` (65), `bkMove` / `bkArrange` (66).

### The knowledge view

`knowledge(seat)` builds the view field by field (never a copy of `G`):

* `stands[i].slots[k] = {u, cut, v, s, c, tok:[{t,v}], not:[...], x, flip, na}`. `v` / `s` (sort value) / `c` (colour) are `null` unless the seat may see that wire: its own wires except its own flipped ones, every cut or revealed wire, crewmates' flipped wires. Token kinds: `n` true number, `y` yellow, `p` even/odd, `c` count on stand, `f` false ("NOT v"). `not` = values a failed probe proved it is not. `stands[i].side` = tokens beside a stand (`mean:'has'|'none'`).
* `seats[i]`: name, crew card (hidden while face down in 34), tool used, role (hidden in 34 except your own), restriction (`'?'` for others in 34), oxygen, number cards (yours, or everyone's in 65), wire counts.
* Public state: `dial`, `markers` (red/yellow candidate values and how many are in play), `tot`/`cut`/`fin` per value, `valid`, `marks` (= / ≠ tags), `robot` (position and wire count), `pile`, `aside` (counts), `gone`, `eq` (face-down cards without id), `ann` (sweeps, "holds / holds none" announcements, yellow counts, oxygen signals), `hist` (who cut what, hit or miss, each turn), `ms` (each rule's public state), `clock`, `prompt`, `q` (full options only for the question addressed to this seat).
* `legal` (only when it is this seat's action): `{plain, flip, solo, special, other, tools, eq}`, the seat's legal single-wire dual cuts, solo cuts, special actions, other actions, which probes are available, and its equipment moves. Computed from public facts and the seat's own hand only; the hidden-state test checks it.
* `off`: the seat's off-turn job moves (claim, volunteer, ta-da, signal, restriction swap).

### Computer crew and "what we know"

* `aiMove(seat)` returns the seat's move from `knowledge(seat)` only (`decide(K)` is the pure function). `aiStep()` is the driver for AI seats: off-turn shouts, turn claims (10), volunteers (45), then the side to act; it returns `{seat, m}` or `null` when a human must act.
* `whatWeKnow(seat, samples=80)` returns `{slots:[{st, k, owner, possible:[values], prob:{value:p}, certain}], consistent, samples, suggestion:{m, text, why}}`. `possible` is the logical set from sort order and tokens; `prob` comes from sampled full deals; `suggestion` is the hard-level move with a plain-English reason.
* How it decides: `buildModel(K)` lists the unseen wires and where they can be (gaps between known wires on each stand with their sort range, X and flipped slots, the robot, the red pile, the unused out-of-3 wires), with every constraint the seat knows (sort order, every token kind, failed probes, = / ≠ tags, sweeps, holds/none announcements, dealt counts). `sampleDeals()` starts from an earliest-deadline-first deal and runs Metropolis swaps of compatible wires, keeping only deals that break no constraint. Moves are scored by `p(hit) * gain - p(miss) * fuse cost - p(red) * BOOM`, plus job bonuses (order cards, targets, oxygen budget, robot, bunker distance). Certain cuts and solo cuts come first. Equipment use: Rewind when the fuse is low, Recharge, Sticky Note and tags as soon as they help, the Damper before a risky dual cut, a Sweep when nothing is safe, probes when they beat the best single cut, Coffee Break when every option is bad. Levels: **easy** forgets failed probes, sweeps and announcements, samples 16 deals, picks sloppily among near-best options and rarely uses equipment; **normal** samples 60 deals; **hard** samples 140. About 20 ms per decision.
* The AI never communicates except through the rules: tokens, tags, the permitted announcements (Sweep answers, the oxygen thumbs-up, accusations) and its moves.


## Test results (final code)

Run with `node gauntlet.js [from] [to] [seeds] [level] [out.json]`, `node cover.js [seeds] [from] [to] [out.json]`, `node rules-test.js`, `node hidden-test.js [seeds]`; long runs go in the background (see `out/`). `python3 build.py && node --check x.js` passes.

| Suite | Result |
|---|---|
| `gauntlet.js` (normal AI, 4 seeds x every job x every allowed player count) | **1048 games, 554 wins (53%), 0 errors, 0 stalls, 0 invariant failures** (invariants every 10 moves) |
| `cover.js` (mixed AI + random legal play, 2 seeds x every job x every player count, plus forced challenge layouts) | **524 games finished, 9505 moves, 0 errors, 0 invariant failures with `checkInvariants()` after every move; nothing missing** |
| `rules-test.js` | **89 passed, 0 failed** |
| `hidden-test.js` (poisoned state) | 262 games, 4106 poisoned decisions; knowledge differs 0, decision differs 0, what-we-know differs 0; 190s. Control: a peeking chooser was caught in 351 of 392 poisoned checks. **PASS** |
| Debug page (`tools/debugpage.js`, jsdom) | Plays AI games for jobs 1, 38, 42, 66 and a game with a human seat through the page's own buttons; "what we know" panel renders; 0 errors |
| AI calibration (`tools/calib.js`, jobs 4-8) | predicted vs real hit rate: 100% -> 100%, 90-99% -> 98% (pred. 99%), 80-89% -> 84% (pred. 85%); 3 of 1185 decisions used the inexact fallback |

### Win rate by job group and player count (normal AI, final gauntlet)

| Jobs | 2p | 3p | 4p | 5p | all |
|---|---|---|---|---|---|
| 1-3 training | 92% (11/12) | 92% (11/12) | 92% (11/12) | 100% (12/12) | 94% (45/48) |
| 4-8 training | 90% (18/20) | 75% (15/20) | 95% (19/20) | 90% (18/20) | 88% (70/80) |
| 9-19 | 86% (38/44) | 70% (31/44) | 75% (33/44) | 68% (30/44) | 75% (132/176) |
| 20-30 | 80% (35/44) | 64% (28/44) | 70% (31/44) | 52% (23/44) | 66% (117/176) |
| 31-42 | 77% (34/44) | 35% (17/48) | 54% (26/48) | 23% (11/48) | 47% (88/188) |
| 43-54 | 29% (14/48) | 19% (9/48) | 21% (10/48) | 27% (13/48) | 24% (46/192) |
| 55-66 | 41% (18/44) | 25% (12/48) | 29% (14/48) | 25% (12/48) | 30% (56/188) |
| **all 66** | 66% (168/256) | 47% (123/264) | 55% (144/264) | 45% (119/264) | 53% (554/1048) |

Balance reading: training jobs are mostly won (1-3: 94%, 4-8: 88%), the middle boxes drop to 75% / 66% / 47%, and the last two boxes sit near a quarter. That is the intended shape. **Jobs with no win in 16 games: 29, 43, 45, 47, 51, 61, 64, 65, 66** (and 49, 53, 54 won once). I traced several and found no rule bug left. These jobs force a value each turn (45, 47, 51, 65), punish every miss (64: own flipped wires explode, 43: robot dead ends), or give little time (66: bunker objectives at 12 s per headless turn). A human team can also plan around them in ways the AI does not, for example by saving certain cuts for later in 26/47.

### Per job (wins of 16; 12 for jobs 34 and 65, which need 3+ players)

| Job | win | Job | win | Job | win |
|---|---|---|---|---|---|
| 1 | 16/16 | 23 | 12/16 | 45 | 0/16 |
| 2 | 13/16 | 24 | 8/16 | 46 | 15/16 |
| 3 | 16/16 | 25 | 14/16 | 47 | 0/16 |
| 4 | 15/16 | 26 | 11/16 | 48 | 8/16 |
| 5 | 13/16 | 27 | 15/16 | 49 | 1/16 |
| 6 | 14/16 | 28 | 9/16 | 50 | 10/16 |
| 7 | 15/16 | 29 | 0/16 | 51 | 0/16 |
| 8 | 13/16 | 30 | 10/16 | 52 | 5/16 |
| 9 | 10/16 | 31 | 5/16 | 53 | 1/16 |
| 10 | 11/16 | 32 | 8/16 | 54 | 1/16 |
| 11 | 15/16 | 33 | 9/16 | 55 | 8/16 |
| 12 | 14/16 | 34 | 7/12 | 56 | 7/16 |
| 13 | 13/16 | 35 | 7/16 | 57 | 7/16 |
| 14 | 8/16 | 36 | 9/16 | 58 | 9/16 |
| 15 | 11/16 | 37 | 9/16 | 59 | 7/16 |
| 16 | 11/16 | 38 | 10/16 | 60 | 5/16 |
| 17 | 11/16 | 39 | 7/16 | 61 | 0/16 |
| 18 | 15/16 | 40 | 5/16 | 62 | 10/16 |
| 19 | 13/16 | 41 | 5/16 | 63 | 3/16 |
| 20 | 15/16 | 42 | 7/16 | 64 | 0/16 |
| 21 | 10/16 | 43 | 0/16 | 65 | 0/12 |
| 22 | 13/16 | 44 | 5/16 | 66 | 0/16 |

### AI levels (jobs 1-33, same seeds)

| Level | 1-8 | 9-19 | 20-33 | all |
|---|---|---|---|---|
| easy (1 seed) | 24/32 | 24/44 | 15/56 | 48% |
| normal (4 seeds) | 115/128 | 132/176 | 139/224 | 73% |
| hard (1 seed) | 28/32 | 36/44 | 35/56 | 75% |

Hard is only a little stronger than normal; most of its extra samples change little once the deduction is calibrated.

### Bugs the tests found and fixed during the build

* Sampler: bad mixing (moves rated 100% safe hit only 90%), a greedy start that left yellows out of the unused pile, and a periodic two-wire chain. Fixed with compatible-pair swaps, an earliest-deadline-first start, lazy steps and longer burn-in.
* Flipped wires: a move "with my flipped wire" now names which one (`fu`).
* Magician (42): returned wires go back in sorted order.
* An off-turn card can leave the active player with nothing legal: now re-checked after every move.
* Endless loops: an empty number deck in job 45; endless skips in jobs 32 and 41; a permanent Sweep spammed in job 18.
* The round-block counter in jobs 37, 57 and 61 now resets on a real action; the setup "post" hooks run after the draft questions (31).
* The level of each seat was missing from the knowledge view, so every AI played as normal.

### The rule scenarios (`rules-test.js`)

* 2 players: 2 stands each; 3 players: foreman 2, others 1; 4-5 players: 1 each
* dealing is even across stands (difference at most one)
* a two-stand player places only one opening token
* the two stands are one hand: solo cut across both stands
* Sweep answers once per stand for a two-stand player
* Handsets: the incoming wire goes on the stand the outgoing one left
* all four in hand: legal; three in hand with one elsewhere: illegal
* last two after two were cut: legal; two in hand with two uncut elsewhere: illegal
* yellow solo: both yellows in play in one hand
* a dual cut can never be made with a value you do not hold
* one red and one non-match: no explosion, the token goes on the non-red wire, one step burns
* both pointed wires red: explosion
* the Twin Probe never names yellow
* both pointed wires match: the crewmate chooses which one to cut
* the Twin Probe is used once per job
* a red 7.5 is not a 7 for the Sweep
* nobody may name red; yellow is named as "yellow"
* a miss on a yellow wire shows the yellow token
* yellow breaks restrictions A-E and passes F
* the Two-Value Probe may include yellow
* Rewind unlocks the moment the first two 6s are cut and works at once, once
* a miss burns one step; the last step is the explosion; the fuse never exceeds 6
* fuse start: player count; jobs 41/55/60/62 at 1; job 51 one further
* Damper: a miss does not burn and a red does not explode, red gets no token
* instant cards fire on unlock (Hidden Compartment adds two cards)
* equipment needs the FIRST two wires: one cut is not enough
* a crew member with only reds reveals them at the start of their turn
* 9 order cards: the second value is locked until two of the first are cut
* 16 order with side B: all four of the first value first
* 10 free order: after a turn anyone may claim, but not twice in a row
* 10 timer: the clock running out is a loss
* 11 a blue value acts as red: cannot be named, revealed at the end
* 12 covered equipment: needs its own value AND the cover value
* 13 the three reds: no reveal; pointing at all three cuts them; a wrong one explodes
* 14 the rookie (foreman card holder) explodes on a miss and may not use the Damper
* 15 face-down equipment turns up when the shown number value is finished
* 17 the fibber's tokens are false; a miss on the fibber shows the called value
* 17 the fibber may not use equipment
* 18 searchlight: the turned-up value is swept and the chosen player must cut it
* 19 the cheating clock: about 668 s of play; the screen jumps from 10:00 to 5:00
* 20 the last dealt wire is unsorted with an X, and equipment cannot touch it
* 21 / 33 even-odd tokens replace info tokens
* 22 negative opening tokens lie beside the stand for values not held
* 22 first yellow pair: everyone gives a token to the left, placed truthfully
* 23 the shown value goes only by the four-wire action; a burn each round until then
* 24 / 40 count tokens: how many of that value are on the stand
* 26 turn over a face-up number card, then cut exactly that value
* 27 no personal tools; first yellow pair: a token draft
* 28 the foreman has no crew card and fumbles: a miss explodes
* 29 the right neighbour lays a hidden card; cutting that value burns a step
* 30 timed targets: a missed first target burns a step
* 30 the three-value rush locks every other value
* 31 restriction draft; a blocked player turns the card down for good
* 32 shared restriction: the foreman may swap it at the start of each turn; blocked players skip
* 34 the weak link: a correct accusation restores personal tools; a wrong one burns a step
* 35 extra X wires wait until all yellows are cut
* 36 the five-card line: only the arrowed value; the cutter chooses where the arrow goes next
* 37 the shared restriction changes when a value is finished
* 38 only the foreman may cut the flipped wire; a wrong own-flipped cut explodes
* 39 four wires at once; then the rest of the number deck becomes extra tokens
* 41 snare wires: right turns the fuse back, wrong burns a step with a token
* 42 circus: magician returns a pair, tamer moves seats, knife throws cut wires away
* 43 the robot walks after every turn and hands over a wire when its value is cut
* 44 shared oxygen by depth; cannot pay means skip and burn
* 45 volunteers: a false call burns a step; the caller must cut the card value
* 46 the 7s go last, all at once, by a hand of only 7s
* 47 arithmetic: two face-up cards make the value; both are discarded
* 48 three yellows at once; a miss tags every pointed wire and burns one step
* 49 bottle post: pay V oxygen to a crewmate before cutting V
* 50 lights out: tokens lie beside the stand, no validation tokens
* 51 the boss turns up a card and picks who cuts; lacking it costs a token and a step
* 52 every token is false
* 53 the robot is the fuse: +1 after a hit, +2 after a miss, -1 on its own value
* 54 a leak draws a red from the pile into the hand in sorted order
* 55 / 60 challenges: meeting one turns the fuse back
* 55 challenge 1: calling red on a non-red explodes
* 56 cutting a crewmate's flipped wire costs a step even on success
* 57 each validation token switches on its paired restriction
* 58 no tokens; the Twin Probe works every turn
* 59 the robot guide: cut only the value under the robot
* 61 rotate restrictions each round; swap for a random F-L card by burning a step
* 62 a finished meteor value turns the fuse back
* 63 the oxygen bundle passes left after each turn
* 64 two flipped wires: the lower far left, the higher far right
* 38/56/64 own flipped wire: the move names which flipped wire; the right one succeeds, the wrong one explodes
* 38 the foreman cuts a flipped wire with a plain dual cut naming it
* 65 hot potato: only values on your cards; a card is handed on after the turn
* 66 bunker: a cut moves the crew toward a side its value satisfies
* 66 bunker: missing an objective deadline ends the job


## Coverage list (`cover.js`, merged; counts are times each thing fired)

```
cover: 524 games, 524 finished, 9505 moves, 0 errors, 0 invariant failures (checkInvariants after every move)
equipment: eq1=66 eq2=39 eq3=42 eq4=52 eq5=36 eq6=42 eq7=47 eq8=67 eq9=45 eq10=38 eq11=49 eq12=75 eqY=14 eq22=2 eq33=1 eq99=1 eq1010=3 eq1111=1
crew tools: dd=843 sweep=94 handsets=68 pt3=67 pt10=61
crew: ch_captain=359 ch_base1=219 ch_base2=133 ch_base3=89 ch_base4=43 ch_new1=94 ch_new2=68 ch_new3=67 ch_new4=61
restrictions: A=1261 B=1259 C=1163 D=1646 E=889 F=592 G=162 H=14340 I=9882 J=13871 K=1432 L=2
challenges: 1=2 2=2 3=2 4=2 5=2 6=2 7=2 8=2 9=2 10=2
core: dual hit=2944 dual miss=1558 solo cut=868 reveal reds=11 unlock=713 sweep=234 sorted insert=241 probe dd hit=265 probe eq3 hit=27 probe pt3 hit=34 probe eq5 hit=28 probe eq10 hit=20 probe pt10 hit=25
endings: win=12 red wire=61 fuse burnt=406 other boom=44
tokens: n=2814 y=45 p=108 c=106 f=35 n:side=49 side none=71
job rules: gate=1586 freeTurns=2000 timer=8 fakeRed=57344 eqCover=18 redTriple=304 rookie=10 eqDeckReveal=2 liar=13 searchlight=3843 xWire=791 yellowGift=3 special4=1604 speech=1606 declare=3260 yellowDraft=2 butterfingers=21 mindRead=113 bus=489 persCon=688 globCon=144 mole=173 line5=1247 flip=200 tripwire=281 circus=535 robotPatrol=5 oxygen=239093 volunteer=3993 sevens=940 math=50720 yellowTrio=790 memory=50 sir=4176 robotFuse=186 redTide=9 challenges=99 unlimitedDD=8506 robotLine=4057 meteor=3 hotPotato=2124 bunker=426
jobs: 1=8 2=8 3=8 4=8 5=8 6=8 7=8 8=8 9=8 10=8 11=8 12=8 13=8 14=8 15=8 16=8 17=8 18=8 19=8 20=8 21=8 22=8 23=8 24=8 25=8 26=8 27=8 28=8 29=8 30=8 31=8 32=8 33=8 34=6 35=8 36=8 37=8 38=8 39=8 40=8 41=8 42=8 43=8 44=8 45=8 46=8 47=8 48=8 49=8 50=8 51=8 52=8 53=8 54=8 55=8 56=8 57=8 58=8 59=8 60=8 61=8 62=8 63=8 64=8 65=6 66=8
MISSING none
```

`forced` marks a challenge condition shown with a forced layout (random play reaches challenges rarely, since only jobs 55 and 60 use them; the same cards are also rule-tested). Every job rule key has at least one effective hook call.

## Cuts and assumptions

The research `gaps` assumptions are kept as written (dial model start = players / 0 = boom / max 6; deal start at the foreman; instant cards fire on unlock; triple/full-scan red handling; ≠ tag on own wires; Vaporiser redraws yellow or finished values; yellow breaks restrictions A-E and passes F; even/odd jobs use the yellow token on yellow; token counts for X, even/odd, count and oxygen tokens unlimited; Reveal Reds forced; naming an unheld value forbidden; challenge 1 on red = revealed; plus every per-job `gaps` entry in `missions.json`).

**Cut** (details and reasons in `rules-notes-impl.md`):
* Speech rules that have no digital meaning: job 25's "never say a number" penalty and job 30's "mime only" penalty. The oxygen jobs' only allowed signal (thumbs-up) IS implemented, as `{a:'signal'}`.
* Table stunts without game effect: job 42's "boing" and closed eyes (the ta-da check is implemented, with a button), job 54's breath-holding finale.
* Audio tracks: replaced by `G.clock` + on-screen prompts in our own words (`SCRIPTS`); stage 3 adds sound.
* Campaign progression (boxes unlocking): stage 2. The rule stickers' effects are applied by job number.
* The unofficial one-person two-stand variant.

**Assumptions added in code**: 25 items listed in `rules-notes-impl.md`. In short: off-turn cards can be used whenever the game waits (not during a question); no legal action means the bomb goes off unless the job says otherwise; 12 s of play per headless turn in timed jobs; random crew deals always include the foreman card; restrictions I/J apply to the end UNCUT wire; Handsets carry tokens and facts; per-job readings for 22, 29, 30, 42, 43, 45, 47, 54, 59, 61, 63, 65, 66; validMoves lists probe combinations and all-at-once actions partially (legal() accepts all); a no-progress guard (four full rounds) ends a stuck job; job 41's last snare wire with nobody left to point is a loss; flipped-wire moves name the wire, and job 64's left flipped wire is the lower one.

## Known gaps and notes for stage 2

* The knowledge view has no memory: the AI does not remember earlier positions (for example, which slot a magician restored, or where a job-50 token pointed). That is within the rules, and it makes the AI weaker in jobs 42 and 50.
* The AI does not plan ahead across turns (for example, saving certain cuts in jobs 26 and 47), and hard is only slightly stronger than normal.
* Real-time play (jobs 10, 19, 30, 42, 54, 66) is driven by `tick()`. Racing claims between several humans (jobs 10, 45) needs the stage 2/3 UI and online layer.
* `G.log` lines are public-only. A human seat's private information (own hand, own cards, own restriction in job 34) must be read from `knowledge(seat)`, and the UI should render through it to keep hot-seat play honest.


## AI pass 2 (hard level, jobs that were never won)

Changes in `src/ai.js` only: miss/step cost x1.6, probes spent more freely (spend .15, used whenever best single cut < 99.5%), target-information bonus .04 -> .12, and a new public inference in `buildModel`: a missed call proves the caller holds that value among their hidden wires (skipped when the caller already cut that value, or when Handsets / Relay / juggling can move wires). `tools/load.js` honours env `AIFILE` to test an alternative ai.js; `run.sh`, `sum.js`, `tools/an.js`, `tools/pass.js`, `tools/eqs.js` are the measuring helpers (`out2/`).

Hard AI, 10 seeds x every allowed player count (40 games per job, 30 for job 65), same seeds before/after:

| Job | before | after | Job | before | after |
|---|---|---|---|---|---|
| 29 | 5/40 | 8/40 | 61 | 7/40 | 14/40 |
| 43 | 11/40 | 12/40 | 64 | 0/40 | 1/40 |
| 45 | 29/40 | 26/40 | 65 | 2/30 | 2/30 |
| 47 | 1/40 | 1/40 | 66 | 0/40 | 1/40 |
| 51 | 13/40 | 19/40 | | | |

Easy-job check (jobs 20, 24, 31, 38, 44, 52, 56, 60): 137/320 before, 146/320 after. hidden-test PASS. Hard AI about 80 ms per main decision.

Notes: jobs 47, 64, 65 are bounded by the fuse (np steps) against 2-3 forced gambles plus skips per game; further gains need new information, not scoring tweaks. Job 66's losses are headless-clock losses (12 s per turn, `turnSec`); the realtime UI clock will be kinder.

### Engine bugs found by AI pass
None found.

## AI pass 3 (red-aware probes after the rules fixes)

`src/ai.js` only. In job 13 (`redTriple`) a Twin/Triple Probe or Full Scan whose selection holds any red explodes, so `probeCands` now scores such a probe as P(a hit and no red in the selection) and charges the boom for P(any red in the selection) (from the sampled deals, i.e. public knowledge only). Job 48/66 three-wire calls (`y3`, `lever`) also charge the boom for a red among the three (a plain miss costs one step). Checked against the other fixed rules: the Sweep model already uses only the non-flipped wires (same list as the engine's `us`), job 39 token offers are already preferred for held values, and the 48 failed call tags every wire so no model change was needed.

Normal AI, 20 seeds x every allowed player count (80 games), same seeds, old vs new ai.js:

| Job | old AI | new AI |
|---|---|---|
| 13 | 45/80 (56%) | 60/80 (75%) |
| 48 | 56/80 (70%) | 59/80 (74%) |
| 38, 39, 5, 20, 31 (10 seeds, 40 games) | 25, 22, 33, 28, 15 | identical |

hidden-test PASS; about 0.5 s per whole game, well under 200 ms per move; 0 errors, stalls, invariant failures.
