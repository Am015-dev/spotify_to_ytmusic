# Cauldron Fair: rules notes (own words)

A push-your-luck bag-building game for 2 to 4 potion-makers at a village fair, 9 rounds. These notes are
what the engine implements. Real-game names live only in the private research folder
(`game-night-private/cauldron-fair-research/`); here everything uses our own names.

Sources used: the publisher's English rules (an early draft), the final English rulebook text, the final
ingredient almanac text (all four book sets), a fan tool that transcribed the cauldron track "from the physical
board" and all 24 fortune cards, and two pictures in the official PDF that show the rat tails on the scoring
track. BoardGameGeek itself refused every fetch (403), so no thread could be read directly; every number
below was cross-checked against at least two of the other sources or against a worked example in the rulebook.

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

## The track (confirmed, see sources.md)

54 spaces, index 0 to 53 (index 0 is where the droplet starts). Index 53 is the spoon. Chips can sit on
indexes 1 to 52; a chip that would go past 52 stays on 52.

| idx | coins | VP | ruby | idx | coins | VP | ruby | idx | coins | VP | ruby |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 0 | 0 | | 18 | 16 | 4 | | 36 | 25 | 9 | ruby |
| 1 | 1 | 0 | | 19 | 17 | 4 | | 37 | 26 | 9 | |
| 2 | 2 | 0 | | 20 | 17 | 4 | ruby | 38 | 26 | 10 | |
| 3 | 3 | 0 | | 21 | 18 | 4 | | 39 | 27 | 10 | |
| 4 | 4 | 0 | | 22 | 18 | 5 | | 40 | 27 | 10 | ruby |
| 5 | 5 | 0 | ruby | 23 | 19 | 5 | | 41 | 28 | 11 | |
| 6 | 6 | 1 | | 24 | 19 | 5 | ruby | 42 | 28 | 11 | ruby |
| 7 | 7 | 1 | | 25 | 20 | 5 | | 43 | 29 | 11 | |
| 8 | 8 | 1 | | 26 | 20 | 6 | | 44 | 29 | 12 | |
| 9 | 9 | 1 | ruby | 27 | 21 | 6 | | 45 | 30 | 12 | |
| 10 | 10 | 2 | | 28 | 21 | 6 | ruby | 46 | 30 | 12 | ruby |
| 11 | 11 | 2 | | 29 | 22 | 7 | | 47 | 31 | 12 | |
| 12 | 12 | 2 | | 30 | 22 | 7 | ruby | 48 | 31 | 13 | |
| 13 | 13 | 2 | ruby | 31 | 23 | 7 | | 49 | 32 | 13 | |
| 14 | 14 | 3 | | 32 | 23 | 8 | | 50 | 32 | 13 | ruby |
| 15 | 15 | 3 | | 33 | 24 | 8 | | 51 | 33 | 14 | |
| 16 | 15 | 3 | ruby | 34 | 24 | 8 | ruby | 52 | 33 | 14 | ruby |
| 17 | 16 | 3 | | 35 | 25 | 9 | | 53 | 35 | 15 | (spoon) |

## Ingredient books (costs for a 1-chip / 2-chip / 4-chip)

Orange (Marrow): 3 for the 1-chip. No power. Black (Cinder Moth): 10, power below.

| Colour | Set 1 | Set 2 | Set 3 | Set 4 |
|---|---|---|---|---|
| Green (Mossback) | 4/8/14 | 6/11/18 | 6/11/18 (early draft says 21 for the 4-chip) | 4/8/14 |
| Blue (Wren Feather) | 5/10/19 | 5/10/19 | 4/8/14 | 5/10/20 |
| Red (Scarlet Cap) | 6/10/16 | 4/8/14 | 5/9/15 | 7/11/17 |
| Yellow (Sunroot) | 8/12/18 | 9/13/19 | 8/12/18 | 8/12/18 |
| Purple (Dusk Sigh) | 9 | 12 | 10 | 11 |

Powers by set (our wording is in `src/data.js`; this is the logic):

* **Green** (end of brew). S1: 1 ruby for each green chip that is the last or second-to-last chip. S2: for each
  such green: a 1 gives an orange 1, a 2 gives a blue 1 or a red 1, a 4 gives a yellow 1 or a purple 1 (only books
  that are out). S3: if your whites total exactly 7, add all green chip numbers and move your last chip forward
  that many spaces (this changes the scoring space; it happens after the die and before rubies). S4: pay 1 ruby
  per such green to move the droplet one space.
* **Blue** (when drawn). S1: take as many extra chips from the bag as the blue chip's number (1/2/4); you may
  place one of them as your next chip (its power works at once), the rest go back. S2: for the next n chips
  after a blue n (1/2/4) an explosion still lets you score VP and shop, but there is no die; covers do not add,
  the longest remaining cover counts. S3: placed on a ruby space: 1 ruby. S4: placed on a ruby space: VP equal
  to its number.
