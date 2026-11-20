# Emberclimb components: structure only (W571, 20 Nov 2026)

This file lists counts, curves and bands, not content. Every card, foe, relic and potion is our own (names, effects, numbers);
the full list is in `proof/content-sheet.md`. Counts are read from `src/data.js` after `python3 build.py`
(`node -e "require('./core.js')"`). Every number is the tabletop number (`D.SCALE = 1`).

## Cards (110 playable + 9 status/curse/token)

| Group | Cards | starter / common / uncommon / rare | Attack / Skill / Power | cost 0 / 1 / 2 / 3 / X |
|---|---|---|---|---|
| Ember Warrior (Strength) | 24 | 3 / 9 / 8 / 4 | 13 / 7 / 4 | 1 / 16 / 4 / 2 / 1 |
| Venom Rogue (Poison, Shivs) | 24 | 4 / 9 / 7 / 4 | 8 / 13 / 3 | 3 / 13 / 7 / 1 / 0 |
| Orb Automaton (orbs) | 24 | 4 / 9 / 7 / 4 | 8 / 12 / 4 | 2 / 14 / 5 / 1 / 2 |
| Stance Monk (Wrath / Calm) | 24 | 4 / 9 / 7 / 4 | 12 / 9 / 3 | 4 / 17 / 1 / 2 / 0 |
| Neutral (shop, events) | 5 | 0 / 3 / 2 / 0 | 1 / 4 / 0 | 4 / 0 / 1 / 0 / 0 |
| Status 4, curse 3, token 2 | 9 | unplayable junk, plus the Shiv and Calm Spark tokens | | |

- Starter deck: 10 cards (12 for the rogue): 4-5 basic attacks of 1, 4-5 basic blocks of 1, and 1-2 hero cards.
- Damage per card (single hit, all-foes hit or hits x damage): 1 on 19 cards, 2 on 10, 3 on 4, 4 on 4, 5 on 2.
  Rares carry the 4-6 hits. Block per card: 1 on 31 cards, 2 on 2, 5 on 1 (a one-shot neutral).
- Every playable card has its own upgrade (`U` table in data.js): bigger numbers, a lower cost or no Exhaust. logic-test rule 52
  checks that each upgrade is strictly better.
- Card text is generated from the effect list, so each line is 8 words or fewer (rules-test).
- Effect vocabulary (engine rules, unchanged): damage, multi-hit, hit-all, Block, Strength (+ double), Weak, Vulnerable, Poison
  (+ double, all), Shivs, draw, energy, heal, HP loss, die roll rows, orbs (channel, evoke, slots, Focus), stances, Scry, Miracle,
  added junk, powers (end-of-turn Strength or Block, start-of-turn Poison or Lightning, Block per card, draw on Wrath, Block on
  stance change, energy per turn, Poison on unblocked hits).

## Foes

| Act / tier | Foes | HP band | biggest single move |
|---|---|---|---|
| Act 1 normal | 10 | 3-11 | 1-4 |
| Act 1 elite (incl. a 3-foe group) | 5 | 6-20 (per hero) | 2-4 |
| Act 1-3 guardians (bosses) | 4 | 20-42 (per hero); captain 7 | 3-6 |
| Act 2 normal / elite | 3 / 1 | 3-5 / 11 | 2 / 4 |
| Act 3 normal / elite | 2 / 1 | 4-6 / 15 | 2-3 / 3 |
| Final act guardian | 1 | 26 | 6 |

- Act 1 foes use the tabletop rule set: 3-row die (1-2 / 3-4 / 5-6) or 2-row die (1-3 / 4-6), a gentle first-encounter side for 2
  foes, one opening step for 1 elite, one foe that sleeps, one Skill tax, one Hunker (Block the first time it is hurt), one foe that
  makes heroes Vulnerable on death, one guardian that splits into 3 normal foes, one guardian with a defensive mode. Patterns and
  numbers are ours; the W571 rewrite kept each foe's HP within one point of its old value and each tier's damage band.
- Acts 2-4 foes are scaled by the engine (+25% HP per act) and drawn from per-act decks (`ENCA`).

## Relics and potions

| Component | Count | Notes |
|---|---|---|
| Relics | 19 | 4 hero starters, 10 common, 2 uncommon, 3 boss. 8 open after Story chapters (RLOCK in ui.js). |
| Potions | 9 | 3 slots per hero; one relic adds a slot. 2 aim at a foe, 7 do not. |
| Events | 13 | unchanged in W571 |
| Heroes | 4 | all playable in Quick from the start |

Relic and potion effects live in `engine.js` (`has('<id>')` hooks and `usePot`); their text is in data.js, and `relic-test.js`
checks that each relic does what its text says.
