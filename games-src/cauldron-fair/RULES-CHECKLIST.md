# Cauldron Fair: rules checklist (one numbered line per rule)

Source: the published game this adapts (base box, 2 to 4 players), taken from the publisher's English rulebook as summarised in public
rules summaries, plus knowledge of the ingredient almanac and fortune cards. `rules-notes.md` was used only as a cross-check for the
numbers (track table, costs). Each line is tested by `logic-test.js` (rule id = test id). `[house]` = a reading the published rules leave
open; `[unverified]` = a number no source could confirm (see rules-notes.md "Guessed"). Names are our own.

## A. Setup
**R001** 2, 3 and 4 players each get their own seat with a bag, pot, flask, droplet, rat stone and scoring marker.
**R002** The game lasts exactly 9 rounds (days).
**R003** Every start bag holds 4 white 1, 2 white 2, 1 white 3, 1 orange 1, 1 green 1 (9 chips).
**R004** Every player starts with 0 VP, droplet on space 0, full flask, no rat stone on the board, and 1 ruby.
**R005** The chip box holds 215 chips: W 20x1 8x2 4x3; O 22x1; G 15x1 8x2 13x4; B 12x1 8x2 10x4; R 12x1 8x2 10x4; Y 13x1 8x2 10x4; P 17x1; K 17x1.
**R006** The fortune deck has 24 cards: 11 that last the round (blue) and 13 that happen at once (purple).
**R007** One fortune card is turned up per round and no card repeats within a game.
**R008** Round 1 shop: orange, black, green, blue and red can be bought; yellow and purple cannot.
**R009** From the buying phase of round 2 yellow can be bought; purple still cannot.
**R010** From the buying phase of round 3 purple can be bought too.
**R011** Before round 6 every player adds one white 1 to the bag (supply: one less white 1 per player).
**R012** The start player moves one seat clockwise each round.
**R013** Each of the five book colours (green, blue, red, yellow, purple) can use any set 1 to 4; a random mix picks a set per colour.
**R014** The supply is finite: chips handed out (start bags, shop, gifts) come out of it and the box count never changes.

## B. Track and placing chips
**R015** The coins printed on all 54 spaces (index 0 to 53) match the board.
**R016** The victory points printed on all 54 spaces match the board.
**R017** Ruby spaces are exactly 5, 9, 13, 16, 20, 24, 28, 30, 34, 36, 40, 42, 46, 50, 52.
**R018** Space 53 is the spoon: 35 coins, 15 VP.
**R019** The first chip is placed as many spaces after the droplet as its number.
**R020** Each later chip is placed as many spaces after the previous chip as its number; skipped spaces stay empty.
**R021** A chip that would go past the last chip space (52) stays on 52; the scoring space is then the spoon (53).
**R022** The scoring space is the space right after the last chip (also for an exploded pot).
**R023** Moving the droplet moves the start: with the droplet on 2 a 1-chip sits on 3.
**R024** With the rat stone ahead of the droplet, chips are counted from the rat stone instead.

## C. Brewing
**R025** Chips are drawn at random from the bag (the order changes from game to game and round to round).
**R026** White chips adding to exactly 7 do not explode.
**R027** White chips adding to more than 7 explode the pot.
**R028** Only white chips count towards the explosion.
**R029** The exploding chip stays in the pot (on its space).
**R030** An exploded pot must stop: no more draws.
**R031** After any chip you may draw again or stop.
**R032** You must draw at least one chip before you can stop [house].
**R033** An empty bag forces you to stop.
**R034** Flask: if the last chip drawn is white and did not explode the pot, flip the flask and put that chip back in the bag.
**R035** The flask cannot be used when the last chip is not white.
**R036** The flask cannot be used after an explosion.
**R037** The flask can be used once; it stays empty until refilled.
**R038** After the flask you may keep drawing; the chip put back can come out again; the white total drops by that chip.
**R039** Chips with a "when drawn" power (blue, red, yellow) act the moment they are placed; white and orange have no power.
**R040** Round 9: every player secretly commits to draw or stop and all choices are revealed together ("Stir!").
**R041** Rounds 1 to 8 may be played at the same time (a seat does not wait for others).

## D. Rats (from round 2)
**R042** Round 1 has no rat stones.
**R043** Rat tails hang on the scoring track after every even number; a player behind the leader counts the tails between their marker and the leader's.
**R044** The leader, and everyone tied with the leader, gets 0 rat tails.
**R045** The rat stone goes that many spaces past the droplet (capped at the track end); it is only set up from round 2.
**R046** The rat stone is removed at the end of the round.
**R047** Rat tails are counted from the VP at the start of the round, after the purple card Clear the Pods has been answered.

