# Wickdeep audit vs the starter-edition rules (W608)

Checked against rules-notes.md and COMPONENTS.md (structure of the published co-op card-driven dungeon crawl; our own names).
The engine already matches the structure: 4 heroes (hand 10/10/9/11, 3 HP curves), 116 ability cards, 16 monster types + 4 bosses,
8-card monster decks, 20-card modifier deck (6/5/5/1/1/1/1), 6 elements, 10 conditions, 25 scenarios / 4 acts, level table, XP thresholds.
rules-test.js: 439 passed, 0 failed.

## Mismatches
| # | Area | Mismatch | Status |
|---|---|---|---|
| 1 | Map | Unrevealed rooms were drawn as empty black void. In the original the whole scenario layout is known (printed map); only contents are hidden until a door opens. | FIXED: unrevealed rooms show as fog tiles with "?" |
| 2 | Resting | Short rest was only offered with 3 or fewer cards in hand and never in round 1. Original: any hero with 2+ played cards may short rest at end of every round. | FIXED: offered whenever legal (only skipped in the round-1 lesson) |
| 3 | Damage | Block with cards (lose 1 hand / 2 played to ignore damage) is only offered when a hit would knock you out. Original: any damage source. | OPEN (interface shortcut) |
| 4 | Items | Armor items are used on your own turn, not as a reaction to a hit. | OPEN |
| 5 | Elements | An element bonus is always consumed when available; original lets you choose. | OPEN |
| 6 | Line of sight | Traced centre to centre, original is corner to corner. | OPEN (rare difference) |
| 7 | Monsters | Stat tables come from a per-type formula, not printed per-level tables. | OPEN (own numbers, same shape) |
| 8 | Push/pull | Destination hex picked automatically. | OPEN |
| 9 | Counts | Exact counts of item deck, perks per class and battle goals are unverified (30 / 7-10 / 10). | OPEN, needs a rulebook check |

## Layout changes (play screen)
- Hero tokens 54+ px with a round HP badge (13px+ number) on every hero and foe; phone zoom cap 46 -> 54.
- Fog of war over unrevealed rooms, so the dungeon reads as rooms at a glance.
- Active-hero bar docked at the bottom: portrait, name, HP bar, HP and cards in hand; the acting hero glows.
- Every instruction is a bubble with an arrow next to its target (board hex, card, Ready, rest button); on PC it sits beside the
  card dock pointing right. The bubble never takes taps and never covers its target. The old bottom prompt line is hidden while it shows.

## Proof
- proof/redesign-402x874.webm: guided first game at 402x874 touch, tapping only where the bubble points: Victory in round 7, 112 taps.
- proof/before/*.png and proof/after/*.png (start, first room, fight; after/end.png = victory).
- tap-play 402x874: 62 taps, 0 dead, no errors.
