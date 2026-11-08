# Tutorial coverage: guided first race (W496)

One real race on the Practice Loop (30 spaces, 1 lap, you + Kit Marlow + Juno Vega, real engine), 5 rounds, 35 steps.
Every step is one sentence of 12 words or fewer and one highlighted tap. Hands, deck tops, rival cards and spaces are stacked per round
(`TUT_CH` in `src/tutor.js`) so every rule really happens. Then the end card starts a real race. No "learn later" list.
`tut-test.js` walks it by touch at 390x844 and 375x667 and checks that every rule below appears, in this order.

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
| 10 | over the limit burns heat | 2 | play 4+3 = 7 into the limit 5, Go: burn 2 |
| 11 | heat cards are dead | 3 | the 2 burned heat cards are in your hand |
| 12 | stall (only heat cards) | 3 | info |
| 13 | spin out | 3 | info |
| 14 | cooldown | 3 | tap gear 1, then see the heat go back (round 4) |
| 15 | stress card | 3 | play it: it flips a 2 |
| 16 | shifting two gears costs 1 heat | 4 | tap gear 3 from gear 1 |
| 17 | slipstream | 4 | land right behind Kit, tap Slipstream |
| 18 | swap (optional discard) | 5 | Swap, throw away a 1, draw a new card |
| 19 | boost | 5 | tap Boost: +3 |
| 20 | finish, race runs until all finish | 5 | you cross the line and win |
