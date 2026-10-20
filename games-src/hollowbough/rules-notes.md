# Hollowbough rules notes (research for a faithful base-game adaptation of the original game)

Written in my own words from the current official rulebook (the original publisher, 24-page 2nd-printing layout, read privately), the official-fan FAQ v1.8 (collated from designer forum answers), and two independent card databases. No publisher text, images or PDFs are stored in the repo. Card data lives in `cards.json`; sources in `sources.md`.

## 0. Disagreements and gaps still open (read first)

1. **Catalogue page and fan wiki unreachable.** The board-game catalogue site returned 403 and the fan wiki returned 503/timeout, so I could not read the catalogue file list or that wiki. Independent card cross-check therefore used: (a) a fan card database (parsed from its HTML) and (b) an open-source implementation (cost, points, copies, type, unique flag, linked card, forest/basic/event data), plus the rulebook's index for effect wording. A rules-summary site and a rules app only repeat rulebook text, so they are not counted as independent.
2. **Numbers cross-checked in both independent sources (all 48 cards):** cost, base points, copies, color/type, unique/common, critter/construction, linked card. Zero mismatches. Copies sum to 128 (63 critter, 65 construction).
3. **Shepherd extra clause.** The card (per both databases) says that if you pay for it with resources instead of the occupy token, the resources go to an opponent. The rulebook's printed index entry for Shepherd omits this. I include it (two sources vs one silent source).
4. **Component counts** (30 berries, 30 twigs, 25 resin, 20 pebbles, point tokens 10x3 and 20x1, 20 occupied tokens, 24 workers) come only from the official rulebook (several hosts carry the same document). Not independently cross-checked. The rulebook also says there is no resource limit and to substitute if a pile runs out; for a digital game treat supply as unlimited (ASSUMPTION, the cap has no gameplay purpose).
5. **Worker on an achieved Event.** Rulebook does not say what happens to the worker. The open-source implementation recalls it at Prepare for Season like any ordinary worker. I use that (ASSUMPTION).
6. **Forest exclusivity and shared flags** are printed as ring icons on the board art that I could not view. Basic-location shared/exclusive flags (4 shared, 4 exclusive) agree between the two databases; all 11 forest locations are exclusive in both (ASSUMPTION for forest: consistent with rulebook text that 2-3 player games have room for one worker per forest card).
7. **Solo win condition tie.** Rulebook says "beat him"; ties unspecified. ASSUMPTION: you need strictly more points than Old Grimbeard, a tie is a loss for you.
8. **Night-of-Sparklers errata.** First printing printed "Tower + Echo Mole"; official errata and second printing: Lookout + Echo Mole. I use the corrected pair.
9. **Tinder Chipmunk self-target** not covered by sources. ASSUMPTION: Tinder Chipmunk may not choose itself (would be an infinite loop); may choose any other production card including another Tinder Chipmunk copy once.
10. **Destination worker capacity.** ASSUMPTION: each Destination card holds exactly 1 worker, except Cemetery and Monastery (2, second slot unlocked by Undertaker / Monk) and Dungeon (2 prisoner cells, not a worker slot). FAQ 2.1.4 and rulebook agree on open-card visiting; capacity itself is inferred from the open-source implementation and standard play.
11. **Lost Parchments leftover cards.** Unclaimed cards of the 5 revealed: ASSUMPTION discard (sources silent).

## 1. Components and counts

| Item | Count |
|---|---|
| Game board | 1 (8 basic spaces, Haven, 4 Journey spaces, 4 forest clearings, event/Elderheart Oak areas) |
| Critter and Construction cards | 128 (48 distinct, copies listed in cards.json; 63 critter + 65 construction) |
| Forest location cards | 11 |
| Basic event tiles | 4 |
| Special event cards | 16 |
| Workers | 24 total, 6 per player color (4 players) |
| Berries / twigs / resin / pebbles | 30 / 30 / 25 / 20 |
| Point tokens | 10 three-point, 20 one-point |
| Occupied tokens | 20 |
| Eight-sided die | 1 (solo only) |
| Elderheart Oak piece | 1; victory/scoring card 1 |

Card colors: tan Traveler (resolves once on play), green Production (on play, then every spring and autumn Prepare), red Destination (worker spot), blue Governance (ongoing bonuses/discounts), purple Prosperity (end-game bonus, base points also count).
Color distribution of copies in deck: green 52, blue 21, tan 19, purple 18, red 18.

