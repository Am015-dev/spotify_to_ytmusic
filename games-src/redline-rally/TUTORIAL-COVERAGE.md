# Tutorial coverage: coached first game "The Sunline Seat" (addendum 4)

A real game (Practice Loop, 30 spaces, 1 lap, you + Kit Marlow + Juno, real AI). Only the very first action is forced (2 spotlight steps: gear 2, then any two cards).
After that: FREE PLAY with every legal choice. Hands are stacked each round (rounds 1-6) and the rivals sit near you, so the situations come up. Coach Mara speaks just-in-time
(`coachSay` in `src/tutor.js`, text in `COACH_TXT`): one bubble at a time, never blocks input, "Got it" dismisses, "Skip" leaves. Good/poor-move lines follow your corner results.
The end: your score walked through rule by rule with your real numbers, then "Things you will meet later" lists every rule that did not come up.
`tut-test.js` plays the coached game with random legal moves by UI taps (phone + PC) and asserts every rule below was explained in game or listed on the later card.

| Rule | Explained when (trigger) | Status |
|---|---|---|
| goal (first over the line) | start, + finish | [x] always |
| gear = cards played | start (forced step 1) | [x] always |
| cards add up to speed | start (forced step 2) | [x] always |
| shift two gears = 1 heat | the moment you select a gear two away | [x] if it happens, else later card |
| corner limit | a corner within 8 spaces | [x] when it comes up |
| burning heat over the limit (+ good/poor line) | preview over the limit, and when you burn or take it clean | [x] when it comes up |
| heat cards are dead | a heat card is in your hand (staged round 4) | [x] |
| stress card | a stress card is in your hand (staged round 4) | [x] |
| cooldown | your cool-down event | [x] if you use gear 1/2 with heat in hand |
| rivals move in turn | first rival turn | [x] always |
| adrenaline | your adrenaline event (rivals staged ahead in round 4) | [x] if you are last |
| slipstream | the slipstream prompt | [x] if offered, else later card |
| boost | you toggle boost / from round 5 with spare heat | [x] |
| finish and order | you cross the line | [x] always |
| spin out | your spin-out; else later card | later card if it did not happen |
| two cars per space | later card | explained, not played |
| too few cards (stall) | later card | explained, not played |
| swap cards (optional discard) | button "Swap cards" on the board (all games); later card | explained, usable now |
| Upgrades mode | later card | explained, not played |
| tie / race goes on until all finish | scoring walkthrough + later card | [x] |