## E. Evaluation
**R048** Order: bonus die, chip powers, ruby on the scoring space, victory points, buying, rubies.
**R049** The bonus die is rolled by the non-exploded player with the highest coin number on the scoring space.
**R050** If several share that coin number, the one on the furthest space rolls alone.
**R051** Players on exactly the same space all roll.
**R052** An exploded player never rolls the die, even with the best space.
**R053** If everybody exploded nobody rolls.
**R054** Die face 1 VP: +1 VP.
**R055** Die face 2 VP: +2 VP.
**R056** Die face ruby: +1 ruby.
**R057** Die face droplet: droplet +1 space.
**R058** Die face orange: an orange 1 goes into the bag.
**R059** The bonus die has six faces showing five different outcomes [unverified which one repeats].
**R060** Green, purple and black chip powers happen after everybody has stopped, in start-player order.
**R061** A scoring space with a ruby gives 1 ruby, even if the pot exploded.
**R062** A non-exploded player scores the VP of the space and also buys with its coins.
**R063** An exploded player chooses: the VP of the space or the coins to shop, not both.
**R064** Buying: 1 or 2 chips; two chips must be different colours.
**R065** Buying: three chips are refused.
**R066** The price is printed in the book; the total may not exceed the coins; leftover coins are lost.
**R067** A chip whose supply is empty cannot be bought.
**R068** A book that is not out yet cannot be bought; white can never be bought; orange only as a 1.
**R069** Bought chips go into the bag at clean-up and cannot be drawn in the same round.
**R070** Buying happens in start-player order.
**R071** Rubies: 2 rubies move the droplet one space, as often as affordable.
**R072** Rubies: 2 rubies refill an empty flask; a full flask cannot be refilled.
**R073** One ruby alone buys nothing; an odd ruby stays.
**R074** At clean-up every pot chip goes back into the bag, the rat stone leaves, the next round starts with the next start player.
**R075** Exploded with ruby space and VP/coins choice: the ruby is still given (R061) whichever is chosen.

## F. End of the game
**R076** Round 9 has no buying phase.
**R077** After round 9, 5 coins on the scoring space give 1 VP (rounded down) for a player who did not explode.
**R078** In round 9 an exploded player takes either the VP of the space or coins at 5 to 1, not both [house: engine picks the better].
**R079** After round 9, every 2 rubies give 1 VP (rounded down).
**R080** The most VP wins.
**R081** A VP tie goes to the player whose last chip got furthest in round 9.
**R082** If still tied the tied players share the win.
**R083** Droplet and flask spending is not offered in round 9 (rubies turn into VP).

