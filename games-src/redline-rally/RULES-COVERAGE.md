# Redline Rally: rules coverage (found -> built), W424

Sources: rules-notes.md, games-src/rules-check/redline-rally.md (rulebook cross-check). Tests: `node rules-test.js` (23 rule cases + 240 AI games with invariants).

| # | Rule (found in) | Built | Test |
|---|---|---|---|
| 1 | Deck 12 speed (1-4 x3) + 3 stress, engine 6 heat, hand 7, reshuffle (notes, check) | yes (engine newGame/draw) | invariants every step |
| 2 | Gear 1-4 = cards played; start gear 1 (notes) | yes | invariants, planError |
| 3 | Shift one free, two for 1 heat; no 2-step shift with 0 heat (notes) | yes | gear-shift-two-costs-heat |
| 4 | Speed = sum; stress flips to a speed card (notes) | yes | stress-flip-skips-starting-upgrade |
| 5 | Boost once a round, 1 heat, flip to speed, counts for corners (notes) | yes | AI games |
| 6 | Heat cards cannot be played; paid heat goes to the discard (notes) | yes | heat conservation invariant |
| 7 | Cooldown gear 1 = 3, gear 2 = 1, in the React step after the cards are shown (check: SIMPLIFIED -> fixed) | yes, now after the play step | cooldown-in-react-step-after-play |
| 8 | Adrenaline: last car to move (last two with 5+ starting cars), +1 move, +1 cooldown (check) | yes | adrenaline-last-car-2-cars, adrenaline-last-two-with-5-cars |
| 9 | Corner: 1 heat per point over the limit, per corner crossed (notes) | yes | corner-heat-per-point-over |
| 10 | Spin out: pay ALL engine heat, stop behind the corner, gear 1, 1 stress (gear 1-2) or 2 (gear 3-4) (check) | yes | spin-out-stress-count, spin-out-pays-all-heat |
| 11 | Slipstream +2, optional, not speed; none past the finish on the last lap (check) | yes | no-slipstream-past-finish-line |
| 12 | Two cars per space, full space pushes you back (notes) | yes | 3-cars invariant |
| 13 | Too few playable cards: play all, pay heat for the rest, no move, gear 1 (check) | yes | stall-short-hand-no-move |
| 14 | Optional discard before drawing to 7 (check) | yes, "Swap" button | optional-discard-before-draw, discard-refuses-heat-stress |
| 15 | Race goes on until all finish; finishing order (check) | yes | race-continues-until-all-finish, finisher-skipped-in-resolve |
| 16 | End-of-race ties: same round = furthest past the line; same space = first to arrive (notes, check) | yes | finish-tie-same-round-by-distance, finish-tie-same-space-first-arrival |
| 17 | Starting upgrade cards, 3 per car (check: MISSING) | yes, HOUSE VALUES: Brake (speed 0), Burst (speed 5), 1 heat card; setup "Starting upgrades" On by default | starting-upgrades-in-deck, starting-upgrade-values-play |
| 18 | Upgrade draft (notes, own design, optional) | yes (already built), 3 picks, house values | upgrade-count invariant |
| 19 | Weather / road conditions (notes: "left out") | yes, HOUSE RULES (own design): Rain (limits -1, never below 2), Heatwave (start 1 heat down), Tailwind (slipstream 3) | weather-rain-lowers-limits, weather-heatwave-starts-hot, weather-tailwind-slip-3 |
| 20 | Championship (notes: "campaign left out"; story chapters exist) | yes, HOUSE VALUES: 3 tracks, 9-6-4-3-2-1, ties by wins then last race; saved between races | championship-points-and-tiebreak |
| 21 | Lap count per track (check: setting) | setting 1-3 | n/a |
| 22 | Limited stress/heat reserve (check: SIMPLIFIED) | not built, listed as simplified in Help (a cap never binds in a 15-card deck race and would only add bookkeeping) | n/a |
| 23 | Legends module (notes: left out) | not built (the computer drivers already fill every seat) | n/a |

Found 23, built 21, deliberately left 2 (listed in Help as simplified).

Why house values: the booklet text names starting upgrades but gives no numbers; a 0 and a 5 give one brake option for corners and one burst, which keeps the average card near 2.5 and the rules-test round counts unchanged (sunline 2 laps ~16 rounds). Weather and championship numbers are own design, marked "house" in Help.