## 2. Setup

1. Board out, Elderheart Oak on its stump; resource piles and tokens beside the board.
2. Forest cards: shuffle all 11, place **3 face-up for 2 players, 4 for 3 or 4 players** on the clearings; rest back in the box.
3. Events: the **4 basic event tiles** are always placed (Four Production, and Three each of Destination, Governance, Traveler, each worth 3 points). Shuffle special events and place **4 special events** on the tree branches; rest unused.
4. Shuffle the 128-card deck, deal **8 face-up** to the Meadow, put the deck in the tree.
5. Each player takes **2 workers** (their color) to start. The remaining 4 sit on the Elderheart Oak: 1 in spring, 1 in summer, 2 in autumn.
6. Starting hands by seat: **seat 1 draws 5, seat 2 draws 6, seat 3 draws 7, seat 4 draws 8**. No starting resources. Most humble player goes first; play clockwise.
7. Hand limit 8 at all times. City limit 15.

## 3. Turn structure

Each turn do exactly one of: **Place a worker**, **Play a card**, **Prepare for season**. Seasons are per player (each player advances in their own time; FAQ 2.3.1).

### 3.1 Place a worker
Put one available worker on an open spot and resolve it at once. The worker is then "deployed" until you Prepare for Season. Locations are **exclusive** (one worker total) or **shared** (many, even same color). In a normal game you can never put two of your own workers on the same forest location.

**Basic spaces (8):**
- 1 berry (shared)
- 1 berry + 1 card (exclusive)
- 1 resin + 1 card (shared)
- 1 pebble (exclusive)
- 3 twigs (exclusive)
- 2 cards + 1 point token (shared)
- 2 resin (exclusive)
- 2 twigs + 1 card (shared)

**Forest locations (11, all exclusive; each card has two slots, 2nd slot only used in 4-player games; any of the 11 can appear at any player count):**
1. 2 berries + draw 1
2. Any 2 resources
3. Discard any number of cards from hand, draw 2 for each discarded (limit 8)
4. Copy one basic location + draw 1
5. 1 pebble + draw 3
6. 1 twig + 1 resin + 1 berry
7. 3 berries
8. 2 resin + 1 twig
9. Draw 2 + any 1 resource
10. Discard up to 3 cards, gain any 1 resource for each
11. Draw 2 from the Meadow, may play one of those two for 1 fewer resource of choice (optional; the played card must be one just drawn; with a full hand you cannot draw; counts as a card-playing ability; FAQ 2.1.2, 2.1.3)

In a 2-player game 3 random forest cards are active with 1 slot each; so 3 forest spots total.

**Haven (shared, unlimited):** discard any number of hand cards, gain 1 resource of choice per 2 discarded.

**Journey (autumn only):** four spots worth 5, 4, 3 (exclusive) and 2 (shared). Discard cards from hand equal to the spot value. The worker stays for the rest of the game and scores its value at game end. A player may send more than one worker (FAQ 2.1.1).

**Destination cards:** a worker may go on any unblocked Destination card in your own city, or on one in an opponent's city marked Open (owner gains 1 point token from supply). Only Inn and Post Office are Open in the base game. Meadow destinations cannot be visited (FAQ 2.1.4). A player who has passed still has an Open card others can visit (FAQ 2.5.2). Post Office requires at least 2 cards in your hand (FAQ 2.2.34.1).

**Events:** place a worker on an unclaimed basic or special event whose requirements you meet right now and pay any listed cost. Only one player can ever claim each. The event moves beside your city for end scoring. Once claimed you may later lose the required cards (FAQ 2.4.1.1). You cannot place a worker unless you can achieve it.

### 3.2 Play a card
Pay the listed cost to the supply, from hand or from the Meadow. **Order of resolution (FAQ 2.2.1.5):** (1) choose a card-playing ability (Dungeon, Judge, Innkeeper, Crane, Inn, forest 11), (2) pay resources or place an occupied token, (3) replenish the Meadow if the card came from there, (4) place in city (if the card replaces another, remove the old one first), (5) resolve the card's own effect, (6) resolve triggered effects like Historian, Shopkeeper, Courthouse (active player picks order).

