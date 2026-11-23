# The Thornbound Throne: components

Owner rule (20 Nov 2026): the rules and the component STRUCTURE match the original (card types, counts, distributions,
strength curve, effect kinds). The authored content is our own: every faction, card, tactic, favour, region, location,
council and threat has its own concept, name, text and numbers. This file records only the structure we match.
`game/src/data.js` is the source the game reads; `cards.json` mirrors it; `proof/content-sheet.md` lists every item.

## Totals

| Component | Count |
|---|---|
| Factions | 4 |
| Faction deck per faction | 19 (14 basic + 5 Site of Power) |
| Faction cards in all | 76 |
| Tactics | 16 (4 per faction) |
| Favour actions | 4 (1 per faction) |
| Kingdom Cards | 51 (17 per suit, 3 suits) |
| Regions | 3, two Locations each (6 Locations) |
| Councils | 3 (one per Kingdom suit) |
| Influence tokens | 32 x1 + 16 x5 |
| Lore tokens | 20 |
| Faction markers | 40 (10 per faction) |
| Supporters | 5 per faction |
| Game length | 4 / 5 / 6 rounds (short / standard / long) |
| Hand size | 3 to 8 |

## Basic deck (14 per faction, same function for every faction, names differ)

| Strength | Cards | Archetypes |
|---|---|---|
| 0 | 2 | 1 ruse (two Day commands, pick one), 1 trader (Autumn rally) |
| 1-4 | 4 | followers, one each |
| 5 | 3 | 1 agent (Deadly), 1 cavalry (Flank), 1 war machine (Deploy) |
| 6-9 | 4 | captains, one each |
| 10 | 1 | heir (starts in hand) |

Traits used: Invulnerable, Pathfinder, Resilient. Votes 0-2 per card, Lore 0-2 per card.

## Site of Power (5 per faction, 20 in all)

| Faction | Advanced | HQ | Strength band of advanced cards |
|---|---|---|---|
| 1 (defensive) | 4 | 1 | 3, 5, 10, 11 |
| 2 (mobile) | 3 | 2 | 3, 11, 11 |
| 3 (scheming) | 3 | 2 | 5, 5, 11 |
| 4 (recall) | 4 | 1 | 3, 5, 5, 11 |

Lore cost of a Site card: 2 to 5. Every faction has exactly one Strength-11 champion.

## Tactics and Favour

- Tactics per faction: 4, timed Spring / Day / Autumn / passive; one per faction is a marker tactic (2-3 markers placed at setup).
- Favour action: one per faction, timed Spring, Day or Autumn; holder gets 3 uses, the disc rotates.

## Kingdom Cards (51)

| Suit | Cards | Placement kinds |
|---|---|---|
| Suit A (its Council: cash in votes) | 17 | 13 on your board, 1 to Supply, 1 on a Region, 1 on a Location, 1 one-shot |
| Suit B (its Council: place markers) | 17 | 16 on your board, 1 to Supply |
| Suit C (its Council: bring Supporters home) | 17 | 15 on your board, 2 on a Region |

Effect kinds used (engine vocabulary only, no new rules): gain influence / lore, hand-size change, Strength bonus,
grant a trait or command (Deadly, Invulnerable, Pathfinder, Resilient, Ambush, Retreat, Flank, Deploy, Rally),
Govern, Journey, swap or move cards (hand, council, Lost Pile, deck), peek face-down cards, steal protection,
Favour use, Order Track control, region modifiers (halve, blank, skip Day/Night), one-shot clash boosts.

## Map

| Region | Locations | Reward kinds |
|---|---|---|
| 1 | 2 | Govern; Journey |
| 2 | 2 | take the Favour disc; extra influence |
| 3 | 2 | cycle cards to the deck bottom; draw back from the Discard Pile |

Location influence values: five Locations give 1, one gives 2.

## Solo

24 Threat cards (effect: rival cards in fogged Regions gain a trait or bonus), weight 1-3 each. Status: partial (see GAPS.md).
