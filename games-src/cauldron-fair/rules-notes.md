# Cauldron Fair: rules notes (own words)

A push-your-luck bag-building game for 2 to 4 potion-makers at a village fair, 9 rounds. These notes are
what the engine implements. Real-game names live only in the private research folder
(`game-night-private/cauldron-fair-research/`); here everything uses our own names.

Rules reference: the structure (9 rounds, bag building, draw or stop, white-chip limit, shop, rat stone) follows the general
mechanism of the genre. The track tables, ingredient prices and powers, and the 24 fortune cards are OUR OWN design:
different numbers, thresholds and wording, tuned by simulation (see `simc1.js`) to the same overall balance.

## Names

| Role | Our name | Chip colour |
|---|---|---|
| the explosive chip | Fizzpod | white (values 1, 2, 3) |
| the plain filler | Marrow | orange (1) |
| end-of-brew power: rubies and gifts | Mossback | green (1, 2, 4) |
| power when drawn: extra draws and covers | Wren Feather | blue (1, 2, 4) |
| power when drawn: extra movement | Scarlet Cap | red (1, 2, 4) |
| power when drawn: in the shop from round 2 | Sunroot | yellow (1, 2, 4) |
| end-of-brew power: in the shop from round 3 | Dusk Sigh | purple (1) |
| end-of-brew power: the neighbour comparison | Cinder Moth | black (1) |
| Ruby / Droplet / Flask / Rat stone / Bonus die / Fortune teller | same words | |

## Components (box counts, all confirmed by the publisher rules)

* 4 cauldrons (player boards), 4 bags, 4 flasks, 4 droplets, 4 rat stones, 4 scoring markers, a scoring track
  with a round indicator, 24 fortune cards, 20 rubies, the bonus die, 12 ingredient books.
* Chips (215): white 20 x 1, 8 x 2, 4 x 3; orange 22 x 1; green 15 x 1, 8 x 2, 13 x 4; blue 12 x 1, 8 x 2,
  10 x 4; red 12 x 1, 8 x 2, 10 x 4; yellow 13 x 1, 8 x 2, 10 x 4; purple 17 x 1; black 17 x 1.
  Supply is limited: when a chip is gone it cannot be bought. (White 20/8/4 is exactly four starting bags
  plus the round-6 white 1 for four players, a good sign the counts are right.)
* Books: orange and black are always used. The other five colours come in 4 sets (1 = the beginner set).
  Black has one page for 2 players and one for 3 or 4 players.

## Setup

* Each player: cauldron, droplet on space 0, flask full, rat stone off the board, scoring marker on 0, **1 ruby**
  (shown by one rules summary and by the almanac art; the early draft does not mention it, but a second
  source and a fan solver both start with 1 ruby), a bag holding 4 white 1, 2 white 2, 1 white 3, 1 orange 1,
  1 green 1.
* The seer's deck (24 cards) is shuffled and held by the start player. Round marker on 1.
* Books in play: orange, black, and green + blue + red of the chosen set. Yellow joins before round 2 and
  purple before round 3 (so they can be bought from the buying phase of round 2 and round 3).
* Before round 6 every player adds one more white 1 to their bag.

## A round

1. **Fortune card.** The start player turns up the top card. Purple cards happen immediately; blue cards last for
   the round. Options that name yellow or purple chips are only available once that book is out.
2. **Rats (from round 2).** Everyone except the leader counts the rat tails on the scoring track strictly between
   their marker and the leader's marker; the rat stone goes that many spaces past the droplet. Chips are placed
   starting after the rat stone (if it is in play) instead of after the droplet. Tied leaders count as leaders.
   Rat tails hang on the track after every even number (0|1, 2|3, 4|5 ...).
3. **Brewing, everyone at once.** Draw a chip from your bag (never look in it), place it as many spaces after the
   previous chip as its number (empty spaces stay empty). After every chip decide: draw again or stop.
   * Explosion: if the white chips in the cauldron add up to more than 7 the cauldron explodes. The last chip
     still stays, you must stop, chip and fortune powers still work.
   * Flask: if the last chip drawn is white (and did not explode the cauldron) you may flip your flask and put it
     back in the bag; then you may keep drawing. The flask is used once per round until refilled.
   * Chip powers: blue, red, yellow act as soon as they are drawn; green, purple, black act after everyone has
     stopped (phase B). White and orange have none.
   * You must also stop if the bag is empty.
   * In the last round everyone reveals draw or stop together ("Stir!"). Rounds 1-8 may also be simultaneous.
