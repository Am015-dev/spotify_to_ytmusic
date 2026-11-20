# Doorkick Dungeon: components

Owner rule (20 Nov 2026): the rules and the component STRUCTURE match the base game (card types, counts, distributions,
power curve). The authored card pool is our own design: every monster, item, one-shot, curse, boost and level card has its own
concept, name, text and numbers. This file records the structure we match and how our pool fills it. `cards.js` is the source;
`logic-test.js` row 3 checks the totals.

## Totals

| Deck | Cards |
|---|---|
| Door | 94 |
| Treasure | 74 |
| All | 168 |

## Door deck (94)

| Type | Base structure | Our pool |
|---|---|---|
| Monsters | 37 | 37 (one copy each) |
| Curses | 19 copies | 19 copies (18 designs, one doubled) |
| Races | 3 races x 3 | same (Elf, Dwarf, Halfling: rules cards) |
| Classes | 4 classes x 3 | same (Warrior, Wizard, Thief, Cleric: rules cards) |
| Monster boosts | 6 (two big +, two small +, one minus, one "second monster") | 6: +10, +8, +6, +4, -5, a second copy of the monster |
| Two races / two classes | 2 + 2 | 2 + 2 |
| Wandering monster | 2 | 2 |
| Other rules cards (wear anything, every Cleric levels, borrow to win, swap a monster, all monsters leave) | 1 each | 1 each |

### Monsters by level band

| Band | Count | Treasures each | Base levels (sum) | Our levels (sum) |
|---|---|---|---|---|
| 1-3 | 10 | 1 | 1x5, 2x5 (15) | 1x5, 2x4, 3x1 (16) |
| 4-6 | 8 | 2 | 4x4, 6x4 (40) | 4x3, 5x2, 6x3 (40) |
| 7-9 | 4 | 2 | 8x4 (32) | 7, 8, 8, 9 (32) |
| 10-12 | 6 | 3 | 10x3, 12x3 (66) | 10x2, 11x2, 12x2 (66) |
| 14-16 | 6 | 4 | 14x3, 16x3 (90) | 14x2, 15x2, 16x2 (90) |
| 17-20 | 3 | 4-5 | 18, 18, 20 (56) | 17, 19, 20 (56) |

- Average monster level: 8.08 base, 8.11 ours. Treasure in all 37 monsters: 90 in both.
- Monsters worth 2 levels: 6 in both (the biggest ones).
- "Won't chase low levels": 6 in both, thresholds 3-5.
- Undead: 4 in both. Bonus against one race or class: 14 in both. Run-away modifiers: 4 base, 5 ours.

### Bad Stuff effect families (37 monsters)

| Family | Base | Ours |
|---|---|---|
| Death (incl. a roll that may kill) | 6 | 6 |
| Lose 1 / 2 / 3 levels | 3 / 5 / 3 | 2 / 5 / 2 |
| Back to level 1 | 1 | 0 |
| Lose levels plus something else (or a conditional loss) | 2 | 4 |
| Lose worn items (a slot, Big, best, all) | 5 | 7 |
| Lose hand cards (all, 2, or hand-or-levels) | 3 | 3 |
| Lose race and/or class | 2 | 2 |
| Rivals take your things | 3 | 2 |
| Lose gold worth of items / roll for losses / drop to lowest level | 1 / 1 / 1 | 1 / 1 / 1 |
| None | 1 | 1 |

### Curse families (19 copies)

Base and ours both have: change race, change class, lose 1 level, lose 2 levels, lose a Big item, lose a small item (x2), lose
worn armor / headgear / footgear, lose your best item, become a plain Human, lose a class, neighbours grab hand cards, everyone
discards items of equal value, a lasting penalty, and a next-fight penalty. Ours drops the sex change and uses a -4 next-fight
nap, a -1 rolls curse and a discard-2 curse in its place.

## Treasure deck (74)

| Type | Base | Ours |
|---|---|---|
| Items | 38 | 38 |
| One-shots | 24 copies | 24 copies |
| Go up a level | 9 (6 plain, 3 with a condition) | 9 (6 plain, 3 with a condition) |
| Hireling, treasure hoard, steal a level | 1 each | 1 each |

### Items

| | Base | Ours |
|---|---|---|
| Slots: head / foot / two-hand / one-hand / no slot / armor | 4 / 3 / 5 / 13 / 8 / 5 | same |
| Bonus spread (0 / 1 / 2 / 3 / 4 / 5) | 5 / 6 / 5 / 15 / 6 / 1 | 2 / 7 / 11 / 12 / 5 / 1 |
| Bonus total | 90 | 90 |
| Gold total | 16,200 | 16,200 |
| Big items | 7 | 7 |
| With a race/class limit | 21 | 21 |

### One-shots

| | Base | Ours |
|---|---|---|
| Plain fight bonuses (+2 to +5) | 10, total +32 | 10, total +33 |
| Effect cards (run, doubling, escape, vanish, transform, hand over, ward off a curse, search the discards, ...) | 14 | 14 (same effect types; one fewer vanish, one more escape) |

## Balance check (all-computer sim, 4 players, 400 games per row, same seeds)

| Mode | Base pool: avg turns | Our pool: avg turns | Base deaths/game | Ours | Seat wins (ours) |
|---|---|---|---|---|---|
| Full rules | 44.0 | 44.1 | 0.49 | 0.46 | 21 / 26 / 26 / 28 % |
| Quick | 34.8 | 32.9 | 0.32 | 0.34 | 29 / 23 / 26 / 23 % |

Kills per game: 15.2 base, 15.8 ours (full); 15.4 base, 15.2 ours (Quick). Base-pool seat wins: 27 / 28 / 22 / 23 % (full).
