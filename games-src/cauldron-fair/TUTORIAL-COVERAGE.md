# Cauldron Fair: tutorial coverage

**UPDATE (addendum 4, round 2: window.GXCOACH exposes running, explained ids and done): the tutorial is now a COACHED FIRST GAME.** No forced taps or spotlight: the player plays the same real two-day game with free choices from turn 1 (fixed seed and stacked bags only make sure cases come up). Granny Hask speaks just-in-time, one bubble at a time, never blocking input, dismissible ("Got it", "Leave tutorial"). Bubble ids (src/turnlayer.js COACH_RULES): goal, fortune, draw, spiral, whites, flask, seven, boom, stopped, rival, report, shop, rubies, day2, lastday, peek, d2count, end. A bubble only shows while its situation is still true; any that did not come up are named on the end card ("Things you'll meet later", with the player's real final numbers). `coach-test.js` plays the game by tapping legal moves through the UI at 390x763 and 1440x860 and asserts every bubble id was either shown or listed on the end card. The step ids in the table below are the old forced-step names, kept as the rule list.

The tutorial ("The Night Before") is ONE real guided game against the real computer (Wynne), cut to two days (day 1 full brew + shop, day 2 the last day) with a fixed seed so each case comes up on cue. Nothing is saved. It cannot cover a 9-day game; the rules that only appear on later days are listed under "Not covered".
Story beat = Granny Hask's line that gives the reason; the step then makes the player do the action. Wording: `src/story-data.js`. The script `tutor-test.js` checks that every step below was shown.

| Rule | Step id(s) | Story beat (short) |
|---|---|---|
| Goal: most victory points after 9 days | goal, end | "Tomorrow the Golden Ladle fair opens... most points wins." / "Tomorrow it is for real." |
| Fortune card, purple (happens now) | fortune | the pedlar owes us rubies |
| Fortune card, blue (all day) | day2 | blue cards last all day: limit is 9 |
| Drawing a chip from the bag | draw1 | reach into your bag |
| Moving along the spiral; the scoring space | spiral | it walked N spaces, the ring is the prize |
| White chips and the limit of 7 | whites, keep | Fizzpods fill the meter |
| The flask puts a white back (once a day) | flask, seven | tip the flask / exactly 7 is safe |
| Push your luck vs stop | push, d2stop | any white now blows the pot |
| Exploding: choose points or coins, no bonus die | choose | your pot went up |
| The bonus die | report | only a safe pot rolls it |
| Scoring the day (coins, points, ruby space) | report, d2report | the fair counts each pot |
| Shop: up to two chips of different colours; leftover coins lost | shops1-3, buy | spend what you earned |
| Chip powers (one per colour; peek and pick in play) | shops1-3, peek | feather whispers a chip |
| Ingredient book unlocks by day (yellow day 2, purple day 3) | shops3 | Sunroot opens day 2, Dusk Sigh day 3 |
| Rubies: droplet step, refill the flask | droplet, refill | two rubies move the droplet |
| Rat stone head start for the trailing player | day2 | the rat stone helps whoever trails |
| Last day: secret simultaneous Draw/Stop, no shop | d2draw, d2report | choose in secret, reveal together |
| Last day: 5 coins = 1 point, 2 rubies = 1 point | d2report | last-day rule |
| End of game and winner | end | win / lose / tie lines |

## Not covered (honest)
- Days 3-9 only rules: purple book (days 3+), black book page for 2 vs 3-4 players, the 24 fortune cards other than the two shown, the bonus die faces other than the one that comes up, tie-break by furthest chip in the last round, bag-empty forced stop, the extra white 1 before round 6.
- Rat tail counting beyond the text of the day-2 step; the "second droplet" variation (not implemented in the engine).
- Resume: leaving half way restarts from step 1 (shared kit); chapters are named in the step titles (Ch 1-4) but are not separately resumable.
