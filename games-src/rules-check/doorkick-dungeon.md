# doorkick-dungeon: rules check

Adapts: a 168-card satirical dungeon-crawl card game for 3 to 6 players (door and treasure decks, race/class cards, race to level 10 by killing monsters, other players' cards used against you).

Sources checked: web search plus two fetched rules pages (an officialgamerules.org summary of the base rules; the publisher's free Deluxe-edition rules PDF text, hosted on a university site, read via text extraction: setup, turn, charity, combat, helper, run away, death and looting, selling, trading, winning). Shelf documents: `munch/rules-notes.md` (cites a private rules sheet v1.71 and about 150 FAQ rulings that I could not read), `cards.js` (card texts), engine `games-src/munch/engine.js` (read: constants, gain/draw, charity, combat strength and tie test, resolveWin, running away, selling, die and looting, abilityMoves, gainLv/loseLv, newGame head). The 300 lines of individual monster and curse effects were not read card by card.

WRONG 0 confirmed, MISSING 2, SIMPLIFIED 5, plus 3 doubtful items (listed as unverified, not counted)

## Findings

| Class | Code | What the code does | Correct rule in plain words |
|---|---|---|---|
| MISSING | engine.js (no `trade` act); notes "Not included" | Players cannot trade items with each other. | Players may trade items that are on the table (not hand cards), at any time except while they or the partner are in a fight, and may give items away freely. Documented omission. |
| MISSING | notes "Not included" | The optional "listen at the door" and shared-victory options are not offered. | They are optional table rules; low impact. Confidence med that they appear in the current sheet. |
| SIMPLIFIED | engine.js:289 (`charityTargets`), 361 | Extra cards (hand over the limit at end of turn) go one card at a time to any chosen lowest-level player. | When several players tie for lowest, the giver must divide the excess "as evenly as possible" and only chooses who gets the larger share. The engine lets the giver hand all of them to one tied player. |
| SIMPLIFIED | notes H2, H3 | Out-of-turn plays (curses, level cards, hireling, level-steal card) are only allowed in fixed windows: during a fight, at the start of each turn, own turn. A one-chance-per-player priority pass happens when the fighter says Fight. | At the table these can be played at any time. Documented adaptation. |
| SIMPLIFIED | engine.js:238-240, note H1 | Helper takes the promised treasure cards first, from the top of the draw, automatically. | Real: the active player draws the treasure and shares it per the agreement made beforehand (who picks first is negotiated). |
| SIMPLIFIED | notes H4, engine.js:127 | The "lose 1,000 gold of items" bad stuff and the tax-collector payments are chosen automatically (least useful items). | The loser/payer chooses which items go. |
| SIMPLIFIED | engine.js:245-248 (`startRun`, `nextRun`) | Several monsters in a run-away are rolled in order of appearance. | The runner chooses the order of the escape rolls (stated in the Deluxe text). |

## Doubtful, not counted (confidence stated)
- Elf helper level cannot be the winning level (notes H5, `gainLv(h,..., false)` caps at level 9). The rules text says the level 10 must come from killing a monster; an Elf's bonus level for helping to kill arguably is that. The notes themselves call it a house rule. Confidence low-med that the real ruling lets the Elf win.
- Halfling run-away modifier: the engine and card text give Halfling -1 to run away (cards.js, runMod at engine.js:244) with no reroll option. My memory of the Deluxe card is "sell one item per turn at double price; if your first escape roll fails you may discard a card and reroll". The notes say the -1 is from the "base printing". Confidence low; check against the printed 168-card base set.
- Looting ties: engine sorts equal-level looters with a random compare (`rnd(3)-1`, engine.js:~172), which is not a fair die roll but is random; real rule is a die roll per tie. Low impact.

## Checked and correct (sample)
- Setup: level 1, human, no class, 4 door + 4 treasure cards; everyone may play cards before first turn; highest roll starts. High (publisher text).
- Turn: kick open (monster fights, curse hits, other card to hand or played), then look for trouble or loot the room (only if no fight), then charity; hand limit 5 (6 for the dwarf). High.
- Combat: strict greater wins; ties go to the monster unless a warrior is among the fighters (engine.js:206, helper included, matching the publisher text); multiple monsters added together, cannot beat one and flee the rest; rewards only after the fight resolves. High.
- Helper: one helper, bribed with items or treasure; active player gets the level; elf helper gains one level per monster slain; both players must run if they fail, rolling separately. High.
- Run away: d6, 5 or more; modifiers; each monster rolled separately; dead runner is skipped. High.
- Death: keep level, race, class, curses, half-breed/super cards; others loot one card each starting from highest level; dead players take no charity and cannot win; the new hero appears at the next player's turn and draws 4 + 4 on own turn. High.
- Selling: 1,000 gold per level, no change given, hand or table, not on 10, halfling doubles one item once per turn (as engine implements). High for 1,000 and no-10; med for the halfling clause.
- Level 10 only from killing a monster; go-up cards and selling cap at 9 (engine.js:82). High.
- Class powers: berserk, flight and undead-turning each discard up to 3 cards for +1 / +1 / +3 each (R.BERSERK/FLIGHT/TURN = 3). Med-high.
- Big item limit (one, dwarf any number), equipment slots 1 head, 1 armor, 1 foot, 2 hands. High.

## Not verified
- All individual monster, curse and treasure texts: not compared with printed cards (notes claim 0 differences against a transcription and a second dataset for numbers).
- The 150 FAQ rulings the notes rely on (the FAQ site was blocked for the earlier author and for me).
- Card counts of 94 door / 74 treasure and 147 distinct cards: plausible for a 168-card base set (rules text says 168); not recounted.
