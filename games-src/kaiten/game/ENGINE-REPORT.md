# Kaiten Kitchen engine + AI report

Files (`games-src/kaiten/game/`): `src/data.js` (KK.DATA: 12 card types, names, rules text), `src/engine.js` (rules, global `KK`), `src/ai.js` (KK.AI), `src/netstrip.js` (online whitelist view),
`tlib.js` (test helper, builds states by hand), `rules-test.js`, `cover.js`, `gauntlet.js`, `hidden-test.js`, `net-strip-test.js`.

## API
```js
const KK = require('./src/engine.js'); require('./src/ai.js');   // browser: data.js, engine.js, ai.js (+ netstrip.js) -> globals KK, netStrip
G = KK.newGame({players:2..5, seed, names:[], ai:[null|'easy'|'normal'|'hard', ...]})
KK.moves(G, seat)        // [{pick:[i] | [i,j], ids:[cardIds], label}]  (indexes into G.players[seat].hand; [] if the seat already picked / game over)
KK.apply(G, seat, {pick:[i]|[i,j]})  // {ok:true}|{ok:false,error}. Stores the hidden pick; when every seat has picked: reveal, resolve, pass, (score, redeal | game end)
KK.pending(G)            // seats that still have to pick
KK.stripView(G, seat)    // one seat's view (seat -1 = watcher): own hand + own pick only, deck/rng/seed hidden, others' hands -1, others' pick [-1]
netStrip(G, seat)        // whitelist copy for the wire (src/netstrip.js, needs global KK)
KK.score(G)              // {cats, rounds:[{round, seats:[{maki,tempura,sashimi,dumpling,nigiri,wasabi,total,icons,table}]}], current (provisional, this round), pudding:{counts,pts,final}, banked, totals, live, over, winner, winners}
KK.AI.choose(G, seat, level?, {units?, top?}) -> a move from KK.moves ; KK.AI.step(G, seat) ; KK.AI.stepAll(G) (every undecided AI seat picks)
KK.checkInvariants(G) -> [] ; KK.cardKey(id) / cardName(id) / cardType(id) ; KK.DATA.types ; KK.HAND ; KK.makiPoints(icons[]) ; KK.puddingPoints(counts, np)
```
Cards are instance ids 0..107 in the order of `KK.DATA.types` (tempura 14, sashimi 14, dumpling 14, roll2 12, roll3 8, roll1 6, salmon 10, squid 5, egg 5, wasabi 6, chop 4, pudding 10).
State: `G.round` (1-3), `G.turn` (1..hand size), `G.hand` (hand size), `G.phase` ('pick'|'over'), `G.players[i] = {seat,name,ai,hand,table:[{id,w}],pud:[ids],pick,picked,mem}`.
`w` on a nigiri = id of the Fire Paste it sits on (-1 none). `picked` is public; `pick` and `mem` are private. `G.hist` = public record of this round's reveals `[{turn, picks:[{seat,ids,chop}]}]`,
`G.rs` = banked round scores, `G.discard`, `G.final = {pudding, puddingPts, totals}`, `G.winner` (seat, -1 when still shared), `G.winners`, `G.winText`, `G.used` (rule counters).
Hands pass to seat (i+1)%np ("left"). Each apply replaces `G.events` with the events of that call.

Events (`G.events`, each has `n`): `{t:'picked',seat}` (no card info) | `{t:'reveal',round,turn,picks:[{seat,cards:[{id,key,w}],chop}]}` (`chop` = id of the sticks sent back to the hand, -1 if not used; cards are in placement order) |
`{t:'pass',round,turn,dir:1,sizes:[..]}` (seat i hand -> seat i+1) | `{t:'score',round,seats:[{seat,maki,tempura,sashimi,dumpling,nigiri,wasabi,total,icons,table}]}` (`wasabi` = the extra points from Fire Paste; `nigiri` = base values) |
`{t:'deal',round,size}` | `{t:'gameEnd',pudding,puddingPts,totals,winners,text}`. Order inside one apply: picked.., reveal, pass | score, deal | gameEnd.
Log (`G.log`): `{i, round, turn, t}` readable text, written only at reveal/score time (never before).

