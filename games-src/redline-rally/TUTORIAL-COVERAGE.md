# Tutorial coverage: Prologue "The Sunline Seat"

One real game: Practice Loop (30 spaces, 1 lap, corners at space 10 limit 5 and space 15 limit 4), you + Kit Marlow + Juno (real AI), played to the result screen.
Six chapters, one round each (leave and resume: Menu > Guide chapters starts any chapter). Hands, deck tops and rival start spaces are stacked each round (`TUT_CH` in `src/tutor.js`).
Text: `src/story.js` (`STORY.tut`). `tut-test.js` plays all 32 steps by tapping the spotlit elements at 390x763 and 1440x860 and asserts each step id was shown (`tutCoverage()`).

| Rule | Taught by (step id) | Story beat (Mara) | Status |
|---|---|---|---|
| Goal: first over the line wins after the laps | meet, result | "Win one lap and the seat stays yours." / result line | [x] |
| Setup: start gear 1, 7-card hand, 6 engine heat | meet, tray (engine pips + "Engine heat") visible every chapter | meet | [x] shown, not drilled |
| Gear = number of cards played | gear, cards | "Your gear is how many cards you play." | [x] by doing |
| Shift one gear free | gear (gear 1 to 2), gear2 | - | [x] by doing |
| Shift two gears costs 1 heat | gear3 (gear 1 to 3, button shows -1 heat) | "Shifting two gears costs one heat." | [x] by doing |
| Speed = sum of cards, you move that many spaces | cards, go1, watch1 | "Two numbers: the sum is your speed." | [x] by doing |
| Rivals move one by one, leader first | watch1, every chapter (banner "<Rival>'s turn", cards revealed) | "Each drive in turn. That is every round." | [x] seen |
| Corner speed limit, each point over burns 1 heat | corner, push, read | "Every point over burns a heat." | [x] by doing |
| Braking: stay under the limit, no heat lost | brake, go2, watch2 | "Brake instead." | [x] by doing |
| Paying heat on purpose | gamble, go3, watch3 | "Spend one heat to catch him." | [x] by doing |
| Heat cards are dead in hand (cannot be played) | deadcards | "They cannot be played." | [x] seen |
| Cooldown (gear 1 returns heat cards from hand to engine) | gear1, go4, watch4 | "Gear 1 cools your engine." | [x] by doing |
| Stress card (flip until a speed card shows) | stress, go4 | "A mystery speed." | [x] by doing |
| Adrenaline for the car in last place | adr (you are staged last) | "Free help for the car behind." | [x] seen |
| Slipstream (optional +2 behind or next to a car) | tuck, slip, watch5 | "You are on his bumper!" | [x] by doing (the "No thanks" choice is shown in other chapters: auto-declined with a caption) |
| Boost (1 heat, extra flipped speed card) | finale, boost, go6 | "Boost: one heat for an extra card." | [x] by doing |
| Race end, finishing order by distance, ties by arrival | result | result line | [x] seen |
| Two cars per space, full space pushes you back | - | - | [ ] NOT covered (explained in Rules) |
| Spin out (not enough heat for a corner) | - | - | [ ] NOT covered by doing (the corner chapters warn "would spin you out"); explained in Rules |
| Upgrades mode | - | - | [ ] NOT covered (optional mode; explained in Rules) |
| Rules from the rulebook check (extra stress cards on spin, discard-before-draw, finish handling) | - | - | [ ] pending: engine changes belong to worker W391; Rules drawer states them once merged |