- **City limit 15** spaces; each card takes one space. Events do not use space. Wanderer takes none. A Husband+Wife pair shares one. You cannot discard cards to make room; only effects (Dungeon, Crane, Innkeeper, University, Ruins) free spaces (FAQ 2.2.1.7, 2.2.7.1). Ruins works in a full city because it takes the razed space.
- **Unique vs common:** only one copy of each unique card in your city; any number of commons.
- **Occupy (free critter):** each Critter names a Construction. If that Construction is in your city and has no occupied token, you may play the Critter for no cost and put an occupied token on the Construction. Once per Construction, ever; the token is never removed even if the critter leaves (FAQ 2.2.1.1). The Elderheart Oak can host any one Critter. If a Critter with a resource-payment clause (Shepherd) is occupied, nothing is paid.
- **Card-playing abilities** (any effect that changes the cost): Inn, Innkeeper, Crane, Dungeon, Judge, forest 11. Only one per card played (FAQ 2.2.1.6). Not abilities: Courthouse, Historian, Shopkeeper.
  - Innkeeper: discard it, cut 3 berries off a Critter.
  - Crane: discard it, cut 3 of any resource off a Construction.
  - Dungeon: lock a city Critter beneath it (stops counting, scores nothing), cut 3 of any resource off a Critter or Construction. 1 cell, second cell with Ranger. One prisoner per card played.
  - Judge: swap one required resource for any other resource you hold.
  - Inn (visit): play a Meadow card for 3 fewer.
- Free plays (Queen, Parcel Dove, Cemetery) ignore cost entirely.
- **Drawing:** always from the deck unless told Meadow. If a Meadow card is taken, replace immediately; when several are taken, take all then refill. Deck empty: shuffle discard into a new deck. Cards given to a player whose hand is full (or who passed) are discarded; you must pick an opponent with room if one exists (FAQ 2.2.1.2).
- Point tokens placed on cards (Chapel, Clock Tower) come from the supply and are lost if the card leaves the city (FAQ 2.2.2.1, 2.2.1.4). Never put bonus tokens on Bard, Monk etc.

### 3.3 Prepare for Season
Allowed only after all your current workers are placed. You recall every deployed worker **except** permanent ones (Monastery, Cemetery, Journey). Then:

| Change | New workers | Other effects | Worker pool after |
|---|---|---|---|
| Winter (start) -> Spring | +1 | activate all green Production cards | 3 |
| Spring -> Summer | +1 | no Production; may draw up to 2 Meadow cards (refill after) | 4 |
| Summer -> Autumn | +2 | activate all green Production cards | 6 |

Production cards are activated in any order you like (FAQ 2.3.2). Clock Tower is used before recalling. Autumn is the last Prepare action. Green cards played during summer still fire on play. After autumn you keep placing remaining workers and playing cards until you pass.

## 4. End of game and scoring
You pass when you cannot or do not want to act; passed players cannot be given cards or resources. Workers stay where they are. Game ends when everyone has passed.

Score per player:
1. Base points printed on each card in the city (Fool is -2; Dungeon prisoners score nothing).
2. Point tokens held (supply tokens from basic/forest/events/cards, Monk, Doctor etc.) plus tokens sitting on cards in the city.
3. Purple Prosperity bonus points (in addition to base): Architect, Castle, Elderheart Oak, King, Palace, School, Theater, Wife.
4. Events: 3 each for basic events; each special event per its own rule; plus 1/2/3 as the card says for tokens or critters beneath.
5. Journey: value of each worker on a Journey spot.

Tie-break: most events achieved, then most leftover resources. (Stored resources on a Storehouse that were never collected do not count.)

## 5. Special events (4 are in play per game; 16 total)

