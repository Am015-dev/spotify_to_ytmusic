# Final Approach: rules checklist

Every rule of the original two-player landing game, numbered. Each is checked by exactly one assertion in `game/logic-test.js` (same number) against the real engine.
Run `node game/logic-test.js`. Source column: **R** = in the printed rulebook (high confidence, from the rulebook and public rules summaries); **U** = our ruling or not verifiable against the box.
This file is generated from the test: `node game/logic-test.js --md > RULES-CHECKLIST.md`.


## Setup

| # | Src | Rule |
|---|---|---|
| 1 | R | The game lasts 7 rounds; the altitude track runs 6000, 5000, 4000, 3000, 2000, 1000, 0 ft, one row per round. |
| 2 | R | At setup the plane stands on approach space 1, the axis is level, the aerodynamics markers are blue 4 / orange 8, the brake marker is not yet at 2, no coffee is held. |
| 3 | R | Exactly two players: Pilot (left seat, blue) and Co-pilot (right seat, orange), each with 4 dice. |
| 4 | R | Briefing comes first: nobody can place a die before both crew are ready; dice are rolled only when both are ready, each die showing 1 to 6. |
| 5 | R | The first player of round 1 is the Pilot; first player alternates every round (round 2 Co-pilot, round 3 Pilot, ...). |
| 6 | U | Reroll tokens: the green/yellow altitude side gives one at 6000 ft and one at 2000 ft; the red/black side gives one at 6000 ft only. One token is in hand at the start of round 1. |
| 7 | R | Components: 3 coffee tokens, 3 reroll tokens, 12 plane tokens, a traffic die with faces 2, 3, 3, 4, 4, 5. |
| 8 | R | Players alternate placing one die per turn, starting with the round's first player. |
| 9 | R | A player who has no dice left does not skip the other: the other keeps placing alone. |
| 10 | R | Each die goes on a free space of its owner's colour: Pilot-only, Co-pilot-only and shared spaces are respected. |
| 11 | R | A space holds only one die: an occupied space cannot be used again in the same round. |
| 12 | R | A die that has no legal space at all may be set aside as the turn; otherwise it may not. |
| 13 | R | At the end of a round all dice come back, spaces are emptied, the altitude drops one row and the next round starts in the briefing. |
| 14 | R | During placement, spoken numbers are banned: the app only lets crew send preset phrases before the roll, at most 3 each, and none contain dice values. |

## Axis

| # | Src | Rule |
|---|---|---|
| 15 | R | Axis: each player must put one die on their own axis space (any value 1-6). |
| 16 | R | The axis moves only when BOTH axis dice are down: after the first axis die the axis has not moved. |
| 17 | R | Axis tilts by the DIFFERENCE of the two axis dice, toward the player with the higher die (Pilot higher and Co-pilot higher tilt opposite ways). |
| 18 | R | Equal axis dice leave the axis where it is. |
| 19 | R | Axis tilt is cumulative from round to round and never resets by itself. |
| 20 | R | The axis can be brought back: tilt 1 toward one side then 1 toward the other is level again. |
| 21 | R | A tilt of 2 either way is survivable. |
| 22 | R | A tilt of 3 (reaching the red marks) toward the Co-pilot side is an immediate loss: spin. |
| 23 | R | A tilt of 3 toward the Pilot side is an immediate loss: spin. A total of 3 reached over two rounds (1 then 2) also spins. |
| 24 | R | A spin ends the game at once: no later move is legal. |
| 25 | R | A missing axis die at the end of a round is a loss (Co-pilot axis not placed). |
| 26 | R | A missing engine die at the end of a round is a loss (Pilot engine not placed). |

## Engines

