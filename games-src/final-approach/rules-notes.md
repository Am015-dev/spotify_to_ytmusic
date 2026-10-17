# Final Approach: rules notes (own words)

Final Approach is a two-player co-operative dice-placement game about landing an airliner. This file records the rules the engine
implements (`game/src/engine.js`), the numbers in `game/src/data.js`, and what is confirmed or only inferred.
Raw research material (the publisher's booklets, rules-app pages, fan implementations used as cross-checks) is kept in the private
research repository (`final-approach-research/`), never here. Names, text and art in the shipped game are original.

## 1. Roles and components

| Item | Detail |
|---|---|
| Players | exactly 2: the Pilot (blue, left seat) and the Co-pilot (orange, right seat). Both win or lose together. |
| Dice | 4 blue dice (Pilot), 4 orange dice (Co-pilot). Each player rolls behind a screen and sees only their own dice. |
| Control panel | Axis, Engines (speed gauge with two aerodynamics markers), Radio, Landing gear, Flaps, Brakes, Concentration. Optional extras for modules. |
| Approach track | a strip of 5 to 8 spaces. Space 1 is where you start (shown in the "current position" window), the last space is the airport. Planes (up to 12 tokens) sit on spaces. Some spaces carry traffic-die icons and some carry corridor tabs. |
| Altitude track | 7 rows: 6000, 5000 ... 0 feet. One row per round, so 7 rounds. The row says which player goes first and whether it carries a reroll token. Two sides: green/yellow (reroll tokens on 6000 and 2000) and red/black (reroll token on 6000 only). |
| Tokens | 3 coffee tokens, 3 reroll tokens in total, 12 plane tokens, 1 traffic die (faces 2, 3, 3, 4, 4, 5). |
| Modules | trainee (6 tokens valued 1 to 6), fuel track (marker at 20), wind dial, icy-runway brake track, 6 ability cards. |

## 2. A round (7 per game)

1. **Round start** (automatic). The next altitude row is revealed. A reroll token on that row goes into your supply. If the space where
   the plane stands carries traffic-die icons (and the scenario uses traffic), roll the traffic die once per icon: each result `v` puts a plane on the
   space `v - 1` ahead of the plane (the current space counts as 1), no further than the airport space; if no plane token is left nothing is added.
   Spaces you only fly through never trigger a roll.
2. **Briefing.** You may talk strategy ("get that plane out of the way", "we need to move two spaces") but never about dice values or where a die should go.
   When both are done each player rolls their four dice behind their screen. From now on both players are silent until the round ends (in the app: a few
   preset non-dice phrases are allowed before the roll, nothing during placement).
3. **Placement.** The altitude row's first player starts and you alternate, one die per turn, onto a free space of your colour (some spaces take either colour).
   Every effect happens at once. Spaces have value limits. If the other player has no dice left, you keep going alone. If a die has no legal place at all you throw it away as your turn.
4. **End of round.** Both axis spaces and both engine spaces must hold a die, otherwise you lose. Fuel and ice-brake book-keeping happens, then (if it was the last round) the landing is judged.
   Otherwise the altitude moves one row down and all dice come back. Entering the last row without being on the airport space is a crash short of the runway.

## 3. The controls

- **Axis (mandatory, both).** When the second die lands, the plane tilts toward the player with the higher die by the difference. The tilt is cumulative and never resets.
  Equal dice do nothing. Reaching a tilt of 3 either way is a spin: immediate loss. Landing requires a level axis.
- **Engines (mandatory, both).** When the second die lands, speed = the sum of the two dice (plus the wind dial if used). With the two aerodynamics markers
  (blue starts at 4, orange at 8): speed up to the blue value advances 0 spaces, up to the orange value advances 1, above it advances 2. Each landing gear deployed
  moves blue up by 1 (4 to 7 at most), each flap moves orange up by 1 (8 to 12 at most).
  Advancing is done one space at a time: on the space you are leaving, first the corridor tab is checked (if the scenario uses tabs and this space has one, the axis must be in a marked
  position), then collision (any plane token on that space loses), then you step. Stepping beyond the airport is an overshoot: loss. Advancing zero spaces is never checked.
  Arriving at the airport before the last round puts you in a holding pattern: every later engine result must advance 0.
  **Last round:** the plane does not move. Instead the speed must be no greater than the brake value, and the brake value must be at least 2.
- **Radio (optional).** Pilot 1 space, co-pilot 2 spaces, any value. Count that many spaces from the plane (value 1 = the space it stands on) and remove one plane token there if there is one (nothing happens otherwise).
- **Landing gear (optional, Pilot).** Three spaces: values 1-2, 3-4, 5-6, any order. The first time a gear's light turns green the blue marker advances one. Using it again is allowed and does nothing.
- **Flaps (optional, Co-pilot).** Four spaces: 1-2, 2-3, 4-5, 5-6, strictly in this order (a later one needs the earlier ones green). Each first deployment advances the orange marker one.
- **Brakes (optional, Pilot).** Three spaces needing exactly 2, then 4, then 6, in order. The brake value becomes 2, 4, then 6. Brakes only matter in the last round.
- **Concentration (optional, either).** Any die, any value. Take a coffee token (never more than 3 held; if you already hold 3 the die is just spent).
- **Coffee.** When placing any die you may spend any number of coffee tokens, each one adding or subtracting 1 (the result stays within 1 to 6, no wrapping). Either player may spend any token. Unspent tokens stay for later rounds. Trainee tokens cannot be changed.
- **Reroll.** At any time during the placement phase, either player (also off their turn, and also a player who has already placed all four dice) may spend a reroll token while at least one die is unplaced: both players may reroll any of their unplaced dice (including none), once, behind their screens. A player with no unplaced die is not asked. Not during the briefing (nothing is rolled yet) and not while another question (hand-over, trainee token, cross-check die) is open.

## 4. Winning and losing

You win only if, at the end of the last round, all of these hold: no plane token anywhere on the approach track; every landing-gear and flap light is green; the axis is level; the last-round speed
was at most the brake value (brake at least 2); and, if the scenario uses them, the trainee has no tokens left and the icy-runway track is finished.
You lose at once on: a spin (tilt of 3), a missing axis or engine die at the end of a round, a collision, an overshoot, a corridor-tab violation, fuel below 0,
the last row reached while not at the airport, a last-round speed above the brake value, or (against the clock) the timer running out with axis or engines unfinished.

## 5. Modules (all in the box)

- **Busy sky (traffic die)** and **tight corridor (tabs)** are printed on the approach strips, so they depend on the airport, not on the scenario card.
- **Fuel watch.** Marker starts at 20. A single space where either player puts a die of any value: the marker drops by the die value. If nobody used it this round the marker drops by 6 at the end of the round. Below 0: loss.
- **Fuel leak.** The fuel space is not used. When the second engine die lands, burn the difference of the two dice plus 1. Below 0: loss.
- **Tail wind.** A 20-position dial starting at position 10. After the axis resolves every round, advance the dial by the current axis tilt (negative tilts go backwards, it wraps).
  The dial position gives a modifier added to the engine sum in every round, last round included: positions 9-11: +3; 7, 8, 12, 13: +2; 6, 14: +1; 5, 15: 0; 4, 16: -1; 2, 3, 17, 18: -2; 0, 1, 19: -3. It starts at +3.
- **Trainee.** Six tokens valued 1 to 6 in a random row. Each player has a trainee space of their colour. Put a die of any value other than the next token's value there, take the next token from your end of the row, and place it immediately as a die of that value on any legal space
  except Concentration and the trainee spaces (coffee cannot change it). All six must be used by the end of the game or you lose. If the token has no legal space at all (every space it could take is full) it goes back to the end of the row it came from and does not count as trained; the die on the trainee space is spent.
- **Icy runway.** Replaces the brakes: four columns valued 2, 3, 4, 5. Each column has a Pilot-only upper space and a lower space for either player, both needing exactly the column value. Only the next column may be used.
  When both are filled in the same round the brake value becomes that number and the next column opens (several columns may be finished in one round). A lone die in a column is wasted at round end. All four columns must be done by the end, and the last-round speed must not exceed the brake value.
- **Against the clock.** 60-second timer per round that starts after the roll; unplaced dice are ignored when it ends. In the app the timer counts only while someone is deciding.

## 6. Ability cards (a scenario names how many you may take, 0 to 2)

Second look (first player rerolls one die before their first placement each round), Flip side (once per game each player turns one unplaced die to 7 minus its value, at any time, also off their turn),
Twin thrust (equal engine dice: gain a reroll token if one is left in the box), Steady hands (equal axis dice: gain a coffee token if one is left),
Cross-check (once a round, once a gear die and a flap die are down, roll the traffic die; the co-pilot places it as an extra action on any empty space of either colour),
Hand-over (once a round, at any time, either player puts an unplaced die there and the other must too; swap the two values, take the dice back).
`newGame` keeps only known card ids, drops duplicates and keeps at most the scenario's count (0, 1 or 2), so a forged online setup cannot add cards.

## 7. Scenarios in this version

All 21 scenarios of the box over 11 airports, in four difficulty bands: 6 green (routine), 7 yellow (exceptional), 5 red (elite), 3 black (heroic). Track numbers, modules and ability counts are in `game/src/data.js`;
the table in `game/src/data.js` is the single source. Every airport has one or two strips (green/yellow/red/black variants differ in plane layout, traffic icons and corridor tabs).

## 8. Confirmed vs. guessed

**Confirmed against the publisher's booklets and the official rules app (read in full):** player count, roles and colours, dice, 7 rounds, the altitude track rows (6000 to 0) and reroll rows on the green/yellow side,
mandatory axis and engines, tilt maths and the spin, engine thresholds and the marker starts (blue 4, orange 8), marker moves for gear (to 7) and flaps (to 12), radio spaces and counting, brakes 2/4/6 and the last-round speed rule,
coffee rules, reroll rules, the end-of-round order, the last-round and landing conditions, the holding pattern, crash short of the runway, traffic-die rules (including no roll for fly-through spaces and the clamp at the airport),
corridor-tab rule, fuel rules (20, minus 6 when unused, leak formula), wind dial rules, trainee rules, icy-runway rules, real-time rule, the six ability texts, the list and difficulty of all 21 scenarios and which modules each uses,
the tokens in the box (12 planes, 3 coffee, reroll tokens).

**Taken from a second source (a published digital implementation of the same game), compared with a second fan dataset (0 differences over 21 strips) but NOT yet with the printed box strips (the two printed strips we compared earlier were promo airports, not box strips):** every number on the approach strips (planes per space, traffic-die icons, corridor-tab positions),
the red/black altitude side (reroll on 6000 only, first-player order), the landing-gear and flap value pairs, the wind dial's modifier table and starting position, the exact flow of the advance procedure (tab check, then collision, then step),
that kerosene below 0 (not 0) is the loss, that the third reroll token sits in the box (3 in total) and the plane supply is 12 minus those placed at setup. (The earlier claim that two printed strips matched referred to promo airports, not box strips; see item 8 below.)

**Guessed / our rulings (flagged in the UI where relevant):**
1. Trainee token placement is immediate (same turn) rather than "later in the round" (matches the rules app and the digital implementation). A token with nowhere to go returns to its end of the row (fan ruling; very rare).
2. A die with no legal place may be thrown away as the turn (very rare).
3. Reroll, Flip side and Hand-over can be used at any time by either player while no other question is open (fixed in the audit round; earlier builds only allowed them on your own turn). The app waits for the move in progress to finish: a free action never interrupts a die that is half placed.
4. Cross-check (traffic die ability) fires once per round, when the second of (a gear die, a flap die) is down; coffee may modify the extra die.
5. Hand-over uses one die from each player and swaps values; both players learn the two values afterwards, which is natural.
6. The strategy-talk presets are an app invention for online play; the computer crew mate also says what it is worried about (never dice).
7. Against the clock: the app timer pauses on pass-the-device screens and while the computer plays.
8. Space-by-space strip data is complete for the box but was transcribed by someone else; a typo in one space would change one scenario's difficulty. The test `rules-test.js` checks plane totals and shapes. A person with the box should spot-check at least the Grand Crossing green strip (4 traffic icons on space 1), the Castlemoor yellow strip (12 planes) and the corridor tabs on the black Twin Spires and red Bowlrock strips.
9. Last-round speed against the brakes: the booklet says the speed must be "less than" the brake marker, but the marker stands between two numbers (after the 4 it sits between 4 and 5), so it is the same as "no more than the last brake value reached". All texts in the app say "no more than"; the digital implementation agrees.

## 9. Later phase: the 2025 expansion (not built)

Researched only from the digital implementation's data, so only partly reliable: about 20 more scenarios with new airports, and new modules: alarms (six alarm tokens: concentration, brakes, landing gear, flaps, pilot radio, co-pilot radio),
total trust (a round with no briefing), turbulence, bad visibility (two dice set aside), stuck landing gear, penguins on the runway, a shortened altitude track, head-on wind, and engine loss (engine spaces blocked, auto-advance one space).
Each is a flag on top of this engine (`G.mods`), so the expansion is a data and rule-hook job, not a rewrite. Website extras (Ready-to-Play remixes, promo airports) are also later.