## G. Chip powers by book (cost for the 1 / 2 / 4 chip)
**R084** White chips have no power and cannot be bought; orange 1 has no power and costs 3.
**R085** Black (all games, cost 10), 2 players: equal black count to the rival: droplet +1.
**R086** Black, 2 players: more black than the rival: droplet +1 and 1 ruby.
**R087** Black, 2 players: fewer black than the rival: nothing.
**R088** Black, 3 or 4 players: more than one neighbour (left or right): droplet +1.
**R089** Black, 3 or 4 players: more than both neighbours: droplet +1 and 1 ruby.
**R090** Black, 3 or 4 players: not more than either neighbour: nothing.
**R091** Green set 1 (cost 4/8/14): 1 ruby per green chip that is last or second-to-last.
**R092** Green set 1: a green chip further back gives nothing; two greens in the last two give 2 rubies.
**R093** Green set 2 (cost 6/11/18): each last-two green 1 gives an orange 1, green 2 a blue 1 or red 1 (choice), green 4 a yellow 1 or purple 1 (only books that are out); chips go to the bag.
**R094** Green set 3 (cost 6/11/18): whites exactly 7: add all green numbers in the pot and slide the last chip forward that far.
**R095** Green set 3: no slide when the whites do not total exactly 7.
**R096** Green set 3: the slide happens after the die and before the ruby, VP and coins of the (new) scoring space.
**R097** Green set 4 (cost 4/8/14): per last-two green you may pay 1 ruby to move the droplet 1.
**R098** Blue set 1 (cost 5/10/19): draw as many extra chips as its number, place one of them (with its power) or none; the rest go back.
**R099** Blue set 2 (cost 5/10/19): for the next n chips after it an explosion still scores VP and coins but no die.
**R100** Blue set 2: covers do not add; the longest remaining one counts.
**R101** Blue set 3 (cost 4/8/14): placed on a ruby space: 1 ruby.
**R102** Blue set 4 (cost 5/10/20): placed on a ruby space: VP equal to its number.
**R103** Red set 1 (cost 6/10/16): moves 1 extra with 1 or 2 orange in the pot, 2 extra with 3 or more.
**R104** Red set 2 (cost 4/8/14): set beside the pot; after you stop (even exploded) you may add it after the last chip, keep it for a later round, or return it to the bag.
**R105** Red set 3 (cost 5/9/15): if the previous chip is white, moves extra by that white chip's number.
**R106** Red set 4 (cost 7/11/17): once a red chip is in the pot every later white 1 moves 2 (still counts 1 for the explosion).
**R107** Yellow set 1 (cost 8/12/18): drawn right after a white chip you may put that white chip back in the bag.
**R108** Yellow set 2 (cost 9/13/19): the next chip placed moves twice its number.
**R109** Yellow set 3 (cost 8/12/18): the explosion limit is 8 with one yellow, 9 with three or more.
**R110** Yellow set 4 (cost 8/12/18): 1st yellow in the pot moves 1 extra, 2nd 2 extra, 3rd 3 extra, later none.
**R111** Purple set 1 (cost 9): 1 purple = 1 VP; 2 = 1 VP + ruby; 3 or more = 2 VP + droplet; a lower reward may be taken.
**R112** Purple set 2 (cost 12): hand in 1 purple: black 1 + 1 VP + ruby.
**R113** Purple set 2: hand in 2: green 1 + blue 2 + 3 VP + droplet.
**R114** Purple set 2: hand in 3: yellow 4 + 6 VP + ruby + 2 droplet steps.
**R115** Purple set 3 (cost 10): each purple scores by its space: 0-9: 0, 10-19: 1, 20-29: 2, 30+: 3.
**R116** Purple set 4 (cost 11): 1 purple swaps a 1-chip of the pot for the 2-chip of the same colour.
**R117** Purple set 4: 2 purples swap a 2-chip for the 4-chip of the same colour.
**R118** Purple set 4: 3 or more swap a 1-chip for a 4-chip; the new chip goes into the bag.

## H. Fortune cards
**R119** Lucky Seven (blue): whites exactly 7 at the stop: droplet +1.
**R120** Spilled Brew (blue): if you explode, your left neighbour takes any 2-chip.
**R121** Do-Over (blue): after your 5th chip you may tip everything back and start again, once; not after an exploding 5th chip.
**R122** Twice Rolled (blue): the die is rolled twice and both results count.
**R123** Thick Skin (blue): explosion limit 9.
**R124** Marrow Fair (blue): orange chips move 1 extra.
**R125** Peek and Pick (blue): if you stop without exploding, draw up to 5 and place one.
**R126** Ruby Glint (blue): scoring space with a ruby: +2 VP, even if exploded.
**R127** Spring Water (blue): all flasks refill free at the end of the round.
**R128** Frothing Pot (blue): you may put the first white chip drawn back.
**R129** Red Spark (blue): scoring space with a ruby: 1 extra ruby.
**R130** Pedlar's Pick (purple): black chip, or any 2-chip, or 3 rubies.
**R131** A Little Slide (purple): everyone droplet +1.
**R132** Swap Stall (purple): trade 1 ruby for any 1-chip except purple and black.
**R133** Kind Alms (purple): fewest rubies (ties all) take 1 ruby.
**R134** Underdog Gift (purple): fewest VP (ties all) take a green 1.
**R135** Clear the Pods (purple): 4 VP, or remove a white 1 from the bag.
**R136** Rat Swarm (purple): the rat stone moves by the rat tail count again.
**R137** Lucky Dip (purple): everyone draws 5; the lowest total takes a blue 2, the others a ruby; chips go back.
**R138** Rat Bribe (purple): move the rat stone back 1 to 3 and take that many rubies.
**R139** Rat Bounty (purple): any 4-chip, or 1 VP per rat tail.
**R140** Fork in the Road (purple): droplet +2, or a purple chip.
**R141** Fairground Dice (purple): everyone rolls the die once.
**R142** Haggler's Hour (purple): draw 4, swap one for the next higher chip of its colour; if none can, take a green 1; chips go back.
**R143** Cards naming yellow or purple chips offer them only once those books are out.

## I. Variants shipped in the box
**R144** The advanced cauldron side (test-tube track): a second droplet may walk a test-tube track with its own rewards [not built, rewards unconfirmed].