4. **Evaluation.** Your scoring space is the space right after your last chip (a cauldron that exploded still has
   one). Printed on it: coins (big number), victory points (small number) and perhaps a ruby.
   * A. Bonus die: among the players who did **not** explode, the one on the highest coin number rolls (if several
     spaces show the same number the one farthest along counts; players on exactly the same space all roll;
     everyone on the final spoon space rolls). Faces: 1 VP, 2 VP, ruby, droplet one space, an orange chip into the bag.
   * B. Chip powers (green, purple, black) in start-player order.
   * C. Rubies: a ruby on your scoring space gives 1 ruby (exploded or not).
   * D. Victory points on the scoring space. E. Buying with the coins. **An exploded player takes D or E, not both.**
   * E. Buy 1 or 2 chips of **different colours**, price from the books (cost depends on the chip's number),
     leftover coins are lost; bought chips go into the bag together with everything drawn.
   * F. Rubies: 2 rubies move the droplet one space (as often as you like), or 2 rubies refill an empty flask.
   * Reaching the last chip space or beyond: the chip stays on the last space and you score the spoon (15 VP,
     35 coins).
5. Clean-up: all chips back into the bag, rat stones off, deck passes clockwise (new start player), marker moves on.

**End.** Round 9 has no buying: 5 coins give 1 VP, and 2 rubies give 1 VP (as many as you can afford, coins
and rubies converted separately). Most VP wins; tie: who got furthest in the last round; still tied: shared win.

## The track (our own tables)

54 spaces, index 0 to 53 (index 0 is where the droplet starts). Index 53 is the spoon. Chips can sit on
indexes 1 to 52; a chip that would go past 52 stays on 52. Coins, VP and ruby spaces are our own curve (about 34 coins and 15 VP at the spoon, 15 ruby spaces).
 

| idx | coins | VP | ruby | idx | coins | VP | ruby | idx | coins | VP | ruby |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 0 | 0 |  | 18 | 14 | 4 |  | 36 | 24 | 10 |  |
| 1 | 1 | 0 |  | 19 | 15 | 4 | ruby | 37 | 25 | 10 | ruby |
| 2 | 2 | 0 |  | 20 | 15 | 5 |  | 38 | 25 | 10 |  |
| 3 | 3 | 0 |  | 21 | 16 | 5 |  | 39 | 26 | 11 |  |
| 4 | 4 | 0 |  | 22 | 17 | 5 | ruby | 40 | 26 | 11 | ruby |
| 5 | 5 | 0 | ruby | 23 | 17 | 6 |  | 41 | 27 | 11 |  |
| 6 | 6 | 0 |  | 24 | 18 | 6 |  | 42 | 28 | 12 |  |
| 7 | 7 | 1 |  | 25 | 18 | 6 |  | 43 | 28 | 12 |  |
| 8 | 8 | 1 | ruby | 26 | 19 | 7 | ruby | 44 | 29 | 12 | ruby |
| 9 | 9 | 1 |  | 27 | 19 | 7 |  | 45 | 29 | 13 |  |
| 10 | 10 | 2 |  | 28 | 20 | 7 |  | 46 | 30 | 13 |  |
| 11 | 11 | 2 | ruby | 29 | 20 | 8 | ruby | 47 | 30 | 13 | ruby |
| 12 | 11 | 2 |  | 30 | 21 | 8 |  | 48 | 31 | 13 |  |
| 13 | 12 | 3 |  | 31 | 22 | 8 |  | 49 | 31 | 14 | ruby |
| 14 | 12 | 3 |  | 32 | 22 | 8 |  | 50 | 32 | 14 |  |
| 15 | 13 | 3 | ruby | 33 | 23 | 9 | ruby | 51 | 33 | 14 | ruby |
| 16 | 13 | 4 |  | 34 | 23 | 9 |  | 52 | 33 | 15 |  |
| 17 | 14 | 4 |  | 35 | 24 | 9 |  | 53 | 34 | 15 | (spoon) |

## Ingredient books (costs for a 1-chip / 2-chip / 4-chip)

Orange (Marrow): 3 for the 1-chip. No power. Black (Cinder Moth): 9, power below. All prices are our own.

| Colour | Set 1 | Set 2 | Set 3 | Set 4 |
|---|---|---|---|---|
| Green (Mossback) | 4/7/13 | 5/10/17 | 7/11/17 | 3/7/13 |
| Blue (Wren Feather) | 5/9/17 | 6/10/18 | 3/8/13 | 6/10/19 |
| Red (Scarlet Cap) | 5/10/15 | 4/7/13 | 6/9/14 | 6/11/16 |
| Yellow (Sunroot) | 7/12/17 | 8/13/18 | 9/12/17 | 7/11/17 |
| Purple (Dusk Sigh) | 8 | 11 | 9 | 10 |

Powers by set (our wording is in `src/data.js`; this is the logic):

* **Green** (end of brew). S1: 1 ruby for each green chip that is the last or second-to-last chip. S2: for each
  such green: a 1 gives an orange 1, a 2 gives a blue 1 or a red 1, a 4 gives a yellow 1 or a purple 1 (only books
  that are out). S3: if your whites total 5 or 6, add all green chip numbers and move your last chip forward
  that many spaces (this changes the scoring space; it happens after the die and before rubies). S4: pay 1 ruby
  per such green to move the droplet one space.
* **Blue** (when drawn). S1: take as many extra chips from the bag as the blue chip's number (1/2/4); you may
  place one of them as your next chip (its power works at once), the rest go back. S2: for the next n chips
  after a blue n (1/2/4) an explosion still lets you score VP and shop, but there is no die; covers do not add,
  the longest remaining cover counts. S3: placed on a ruby space: 1 ruby. S4: placed on a ruby space: VP equal
  to its number.
* **Red** (when drawn). S1: moves 1 extra space if there is 1 orange chip in the cauldron, 2 extra with 2 or more.
  S2: set beside the cauldron; after you stop (even exploded) you may place it after your last chip (it moves by
  its number), or keep it beside the cauldron for a later round, or return it to the bag at any time. S3: if the
  chip just before it is white, add that white chip's number to its move. S4: once a red chip is in the cauldron
  every later white 1 moves 2 spaces (it still counts 1 towards the explosion).
* **Yellow** (when drawn). S1: if drawn right after a white chip you may put that white chip back in the bag
  (the space stays empty). S2: the next chip you place moves twice its number. S3: the first yellow raises
  the explosion limit to 8, three yellows raise it to 9. S4: the 1st yellow in the cauldron moves 1 extra, the
  2nd to 4th 2 extra, further ones none.
* **Purple** (end of brew). S1: 1 purple = 1 ruby; 2 = 1 VP + droplet; 3 or more = 2 VP + ruby; a lower reward may be
  taken. S2: hand in purple chips: 1 gives red 1 + 2 rubies; 2 give green 2 + red 2 + 2 VP + ruby;
  3 give red 4 + 5 VP + 2 droplet steps (4 purples cannot do the 2-reward twice; fewer may be handed
  in). S3: each purple scores VP by its space: 0-7: 0, 8-17: 1, 18-29: 2, 30+: 3. S4: 1 purple: swap a 1-chip of
  the cauldron for the 2-chip of the same colour; 2 purples: a 2-chip for a 4-chip; 3+: a 1-chip for a 4-chip
  (the new chip goes straight into the bag; lower options allowed).
* **Black** (end of brew), 2 players: same number of black chips as the opponent = droplet, more = droplet + ruby.
  3-4 players: more black than either neighbour = droplet; more than **both** =
  droplet + ruby.

## The 24 fortune cards (our own; blue = whole round, purple = immediately)

Blue (11):
* Lucky Six: Stop with your white chips adding up to exactly 6? Move your droplet one space.
* Tipped Cauldron: If your pot explodes, the player on your right takes any 2-chip.
* Fresh Start: Right after your 4th chip, you may tip them all back and start the day again, once.
* Lucky Roller: Whenever you roll the bonus die today, you also take 1 ruby.
* Sturdy Pot: The white limit is 8 today instead of 7.
* Root Market: Today every orange chip and every green 1-chip moves 1 extra space.
* Quick Look: Stop safely? Draw up to 4 chips and place one of them.
* Ruby Gleam: If your scoring space shows a ruby and your pot did not explode, score 3 points.
* Rain Barrel: At the end of the day every empty flask refills free, unless its owner exploded.
* Second Skim: Today you may put your second white chip back in the bag.
* Ember Spark: If your scoring space shows a ruby, take 2 extra rubies.

Purple (13):
* Pedlar's Pick: Take a black chip, any 2-chip, or 4 rubies.
* Tailwind: Move your droplet forward one space, or two if you are furthest back.
* Ruby Trader: You may pay 1 ruby for any orange, green, blue, red or yellow 1-chip.
* Poor Box: Each player with the fewest rubies takes 2 rubies.
* Helping Hand: Whoever has the fewest points takes a blue 1.
* Clear the Pods: Score 3 points, or take a white 1 out of your bag.
* Rat Parade: If you are behind, count your rat tails and move your rat stone, your head start for being behind, that many spaces plus one.
* Grab Bag: Everyone draws 4 chips, the lowest total takes a red 2 and the others take a ruby, then the chips go back.
* Hush Money: Move your rat stone, your head start for being behind, back up to 2 spaces and take 2 rubies for each space.
* Rat Prize: Take any 4-chip, or score one more point than your rat tails, which count how far you trail the leader.
* Crossroads: Move your droplet one space and take a ruby, or take a purple chip.
* Carnival Dice: Everyone rolls the bonus die once, and whoever has the fewest points rolls it twice.
* Market Haggle: Draw 3 chips and you may upgrade one to the next size, or take a blue 1 if none can, then the chips go back.

## Confirmed vs. guessed

**Fixed structure** (same as the genre mechanism): the 9 rounds, start bag, white limit 7, flask, buying rules (1 or 2 different colours, leftovers lost, limited supply), evaluation order A-F, exploded player picks VP or shop, droplet and flask cost 2 rubies, final-round conversions (5 coins or 2 rubies = 1 VP), round 2/3 book reveals and the round-6 white 1, start player passes clockwise, tie-break by furthest in the last round.

**Our own design** (not taken from any other game): the track tables (coins, VP, ruby spaces), every ingredient price and power threshold, the bonus die faces, and all 24 fortune cards with their numbers and wording. They were tuned with the simulators so the newcomer-vs-easy win rate stays near 58%.

**Guessed or interpreted** (all are single constants or small functions in the engine, listed in the report):
1. Bonus die faces: the rules list five outcomes for six faces. We use our own faces: 1 VP, 2 VP, ruby, ruby, droplet, orange.
2. Rat tails beyond the picture (after space 27): assumed to continue after every even number.
3. Rat stone: always moved the full distance (the rules say "can"). An optional "fewer" stepper exists before the
   first draw.
4. A player must draw at least one chip before stopping (confirmed 8 Nov: the rulebook puts the stop-or-draw choice after each placed chip).
5. Left neighbour = the next seat clockwise (also used for "Spilled Brew").
6. "Any 2-chip / any 4-chip / any 1-chip" fortune picks exclude white; only colours whose book is out are offered. Haggler's Hour only upgrades coloured chips; with none it gives a Mossback 1 (also at 2 or 3 players, where white 2s are in the supply).
7. Twice Rolled: both die results count (the text only says "roll it twice").
8. Limit changes add up: Thick Skin (9) plus Sunroot set 3 (+1 or +2).
9. Yellow set 2 doubles the printed number, extra spaces from other powers are added after doubling.
10. Cinder Moth needs at least one black chip in your cauldron to count as "more or equal".
11. Do-Over is offered only right after the 5th chip and NOT when that chip explodes (fixed after the audit); Frothing Pot only
    right after the first white chip.
12. Ties in the round-9 tie-break use the position of the last chip even for an exploded cauldron.
13. Green set 3 cost 18 for the 4-chip (final almanac text) rather than 21 (early draft).
14. Purple set 3 counts the space of each purple chip (index of the space it sits on, 0 to 52).
15. Start-of-game ruby: 1 per player.
16. The Round 9 choice for an exploded player (VP or coins at 5:1) is made automatically in favour of more VP.

## Not built (listed for later)

* **Test-tube side of the cauldron** (the advanced variant in the base box): a second droplet walks along 12 test
  tubes (ruby, 1 VP, blue 1-chip, ..., black 1-chip as the 5th, ..., yellow 4-chip, 4 VP at the end). Only the
  first three, the fifth and the last two rewards could be confirmed; the rest are unknown, so it is not built.
* **Expansion 1 (the original first expansion):** a 5th player, new books (sets 5 and 6), a new ingredient chip, orange 6-chips,
  overflow bowls (half the value of extra chips as VP), 12 witches (4 per type, 3 colours of witch coin, each used
  once per game; a leftover coin is 2 VP) with powers per phase, extra fortune cards. Researched from the
  publisher rules and a how-to-play page; reliable enough to build in a later phase, but only after the base game
  is signed off.
* **Expansion 2 (the original second expansion):** flask board with an essence track, essence cards, patient cards, cauldron
  variants. Only a third-party summary was found, so it is not reliable yet.

## Audit fixes (round 1 of the rules audit)
* Trade wind (purple set 2): the purple chips handed in (1, 2 or 3 per reward) are discarded to the supply.
* Upgrade sigh (purple set 4) and Trade wind never change the scoring space: it is fixed when the powers start (only the green set 3
  slide moves it).
* Clear the Pods: its 4 points are applied before the rat tails are counted (the rat stone is set after the last answer).
* Second Chances (Do-Over): not offered after an exploding 5th chip.
* Day 9 "Stir!": every cauldron that can still draw secretly commits to draw or stop; when all have committed the choices are
  applied together, start player first. Other days are not held back. The choice is never sent to other seats (only `lock: true`).
* Chip powers may be declined or lowered: Gentle sigh (purple set 1) asks which reward (best, middle, lowest) when 2 or more purples; Lucky-seven moss
  (green set 3) may be declined when sliding would lose the ruby on the scoring space (otherwise the slide is always better and
  automatic). Ruby moss, Cinder Moth and the other automatic powers have no downside.
* Bonus die: see guess 1 (unverified).
