# Emberclimb components (F1, 20 Nov 2026)

Counts are read from `src/data.js` (run `node -e "require('./core.js')"` after `python3 build.py` to re-check).
Every number on screen is the tabletop number (`D.SCALE = 1`, F2): Strike 1, Defend 1, Warrior 10 HP, Rest heals 3.

## Cards

| Group | Cards | starter / common / uncommon / rare |
|---|---|---|
| Ember Warrior | 24 | 3 / 9 / 8 / 4 |
| Venom Rogue | 24 | 4 / 9 / 7 / 4 |
| Orb Automaton | 24 | 4 / 9 / 7 / 4 |
| Stance Monk | 24 | 4 / 9 / 7 / 4 |
| Neutral (any hero) | 5 | 0 / 3 / 2 / 0 |
| Status, curse, token | 9 | 6 status, 3 curse (Shiv and Calm Spark are tokens) |

Every playable card (110) has its own upgrade in the `U` table in `src/data.js` (new effects, new cost, or Exhaust removed).
logic-test rule 52 and rules-test check that every card has one and that it is strictly better.

## Other components

| Component | Count | Notes |
|---|---|---|
| Heroes | 4 | all playable in Quick from the start (no Story lock) |
| Foes | 27 | Act 1 foes use their printed tabletop cards; Act 2, 3 and final foes are our own |
| Bosses | 4 | act 1 Mire Behemoth (splits), act 2 Ashen Wraith, act 3 Gate Wyrm, final Ember Tyrant |
| Relics | 19 | 8 open after Story chapters (RLOCK in ui.js) |
| Potions | 9 | 3 slots per hero; Pocket Satchel adds 1 |
| Events | 13 | |
| Climb length | 1 act, 3 acts (default), 3 acts + final | setup screen |
| Difficulty | Tabletop (default, rulebook numbers), Gentle (opt-in: 5x HP, 3 Healing Draughts, Rest heals 8) | |

## Not identical to the original

This file does not map our cards, relics, potions and events one-for-one to the original's lists, and F1 did not copy those lists.
Rules and numbers follow the tabletop (see rules-notes.md); content beyond Act 1 foes is our own design.
[unverified] how many cards, relics, potions and events the original has. They were not checked against a source in this pass.