| # | Src | Rule |
|---|---|---|
| 27 | R | Engines: each player must put one die on their own engine space (any value). |
| 28 | R | Speed is the SUM of the two engine dice; the plane does not move until both engine dice are down. |
| 29 | R | Speed up to the blue marker (4): the plane stays (sums 2, 3, 4 advance 0). |
| 30 | R | Speed above blue and up to orange (5 to 8): the plane advances 1 space. |
| 31 | R | Speed above orange (9 and more, up to 12): the plane advances 2 spaces. |
| 32 | R | Each landing gear that turns green moves the blue marker up by one (4 -> 5 -> 6 -> 7); sum 5 then advances 0 after the first gear. |
| 33 | R | With blue at 5 (one gear down), a speed of 5 advances 0 spaces; with blue at 4 it advances 1. |
| 34 | R | Each flap that turns green moves the orange marker up by one (8 -> 9 ... -> 12). |
| 35 | R | With orange at 9 (one flap out), a speed of 9 advances only 1 space, not 2. |
| 36 | R | With all gear and all flaps (blue 7, orange 12) a speed of 7 advances 0, 8 advances 1, 12 advances 1, never 2. |
| 37 | R | Advancing is checked one space at a time: with a plane token on the space you are leaving, you collide and lose. |
| 38 | R | Planes on spaces you only fly over do not hurt: starting on a free space, moving 2 over a plane on space 3 is fine. |
| 39 | R | A plane on the space you step INTO (adjacent) is not hit this round; you are only in danger when you try to leave that space later. |
| 40 | R | A move of 2 also checks the second space you leave: a plane on space 2 is hit when advancing from 1 by 2 (leaving space 2). |
| 41 | R | Advancing 0 spaces is never checked: a plane on your own space is harmless if you do not move. |
| 42 | R | Overshooting the airport (advancing beyond the last space) is a loss. |
| 43 | R | Holding pattern: standing on the airport space before the last round, every engine result must advance 0 (sum 2 is safe, sum 5 overshoots). |
| 44 | R | Arriving on the airport space exactly is fine (no loss when you reach it). |
| 45 | R | Reaching the last altitude row (0 ft) while not on the airport space is a loss: the plane crashes short of the runway. |
| 46 | R | Reaching the last row ON the airport space is fine (round 7 starts). |

## Corridor

| # | Src | Rule |
|---|---|---|
| 47 | R | Tight corridor: when leaving a space that has tab marks, the axis must be in one of the marked positions, else loss. |
| 48 | R | With the axis inside the marked positions the plane leaves a tab space freely. |
| 49 | R | The axis is checked as it stands AFTER this round's axis dice resolved, and only if the plane actually leaves (advance 0 is not checked). |
| 50 | R | Tab check comes before the collision check on the space being left. |
| 51 | R | Only the space being left matters: a tab on a space that is merely flown over (second step) is checked when leaving it. |

## Radio

