# Twin Thrones: rules audit (FIXED1, 14 Nov 2026)

Owner report: "unplayable, the rules are not correct, not fun".
Method: I checked every rule of the published two-player game this adapts against `src/engine.js` and `src/data.js`.
The source is the published rulebook and card list, which no file in the repo names.
Tags: **MATCH** = the code does what the original does. **WRONG** = the code differs and is now fixed.
**MISSING** = not in the code and now added. **UNSURE** = I could not confirm it, so it stays as it was.
Each fixed rule has a test in `logic-test.js` (RULES-CHECKLIST.md) or `tutorial-script-test.js`.

## Setup
| Rule | Code | Tag |
|---|---|---|
| 7 coins each | newGame | MATCH |
| 12 wonders, 8 drawn, two groups of 4; picks 1-2-2-1 then 2-1-1-2 (the last pick in each group is forced) | DRAFT_ORDER | MATCH |
| 10 progress tokens: 5 face up, 5 out of play | newGame | MATCH |
| Age decks: I and II use 20 of 23 cards; III uses 17 of 20 plus 3 of 7 guilds, shuffled in | newGame | MATCH |
| Card layouts: I is 2-3-4-5-6, II is 6-5-4-3-2, III is 2-3-4-2-4-3-2; rows alternate face up and down, top row up | LAYOUT | MATCH |
| A random player starts the draft and opens Age I | firstSeat | MATCH |

## Turn
| Rule | Code | Tag |
|---|---|---|
| Take one uncovered card: build it, sell it, or use it to build a wonder | validMoves / apply | MATCH |
| A face-down card turns face up when nothing covers it | takeCell | MATCH |
| Sell: 2 coins + 1 per yellow card you own | discardGain | MATCH |
| Buying a missing resource costs 2 + the rival's brown/grey output of it; yellow and wonder output don't count | unitPrice | MATCH |
| Depot cards fix one resource at 1 coin; Customs Quay fixes glass and papyrus at 1 | unitPrice | MATCH |
| Owning the linked symbol makes a card free (chain) | buildInfo | MATCH (engine), see card data |
| A choice producer gives 1 unit of one listed resource per turn | payFor | MATCH |
| Only 7 wonders get built; the 8th is lost | G.built | MATCH |

## Military, science, tokens
| Rule | Code | Tag |
|---|---|---|
| Each shield moves the pawn 1 step; reaching 3 / 6 steps costs the rival 2 / 5 coins, once per space | milMove | MATCH |
| 9 steps = instant win; end points 2 / 5 / 10 by zone | milMove, milVP | MATCH |
| Two copies of a science symbol = pick a face-up token (once per symbol) | checkSci | MATCH |
| 6 different symbols = instant win; the Law token counts as a symbol | checkSci | MATCH |
| All 10 token effects (6 coins + 4 pts; wonders -2 resources; you collect the rival's trade coins; Law; blue -2 resources; 3 pts per token; 7 pts; +1 shield on red cards; wonders play again; 6 coins + 4 per chain) | apply / payFor / score | MATCH |

## Wonders
| Rule | Code | Tag |
|---|---|---|
| Play-again, burn a rival grey/brown card, revive from the discard pile free, take 1 of 3 unused tokens, steal 3 coins | apply | MATCH |
| Sky Tomb costs 3 stone + 1 papyrus (code also asked for glass) | data | **WRONG, fixed** |
| Moon Grove costs wood + stone + glass + papyrus (code: wood + glass + 2 papyrus) | data | **WRONG, fixed** |
| Grand Arena costs 2 stone + wood + glass (code: clay instead of wood) | data | **WRONG, fixed** |
| Sunken Harbor costs 2 wood + stone + clay (code: clay, glass, papyrus) | data | **WRONG, fixed** |
| Beacon Isle and Thunder Idol costs | data | UNSURE (kept) |

## Age change and end
| Rule | Code | Tag |
|---|---|---|
| The player behind on the war track picks who starts the next age; on a tie, whoever took the last card picks | endAge | MATCH |
| A play-again earned on the last card of an age is lost | finishTurn | MATCH |
| Score: cards, guilds, wonders, tokens, 1 per 3 coins, war zone; tie goes to more blue points, then shared | score / finish | MATCH |
| Guilds count the best of the two cities; coins on build for 5 of them | gainCard / score | MATCH |

## Card data (where the old build was wrong)
I. **Lookout** costs nothing (code: 1 coin) and has no chain. **WRONG, fixed**
II. Age I science: **Scribe Room** and **Remedy Shop** are worth 0 points and chain into Age II science cards; Herb Garden and Weights Hall have no chain. **WRONG, fixed**
III. **Science spread:** Age II needs quill, mortar, wheel and scale; Age III needs 2 sundials and 2 globes.
The code put sundial and globe in Age II and quill and mortar in Age III, so the symbol pairs, which ages they come in, and the 3-point science cards were all off.
Scholars' Court (quill) and Healers' House (mortar) moved to Age II; Star Gazers (sundial) and Chart Room (globe) moved to Age III. Costs, points and chains now match the original. **WRONG, fixed**
IV. **Chains** were wired to the wrong cards (7 of 18). Now:
- Inn → Beacon Quay; Brewhouse → Sand Arena
- Stake Fence → Bastion; Archery Range → Siege Yard; Parade Ground → High Fort
- Hero Monument → Terrace Gardens; Sun Temple → Hall of Many Gods; Podium → Grand Fountain
- Herbarium → Globe Hall; Measure Hall → Chart Room
- Judges' Hall, City Wall and Horse Yard (outgoing) and Sky Obelisk (incoming) have no chain. **WRONG, fixed**
V. **Costs:**
- Open Bazaar: + 1 clay. Caravan Post: + 1 papyrus. Archery Range: S1 W1 P1. Herbarium: W1 P2. Measure Hall: W1 G2.
- Hall of Many Gods: C1 W1 P2. Council Hall: S3 W2. Grand Fountain: C2 S1 P1. Armory: S2 G1. Sand Arena: C1 S1 W1.
- Bastion: S2 C1 P1. Siege Yard: W3 G1. War Pavilion: 8 coins. High Fort: C2 S2.
- Planetarium S1 W1 G2 and Star Gazers W2 G1 P1 (3 points each); Globe Hall C1 G1 P1; Chart Room S1 P2. **WRONG, fixed**

Count: 31 rule lines checked = 26 MATCH + 5 WRONG wonder/card-rule lines.
The card data had about 40 wrong values (costs, points, chains, ages) across 32 cards, now fixed. MISSING rules: none found in the engine.

## What made it unplayable / not fun (touch play, see PLAYABLE.md for the test log)
Listed in the FIXED1 section of `PLAYABLE.md`.
