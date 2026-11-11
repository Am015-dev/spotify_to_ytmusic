# Hollowbough engine + AI report

Files (all under `games-src/hollowbough/game/`):

| File | What |
|---|---|
| `gen-data.py` | builds `src/data.js` from `../cards.json` (display `name` = `new_name`, `text` = `new_text`) |
| `src/data.js` | `HB.DATA`: 48 cards (128 copies), 11 forest places, 8 basic places, the Haven, 4 Journey spots, 4 basic + 16 special events, solo names |
| `src/engine.js` | rules engine (browser global `HB` and node `require`) |
| `src/ai.js` | computer players `HB.AI` (easy / normal / hard) |
| `tlib.js` | shared test helpers (build states by hand without breaking card conservation) |
| `rules-test.js` | 108 targeted rules tests |
| `gauntlet.js` | AI-vs-AI games, any player count and level mix, solo |
| `cover.js` | forced coverage of every card / place / event / ability, invariants after every apply |
| `hidden-test.js` | hidden-information test (`stripView`, poisoned states, AI never peeks) |

## API

```js
const HB = require('./src/engine.js'); require('./src/ai.js');          // browser: <script> data.js, engine.js, ai.js -> global HB
let G = HB.newGame({ players:[{name:'Ann', ai:null},{name:'Bo', ai:'normal'}], solo:null, seed:42 });
// solo: HB.newGame({ players:[{name:'You'}], solo:{difficulty:1|2|3}, seed })   (1 Grumpy, 2 Gruff, 3 Ghastly; opponent "Old Grimbeard")
HB.actor(G)            // seat that must act now (G.q.who if a decision is pending, else G.cur); -1 when the game is over
HB.moves(G, seat)      // [] unless seat must act. Each move is a small JSON object with a human-readable `label`
HB.apply(G, move)      // {ok:true} or {ok:false, error}; mutates G in place. Pass a move object taken from moves().
HB.AI.choose(G, seat, level?, {budget:ms}?)  // returns one of HB.moves(G, seat); level defaults to G.players[seat].ai
HB.AI.step(G)          // choose + apply for whoever must act
HB.stripView(G, seat)  // what `seat` may see: other hands/deck order/seed/private piles hidden (cards = -1)
HB.score(G, seat)      // {total, cards, tokens, bonus, events, journey, evCount, left, detail:[{card,bonus}]}
HB.grimScore(G)        // solo opponent's score breakdown
HB.checkInvariants(G)  // [] when conservation rules hold (128 cards, no negative resources, city <= 15, workers conserved ...)
HB.cardOf(id) / HB.cardKey(id) / HB.cardName(id)   // card instance id (0..127) -> data / internal key / display name
HB.DATA                // static data: cards, forest, basic, haven, journey, basicEvents, specialEvents, soloName, soloLevels
```

Move shapes (`type`):

* `{type:'worker', k:'basic', i}` / `k:'forest', i` (clearing index) / `k:'haven'` / `k:'journey', i` (0..3 = 5,4,3,2 points) /
  `k:'dest', o:ownerSeat|'G', c:cardId` / `k:'event', e:'b'|'s', i` (index into `G.bev` / `G.sev`).
* `{type:'play', card, from:'hand'|'meadow', how:'pay'|'occupy'|'innkeeper'|'crane'|'dungeon'|'judge', via?}` (`via` = card id of the construction/ability card used).
* `{type:'prepare'}`, `{type:'pass'}`.
* `{type:'choose', i, kind, label, card?, res?}`: answer to the pending decision `G.q = {who, kind, title, opts:[{label,...}]}`. `kind` is one of
  resource, discard, copy, meadow, clear, bazaar, waive, prisoner, judge, ruins, banish, recipient, trigger, production, chip, mole, spend, give, trade,
  teach, stock, pigeon, ranger, inn, queen, cemetery, university, recall, stack, scroll, tuck, cityDisc, clock.

State `G` (plain JSON): `players[]` (`hand`, `city[]` entries `{id,occ,tok,w,stock,pris,pair}`, `res`, `pts` point tokens, `workers`, `lost`, `season` 0..3 =
winter..autumn, `passed`, `dep[]` deployed workers `{k,i,c,o,e,perm}`), `deck`, `discard`, `meadow[8]` (-1 = empty slot), `limbo` (cards being played / revealed),
`forest[]` (location ids in clearing order), `bev[]`/`sev[]` events (`o` = owner seat, -1 free, 'G' = automa; special events carry `tuck`, `stock`),
`grim` (solo automa: `city`, `pts`, `mb` blocked meadow slots, `fi/bi/ji` his workers), `cur`, `turn`, `phase` ('play'|'over'), `q`, `log[]`, `used` (usage counters),
`over` (final scores) when finished.

`internal key` strings (`card.key`) are for code only and are the original game's role names: never show them. Show `name` and `text`.

## Test numbers (node 22, final code)