| # | Src | Rule |
|---|---|---|
| 52 | R | Pilot has ONE radio space; Co-pilot has TWO radio spaces; radio takes any value, and only its owner's colour. |
| 53 | R | Radio die of value 1 clears a plane on the space the plane is standing on. |
| 54 | R | Radio die of value v removes a plane token on the space v-1 ahead of the plane (count from the plane's own space as 1). |
| 55 | R | Radio value 3 with the plane on space 2 targets space 4. |
| 56 | R | Radio removes only ONE token even if the space holds several. |
| 57 | R | Radio aimed at an empty space (or beyond the airport) changes nothing and is not an error. |
| 58 | R | The removed plane token goes back to the supply (a later traffic roll can use it again). |
| 59 | R | Radio resolves immediately, so clearing a plane before the engines are placed makes the later advance safe. |
| 60 | R | Radio works from the plane's current space, so after the plane has moved the target shifts with it. |

## Gear

| # | Src | Rule |
|---|---|---|
| 61 | R | Landing gear (Pilot): three spaces needing 1-2, 3-4 and 5-6; a die outside the pair is refused. |
| 62 | R | Landing gear spaces can be filled in any order (5-6 first is allowed). |
| 63 | R | Only the Pilot can use landing gear; the Co-pilot cannot. |
| 64 | R | Putting a die on a gear space turns its light green (switch set) at once. |

## Flaps

| # | Src | Rule |
|---|---|---|
| 65 | R | Flaps (Co-pilot): four spaces needing 1-2, 2-3, 4-5, 5-6. |
| 66 | R | Flaps must be set strictly in order: flap 2 needs flap 1 green, flap 3 needs flap 2, flap 4 needs flap 3. |
| 67 | R | Only the Co-pilot can use flaps; the Pilot cannot. |

## Brakes

| # | Src | Rule |
|---|---|---|
| 68 | R | Brakes (Pilot): three spaces needing exactly 2, then 4, then 6. |
| 69 | R | Brakes must be set in order: 4 only after 2, 6 only after 4. |
| 70 | R | Only the Pilot can use the brakes. |
| 71 | R | The brake marker stands at 0 (none) until the first brake, then 2, 4, 6 after each brake. |
| 72 | R | Gear, flaps and brakes are optional in a round: a round may end without any of them. |
| 73 | R | Placing a die on an already-green group is only possible on another empty space: gear/flaps/brakes are not toggled twice (a green switch stays green across rounds). |

## Coffee

| # | Src | Rule |
|---|---|---|
| 74 | R | Concentration: three shared spaces, any value, either player. |
| 75 | R | A die on a concentration space gives one coffee token. |
| 76 | R | You can never hold more than 3 coffee tokens; the 4th die on concentration is just spent. |
| 77 | R | Spending a coffee token changes the die being placed by +1 or -1; the token is used up. |
| 78 | R | One coffee can raise a 1 to a 2 so that it fits the first brake / gear / flap values. |
| 79 | R | Several coffee tokens may be spent on one die (each +1 or -1): a 2 becomes 4 with two tokens. |
| 80 | R | Coffee can go down as well as up: a 5 becomes a 4 with -1. |
| 81 | R | A die can never leave the range 1-6: a 6 cannot become 7 and a 1 cannot become 0 (no wrapping). |
| 82 | R | You cannot spend more coffee than you hold. |
| 83 | R | Unspent coffee tokens stay for later rounds. |
| 84 | R | Either player may spend any coffee token: the Co-pilot can use a token the Pilot earned. |
| 85 | R | The coffee change counts for the effect: a die changed by coffee acts with its final value (axis tilt uses the changed number). |

## Reroll

| # | Src | Rule |
|---|---|---|
| 86 | R | A reroll token can be used any time during the placement phase while unplaced dice remain; it is spent. |
| 87 | R | Without a reroll token no reroll is offered. |
| 88 | R | No reroll in the briefing (the dice are not yet rolled). |
| 89 | U | Either player may reroll any of their own UNPLACED dice (including none); already placed dice never change. |
| 90 | R | The reroll can be used by a player off their own turn, and after they have placed all their dice (while the other still holds one). |
| 91 | R | Rerolled dice get fresh values 1-6; dice the player did not select keep their value. |
| 92 | R | A reroll token that was on the altitude track goes into your supply when that row is reached (not before). |
| 93 | R | Only 3 reroll tokens exist in total: the Twin Thrust bonus can only pay out while one is left unused in the box. |

## Traffic

| # | Src | Rule |
|---|---|---|
| 94 | R | Traffic die: at the start of a round, roll it once per icon on the space the plane stands on; the plane token is placed v-1 spaces ahead (die 2 = next space ... 5 = four spaces ahead). |
| 95 | R | No icons on the plane's space: no roll at the start of the round. |
| 96 | R | Spaces the plane only flies through never trigger the roll: moving past an icon space adds nothing; the roll happens only if the plane starts a round there. |
| 97 | R | The plane is placed no further than the airport (clamped to the last space). |
| 98 | R | Only 12 plane tokens exist: with all 12 on the track no new plane appears. |
| 99 | R | A traffic plane is never placed on the plane's own space: the nearest spot is the next space (die value 2). |
| 100 | R | The traffic die faces are 2,3,3,4,4,5 (placement offsets 1,2,2,3,3,4 ahead): over many rolls every offset 1-4 occurs, 3 more often than 1. |

## Landing

| # | Src | Rule |
|---|---|---|
| 101 | R | Last round: the plane does not move, whatever the engine sum is. |
| 102 | R | Last round: the engine speed (sum of the two dice) must be no more than the brake value (the marker sits just past the number); speed 3 with brakes at 4 lands. |
| 103 | R | Last round: a speed EQUAL to the brake value lands (speed 2 with the brakes at 2). |
| 104 | R | Brake value 4 allows speed up to 4 and no more; speed 5 fails. |
| 105 | R | Brake value 6 allows speed up to 6 and no more; speed 7 fails. |
| 106 | R | Timing: the speed is compared with the brakes WHEN THE SECOND ENGINE DIE IS PLACED. Speed 4 with brakes at 2 loses right then; a brake 4 offered afterwards is refused (the flight is over). |
| 107 | R | Timing: a brake set BEFORE the second engine die counts. One engine die, then brake 4, then the other engine die: speed 4 against brakes 4 lands. |
| 108 | R | Timing: the brake value is frozen at the second engine die; the landing checklist reports that frozen value, not a later one. |
| 109 | R | Brakes are required: with no brake set, even the lowest speed (2) is a loss. |
| 110 | R | Landing needs ALL landing gear green: with one gear missing the landing fails. |
| 111 | R | Landing needs ALL flaps green: with one flap missing the landing fails. |
| 112 | R | Landing needs a level axis: a tilt of 1 at the end of the last round fails the landing. |
| 113 | R | Landing needs an empty approach track: any plane token left on any space fails the landing. |
| 114 | R | A plane token on the airport space itself also fails the landing (any space counts). |
| 115 | R | The landing is judged only at the END of the last round: the round is not decided until all dice are placed (or none remain). |
| 116 | R | A fully correct landing wins: all conditions true together gives a win and ends the game. |
| 117 | R | In the last round gear, flaps and brakes can still be set before landing is judged (a die placed in the last round counts). |
| 118 | R | A tilt of 3 in the last round is a spin, not a failed landing. |
| 119 | U | The last round engine dice are still mandatory: missing engine dice in the last round is a loss. |
| 120 | R | After the 7th round ends the game is over: the landing is decided, there is no 8th round. |

## Fuel

| # | Src | Rule |
|---|---|---|
| 121 | R | Fuel watch: the marker starts at 20 and the shared fuel space takes a die of any value, burning that many units. |
| 122 | R | If nobody used the fuel space during a round, the marker drops by 6 at the end of that round. |
| 123 | R | If the fuel space was used, there is no extra -6 at the end of the round. |
| 124 | R | Fuel below 0 is a loss; exactly 0 is still alive. |
| 125 | R | Running dry through the end-of-round -6 also loses (fuel 5 -> -1). |

## Leak

| # | Src | Rule |
|---|---|---|
| 126 | R | Fuel leak: when both engine dice are down, lose the DIFFERENCE of the two dice plus 1 (no fuel space in this variant). |
| 127 | R | Leak with equal engine dice still costs 1; a leak taking fuel below 0 loses. |

## Wind

| # | Src | Rule |
|---|---|---|
| 128 | R | Tail wind: a 20-position dial starts at position 10 (modifier +3). |
| 129 | R | Wind modifier table by dial position: 9-11:+3; 7,8,12,13:+2; 6,14:+1; 5,15:0; 4,16:-1; 2,3,17,18:-2; 0,1,19:-3. |
| 130 | R | After the axis resolves each round, the dial advances by the current axis tilt (and goes backwards for negative tilt). |
| 131 | R | The dial wraps around at 20 (position 19 + 1 -> 0, position 0 - 1 -> 19), and an unchanged axis still moves the dial by the tilt every round. |
| 132 | R | The wind modifier is added to the engine sum: at +3 a dice sum of 2 gives speed 5 and advances 1. |
| 133 | R | The wind modifier also applies in the last round: speed = dice sum + wind modifier compared with the brakes. |

## Trainee

| # | Src | Rule |
|---|---|---|
| 134 | R | Trainee: six tokens valued 1-6 in a random row; each player has a trainee space of their colour. |
| 135 | R | The trainee space takes a die of any value EXCEPT the value of the next token in that player's end of the row. |
| 136 | R | The Pilot takes the token from the left end of the row, the Co-pilot from the right end. |
| 137 | R | The token taken is placed immediately as a die of its value on any legal free space of the same colour (not concentration, not the trainee spaces); coffee cannot change it. |
| 138 | U | A token with no legal space goes back to the end of the row it came from and does not count as trained. |
| 139 | R | All six trainee tokens must be used by the end of the game; otherwise the landing fails. |

## Ice

| # | Src | Rule |
|---|---|---|
| 140 | R | Icy runway replaces the brakes with four columns valued 2, 3, 4, 5; each has a Pilot-only upper space and a lower space for either player. |
| 141 | R | Only the NEXT column can be used: column 2 is closed until column 1 is finished. |
| 142 | R | A column is finished only when both its dice are placed in the same round; then the brake value becomes the column number. |
| 143 | R | Several columns may be finished in one round, in order (2 then 3). |
| 144 | U | A lone die in a column is wasted at the end of the round: the column is empty again next round. |
| 145 | R | All four columns must be finished for the landing; with one column missing the landing fails. |
| 146 | R | With all four columns done the brake value is 5; speed up to 5 lands, 6 fails. |
| 147 | R | With only column 1 done the brake value is 2. |

## Real-time

| # | Src | Rule |
|---|---|---|
| 148 | R | Against the clock: when the timer runs out unplaced dice are ignored; if axis or engine dice are missing the crew loses. |
| 149 | R | Against the clock: if all four mandatory dice are down when the timer ends, the round ends normally and the game goes on. |

## Abilities

| # | Src | Rule |
|---|---|---|
| 150 | R | A scenario names how many ability cards you may take (0 to 2); a setup with unknown, duplicate or too many cards keeps only valid ones up to that count. |
| 151 | R | Second Look: once per round the first player may reroll one of their dice before placing their first die; not the second player. |
| 152 | R | Second Look is no longer available once the first player has placed a die. |
| 153 | R | Flip Side: once per game each player may turn one unplaced die to 7 minus its value, at any time (also off turn); each player only once. |
| 154 | R | Flip Side is once per GAME, not once per round: the use is remembered into later rounds. |
| 155 | R | Twin Thrust: equal engine dice earn a reroll token, if one is left in the box. |
| 156 | R | Twin Thrust gives nothing when the engine dice differ. |
| 157 | R | Steady Hands: equal axis dice earn a coffee token, if one is left. |
| 158 | R | Steady Hands gives nothing when the axis dice differ, and never above 3 coffee. |
| 159 | R | Cross-Check: once per round, once a gear die and a flap die are down, the traffic die is rolled and the Co-pilot places it as an extra action on any empty space of either colour. |
| 160 | R | Cross-Check happens only once per round. |
| 161 | R | Hand-Over: once per round either player puts an unplaced die there, the other must too, and the two values are swapped. |

## General

| # | Src | Rule |
|---|---|---|
| 162 | R | Both players win or lose together: a loss ends the game for both and offers no further moves. |
| 163 | R | All 21 scenarios of the box exist (6 green, 7 yellow, 5 red, 3 black) and each can be started. |
| 164 | R | Approach tracks have 5 to 8 spaces and never more than 12 plane tokens at setup. |
| 165 | R | The engine's own invariant check agrees after a full play of random legal moves for every scenario (no impossible state: coffee 0-3, dice 1-6, tilt within -2..2 while alive). |

## Order

| # | Src | Rule |
|---|---|---|
| 166 | R | Other placements after the engines still happen in the last round: with speed 2 already within brakes 2, a later brake 4 is legal and the flight lands; the speed check used the brakes at the engine die (2). |
| 167 | R | A speed above the brakes at the second engine die is lost at once, before the round ends: speed 5 with brakes 4 loses even though a 6 for brake 6 is still in hand. |
| 168 | R | A gear die placed before the engine dice raises the blue marker for that round's speed (gear 1 first: speed 5 advances 0). |
| 169 | R | A gear die placed AFTER the engine dice does not change that round's advance (speed 5 advances 1 this round). |
| 170 | R | Engine dice placed BEFORE the axis dice use the axis as it still stands: a corridor tab is checked against the old axis. |
| 171 | R | A radio die placed AFTER the engines is too late for this round's collision (the collision already happened). |
| 172 | R | A coffee token earned by concentration earlier in the round can be spent later in the same round. |

## Not implemented / out of scope

- The 2025 expansion modules (alarms, turbulence, bad visibility, penguins, stuck gear, shortened track, head-on wind, engine loss) are not in this game; the engine has no code for them, so there is nothing to check.
- Promo airports and the website remixes are not in the box set and are not built.
