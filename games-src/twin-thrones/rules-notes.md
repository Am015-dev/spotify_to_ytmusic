# Twin Thrones: rules notes (own words)

Two-player card game, three ages. Names, card text and art are original; mechanics follow the published structure.

## Implemented (src/engine.js)
- Setup: 7 coins each; 8 of 12 wonders drafted 4 + 4 (pick order 1-2-2-1 then 2-1-1-2); 10 progress tokens, 5 face up, 5 in reserve (3 drawn by the library wonder); military track -9..+9; age decks 20 cards each (age 3 = 17 + 3 of 7 guilds).
- Pyramids: age 1 `2-3-4-5-6`, age 2 `6-5-4-3-2`, age 3 `2-3-4-2-4-3-2`, rows alternate face up/down; a card is takeable when no card in the next row sits on it; taking cards flips newly uncovered face-down cards.
- Turn: build (pay), sell for 2 + yellow cards, or raise a wonder (card tucked under; at most seven wonders in the game).
- Trading: each missing resource unit costs 2 + rival's printed production of it (brown/grey cards only), or 1 with a matching trade-post card. Choice producers assigned cheapest. Chain symbol = free. Architecture / Masonry tokens remove 2 resource units (wonders / blue cards).
- Military: pawn moves by shields; first crossing of 3 and 6 steps makes the rival lose 2 and 5 coins; 9 steps wins. End scoring 2/5/10 by zone.
- Science: second copy of a symbol = take a progress token; 6 different symbols (law token counts) = instant win.
- Wonders: shields, coins, steal, play-again, burn a rival grey/brown card, rebuild from discard, library (pick 1 of 3 tokens), resource choice.
- Age change: player behind on the track chooses who starts (tie: the player who took the last card).
- End: points (cards, wonders, tokens, 1 per 3 coins, military zone); tie -> civic points; else shared.

## Cross-check (R2, W338)
Method: no rulebook file is in the repo, so each line was compared with the published structure as the reviewer knows it (from memory, not invented).
Tags: VERIFIED = matches; CHANGED (old -> new) = fixed; UNSURE = could not be confirmed, kept as is and listed for a check against a physical copy before a paid release.
No number or rule needed changing in this pass (CHANGED: none).

Structure and rules
- 7 coins each; 8 of 12 wonders drafted 4 + 4, pick order 1-2-2-1 then 2-1-1-2: VERIFIED (engine DRAFT_ORDER 0,1,1,0,1,0,0,1).
- 10 progress tokens, 5 face up, 5 in reserve, the library wonder draws 3 of the reserve: VERIFIED.
- Military track -9..+9, loot at 3 and 6 steps (rival loses 2 and 5 coins, first crossing only), 9 steps = instant win, end zones 2 / 5 / 10 points: VERIFIED (milVP: 1-2 = 2, 3-5 = 5, 6-8 = 10).
- Age decks 20 cards; age III = 17 + 3 of 7 guilds; pools of 23 / 23 / 20 cards drop 3 at random for ages I-II: VERIFIED.
- Pyramids age I `2-3-4-5-6`, age II `6-5-4-3-2`, age III `2-3-4-2-4-3-2` with the centre gap, rows alternate face up / down starting face up, a face-down card turns up when uncovered: VERIFIED.
- Turn: build, sell for 2 + 1 per yellow card, or raise a wonder (card tucked under); at most seven wonders in the game: VERIFIED.
- Trading: missing unit costs 2 + rival's printed production of it (brown and grey cards only, wonders and yellow cards do not count), 1 with a matching trade post, chain symbol = free: VERIFIED.
- Architecture: wonders cost 2 resource units less; Masonry: blue cards cost 2 less; Economy: you receive the coins your rival pays for trade; Law counts as a science symbol; Strategy: red cards only (not wonder shields); Theology: wonders play again; Urbanism: 6 coins and +4 when you build by chain; Agriculture 6 coins + 4 points; Philosophy 7 points; Mathematics 3 points per token: VERIFIED.
- Science: second copy of a symbol = take a token (once per symbol), 6 different symbols (the Law token is the sixth-plus symbol) = instant win: VERIFIED (6 card symbols + law in data.js).
- Guilds score from the richer of the two cities for the owner, builders 2 points per wonder and no coins, moneylenders 1 point per 3 coins: VERIFIED.
- Age change: the player behind on the track picks who starts; on a tie the last active player (took the last card) picks: VERIFIED (W435, rulebook text).
- End scoring (cards, wonders, tokens, 1 per 3 coins, military zone), tie goes to civic (blue) points, else shared: VERIFIED.

Wonders (effects match; costs compared)
- Bronze Titan 3 pts + 2 shields, cost C3 G1; Moon Grove 12 coins + again, W1 G1 P2; Terraced Orchard 3 pts + 6 coins + again, W2 G1 P1; Archive of Dust 4 pts + token from 3, W3 G1 P1; Marble Barrow 2 pts + revive, C2 G2 P1; Stone Riddle 6 pts + again, S1 C1 G2; Merchant Road 3 pts + 3 coins + rival loses 3 + again, S2 C2 P1; Grand Arena 3 pts + 1 shield + discard grey, S2 C1 G1: VERIFIED.
- Sky Tomb 9 pts (S3 G1 P1), Beacon Isle 4 pts + raw choice (P2 S1 G1), Thunder Idol 3 pts + 1 shield + discard brown (W1 S1 P2), Sunken Harbor 2 pts + again + glass/papyrus (C2 G1 P1): effects VERIFIED, exact costs UNSURE (kept).

Cards (cost and points)
- Age I: all raw and goods cards, the three blue cards, the four green cards, Roadside Inn (free, 4 coins), the three depots (3 coins), Pony Pen, Barrack Yard, Stake Fence: VERIFIED. Lookout ($1): UNSURE (may be free in the published set).
- Age II: Sawpit / Kiln Yard / Deep Quarry (2 coins), Glassblower / Drying Rack (free), the five blue cards (5/4/4/5/4 points, chains), Caravan Post ($2 G1), Brewhouse (free, 6 coins), Horse Yard, Great Barracks ($3), Parade Ground, City Wall: VERIFIED. Customs Quay (S2; the published card is believed to cost 4 coins), Open Bazaar ($3; may also need 1 clay), Archery Range (S1 W2; may also need 1 papyrus), the four green Age II costs: UNSURE (kept).
- Age III: Trade Chamber, Beacon Quay, Sand Arena, Grand Port, Armory (coin rules and 3 points), the 7 guilds: VERIFIED. Blue/green/red Age III resource costs: UNSURE (kept).

Rule of thumb for a paid release: the UNSURE lines are cost-only (no effect or scoring differs); compare them with a physical copy and edit `data.js` only.

## Not built
Online play, campaign (see HANDOFF.md). Sound and the first-game guide were added in R2 (HANDOFF-R2.md).
