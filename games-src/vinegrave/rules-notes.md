# Vinegrave rules notes (own words)

Deck-building + worker placement jungle expedition, 1-4 explorers, 5 rounds.
- Start: deck of 6 (2 Creeping Dread, 2 Patron Letter = 1 coin, 2 Trail Notes = 1 compass), draw 5. 2 explorers each.
  Start resources by turn order: 2 coins | 1 coin 1 compass | 2 coins 1 compass | 1 coin 2 compasses.
- Turn: one main action, then the next explorer; pass = out for the round. Round ends when all passed.
- Main actions: play a card (artifact from hand costs 1 tablet; Dread has no effect); dig at a free camp site or discovered ruin
  (pay travel icons by discarding cards: each card has one icon; Jeep pays Jeep or Boot, Boat pays Boat or Boot (rules-check WRONG 1), Plane pays anything,
  2 coins = a Plane); discover a hidden ruin (3 compasses level 1, 6 level 2, plus travel): reveal it, take an idol (instant gift),
  dig its loot, a guardian wakes there; overcome a guardian at a site where your explorer stands (pay its cost: 5 points + one
  free boon later); buy an item (coins, to the bottom of your deck) or artifact (compasses, its effect fires at once, free);
  research (magnifier climbs a row paying the row cost and taking the bonus; the notebook may follow but never pass it); at the
  temple (row 8) the research action buys temple tiles (11 / 6 / 2 points).
- Free actions: guardian boons (once each), one idol per turn into a shrine (instant boon; idols score 3 either way, each slot once).
- End of round: explorers return; one still sharing a site with an unbeaten guardian brings home a Dread card (to discard).
  Played cards are shuffled and put under the deck (engine endRound; logic-test B11), unplayed cards stay in hand, draw up to 5. Market of 6: round r has 6-r items then artifacts; at round end
  the item and the artifact beside the divide leave (exiled) and the row refills with one more artifact slot.
- Research: magnifier first, notebook follows but never passes it and never enters the temple row; only the magnifier reaches the temple.
- Temple tiles: 6 points (2 tablets + 1 jewel, 8 tiles), 6 points (1 jewel + 2 arrowheads, 8), 11 points (all of it, 4).
- Score: notebook row points (0,1,2,4,6,9,12,15) + magnifier row points (0,0,1,2,3,4,6,8; in the temple 10/8/6/4 by order of arrival)
  + temple tiles + 3 per idol + 5 per guardian + card points - 1 per Dread. Tie: first into the temple, then the higher research score.
- Solo: rival deck of 8 cards per round (camp x2, raid market, loot relic, study x2, scout, hunt); one card after each of your
  main actions; its score = points taken + its research row (magnifier scale).

## Confirmed vs guessed
Confirmed (structure of the genre leader): 5 rounds, one main action per turn then pass, 2 explorers, travel icons boot/car/ship/
plane with coins buying planes, fear cards from guardians, idols with slots, research track with two markers and a temple, card row
of items/artifacts shifting each round, artifacts free when bought and costing a tablet from hand, item to the bottom of the deck.
Guessed / our own numbers: every card, site, guardian, idol and track value; starting resources; idol slot scoring (3 vs 1);
temple tile costs; the rival deck. Counts match the box roughly: 35 items, 35 artifacts, 15 guardians, 10 level-1 and 8 level-2 sites.
Left out: expansions, the alternate board side.
## FIXED2 r3 (12 Nov 2026): rules checked against the official English rulebook (24 pages, read 12 Nov 2026), with short quotes
Assistants (logic-test L1-L12):
- Setup: "12 assistant tiles"; "Turn all assistants silver side up. Shuffle them into 3 random stacks of 4" (p.3-4). Built: G.aSt.
- Recruit: "When you move your notebook to a row with this symbol, choose one of the assistants available on the supply board. (Usually,
  there are 3 ...)" (p.16). Built: notebook only; the magnifier never recruits.
- "Set the assistant on one of the assistant squares on your player board. The silver side should be face up." 2 squares (player aid:
  "you can have only 2"). Built: max 2; a recruit with 2 held can only upgrade (our handling; the rulebook is silent).
- Use: "To use your assistant, turn it sideways ... you can use an assistant's effect only once per round. At the end of the round, all
  assistants are refreshed" (p.16). Free action only when it shows the free-action icon.
