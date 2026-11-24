# Learn to play: Hadiya's commissions (W624)

**Premise.** The Sultan is dead and the bazaar of Qamar is up for grabs. Old Hadiya will vouch for you before the council, but only if you out-think Farid, the water-boy who wants the throne too. Six commissions; each is a real turn of the game on the real engine (`src/comm.js`), with a goal, Farid following a plan, and a debrief.

**Rules for every commission.** No Next, OK or Got-it taps: the brief sits beside the key tile, the board is live at once, and the first real move closes it. A rule appears once, in one line, beside the track, tile or button the decision needs, only when that decision comes up. After each of your moves the bubble says what it did (from the engine log). The debrief names the consequence and the lesson; its buttons are a real choice (Try again / Next / Back).

Every tap below is listed with what it teaches. Moves you can make differently are real choices; the walk taps are the move itself.

## C1 One coin for the oasis (bid, move, take, claim, Oasis, Advisors)
Goal: claim the Oasis and finish ahead of Farid. Farid always takes a free spot, and he has his own path to the Oasis.
| tap | this tap teaches |
|---|---|
| a track spot (free or 1 coin or more) | dearer spots play first; same price: the later bidder plays first; coins paid are points lost. **The puzzle**: free = Farid plays first and takes the Oasis; 1 coin = you play first. |
| lift tile C… (the Trader + Advisor) | you lift everyone on a tile, and you choose which tile |
| drop the Trader on the next tile | one person per tile, up/down/left/right, never straight back; you choose the drop order |
| drop the Advisor on the Oasis | the last person must land on its own colour; you take all of that colour |
| take the Advisors | Advisors are kept: 1 each, +10 per rival with fewer; the emptied tile gets your camel |
| plant the palm | an Oasis must get a palm: 3 points to whoever holds the tile |
| End turn | the turn ends; Farid now plays by the same rules (you watch his walk) |
| Debrief: Try again / Next | naive: "You took a free spot. Farid took one after you, so he played first and took the Oasis." strategic: "You walked first and took the Oasis: 73 to 56." |

## C2 Coins from stone, coins from silk (Masons, Mystic, Traders, Stall, selling)
Goal: end your turn with 68 coins or more (you start with 50 and one Mystic).
| tap | this tap teaches |
|---|---|
| lift the Mason or the Trader | **the choice**: Masons pay coins now; Traders bring goods to sell |
| drop on the Masons / the Traders | the last person lands on its colour |
| Masons: use the Mystic or not | Masons pay Masons × blue tiles around; a Mystic adds a Mason but scores nothing at the end (here: 16 coins, too few) |
| Traders: collect | Traders take that many goods from the front of the row; a Mystic in the row stays a Mystic |
| Stall: buy one of the first 3, or skip | 3 coins for a good; a 5th kind lifts a set from 13 to 21 |
| pick goods + Sell | different kinds sell together: 1, 3, 7, 13, 21; selling is the last part of a turn; Mystics can't be sold |
| Debrief | naive (Masons): 66 coins, "Masons here see only 4 blue tiles". strategic (Traders + Stall + one 5-kind set): 68. |

## C3 The price of a djinn (Sages, Shrine, djinns)
Goal: gain 22 points this turn. You hold 1 Sage and 1 Mystic; your Oasis has 2 palms; djinns on offer: Wahha, Nakhla, Hikma.
| tap | this tap teaches |
|---|---|
| lift + drop the Sage on the Shrine | Sages are kept, 2 points each; the Shrine is claimed |
| collect the Sages | Sages pay for djinns |
| pick a djinn | each djinn scores its own points and has a power; **choice**: Nakhla (palms 5) vs Wahha (plant a palm) vs Hikma (Sages 4) |
| pick the payment | 2 Sages, or 1 Sage + 1 Mystic; **the lesson**: the Mystic scores 0, a Sage scores 2 |
| Debrief | naive (Wahha with 2 Sages): +13. strategic (Nakhla, Sage + Mystic): +22. Nakhla with 2 Sages: +20. |

## C4 A knife in the souk (Shadows, Advisor majority)
Goal: finish ahead of Farid. He keeps 3 Advisors to your 2.
| tap | this tap teaches |
|---|---|
| lift + drop the Shadow on the Shadow | Shadows land like everyone else |
| the Shadow's target: the Sage on the Hamlet, or Farid's seat | Shadows remove one person within as many steps as you have Shadows, **or** a rival's kept Advisor or Sage; a tile you empty is yours. **The choice**: land (+5) vs breaking his majority (3-2 becomes 2-2: ties give no +10, so -11 for him) |
| Stall: skip or buy | the tile action still follows |
| Debrief | naive (land): 63-67. strategic (his Advisor): 58-56. |

## C5 Whose palace is it? (Hamlet, palaces score for the owner, camels stay)
Goal: finish ahead of Farid. He owns the Hamlet where 2 Advisors stand.
| tap | this tap teaches |
|---|---|
| lift the Advisor or the Trader | **the choice**: 3 Advisors (+13) on Farid's Hamlet vs Traders on the Grand Bazaar |
| land | ending on a Hamlet means you must build a palace; emptying Farid's tile gives you the people, never the land |
| build the palace (forced on the Hamlet) | a palace scores 5 for whoever holds the tile: here, Farid |
| Grand Bazaar: pick 2 of the first 6 | 6 coins for 2 goods |
| Sell | a 5-kind set sells for 21 |
| Debrief | naive: 63-68, "your palace went up on Farid's hamlet". strategic: 69-63. |

## C6 The last camel (end of game, next-round order)
Goal: finish the game ahead of Farid. You have 1 camel left and lead 60 to 50.
| tap | this tap teaches |
|---|---|
| lift the Mason or the Shadow | **the choice**: 12 coins now, or claim the Oasis with your last camel |
| drop | placing your last camel ends the game after this round; everyone else still plays |
| Shadow target | with no camel left, a tile your kill empties stays unowned |
| plant the palm | Oasis palm, scored by the tile's owner |
| End turn / round 2 bid (naive only) | next round you bid in the order you played; Farid pays to go first and takes the Oasis with his last camel |
| Debrief | naive (wait): 71-71, a tie is not a win. strategic (end it now): 74-73. |

## Taps with a lesson: 100%
Every tap above is a game move or a debrief choice. There are no Next/OK taps: the brief closes on the first real move.

## Tests
- `node ft/comm-test.js`: for each commission a naive scripted line fails and a strategic line wins, with `checkInvariants()` after every move. 6/6.
- `node ft/comm-video.js` (after a build): commission 1 played twice by touch at 402x874, naive then retry; `proof/story-402x874.webm` + 3 stills.
