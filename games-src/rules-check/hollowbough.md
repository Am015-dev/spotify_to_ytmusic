# hollowbough: rules check

Adapts: a 1 to 4 player woodland worker-placement and tableau-building card game (128 critter and construction cards, 24 workers, 4 seasons per player, events, a solo opponent mode).

Sources checked: web search of rules-summary sites (rules.dized.com index pages, officialgamerules.org, gamerules.com, boardgamecapital.com): confirmed tie-break order, 5/6/7/8 starting hands, shared vs exclusive locations, open-destination rule and that the post-office card is open. The full rulebook and the card pages were not fetched. Shelf documents: `hollowbough/rules-notes.md` (author read the publisher rulebook and an FAQ privately; 11 listed assumptions), `data.js` (cards, forest, basic spaces, events, journey). Engine `games-src/hollowbough/game/src/engine.js` read in these places: setup (newGame), turn moves (genMoves, locOpts, destOK, evOK), prepare-for-season, scoring (scoreOf, sevScore), game end, destination effects, deck/draw. The 800 lines of card effects (PROD, ONPLAY, EVFX, FOREST) were not read line by line.

WRONG 0, MISSING 0, SIMPLIFIED 6 (all documented), plus unverified items below

My honest read: I could not find a contradiction with the published rules in the parts I read. The owner's "all rules are wrong" may therefore sit in card-effect details (not read) or in UI explanation, not in the core flow. Recommend a card-by-card effect pass against the printed cards.

## Findings

| Class | Code | What the code does | Correct rule in plain words |
|---|---|---|---|
| SIMPLIFIED | engine.js:12 (no resource cap) | Resource supply is unlimited. | Physical piles are limited (30/30/25/20) but the rulebook says substitute when they run out; so no real difference. |
| SIMPLIFIED | engine.js:309-310 (`destCap`) | Each destination card holds one worker, except the two permanent-worker cards (2 with their helper critter) and prison cells. | Capacity is inferred from an open-source implementation, not printed text (assumption 10 in notes). |
| SIMPLIFIED | engine.js:197-199 (`finish`, solo) | In solo mode a tie counts as a loss for you. | Rulebook says "beat" the bear; ties unspecified (assumption 7). |
| SIMPLIFIED | engine.js:1021-1023 (`prepRecall`) | A worker standing on a claimed event is recalled like any other. | Rulebook silent; follows an open-source implementation (assumption 5). |
| SIMPLIFIED | engine.js (cemetery reveal from discard) | "Reveal 4 from the discard pile" takes the top four. | Likely the same; no source read. |
| SIMPLIFIED | engine.js:57-60 (`deckTake`) | When the deck runs out the discard is shuffled into a new deck automatically. | Rulebook: reshuffle discard when deck is empty (matches); listed only because the notes do not mention it. |

## Checked and correct (sample, high unless marked)
- Starting hands 5/6/7/8 by seat, 2 workers, meadow of 8, hand limit 8, city limit 15, 4 forest locations (3 for two players), 4 basic events always plus 4 special events. High (summary sites agree).
- Prepare for season: spring +1 worker and production, summer +1 worker and take 2 meadow cards, autumn +2 workers and production; only when all workers are placed; permanent workers stay. Matches the printed progression (2 + 1 + 1 + 2 = 6 workers).
- Eight basic spaces with correct gains and shared/exclusive flags; forest list of 11; Haven (2 discards = 1 resource); Journey 5/4/3/2 autumn only with matching discards and permanent worker.
- Scoring: card points, tokens, prosperity bonuses (Architect max 6, King 1 per basic and 2 per special event, Castle common constructions, Palace unique constructions, School common critters, Theater unique critters, tree = purple cards, Wife +3 when paired), events, journey. Tie-break: most events, then most leftover resources (confirmed by three summary sites).
- Open destinations: only the inn and the post office; owner gets 1 point per visit; post office gives opponent 2 cards then refill (confirmed for the post office by a rules-site quote).
- Special event list (16) with needs, costs and scores looked consistent with my knowledge of the published set; the engine's sevScore covers all scoring shapes.

## Not verified
- Individual card costs and effects (about 48 card types): the notes say two independent card databases matched on cost, points and copies. I could not independently confirm; one spot doubt is the cost of the husband-type critter (data says 3 berries; I recall 2). Confidence low.
- Husband-type critter production text (data: gains any 1 resource when paired and you own an allotment). Low.
- The Shepherd-type payment clause (resources go to an opponent if paid with berries) is in two databases but not the rulebook index; med.
- Forest slot count at 3 players: engine gives each forest card one slot at 2-3 players and two slots at 4. Notes agree with the rulebook; med-high.
- Solo opponent movement tables and difficulty numbers (engine.js:1034-1058): taken from notes only, not checked against a source.
- Worker-on-event, destination capacity and Tinder-type self-target are documented assumptions (see notes section 0).
