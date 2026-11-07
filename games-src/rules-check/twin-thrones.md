# Rules check: twin-thrones

Adapts: a two-player card-drafting civilization duel played over three ages. Each age lays out a pyramid of face-up/face-down cards; players take uncovered cards to build, sell them, or tuck one under a wonder. Three ways to win: military track, six different science symbols, or points at the end. Engine: games-src/twin-thrones/src/engine.js (data in data.js).

Sources checked
- games-src/twin-thrones/rules-notes.md (its own cross-check says "from the reviewer's memory", no rulebook in repo).
- Web: nightsaroundatable.com how-to-play article (start-of-age rule); a Board Game Arena forum thread and a BGG-style errata thread surfaced in search (not fully readable). No publisher PDF opened.
- Remaining checks are from my own knowledge of the published structure (marked conf).

WRONG 2, MISSING 0, SIMPLIFIED 0 (plus 6 UNSURE card costs, listed separately)

## Findings
| Class | Code | What the code does | Correct rule in plain words | Conf |
|---|---|---|---|---|
| WRONG | engine.js:149 (endAge chooser) | When the military pawn is on the centre space at the end of an age, the player who did NOT take the last card chooses who starts the next age. | Sources agree the player with the weaker military position chooses; at a tie (pawn centre) the player who took the LAST card of the previous age is the one who chooses. The code gives the choice to the opposite player. Sources disagree on wording, so check the printed rulebook. | med |
| WRONG | data.js:53 (Customs Quay) | Costs 2 stone. | The matching yellow Age II card (trade post for glass and papyrus) costs 4 coins, not resources. rules-notes itself says "believed to cost 4 coins" but kept the resource cost. | med |
| UNSURE (cost) | data.js:51 (Open Bazaar) | Costs 3 coins. | The matching card most likely also needs 1 clay. | low-med |
| UNSURE (cost) | data.js:35 (Lookout) | Costs 1 coin. | May be free in the published set. | low |
| UNSURE (cost) | data.js:57 (Archery Range) | S1 W2. | May also need 1 papyrus. | low |
| UNSURE (cost) | data.js:65-66 (Sky Obelisk / Grand Fountain) | Obelisk (5 points) has a chain-from podium; Fountain (5 points) has no chain and costs C2 W1. | The published 5-point Age III blue card with a chain is believed to cost 2 clay, 2 stone, 1 papyrus; the chain/cost assignment between the two looks swapped or altered. | low |
| UNSURE (cost) | data.js Age II green costs, Age III red/blue/green resource costs, wonder costs for Sky Tomb... Sunken Harbor | As listed in rules-notes "UNSURE". | Cannot confirm without a physical copy. | low |

## Verified matching (no difference found)
7 coins each. 12 wonders, 8 drafted 4+4 in order 1-2-2-1 / 2-1-1-2; max 7 wonders built, the last one discarded. 10 progress tokens, 5 up, 5 boxed, library wonder shows 3 of the boxed five. Military track -9..+9, loot of 2 coins at 3 steps and 5 coins at 6 steps, first crossing only, 9 steps wins; end zones 2/5/10 points. Decks: 20 cards in ages I-II (3 dropped from 23), age III = 17 of 20 plus 3 of 7 guilds. Pyramid shapes 2-3-4-5-6, 6-5-4-3-2, 2-3-4-2-4-3-2 with alternating face-up/face-down rows. Sell price 2 + 1 per yellow card. Trade price 2 + rival's printed brown/grey production, 1 with trade post, choice producers assigned cheapest, chain symbols free. Science: second copy of a symbol gives a token (once per symbol), six different symbols (law token counts) wins instantly. Token effects (architecture, masonry, economy, law, mathematics, philosophy, strategy, theology, urbanism, agriculture) match. Guild scoring from the richer city; builders guild 2 per wonder with no coins; money guild per 3 coins. End points: cards, wonders, tokens, 1 per 3 coins, military zone; tie goes to blue-card points, else shared. Wonder effects (all 12) match in effect.

## Not verified
- Exact resource costs listed as UNSURE above (and the three Age III red/yellow cost sets) could not be checked online.
- Whether the first player of age I is random or fixed in the published rules (code: random).
- Whether the start-of-age tie rule matches the printed rulebook or the errata; sources disagree.

## Fixed (W391)
- WRONG tie chooser at age end -> fixed: at a centred military pawn the player who took the last card chooses (stated source: the check's sources agree); test "tie-chooser-is-player-who-took-last-card".
- WRONG trade-post card cost -> fixed: Customs Quay now costs 4 coins; test "trade-post-card-costs-4-coins".
- UNSURE costs (Open Bazaar, Lookout, Archery Range, Sky Obelisk/Grand Fountain, Age II/III costs): unverified, left unchanged (low confidence, no source).
