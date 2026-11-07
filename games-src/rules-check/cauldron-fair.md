# cauldron-fair: rules check

Adapts: a 2-4 player push-your-luck bag-building brewing game over 9 rounds (draw chips from a bag onto a spiral track, explode above 7 white, buy better chips with coins, rubies, rat catch-up, a bonus die, 24 event cards, 4 ingredient-book sets). Closest-fidelity game on the shelf: the notes (rules-notes.md) cite the publisher's English rulebook draft and final text, the full ingredient almanac and a fan transcription of the track and cards, and an earlier independent audit exists (AUDIT-RULES.md).

Sources checked: games-src/cauldron-fair/rules-notes.md and AUDIT-RULES.md (read in full, they quote the rulebook by page); web search of rules summaries (overrules.mobi, officialgamerules.org, rulespal.com, a community rulebook PDF, a wiki) for the end-of-game conversion, tie-break and bonus-die rules; engine src/engine.js and src/data.js read at the functions named below. The private research folder (original rulebook text) is not in the repo, so card-level text was not re-read.

WRONG 1, MISSING 2, SIMPLIFIED 4

Status of the earlier audit (AUDIT-RULES.md): of its 6 "fix before sign-off" items, I confirmed in the current code that 4 are fixed (hand-in of purple chips at engine.js:455, purple fortune card VP before rat count at engine.js:92, no do-over after an exploding 5th chip at engine.js:205, round-9 simultaneous reveal "Stir!" at engine.js:309-331). 2 remain (rows 1 and 2 below).

| Class | Code | What the code does | Correct rule in plain words | Conf. |
|---|---|---|---|---|
| WRONG | engine.js:459-464 (`p4`, purple set 4 "upgrade") | The chip being upgraded is spliced OUT of the cauldron (`p.pot.splice`) and put back in the supply; this changes which chips count as "last or second-to-last" and what the cauldron holds. | The upgrade has no effect on the current round; only the new, higher chip goes straight into the bag. The old chip should stay in the cauldron as drawn (it still returns to the bag at clean-up as normal). | med (almanac wording quoted by the earlier audit) |
| MISSING | engine.js (powers `p1`, `g1`, `g3`) | Several end-of-brew powers always take the best reward or always apply (green set 3 slide is forced unless it would lose a ruby; green set 1 ruby count is automatic). | Rulebook: "you are also allowed to pass up on actions"; a lower reward is always allowed. Partly implemented (purple set 1 and 2 offer lower options). | low |
| MISSING | none | The optional "second droplet / test-tube" variation printed on the back of the cauldron boards is not implemented. | A rulebook variation for experienced groups (second droplet; each droplet move chooses which one moves). Optional by the rulebook, so low impact. | med |
| SIMPLIFIED | data.js:99 | Bonus die faces: 1 VP, 1 VP, 2 VP, ruby, droplet step, orange chip. | The rulebook lists only five outcomes for six faces; which one repeats is unknown to the sources (the fan tool says 1 VP, which the shelf uses; an earlier build repeated the ruby). | low |
| SIMPLIFIED | engine.js:684 | Tie on points: the player whose last chip reached furthest in round 9 wins, otherwise shared. | Sources disagree: the publisher's rulebook text quoted in notes says furthest in the last round; one rules summary says tied players share the title with no tie-break. Shelf follows the rulebook text. | med |
| SIMPLIFIED | rules-notes.md guess list 1-16 | Sixteen documented interpretations (rat stone always full distance with an optional stepper before the first draw, must draw at least once, Twice Rolled counts both results, Thick Skin plus Sunroot limits add, yellow set 2 doubles only the printed number, "any N-chip" picks exclude white, and so on). | Each was a gap in the sources; the earlier audit judged 7 right/safe and 5 unclear. None contradicts a rulebook sentence. | med |
| SIMPLIFIED | rules-notes.md names | All chip, card and almanac names are original. Card effects match the fan transcription ("names differ"). | Intended by the brief. | high |

## Checked and found to match (no mismatch)
- Setup: start bag 4 x white 1, 2 x white 2, 1 x white 3, 1 x orange 1, 1 x green 1; droplet at 0, flask full, rat stone off board, 1 ruby (engine.js:66, data.js:115). Supply counts 215 chips per notes. Extra white 1 before round 6 (data.js:115 `extraWhiteRound: 6`).
- Explosion when whites sum above 7 (engine.js:186), last chip stays, bag-empty forces a stop, flask rule, rats from round 2, yellow book from round 2 shop and purple from round 3.
- Evaluation order (die, chip powers, rubies, VP, buying, droplet/flask with rubies); exploded player takes VP or buying, not both; buy 1-2 chips of different colours, leftover coins lost.
- Final round: no buying; 5 coins = 1 VP and 2 rubies = 1 VP, repeatable (data.js:115 `endCoinsPerVp: 5, endRubiesPerVp: 2`), matches every rules summary I fetched.
- Track: 54 spaces, spoon 15 VP / 35 coins (compared by the earlier audit with 0 differences against the only full table; I did not re-key the table).
- Book prices in all four sets (compared by the earlier audit). Black rule for 2 players vs 3-4 players (engine.js:657-663).
- Fortune cards: 24; the earlier audit checked all effects against the card text.

## Not verified
- Player-count differences beyond the black book page: no check of whether any other chip counts change for 2-3 players (notes say white 2 supply stays in the box for fewer players; not confirmed).
- Exact wording of the 4 almanac sets and the 24 cards (original text not in repo); relied on the earlier audit's comparison.
- Bonus die face distribution (see above), rat tails past space 27, and the Thick Skin plus Sunroot stacking are interpretations with no source.
- Whether the rulebook says the rat stone distance is optional ("can") or mandatory: shelf keeps an optional stepper, so either reading is playable.

## Fixed (W391)
- WRONG purple upgrade removed the chip from the cauldron -> fixed: the old chip stays in the cauldron this round (flag sw) and goes to the supply at clean-up; tests "upgrade does not touch the current round...".
- MISSING pass up actions -> fixed for the Lucky-seven moss slide (always optional); test "pass up an action". Gentle sigh and Trade wind already offered lower choices; green set 1 ruby count left automatic (declining a free ruby is never useful).
- MISSING second droplet / test-tube variation: left (optional variant on the cauldron boards, needs board and UI changes).