- Upgrade: "When you move your notebook to a row with this symbol, upgrade one of your assistants to the gold level ... the assistant is
  refreshed even if its silver-level effect was used earlier in the round" (p.16).
- Effects shown in the rulebook (p.16): a choice of a coin or a Plane (free); a buy discount of 1, 2 on the gold side, which "has no free
  action icon, so using this assistant counts as your turn's main action"; one that "needs a Boot to make you an arrowhead" (free).
  Built as a-guide, a-broker, a-fletch. Our own (only icons on the tiles, not in the text): the other 9 effects, the gold sides of the
  guide and the fletcher, and which notebook rows hold the symbols (we use rows 2 and 4 to hire, 3 and 5 to upgrade).
Other rules (logic-test M1-M8):
- Free-action items: "Exploration cards have effects that are free actions, and some item effects are free actions, too" (p.13). Which
  items: ours (8 cheap items, shown "Free:" on the card).
- Travel boons: "Some boons are travel values" that pay like a card; "used once during the game" (p.11). 3 guardians (ours) have them;
  they pay automatically when you dig or explore.
- Temple: "the 6-point stack ... requires you to pay the two costs ... The 11-point stack ... all three costs" and tiles "are limited"
  (p.14); setup makes stacks "with as many tiles as there are players": one 11, two 6 and three 2 point stacks. The three costs are ours.
- Lost Temple: "When your magnifying glass reaches the top row ... take a bonus tile. Look through the stack of face-down tiles and choose
  one ... There are just enough for everyone" (p.14). Tile values are ours.
- Blocking tiles (setup 9): "In a four-player game, do not use the blocking tiles"; three players block 3 camp spaces at random; "In a
  two-player game, block all 5 ... Each site will have space for only one archaeologist." Built: camp sites have a second space.
- Exile: "you may exile a card from your hand or your play area" (p.13). Built and tested (M8).
- Box counts: 10 level-I and 6 level-II site tiles, 16 idols, 40 items, 35 artifacts, 15 guardians (p.2): all match.
Still not built: the alternate board side; research bonus tiles on every space (we keep first-arrival rewards on rows 2, 4, 6, 7).

## Cross-check against the published rulebook (web, 7 Nov 2026)
Checked against a rulebook summary page found online (no rulebook text or art copied; numbers re-expressed). Fixed to match:
starting resources by turn order; idols always score 3 (shrine use is a free one-time boon, each slot once); the notebook may not
enter the temple row; magnifier temple points by order of arrival; three temple stacks (6 / 6 / 11, the 11 needs both 6-point costs);
at round end the item AND the artifact beside the moon-staff divide leave; tie-break = first into the temple, then research.
Confirmed as built: 5 rounds, one main action then pass (the two starting coin / compass cards are free actions: logic-test H1, H1b), keep or discard hand cards (we keep all: the rulebook calls discarding rarely
useful), Dread for each explorer taken back from a guardian's site, guardians 5 points, bought items to the bottom of the deck, artifacts
to the play area with a free use, artifacts from hand cost their tablet, 2 Dread in each starting deck.
Now built: first-arrival research rewards (only the first magnifier on rows 2, 4, 6, 7; every arrival still gets the row bonus) and the
19-card Dread supply (exiled Dread returns to it; when empty, a fear tile worth -2). Still our own: exact travel/discover costs, empty-slot
values, the reward amounts, assistant abilities, and every card's numbers.
No open-source implementation of this game exists (searched GitHub and the web), so no code or data was ported; THIRD-PARTY.md is not needed.
Sources (facts only, nothing copied): rulespal.com rulebook summary (start resources, idols, temple, market, tie-break, Fear supply).
Card COUNTS kept at the box's scale (35 items / 35 artifacts / 15 guardians / 16 site tiles split 10+8 here vs the box's mix); our cards,
costs and effects are original, so print-and-play / workshop card lists were not needed for per-card numbers.

## Rules check fixes (W378, 7 Nov)
- WRONG 1: a Boat card now pays a Boot (engine CAN table). Test: "WRONG 1: a Boat card pays a Boot".
- MISSING 1: 4 shrine slots on each board (1, 1, 1, 2 points) score while empty; each set idol fills the next slot (V.IDOL_SLOT_VP, score().slots). Tests: "MISSING 1: ...". Everyone now starts at +3 (5 slot points, -2 Dread).
- SIMPLIFIED items are listed in the rules drawer under "Simplified on purpose".
