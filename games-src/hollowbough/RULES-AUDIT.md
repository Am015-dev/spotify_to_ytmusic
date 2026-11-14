# Hollowbough rules audit (FIXED13, 14 Nov 2026)

Owner report: "the rules are not correct". Source of truth: `rules-notes.md` (the original rulebook and FAQ, in our own words) and `cards.json`.
Checked: `game/src/engine.js` and `game/src/data.js` line by line, plus every player-facing rule sentence (rules drawer `ui6.js`, coach `ui12.js`,
help cards and bulb `ui11.js`, place zoom `ui2.js`/`ui3.js`, card texts). Each fix has a test in `logic-test.js` (rules 216-218); the full list is `RULES-CHECKLIST.md`.

## Found and fixed

| # | Area | Status | What was wrong | Fix |
|--:|---|---|---|---|
| 1 | Engine / card data | WRONG | Mudpie Jester's free home was `fairgrounds`, the building's key is `fair_grounds`: the jester could never move in free | `cards.json` link fixed, `data.js` regenerated. Rules 216 (no broken links) and 217 (jester free play) |
| 2 | Coach (first game) | WRONG | "When you are done, Pass" showed at the end of Spring; Pass only exists after the Autumn Prepare | Tip shows only in Autumn with all workers out; wording says Autumn. Rule 218 |
| 3 | Coach | WRONG | "Prepare: you gain one, production pays" at every Prepare. Summer has no production; Autumn gives 2 workers | Prepare tip names what this Prepare gives (Summer: up to 2 meadow cards; Spring/Autumn: green cards pay; Autumn +2). Rule 218 |
| 4 | Coach / feedback | WRONG | "Production cards pay again each season" and "It will keep paying every season" (also said for non-green cards) | "Green cards pay again in Spring and Autumn", only for green cards. Rule 218 |
| 5 | Rules drawer | MISSING | Pass had no Autumn limit | "Pass only in Autumn, after your last Prepare". Rule 218 |
| 6 | Rules drawer | WRONG | "Cards with a permanent helper hold two" | "The Glade and the Cloister take a second worker once you own the Sexton or Brother Moss". Rule 218 |
| 7 | Rules drawer | WRONG | "Summer gives 2 meadow cards" | "up to 2 meadow cards (no production)". Rule 218 |
| 8 | Place zoom | WRONG | Forest and Long Road always said "One worker" | 4 players: "Two workers, never two of yours"; Long Road: "One worker on 5, 4 and 3. The 2 spot takes any number" |
| 9 | Bulb hint | WRONG | Jester: "it scores -2 points" (for you) | "Plant it in a rival city: it costs them 2 points" |
| 10 | Coach / help | WRONG | "Special events need certain buildings and cost goods"; tie-break listed only events | "Each special event needs two named cards"; ties: events, then leftover goods |
| 11 | Card text | WRONG | Hollow Sexton "opens the second Grove plot" (no such card) | "second Mossgrave Glade plot" |
| 12 | Forest label | WRONG | Echoing Meadow "Copy a place" (any place) | "Copy a basic place" |

## Checked and matching (MATCH)

- Setup: hands 5/6/7/8 by seat, 3 forest cards (2p) or 4 (3-4p), 4 basic + 4 special events, 8-card meadow, 2 workers, no resources.
- Seasons: Prepare only with every worker out; Belfry before recall; +1/+1/+2 workers; production in Spring and Autumn only; Summer optional meadow draw of up to 2, refill after; Autumn is the last Prepare.
- Placement: 8 basic places (4 shared, 4 one-worker), forest slots (2 only at 4 players, never two of yours), Haven 2 cards per resource rounding down, Long Road in Autumn with exact discards (5/4/3 one worker, 2 shared), open Inn/Post Office (owner +1 point, also after the owner passed), Post Office needs 2 cards, events only when the city qualifies, one owner per event.
- Card play: costs, occupy once per building (and any critter on the Elderheart Oak), unique cards, city limit 15 (Drifter takes no space, a Goodman+Goodwife pair shares one, Toppled Hall in a full city), one card-playing ability per card, resolution order (meadow refill, place, own effect, then triggers in the player's order).
- All 48 card effects, costs, points and colour counts (52/21/19/18/18); all 16 special events (needs, claim effect, scoring).
- Hand limit 8; gifts to passed or full players are discarded.
- Scoring: printed points, tokens, purple bonuses (Lathwright cap 6, Goodwife needs a pair), events, Long Road; tie-breaks events then leftover resources. Pass only after the Autumn Prepare.
- Solo: blocking schedule, d8 meadow plays, his score per difficulty.

## Open (source check needed, not changed)

- Goodman Vole cost: data says 3 berries (cross-checked in research); one reviewer remembers 2. Kept as researched.
- Lorewood College disbanding a Glade/Cloister: permanent workers move with it (sources silent).