* **Red** (when drawn). S1: moves 1 extra space if there are 1-2 orange chips in the cauldron, 2 extra with 3+.
  S2: set beside the cauldron; after you stop (even exploded) you may place it after your last chip (it moves by
  its number), or keep it beside the cauldron for a later round, or return it to the bag at any time. S3: if the
  chip just before it is white, add that white chip's number to its move. S4: once a red chip is in the cauldron
  every later white 1 moves 2 spaces (it still counts 1 towards the explosion).
* **Yellow** (when drawn). S1: if drawn right after a white chip you may put that white chip back in the bag
  (the space stays empty). S2: the next chip you place moves twice its number. S3: the first yellow raises
  the explosion limit to 8, three yellows raise it to 9. S4: the 1st yellow in the cauldron moves 1 extra, the
  2nd 2 extra, the 3rd 3 extra, further ones none.
* **Purple** (end of brew). S1: 1 purple = 1 VP; 2 = 1 VP + ruby; 3 or more = 2 VP + droplet; a lower reward may be
  taken. S2: hand in purple chips: 1 gives black 1 + 1 VP + ruby; 2 give green 1 + blue 2 + 3 VP + droplet;
  3 give yellow 4 + 6 VP + ruby + 2 droplet steps (4 purples cannot do the 2-reward twice; fewer may be handed
  in). S3: each purple scores VP by its space: 0-9: 0, 10-19: 1, 20-29: 2, 30+: 3. S4: 1 purple: swap a 1-chip of
  the cauldron for the 2-chip of the same colour; 2 purples: a 2-chip for a 4-chip; 3+: a 1-chip for a 4-chip
  (the new chip goes straight into the bag; lower options allowed).
* **Black** (end of brew), 2 players: same number of black chips as the opponent = droplet, more = droplet + ruby.
  3-4 players: more black than the left neighbour **or** the right neighbour = droplet; more than **both** =
  droplet + ruby.

## The 24 fortune cards (blue = whole round, purple = immediately)

Blue (11): Lucky Seven (whites exactly 7 when you stop: droplet), Spilled Brew (if you explode, your left
neighbour takes any 2-chip), Do-Over (after your first 5 chips you may tip everything back and start again, once),
Twice Rolled (whoever rolls the bonus die rolls it twice), Thick Skin (explosion limit 9), Marrow Fair (orange
chips move 1 extra), Peek and Pick (if you stop without exploding, draw up to 5 and place one), Ruby Glint
(scoring space with a ruby: +2 VP, even if exploded), Spring Water (all flasks refill free at the end), Frothing Pot
(you may put the first white chip you draw back), Red Spark (scoring space with a ruby: +1 extra ruby).

Purple (13): Pedlar's Pick (black chip, or any 2-chip, or 3 rubies), A Little Slide (droplet), Swap Stall (may trade 1
ruby for any 1-chip except purple and black), Kind Alms (fewest rubies take 1), Underdog Gift (fewest VP take a green 1),
Clear the Pods (4 VP or remove one white 1 from your bag), Rat Swarm (count rat tails again, move the rat stone that
many extra), Lucky Dip (all draw 5 chips, lowest total takes a blue 2, the others a ruby, chips go back), Rat Bribe
(move your rat stone back 1-3 and take that many rubies), Rat Bounty (any 4-chip, or 1 VP per rat tail you trail
the leader by), Fork in the Road (droplet 2 spaces, or a purple chip), Fairground Dice (everyone rolls the bonus
die once), Haggler's Hour (draw 4, swap one for the next higher chip of the same colour; if none can, take a green 1).

## Confirmed vs. guessed

**Confirmed** (two or more sources, or a rulebook example): the 9 rounds, start bag, white limit 7, flask, buying
rules (1 or 2 different colours, leftovers lost, limited supply), evaluation order A-F, exploded player picks VP or
shop, the track values (checked against six rulebook example spaces), spoon = 15 VP / 35 coins, droplet and flask
cost 2 rubies, final-round conversions (5 coins or 2 rubies = 1 VP), round 2/3 book reveals and the round-6 white 1,
start player passes clockwise, all costs and texts of all four sets (except green set 3's cost), black chip rules,
tie-break by furthest in the last round, fortune cards as described by the fan transcription (names differ;
effects match what I remember of the box).

**Guessed or interpreted** (all are single constants or small functions in the engine, listed in the report):
1. Bonus die faces: the rules list five outcomes for six faces. We use 1 VP, 1 VP, 2 VP, ruby, droplet, orange (the fan tool's reading: the repeated face is 1 VP). Unverified; check against the physical die.
2. Rat tails beyond the picture (after space 27): assumed to continue after every even number.
3. Rat stone: always moved the full distance (the rules say "can"). An optional "fewer" stepper exists before the
   first draw.
4. A player must draw at least one chip before stopping.
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
* **Expansion 1 (herb witches):** a 5th player, new books (sets 5 and 6), the Locoweed chip, orange 6-chips,
  overflow bowls (half the value of extra chips as VP), 12 witches (4 per type, 3 colours of Witch Penny, each used
  once per game; a leftover penny is 2 VP) with powers per phase, extra fortune cards. Researched from the
  publisher rules and a how-to-play page; reliable enough to build in a later phase, but only after the base game
  is signed off.
* **Expansion 2 (alchemists):** flask board with an essence track, essence cards, patient cards, cauldron
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
