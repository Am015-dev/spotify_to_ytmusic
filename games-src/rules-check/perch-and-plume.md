# perch-and-plume: rules check (7 Nov 2026)

Adapts: a bird-collecting engine-building card game for 1-5 players (4 rounds, 3 habitat rows of 5 slots, food dice feeder, eggs, tucked and cached points, end-of-round goals, bonus cards).

## Sources checked
- Publisher rulebook PDF, hosted on a public-library site (full text extracted and read: setup, turn structure, the four actions, birdfeeder, tray, round end, goals, scoring, tie-break). Confidence high for everything below marked "rulebook".
- Online rules summary on a game-help site (first-player rotation). Confidence med-high.
- Not reachable as text: the player-mat art and the appendix (power list, solo rules).

WRONG 0, MISSING 3, SIMPLIFIED 7 (plus 2 low-confidence minor items under "Not verified")

## Findings
| class | code | what the code does | correct rule |
|---|---|---|---|
| MISSING | engine.js:323, 326, 354 (`gainF`, `cacheF`, `wFeeder`) | A power that takes dice from the feeder does nothing when the feeder is empty ("no X in the feeder"); it never offers the all-same-face reroll. | Rulebook: if the feeder is ever empty, all 5 dice are thrown back in; and if the dice all show one face and you are about to gain food "for any reason", you may first reroll. Powers that take from the feeder should reroll an empty feeder and offer the reroll (only the main forest action does it now: lines 255, 426). |
| MISSING | engine.js:572 (`doPlay`, `onlyHab != null` skips `queuePinks`) | A bird played through a "play a second bird" power does not trigger other players' pink (between-turns) powers. | Any bird played, however it came into play, counts as "another player plays a bird" for pink powers. |
| MISSING | engine.js:57, 183 and goals (no blue side) | Goals are green-side only; the first player is always seat 0 (the setup option `first` exists but the menu does not randomise). | Rulebook: setup offers the blue goal side (1 point per item, max 5) as a choice; first player is chosen at random. (Seat 0 fixed is harmless for a vs-computer game.) |
| SIMPLIFIED | engine.js:558 (`eggSources`, auto payment) | Eggs paid for a column and food payment are chosen automatically (cheapest first). | Player chooses which eggs/food to pay. Documented in rules-notes.md. |
| SIMPLIFIED | engine.js:390-402 (rival deck) | Solo rival is an invented 8-card deck. | Published solo play uses its own automa deck and scoring. Documented. |
| SIMPLIFIED | data.js / gen-data.py | 120 original birds (published base has 170), 18 bonus cards (published 26), 12 goals (published 16 double-sided tiles = 8 tiles of two goals). Power texts are original. | Counts only; effects are original on purpose. Documented. |
| SIMPLIFIED | engine.js:452-454 | The optional trade on a bonus slot is offered BEFORE the main gain (food: discard card, +1 die; eggs: pay food, +1 egg; cards: discard egg, +1 draw). | Rulebook order: take the slot's base gain first, then offer the trade, then brown powers. Result is the same except for information timing (and an egg discarded before drawing). Not documented; harmless. |
| SIMPLIFIED | engine.js:12-17, 92 (YIELD/BONUSSP) | Row yields forest 1,1,2,2,3,3 / grassland 2,2,3,3,4,4 / wetland 1,1,2,2,3,3 with trades on every second slot. | Printed only on the mat art, not in the rulebook text. Confidence med (matches the earlier cross-check in rules-notes.md). |
| SIMPLIFIED | engine.js:42 | Goal selection avoids two goals from the same family. | Published game draws 4 random goal tiles. Design choice. |

## Confirmed matching the rulebook (high confidence)
Cubes 8/7/6/5; one action per turn; row action, then brown powers right to left; playing a bird fires only its white power and no row; egg cost columns (free, 1, 1, 2, 2); any 2 food stands in for 1 only when playing a bird; wild/either/both food costs; max 5 birds per row; multi-habitat birds choose a row; tray refilled at end of the turn and fully replaced at round end; first player rotates each round (line 194); goals scored at round end with 4/1/0, 5/2/1, 6/3/2, 7/4/3, ties add places and split rounded down, need at least 1 item; setup 5 birds + 5 food (keep k birds, discard k food), 2 bonus keep 1; final score = birds + bonus + goals + eggs + cached + tucked; tie-break most unused food, then shared win; pink powers once between your own turns; 5 dice with 6 faces (one grub/seed face); reroll-all when all dice match (main action); die face grub/seed gives one token of either.

## Not verified
- Exact row yields per slot and which slots carry trades (mat art only). Confidence med.
- `queuePinks` (engine.js:366-377) only tries the first matching pink bird per opponent; if that bird's nest is full, a second pink bird would not be tried. Low confidence this matters.
- Solo rules (published automa details) not available as text; automa left as simplified.
- Individual bird/bonus/goal card effects are original, so there is nothing to compare; sampled power types (26) for internal consistency only.
