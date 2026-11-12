# Tutorial coverage: guided first race (W496)

One real race on the Practice Loop (30 spaces, 1 lap, you + Kit Marlow + Juno Vega, real engine), 7 rounds, 39 steps.
Every step is one sentence of 12 words or fewer and one highlighted tap. Hands, deck tops, rival cards and spaces are stacked per round
(`TUT_CH` in `src/tutor.js`) so every rule really happens: you burn heat, spin out, stall, cool down, slipstream, discard and boost.
Then the end card starts a real race. No "learn later" list. `tut-test.js` walks it by touch at 390x844 and 375x667, checks every rule
below appears in this order, and that the spin out, stall, slipstream and boost really happened (car stats).

| # | Rule (TUT_RULES id) | Round | How it is taught |
|---|---|---|---|
| 1 | goal | 1 | info: one lap, first over the line |
| 2 | gear = cards played | 1 | tap gear 2 |
| 3 | cards add up to speed | 1 | tap the 3, tap the 2 |
| 4 | everyone reveals at once | 1 | tap Go |
| 5 | cars move one by one, leader first | 2 | info after watching round 1 |
| 6 | adrenaline (+1 speed, +1 cooldown) | 2 | you started last and got it in round 1 |
| 7 | two cars per space | 2 | info |
| 8 | corner speed limit | 2 | info, limit-5 corner ahead |
| 9 | engine heat | 2 | info on the engine meter |
| 10 | over the limit burns heat | 2 | play 4+4 = 8 into the limit 5: burn 3 |
| 11 | spin out | 3 | play 4+4 into the limit-4 corner with 3 heat: real spin out |
| 12 | heat cards are dead | 4 | your hand is 6 heat cards |
| 13 | stall | 4 | gear 2 with one playable card, Go: real stall |
| 14 | cooldown | 5 | stay in gear 1: 4 heat back (with adrenaline) |
| 15 | stress card | 5 | play it: it flips a 2 |
| 16 | shifting two gears costs 1 heat | 6 | tap gear 3 from gear 1 |
| 17 | slipstream | 6 | land beside Juno, tap Slipstream |
| 18 | discard step | 6 | right after moving: throw away a 3, draw back to 7 |
| 19 | boost (after the reveal) | 7 | cards shown, then tap Boost: +3 |
| 20 | finish, race runs until all finish | 7 | you cross the line and win |
