# emberclimb: rules check

Adapts: a cooperative, 1-4 player tabletop deckbuilding dungeon climb (four classes: heavy-hitter, poison rogue, orb machine, stance monk), itself based on a well-known single-player roguelike deckbuilder. The shelf engine mixes numbers from the video game (percent-based Weak/Vulnerable, decrementing Poison, 30% rest heal, capped hand) with the tabletop structure (shared party turn, die, 2-hero co-op). The shelf notes (rules-notes.md) say they were checked against "the official rules as I know them" with no rulebook access, so the baseline was never fixed to one edition.

Sources checked (tabletop rules, summarised): rulespal.com rulebook page; boardgamearchive.com how-to-play; boardgamesbot.com how-to-play. These give structure and keyword rules, NOT per-class HP or starter lists. Video-game values below are from memory (confidence med). Engine: games-src/emberclimb/src/engine.js, data.js.

WRONG 15, MISSING 8, SIMPLIFIED 6

## Findings (edition tag: T = tabletop, V = video game)

| Class | Code | What the code does | Correct rule (plain words) | Conf. |
|---|---|---|---|---|
| WRONG (T) | engine.js:126, 132 | Hand capped at 10; draw stops when full | Tabletop: no maximum hand size. (Video game: cap 10, extra draws go to discard, not left in draw pile.) | high (T) |
| WRONG (T) | engine.js:148, 153 | Vulnerable = +50% damage, Weak = -25%, floor | Tabletop: Vulnerable DOUBLES hit damage (after Strength); Weak is -1 damage per hit. (Video game: +50% / -25%.) | high (T) |
| WRONG (T) | engine.js:301, 329 | Debuffs lose 1 per round / per enemy turn | Tabletop: Vulnerable and Weak (max 3 each) lose 1 token per Attack or enemy action, once per whole multi-hit, not per round. | high |
| MISSING (T) | engine.js:148, 318-319 | Weak attacker vs Vulnerable target both apply | Tabletop: if a Weak attacker hits a Vulnerable target neither applies; remove 1 Weak and 1 Vulnerable. | high |
| WRONG (T) | engine.js:298, data.js cards `poison` | Poison: lose N HP at enemy turn start, then N drops by 1; amounts 5, 8, 10 | Tabletop: at end of turn each poisoned enemy loses 1 HP per token (ignores Block); tokens stay until the enemy dies; cap 30 total across enemies. (Video game uses the decrementing version.) | high (T) |
| WRONG (T) | engine.js:181, 148, 319 | Wrath doubles damage dealt AND taken; Calm exit +2 energy; classes start in Calm | Tabletop: Wrath is +1 damage per hit and ending your turn in Wrath costs 1 HP; the stance class starts every fight in Neutral; Calm exit gives 2 energy (this part is right). | high (T) |
| WRONG (T+V) | engine.js:242, 247, data.js:16 | Starter relic puts the stance class in Calm and adds a 0-cost +1 energy card | Neither edition starts in Calm. The class begins Neutral and gets a Miracle (token, max 5, each gives 1 energy) at start of combat. | high (T), med (V) |
| WRONG (T) | engine.js:143 | Party loses only when ALL heroes are dead; dead hero is skipped | Tabletop: if ANY player reaches 0 HP the party loses immediately (optional "last stand" only in a boss fight). | high |
| WRONG (T) | engine.js:470 (`heal` move) | Rest heals 30% of max HP (+10 with moss) | Tabletop: Rest heals 3 HP. (Video game: 30%.) Rest-or-upgrade choice is per player, which is implemented. | high |
| WRONG (T) | engine.js:222 | Two heroes: all enemy HP x2 | Tabletop scales enemy HP by a printed player-count board, not a flat doubling. Exact numbers not found. | med |
| WRONG (T) | data.js:16, 14, 15 | Class HP 80 / 70 / 72 / 76 (notes: two changed for balance from 75 / 72) | Tabletop HP is printed per class board (values not found online). Video game: 80 / 70 / 75 / 72. Two values knowingly differ. | med (V) |
| WRONG (V) | data.js:14 | Rogue starter deck has 4 attacks + 5 defends + 2 (11 cards) | Video game starter: 5 attacks + 5 defends + 2 specials (12 cards). Notes already flag "UNCHECKED". | med |
| WRONG (T) | data.js card `shiv` (line ~137) | Shiv hits for 4, no cap | Tabletop: a Shiv deals 1 damage as its own Attack; max 5 Shivs at once; start combat with 0. | high |
| WRONG (T) | engine.js:360 `treasure` (~line 401) | Treasure room: one relic for the whole party | Tabletop: EACH player gains a relic. | high |
| WRONG (T) | engine.js:341 | Boss relic choice always 3 from one pool; only one taken per party (`took.relic`) | Tabletop: reveal 1 per player + 1 (3 if solo); each player may take one. | med |
| WRONG (T) | engine.js:355 (`cardChoices`) | Reward rarity rolled with fixed percentages from the shelf's own card pool | Tabletop: card reward deck per class, skipped cards reshuffled back in; rares come from a separate rare deck. | med |
| MISSING (T) | engine.js (whole) | No Strength cap | Tabletop Strength is capped at 8; Block cap 20 (players); Energy cap 6. | high |
| MISSING (T) | engine.js:259 | No Energy cap | Max 6 energy (Miracle may exceed only when spent at once). | high |
| MISSING (T) | engine.js:266 | No retain; no scry | Retained cards stay in hand at end of turn; Scry X looks at the top X cards and discards any. Notes admit Scry was replaced by "draw 1". | high |
| MISSING (T) | engine.js:225 | Enemies simply cycle a pattern or pick random | Tabletop enemies use single action / die-roll action / cube-track actions; one die roll per round shared by the party. | high |
| MISSING (T) | engine.js:228-330 | Enemy rows: enemies attack a single targeted hero | Tabletop enemies attack the player in their row; some actions hit all players. | med |
| MISSING (T) | engine.js:416-421 | One act only; a win ends the run | Tabletop has 3 acts (plus optional final act), full heal at each act start, boss/elite/encounter decks per act. | high |
| MISSING | data.js:155-158 | No merchant relic/potion price rule (top-left 1 cheaper), merchant sells 3 relics + 3 potions + 3 cards per player | Shelf shop: 5 class cards + 1 neutral + 2 relics + 2 potions; removal 75g once. Tabletop shop has 3 relics, 3 potions, 3 cards per player. | med |
| SIMPLIFIED | engine.js:83-109 | Generated 4-wide, 9-floor map, treasure floor 5, rest floor 9 | Tabletop uses printed branching maps (Act I board). Documented in notes. | high |
| SIMPLIFIED | engine.js:240-247, data.js:155 | Dice appear on cards and in events | Tabletop die is rolled once per round for enemies/relics. Notes call dice "a board-game addition", kept as designed. | high |
| SIMPLIFIED | data.js:143-150 | All foes, bosses, relics, potions, events are original | Fine and intended; none match published encounters. | high |
| SIMPLIFIED | data.js card list | Many card numbers changed "for tuning" (notes list ~15) | Documented in rules-notes.md. | high |
| SIMPLIFIED | engine.js:355 | Reward chance of potion 40% / 60% | Tabletop: potion is a drawn reward card; cap 3 potions (matches). | low |
| SIMPLIFIED | engine.js:77 | 2-hero party only (opt.heroes slice 0..2) | Tabletop supports 1-4. | high |

(Line numbers for the rest/treasure entries refer to the `performMove` and `enterNode` functions near lines 397-483; verified by reading, not by grep of exact numbers.)

## Not verified
- Exact tabletop HP, starter decks, orb slot count, Weak/Frail on cards: not on the pages I could fetch (confidence none).
- Frail (-25% block) is a video-game rule; the tabletop pages never mention it (shelf uses it only if an enemy applies it, which none currently does).
- Card-by-card numbers (10+ sampled by notes only) could not be verified against printed cards.
- Whether the owner means the tabletop or video-game edition: the findings tagged (T) vs (V) split this. Under the video-game baseline the main errors reduce to: no Calm start (stance class), rogue starter size, hand-cap draw overflow, and card numbers.