| Test | Result |
|---|---|
| `node rules-test.js` | 108 tests, 108 pass |
| `node cover.js 200` | 151/151 required items used (48 cards played, 28 card effects, 9 destination visits, 8 purple bonuses, 9 ways to play, 11 forest places, 8 basic places, Haven, 4 Journey spots, 4 basic + 16 special events, 3 season changes, automa roll and Fool); 200 mixed AI/random games (29.5k steps, 1-4 players incl. solo) + forced scenarios = 29.9k applies, invariants checked after every one: 0 problems; dungeon second cell exercised |
| `node hidden-test.js 40` | 40 games, 4521 view checks: 0 leaks, 0 view differences, 0 move/label differences, 0 AI decision differences (easy/normal/hard); the cheating control chooser is caught 988/1478 times |
| gauntlet 2p normal vs normal | 1500 games, 0 errors, 0 stalls; seat 1 wins 51.4% / seat 2 48.6% (3 batches: 48/52, 51.6/48.4, 54.6/45.4); avg 61 actions, avg score 41-42, all games reach autumn |
| gauntlet 3p normal | 1000 games, 0 errors, 0 stalls; seat wins 33.3 / 33.2 / 33.5%; avg 91 actions, avg score 42 |
| gauntlet 4p normal | 1000 games, 0 errors, 0 stalls; seat wins 24.1 / 25.0 / 24.3 / 26.6% (ties counted for none); avg 125 actions, avg score 44 |
| gauntlet solo vs Old Grimbeard, normal AI | 400 games per level, 0 errors, 0 stalls; AI wins L1 46.3%, L2 0.5%, L3 0.3% (his avg score 30.7 / 42.8 / 44.3; AI avg 29) |
| solo, hard AI (60 games per level) | wins L1 40%, L2 5%, L3 1.7% |
| levels | 2p normal vs easy: normal wins 96%; hard vs normal (100 games, seats rotated): hard wins 72% (avg score 48.3 vs 40.7); 3p/4p easy+normal: normal 97% / 50% of 4p seats |
| AI speed | normal 0.7-2.7 ms per decision (max ~380 ms under 3-way CPU load, once); hard avg 16 ms, max 169 ms (budget 220 ms: extra re-deals are skipped when time runs out) |

Run: `node gauntlet.js N [players] [levelA] [levelB] [seed] [--solo 1|2|3]`; batches run in parallel in the background (`xargs -P 3`), each chunk ≤ 500 games per command.
Solo caveat: the automa is exactly as written in `rules-notes.md` (2 points per card he plays, per-year special-event penalty, journey, tokens). Because every card you play also feeds him,
and the bots almost never claim special events, Gruff and Ghastly are essentially unwinnable for the computer players. Tabletop experts do this by claiming events; the AI does not plan for them well. Report this honestly in the UI (e.g. label Gruff/Ghastly "very hard").

## Assumptions added beyond `rules-notes.md`

1. Passing is allowed at any time (the AI only passes in autumn or when every other move is clearly bad). Placing a worker on the Haven needs 2+ cards in hand.
2. Husband/Wife pair automatically with the first unpaired partner when the second card is played (no option to stay unpaired).
3. Toppled Hall (Ruins) must raze a construction other than another Toppled Hall (prevents infinite free-draw loops). It is playable only when such a construction exists.
4. Trailwarden Fox relocates only a non-permanent worker standing on a basic/forest/Haven/destination spot, never one on an event, and never to the same spot.
5. Lost Parchments Unearthed: each of the 5 revealed cards is kept in hand (if room) or tucked (forced when the hand is full); nothing is discarded. Tucked cards (and Commencement critters) are hidden from rivals.
6. Gifts of resources need a rival who has not passed; Quietstone Cloister can only be visited when such a rival (or the automa) exists and you hold 2+ resources; Brother Moss and Grand Market Scheme simply give nothing otherwise; Crook Shrew's payment then goes to the supply.
7. When a card leaves the city, a non-permanent worker standing on it stays deployed (recalled at the next Prepare); permanent workers are lost, except Lorewood College which absorbs them. Lorewood College cannot disband itself.
8. Mossgrave Glade reveals the top 4 cards of the discard pile when you choose "discard"; it can always be visited.
9. Dewdrop Belfry: one token per Prepare, returned to supply, usable on workers standing on basic or forest spots only.
10. Chains of copying (Tinder Chipmunk / Echo Mole) cannot activate the same card twice (infinite-loop guard); a copied Chipmunk re-runs a card in your own city; Echo Mole may copy another Echo Mole once.
11. Chronicle Owl triggers when you plant Mudpie Jester in a rival city (a card was played); Tallyshop Mouse does not (not your city). Solo: your Jester triggers the owl but not the automa roll.
12. Production order is asked only among cards that need decisions; trivial ones (Allotment, mine, ...) resolve automatically first.
13. Meadow Bazaar can play only one of the two cards just taken, with its own 1-resource discount (no stacking); Lantern Rest's discount is its own ability (no occupying through it).
14. Hand-limit rules: draws stop at 8; Slate Schoolmarm needs room for one card.
15. Solo: Old Grimbeard's journey worker sits on the 3/4/5-point Long Road spot for difficulty 1/2/3; "Ghastly" removes one of your workers for good at his autumn Prepare (you end with 5). Meadow slots are numbered 0-7 in `G.meadow`; his workers block slots 0,1,2,3 cumulatively.
16. Supplies of resources, point tokens and occupied tokens are unlimited. Ties: `G.over.tie` is true when rank 1 is still tied after events and leftover resources (winner = first such seat).
17. The base-game names "Haven" and "Journey" are internal keys only; players see "Barter Burrow" and "The Long Road". Basic place names and the solo level names (Grumpy, Gruff, Ghastly) are mine.

## Known gaps

* No undo, no 3-year solo campaign (the three levels are three separate games).
* Hard AI result depends on a wall-clock budget (the number of re-deals); everything else is deterministic for a given state.
* `cards.json` text for Reedpunt Toad says "(Farm-role card)": it mentions an internal role name; displayed text was left exactly as in `new_text`, patch it in `cards.json` and rerun `python3 gen-data.py`.
* AI quality: no explicit multi-turn planning toward special events; solo levels 2-3 beyond the bots (see above); the game shows ~42 points average, comparable to tabletop play but untuned against human play.
* Logs are public text only (no private log lines), so a network UI can ship `G.log` to everyone.
* Not tested here: any UI, real networks, human playtests.

