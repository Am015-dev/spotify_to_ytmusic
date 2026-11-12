# Tutorial coverage (W492): a guided first game, one rule per step

The tutorial is one short scripted game on the real engine (fixed deal, fixed rival choices; Age I has 9 cards, Age II 5, Age III 3).
Every step is one sentence of 12 words or fewer and ONE highlighted tap: either the game action itself (wonder, card, Build / Sell / Wonder,
token, who starts) or Next on a rule you can see on the board. The rival waits while a rule bubble is up. After the score: "Play a real game".
No "learn later" list: every core rule is taught in play order.

| # | Rule | Step id | Tap |
|---|---|---|---|
| 1 | How to win (points after 3 ages, or war / science early) | goal | Next |
| 2 | Wonder draft, round 1: you pick 1, rival 2, last one is yours automatically | draft, draft-last | wonder, Next |
| 3 | Round 2 (4 new wonders): rival first, you take 2, rival gets the last | draft-2, draft-3 | wonder x2 |
| 4 | Pyramid: only uncovered (glowing) cards can be taken | pyramid | card |
| 5 | Build a free card | build-free | Build |
| 6 | A freed face-down card turns face up | flip | Next |
| 7 | Your brown / grey cards pay resource costs | resource, own-resource | card, Build |
| 8 | Shields push the pawn; rival's end = instant military win | shield, military-win | Next x2 |
| 9 | Trading: 2 coins + 1 per rival card making that resource | trade-card, trade | card, Build |
| 10 | Yellow cards give coins | yellow, yellow-build | card, Build |
| 11 | Green cards carry science symbols (missing papyrus bought for 2) | science, science-build | card, Build |
| 12 | End of age: weaker military chooses who starts | next-age | I start |
| 13 | Age II: new cards, same turn rules | age2 | Next |
| 14 | Chains: linked card is free | chain-card, chain | card, Build |
| 15 | Build a wonder with any card (pay its cost, card goes under) | wonder-card, wonder | card, Wonder |
| 16 | Play-again wonder | again | Next |
| 17 | Only 7 of the 8 wonders get built | seven | Next |
| 18 | Science pair: take a progress token | pair-card, pair-build, pair | card, Build, token |
| 19 | Six different science symbols = instant win | science-win | Next |
| 20 | Tied shields: whoever took the last card chooses | tie-start | Next |
| 21 | Age III; token effect (+1 shield) and chain again | age3, loot-build | card, Build |
| 22 | Looting: the pawn crosses a coin space, rival loses coins | loot | Next |
| 23 | Sell (discard): 2 coins + 1 per yellow card | sell-card, sell | card, Sell |
| 24 | Civilian scoring: cards, wonders, tokens, war track, 1 per 3 coins | score | Next |
| 25 | Tie on points: more blue points wins | tie | Finish |

Tests: `node tutorial-script-test.js` plays the fixed deal move by move on the engine and checks each rule really happens (costs, flips,
chain, pair, loot, who chooses) and that every sentence is <= 12 words. `node tutorial-e2e.js 390 844 [shotdir]` (and `375 667`) walks the
tutorial by real touch, tapping only the highlighted element, and checks all 26 rule steps appear in order, the end card starts a real game, 0 errors.