| Event (our name) | Needs in city | On claim | End score |
|---|---|---|---|
| Grand Market Scheme | Shopkeeper + Post Office | give opponents up to 3 resources total; take 2 point tokens for each | tokens already taken |
| Hurry-Scurry Dash | Tinder Chipmunk + Clock Tower | recall 1 deployed worker | 4 |
| Night of Sparklers | Lookout + Echo Mole | place up to 3 of your twigs on it | 2 per twig |
| Lost Parchments Unearthed | Historian + Ruins | reveal 5 cards, each to hand or beneath it | 1 per card beneath |
| Acorn Bandits Seized | Courthouse + Ranger | move up to 2 critters from your city beneath it | 3 per critter |
| Marsh Fever Remedy | Undertaker + Reedpunt Toad | pay 2 berries and discard 2 cards from your city | 6 |
| Wingborne Healers | Doctor + Parcel Dove | none | 3 per Husband+Wife pair in all cities |
| Commencement of Pupils | Teacher + University | move up to 3 critters from hand beneath it | 2 per critter |
| Counsel for Scoundrels | Monk + Dungeon | none | 3 per prisoner in your Dungeon |
| Pilgrims Trail | Monastery + Wanderer | none | 3 per worker in your Monastery |
| Resident Minstrel | Inn + Bard | place up to 3 of your berries on it | 2 per berry |
| Gilded Shrine Vault | Woodcarver + Chapel | draw 1 card and take 1 resource per token on your Chapel | 2 per token on Chapel |
| Vigil of Remembrance | Cemetery + Shepherd | none | 3 per worker buried in your Cemetery |
| Toll Holiday | Judge + Queen | activate Production | 3 |
| Grand Hollow Games | 2 cards of each of the 5 colors | none | 9 |
| Change of Proprietors | Peddler + General Store | place up to 3 of your resources on it | berry/twig 1 each, resin/pebble 2 each |

## 6. Two-player differences
- 3 forest cards (not 4), one worker slot each; same applies at 3 players for slots, but 4 players adds a second slot.
- Starting hands 5 and 6.
- Everything else (8 meadow, 4 basic + 4 special events, 15 city, worker counts) is unchanged.
- Solo mode uses the two-player setup.

## 7. Solo mode vs Old Grimbeard
Three years in a row (three escalating rounds); you must beat his score each year.

**Setup:** two-player setup. You hold 5 starting cards; Old Grimbeard has no hand. Old Grimbeard takes two workers: one blocks the **top-left forest card**, the other sits on the **3-twig basic space**. Both are blocked for you.

**His card plays:** after each card you play (Meadow cards replenished first), roll the d8. The Meadow slots are numbered 1-8 (top-left = 1, bottom-right = 8). Old Grimbeard plays that Meadow card into his city, then the Meadow refills. Stack his cards by color. Card effects and base points are ignored; his cards count only for colors and totals. A Parcel Dove free play counts as two plays so he plays two cards. His city has no 15-card cap (FAQ 2.8.1). Playing the Fool yourself: discard it and remove any 1 card from his city; this does not trigger his play (FAQ 2.8.3). If he plays a Fool into your city and you are full, he skips (FAQ 2.8.5); you cannot choose to play a Fool into your own city.

**Gifts to Old Grimbeard:** you may use Inn and Post Office in his city; he then gains 1 point token. Any card or resource you must give an opponent is just discarded (FAQ 2.8.2). Echo Mole may copy a green card in his city.

**His Prepare for Season** (triggered right after yours):
1. If his city has enough colored cards for any basic event (4 Production or 3 Destination/Governance/Traveler), he claims it. At game end he also claims any basic events he qualifies for (FAQ errata 1.2).
2. His new worker goes on Meadow card #1 in spring, #2 in summer, #3 and #4 in autumn. Those cards are fully blocked for you (cannot play, draw or discard); he can still roll them.
3. Move his forest worker counter-clockwise to the next forest card (spring and summer). Move his basic-space worker: spring 3 twigs -> 2 resin, summer -> 1 pebble, autumn -> 1 berry+1 card. In autumn the forest worker leaves the 3rd forest card and goes to the Journey space.

**His score:** 2 points per card in his city (3 per purple), 3 per basic event he achieved, a per-event amount for each special event **you did not achieve**, points for his Journey worker, and tokens you gave him.

| Year (difficulty) | Special event per unclaimed | Journey spot | Extra |
|---|---|---|---|
| 1 "Grumpy" | 3 | 3 | none |
| 2 "Gruff" | 6 | 4 | none |
| 3 "Ghastly" | 6 | 5 | In his autumn Prepare, instead of moving his basic worker to the berry+card spot, remove that worker and one of your workers permanently: you have 5 workers (not 6) in autumn |

## 8. Inferred items summary
All marked ASSUMPTION above: forest exclusivity, worker-on-event recall, destination capacity, Tinder Chipmunk self-target, solo tie, Lost Parchments leftover, unlimited resource supply. Everything else is stated by the rulebook or FAQ.
