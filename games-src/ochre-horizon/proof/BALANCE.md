# Ochre Horizon balance proof (24 Nov 2026)

Sim: `node game/sim-balance.js 300 both` (headless, engine + ai only, seeds fixed, 300 games per policy, seat order alternates every game).
Rival = AI level `normal`. "Good player" = scripted: claims milestones at once, plays engine cards in generations 1-3, then the best
score gain per credit spent (standard projects, cards, card actions, heat, plants), funds an award it leads, buys cheap/engine cards.
"Naive" = plays a pseudo-random playable card, converts plants/heat, never claims goals, never evaluates.

## Before / after (300 games each)

| Metric | Target | Before | After |
|---|---|---|---|
| Good player wins vs normal AI | 55-70% | 37.7% (seat 0: 36, seat 1: 39) | **60.7%** (58 / 63) |
| Naive wins vs normal AI | < 30% | 0.3% | **1.0%** |
| Generations per game (good vs AI) | 9-14 | 15.1 (12-20) | **13.8** (11-17) |
| Generations per game (naive vs AI) | 9-14 | 18.3 | 16.1 (a naive player is slow by design) |
| Action decisions per player (good policy) | < 60 | 50.9 | **45.9** (74 incl. setup, buys, placements) |
| Action decisions, rival AI | n/a | 83.4 | 72.3 |
| Game ends by all three globals maxed | n/a | 100% | 100% (no game reached the 40-generation cap) |
| Game ends by another condition | n/a | 0% | 0% |
| Dead states (no legal move except pass/end), good policy | 0 | 0 | 0 |
| Dead states, naive policy | 0 | 7 | 8 (only after the naive script spends everything; pass is always legal, so no softlock) |
| Positions where only "sell cards" + pass exist | info | 6101 | 7998 (late game, hand left, no credits) |
| End rating gap (policy - rival) | info | -1.4 | -7.1 (rival terraforms harder, good player wins on goals) |
| End score gap (policy - rival) | info | -5.0 | +4.6 |
| Milestones claimed per game, policy / rival | info | 1.79 / 1.18 | 2.24 / 0.66 |
| Awards funded per game, policy / rival | info | 0.24 / 2.49 | 0.88 / 1.23 |
| Score gap by part (policy - rival) | info | rating -1.4, milestones +3.0, awards -9.6, greenery +2.3, city +5.5, cards -4.8 | rating -7.1, milestones +7.9, awards -4.0, greenery +1.2, city +8.7, cards -2.1 |

Reading: before, the AI funded 2.5 awards a game (a bug: when its top move was an award it was not allowed to take, it fell through
to the next-best move, which could be another award it was behind on, so it funded awards almost blindly) and spent turns on slow
card value, so games ran 15+ generations. A scripted good player lost 62% of games.

## What changed (src/ai.js only; rules, engine and data.json untouched)

1. Award check: every award the rival is not clearly leading is dropped before it picks its move (was: only the first one). It now funds awards about half as often and mostly when it really leads.
2. Rating weight x4 in the rival's valuation (`TRW`): it terraforms sooner, which shortens games by about 1.3 generations and cuts its decisions per game.
3. Normal-level noise of up to 30 credit-equivalents on each non-pass move (`NOISE`): the rival makes human-sized mistakes, so a good player beats it about 60% of the time. Hints (`suggest`) are noise-free.
4. Tuning knobs for the sim, read from environment variables in node only: `OH_TRW`, `OH_NOISE`, `OH_AWM`, `OH_BUYT`, `OH_PASSOFF`. Defaults are the shipped values.

Tried and dropped: card-buying threshold (`OH_BUYT` 2 to 14: win rate 38 to 27%, no help), pass reserve (`OH_PASSOFF` 4 to 25: no effect), award margin 3 to 5 (made the good player lose more).

## Cards

No change to data/cards.json. Quick Tide (p149), Mirror Tilt Program (p039) and Orchard Fog Engine (p040) are cheap but the targets
were met without touching them; the sim shows no run ending before generation 11, so none of them breaks the game.

## Gates

- `node rules-test.js` (in game/): 64 passed, 0 failed.
- `python3 build.py` (in game/): builds.
- `node gauntlet.js 30 normal hard`: 0 invariant failures, 0 illegal moves.

## Remaining gaps and caveats

- The rival still makes 72 action decisions a game, more than the 60 target applied to a human player. A human with the good-policy pace makes 46.
- Hard level is now about as strong as normal (normal vs hard, 30 games: 14-16) because the rating weight and noise changes were applied to normal only through noise; hard got the weight too. Next step: give hard its own tuning (lower noise is already 0; raise its reserve) or lower normal's weight and keep noise.
- Weak corporation in the gauntlet: c10 won 10% of 10 games, c11 0 of 4 (small samples; not tuned here).
- The good policy is a script, not a person; 60% is a proxy for "a skilled player wins most games".
- Win rates are ±3 points at 300 games (95%).
