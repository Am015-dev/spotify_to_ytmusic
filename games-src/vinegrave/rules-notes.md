# Vinegrave rules notes (own words)

Deck-building + worker placement jungle expedition, 1-4 explorers, 5 rounds.
- Start: deck of 6 (2 Creeping Dread, 2 Patron Letter = 1 coin, 2 Trail Notes = 1 compass), draw 5. 2 explorers each.
  Start resources by turn order: 2 coins | 1 coin 1 compass | 2 coins 1 compass | 1 coin 2 compasses.
- Turn: one main action, then the next explorer; pass = out for the round. Round ends when all passed.
- Main actions: play a card (artifact from hand costs 1 tablet; Dread has no effect); dig at a free camp site or discovered ruin
  (pay travel icons by discarding cards: each card has one icon; Jeep pays Jeep or Boot, Boat pays Boat, Plane pays anything,
  2 coins = a Plane); discover a hidden ruin (3 compasses level 1, 6 level 2, plus travel): reveal it, take an idol (instant gift),
  dig its loot, a guardian wakes there; overcome a guardian at a site where your explorer stands (pay its cost: 5 points + one
  free boon later); buy an item (coins, to the bottom of your deck) or artifact (compasses, its effect fires at once, free);
  research (magnifier climbs a row paying the row cost and taking the bonus; the notebook may follow but never pass it); at the
  temple (row 8) the research action buys temple tiles (11 / 6 / 2 points).
- Free actions: guardian boons (once each), one idol per turn into a shrine (instant boon; idols score 3 either way, each slot once).
- End of round: explorers return; one still sharing a site with an unbeaten guardian brings home a Dread card (to discard).
  Played cards to discard, unplayed cards stay in hand, draw up to 5. Market of 6: round r has 6-r items then artifacts; at round end
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
Left out: expansions, the alternate board side, assistants on the research track.

## Cross-check against the published rulebook (web, 7 Nov 2026)
Checked against a rulebook summary page found online (no rulebook text or art copied; numbers re-expressed). Fixed to match:
starting resources by turn order; idols always score 3 (shrine use is a free one-time boon, each slot once); the notebook may not
enter the temple row; magnifier temple points by order of arrival; three temple stacks (6 / 6 / 11, the 11 needs both 6-point costs);
at round end the item AND the artifact beside the moon-staff divide leave; tie-break = first into the temple, then research.
Confirmed as built: 5 rounds, one main action then pass, keep or discard hand cards (we keep all: the rulebook calls discarding rarely
useful), Dread for each explorer taken back from a guardian's site, guardians 5 points, bought items to the bottom of the deck, artifacts
to the play area with a free use, artifacts from hand cost their tablet, 2 Dread in each starting deck.
Still our own (not stated in the page we could read): exact travel/discover costs, empty-slot values, "first to a bonus space" extra
bonuses (we give every arrival the row bonus), the Fear-card supply limit and -2 fear tiles, assistants, and every card's numbers.
No open-source implementation of this game exists (searched GitHub and the web), so no code or data was ported; THIRD-PARTY.md is not needed.
