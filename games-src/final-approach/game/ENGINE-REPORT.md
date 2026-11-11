# Final Approach engine + AI report

Files (`games-src/final-approach/game/`): `src/data.js` (FA.DATA: tracks, 11 airports, 21 scenarios, modules, abilities; generated from the private research notes by `make-data.js`, original names and text), `src/engine.js` (rules, global `FA`),
`src/ai.js` + `src/aiw.js` (FA.AI, weights file, empty = the hand-set prior), `src/netstrip.js` (online whitelist copy), `tlib.js` (test helper that builds situations by hand), `rules-test.js`, `cover.js`, `gauntlet.js`,
`hidden-test.js`, `net-strip-test.js`. Rules in plain words, with Confirmed / guessed marked: `../rules-notes.md`.

## API
```js
const T = require('./tlib.js'); require('./src/ai.js'); const FA = T.FA;        // browser: data.js layout.js engine.js aiw.js ai.js netstrip.js
G = FA.newGame({scenario:'g1', seed, names:[], ai:[null|'easy'|'normal'|'hard', ...], abil:[ids]})   // seat 0 = Pilot (blue), seat 1 = Co-pilot (orange)
FA.validMoves(G, seat)           // [{t:'say',c} {t:'ready'} {t:'place',d,to,c} {t:'toss',d} {t:'rr'} {t:'rrpick',m:[b,b,b,b]} {t:'antic',d} {t:'adapt',d} {t:'wt',d} {t:'wt2',d} {t:'timeout'}]
FA.performMove(G, move, seat)    // {ok:true} | {ok:false, error}
FA.sideToAct(G) / FA.pending(G)  // next seat / every seat that owes a move now (briefing and reroll answers are simultaneous)
FA.stripView(G, seat)            // what a seat may know: its own dice, everything public; partner dice 0, seed / rng 0, scripted hands gone
FA.checkInvariants(G) -> []      // FA.toText(G, seat) = render_game_to_text; FA.clone / FA.cloneLite
FA.AI.move(G, seat, level, {rand}) -> a legal move; FA.AI.say(G, seat) -> up to two briefing phrases (public information only)
```
`d` is the die index 0-3 (or `'p'` for the pending trainee token / cross-check die), `c` the coffee change (-3..3). State is one JSON object with its own seeded RNG; pending questions are `{h, d}` (`G.pend`). Save/load is `JSON.stringify(G)`.

## Rules covered
Seven rounds on the altitude track, first player per row, reroll tokens by side, 4 + 4 dice rolled behind screens, alternating placement (a player with no dice left is skipped), axis +-3 spin, engines against the two markers, landing gear / flaps (orders, marker moves), brakes,
radio (pilot 1 slot, co-pilot 2, counting from the plane), concentration and coffee (+-1, never wrapping, max 3), reroll tokens, approach track movement with collision and overshoot checks, short-of-runway crash, final-round landing checks
(planes, gear, flaps, axis, speed against brakes, trainee, ice track), every module (traffic die, corridor turns / tabs, kerosene, kerosene leak, wind dial, trainee, ice brakes, real-time) and all six ability cards. 21 scenarios (6 green, 7 yellow, 5 red, 3 black) on 11 airports.
`rules-test.js` has 63 tests, one or more per tricky rule (data integrity, setup, every colour and value limit, flaps order, engine table, collision / tab / overshoot, radio counting, coffee limits, rerolls, final round, each landing check, traffic die, fuel (+ leak), wind turns,
trainee token cross-check, ice columns, each ability, real-time, toss, hidden information, refused moves, save/restore, scripted guided flight).

## AI
* **Fair.** Every decision starts from `FA.stripView(G, seat)`: own dice + public state only. `hidden-test.js` poisons everything the seat cannot see and checks that the legal moves and the choice of easy / normal / hard are identical.
* **easy:** a beginner partner: the greedy best move on the cost model below (no search), 12 % of the time the second best when it is within one nat of the best (never a clear disaster), uses the free actions (rerolls, abilities) only 60 % of the time, no briefing talk.
* **normal:** every candidate is applied to a light copy of the real engine and the resulting state is judged by a "nats of failure" model (minus log of the probability that a task still succeeds): schedule (can the remaining rounds still deliver the exact distance at the engine thresholds the
  markers will have), planes to clear, gear / flaps / brakes (binomial models of the dice still to come), dice budget of each seat, axis balance, fuel (normal approximation + a linear "units burnt this round" term), trainee, ice columns (a half-done column is credited by the chance
  the other half arrives this round), coffee / reroll tokens, and the expected cost of the half-finished axis / engine pair (own dice known, partner's k dice unknown, uniform d6). On top, a small Monte Carlo (`FA.AI.NMC`): the top 3 candidates are each played to the end of the round in
  3 sampled worlds (partner's unknown dice drawn at random, everybody continues with the greedy policy) and the best average cost is played. Weights are the hand-set prior `W0` (a logistic fit `fit.py` and an SPSA search `tune.js` were tried and did not beat it; kept in `data/experiments/`).
  The Monte Carlo is what separates normal from the greedy policy (green band 37 % -> 51 %).
* **hard:** the same with 6 candidates and 12 sampled worlds (`FA.AI.HMC`). Measured, it is not distinguishable from normal (see `TEST-RESULTS.md`); it just searches more.
* Briefing: the computer says up to two public worries (planes ahead, gear / flaps / brakes still to do, fuel, trainee, wind) and presses Roll.

## Hidden information
`stripView` (engine), `netStrip` (wire), the DOM (`#pz .die` shows `?` for the other crew member; hot-seat shows no value while nobody holds the device) and the painted layer (reads the DOM) are all covered by tests: `hidden-test.js`, `net-strip-test.js`, `click.js`, `px-test.js`, `p2p-fa.js`.

## Results of the last runs
`TEST-RESULTS.md` (every test with numbers, and the per-airport landing rate of two computer crew members at easy / normal / hard). `node gauntlet.js <ids|all|green|yellow|red|black> <easy|normal|hard|all> <games> <seed0> [--abil] [--nmc=top,samples] [--hmc=top,samples]` reproduces it (`--abil` fixes the ability cards to two of the six, default draws them at random).

Tools kept for the AI work: `trace.js` (print a game), `train.js` / `fit.py` (self-play data and logistic fit), `evalw.js` / `tune.js` (SPSA search), `guided-search.js` (found the scripted hands of the guided first flight).