## Rule decisions (not spelled out in PLAN.md)
1. Double pick `[i,j]`: placement order is automatic (Fire Paste first, then nigiri best first, then the rest), which is always at least as good for the player. The sticks removed from the table are put into that seat's hand after the two cards leave it. Taking the other sticks as one of the two cards is allowed.
2. Fewest-pudding penalty is split among tied players with the magnitude rounded down (6/3 = -2, 6/4 = -1). Most: 6 split, rounded down.
3. Puddings stay in the deck for 2 players as well (only the penalty is dropped). The deck is never reshuffled; 5 players use 105 of 108 cards.
4. Game tie: more puddings wins; if still tied the win is shared (`G.winner = -1`, `G.winners` lists both).

## AI
* easy: greedy with noise (+-1.5 per card, 15% random card, rarely uses sticks). normal: marginal expected points per card using Poisson expectations of how many more copies it will see (unseen cards, hand sizes, turns left, contest factor), maki and pudding races over 5 rival scenarios, Fire Paste vs future nigiri, sticks option value.
* hard: determinized Monte Carlo: top 4 normal candidates (singles and sticks pairs), each rolled out to the end of the round in sampled worlds with normal policies for everybody. Hands this seat has held and passed on are reconstructed exactly (own memory `mem` + public `hist`), other hidden hands are dealt from the unseen pool. Result = round score gap + (last round) real pudding points / (earlier rounds) pudding scenarios.
* All levels read only public data plus the seat's own hand/mem (hidden-test.js proves it with poisoned states); randomness is seeded from that data, so the same view gives the same decision.

## Test numbers (node 22)
| Test | Result |
|---|---|
| `node rules-test.js` | 90 tests, 90 pass |
| `node cover.js 300` | 300 games (2-5p, easy/normal/hard/random mixes), 25,650 applies, invariants after each, 0 problems; 38/38 required items fired (every card type, sticks, paste, all scoring rules, pudding cases, tie-break) |
| `node hidden-test.js 40` | 40 games, 1137 view checks: 0 leaks, 0 view/move/AI differences (poisoned and stripped views, all levels), 0 pre-reveal log/event leaks; cheating control chooser caught 745/1137 |
| `node net-strip-test.js 20` | 2870 stripped views, 0 problems |
| gauntlet normal vs normal | 1500 games per player count, 0 errors, 0 stalls. 2p seats 50.6/49.4%, 3p 32.6/34.0/33.3, 4p 26.6/25.3/23.6/24.4, 5p 20.5/20.9/19.4/20.1/19.1 (ties counted fractionally) |
| average score per seat (normal) | 2p 52.6, 3p 42.5, 4p 35.3, 5p 29.4 |
| normal vs easy (500 games each) | normal wins 95% of 2p games; per seat 3p 56% vs 5%, 4p 47% vs 3%, 5p 36% vs 3% |
| hard vs normal (100 games each, seats rotate) | 2p hard wins 99%; per-seat win rate 3p 48% vs 15% (fair share 33), 4p 37% vs 14% (25), 5p 28% vs 11% (20) |
| AI time (single process, hard) | avg 12 ms, max 57 / 72 / 116 / 90 ms (2/3/4/5p, 8 games each); normal/easy < 1 ms (max a few ms) |

Run: `node gauntlet.js N [players] [levelA] [levelB] [seed]` (`AIP='{"hardWorlds":400}'` overrides AI knobs, `--used` prints rule counters).

## Uncertain / honest notes
* 2p average (52.6) is a bit above the 30-50 target and 5p (29.4) a bit below; the rules are as specified, so this is the AIs picking efficiently (easy scores 44 in 2p). Totals are in the expected range for 3p/4p.
* Hard's tail time depends on the machine: under 4 parallel processes a 5p decision hit 436 ms once. Worlds are fixed by `P.hardWorlds` (deterministic by design, not by wall clock); lower it for slow phones (strength was the same at 250 and 450 in tests).
* `tlib.js` is an extra helper file created for the tests.
* Not tested: any UI, real networks, human play. `G.log` and `G.events` are public text only.
