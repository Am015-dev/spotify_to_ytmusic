# Rules check: vinegrave

Adapts: a 2021 deck-building plus worker-placement expedition game (5 rounds, two explorers per player, travel icons, item and artifact card row, research track with a temple, guardians and fear cards, idols).

## Sources checked
- rulespal.com rulebook summary (start deck, start resources, travel substitution, actions, temple, scoring, tie-break)
- officialgamerules.org rules summary (conflicts with the first on several details, noted below)
- games-src/vinegrave/rules-notes.md. Engine: src/engine.js, src/data.js.

WRONG 1, MISSING 1, SIMPLIFIED 5

## Findings
| Class | Code | What the code does | Correct rule | Conf. |
|---|---|---|---|---|
| WRONG | src/engine.js:69 (CAN table) | A Boat card cannot pay a Boot cost (boot is payable by boot, car, plane only). | Any travel icon pays for a Boot; only Jeep and Boat do not stand in for each other, and the Plane pays for anything. So Boat must be added to what pays Boot. | med (one source states it plainly) |
| MISSING | src/engine.js:246 (score) | Idols score a flat 3 each; unused/empty idol slots score nothing. | Idols are 3 each PLUS the printed value of any idol slots left empty on the player board (1-3 each). Our shrine slots carry no end value. | med |
| SIMPLIFIED | src/data.js:120 | Discovering a new site costs 3 compasses (level 1) and 6 (level 2) plus travel. | Printed on the board (exact numbers not found; one source says 5 and 8, which looks like a mix-up with artifact costs). | notes say "our own"; low |
| SIMPLIFIED | src/data.js (all cards, sites, guardians, idols, track rewards) | All card/site/guardian numbers and effects are original. | Published values differ; not reproducible without the physical components. | documented |
| SIMPLIFIED | src/engine.js:102 | Only one idol-to-shrine placement per turn, 4 shrine slots, shrine = instant boon (own design). | Idol slot rules are the published ones; per-turn limit unknown. | low |
| SIMPLIFIED | (not built) | Assistants, expansion material, alternate board side, bonus tiles on research rows (only first-arrival rewards are built). | Present in the base game (assistants and bonus tiles). | documented |
| SIMPLIFIED | src/engine.js:250 | Solo rival deck is our own (8 cards per round). | Published rival board and deck. | documented |

## Checked and matching
5 rounds; one main action per turn then pass; free actions unlimited; start deck 2 Fear + 2 income + 2 exploration cards, hand of 5, refill to 5 each round; start resources by turn order (2 coins | 1 coin 1 compass | 2 coins 1 compass | 1 coin 2 compasses); travel paid by discarding hand cards, 2 coins buy a Plane, Plane pays any; Jeep pays Boot; items cost coins and go to the bottom of the deck; artifacts cost compasses, resolve at once when bought, cost a tablet when played from hand; guardians worth 5 and one fear card per explorer left on an undefeated guardian site; fear tile -2 when the supply is empty; notebook never above the magnifier and never in the temple row; magnifier temple points by arrival order; three temple stacks (6, 6, 11); both card-row cards beside the divider leave each round; tie-break first into the temple then research score.

## Not verified
- Starting-deck card mix (one source says 2 Fear, another 4 Fear); we use 2. med.
- Card row size and how many items vs artifacts per round (code: 6 slots, 6-round items). low.
- Total Fear supply (code 19). low.
- Cleanup wording: one source says played cards are shuffled into the BOTTOM of the draw pile; code discards them and reshuffles when the draw pile is empty. low.
- Whether bonus tiles on research rows and "checkmark" guardians (no cost) should exist.
- Whether the one-idol-per-turn limit is a published rule.
