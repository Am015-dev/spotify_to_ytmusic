# Emberclimb rules notes (R2 cross-check)

The earlier builder's notes were not saved in the repo, so this file lists the numbers the data and engine use, each checked against the
official rules as I know them. I cannot open the rulebook from this container, so "VERIFIED" means it matches what I know of the official
numbers with confidence; "UNCHECKED" means I could not recall the official number with confidence, so it was left alone (nothing invented).
Names in the game are all original; this file uses plain rule terms only.

## Core turn
- Draw 5 cards, 3 energy each turn, hand limit 10. VERIFIED.
- Block clears at the start of your own turn. VERIFIED.
- Vulnerable: target takes +50% attack damage. VERIFIED. Weak: attacker deals -25%. VERIFIED. Frail: -25% block. VERIFIED.
- Strength adds to every attack hit. VERIFIED.
- Poison: lose that much HP at turn start, then it drops by 1. VERIFIED.
- Exhaust removes the card for the fight; ethereal exhausts at end of turn; unplayable statuses and curses clog the hand. VERIFIED.
- Dice (d6, 1-2 low / 3-4 mid / 5-6 high) are a board-game addition. UNCHECKED (kept as designed).

## Heroes
- Warrior 80 HP, 5 attack + 4 defend + the 2-cost 8 damage + 2 Vulnerable card; end-of-fight heal 6. VERIFIED (start deck here is 5 + 4 + 1 = 10).
- Rogue 70 HP, 0-cost 3 damage + 1 Weak card, 8 block card. VERIFIED. (Starter deck: 4 attack + 5 defend + 2 = 11; official starter has 5 + 5 + 2, UNCHECKED for the board version.)
- Automaton 75 HP -> CHANGED 72 HP (balance only, see table; official value 75 kept in mind for a later pass). Start with a Lightning orb, 3 orb slots. VERIFIED.
- Monk 72 HP -> CHANGED 76 HP (balance only). Starter deck 4 + 4 + 9-damage-enter-Wrath (cost 2) + 8-block-enter-Calm (cost 2). VERIFIED.

## Stances (Monk)
- Wrath: damage dealt AND taken doubled. VERIFIED. Calm: leaving it gives +2 energy. VERIFIED.
- Entering the stance you are already in does nothing. VERIFIED.
- Start fights in Calm (relic). CHANGED: "Prayer Beads" now also puts one Calm Spark (0 cost, +1 energy, exhaust) in the opening hand, matching the official starter relic's effect (old: Calm only).
- Rush power: entering Wrath draws 2 cards. VERIFIED. Mental Fortress power: 4 block on every stance change. VERIFIED.
- Inner Peace: draw 2 -> CHANGED draw 3 and enter Calm (official: draw 3 if already in Calm, else enter Calm; the simple version always does both).

## Orbs (Automaton)
- Lightning passive 3 damage to a random enemy at turn end, evoke 8; Frost passive 2 block, evoke 5; Dark grows by 6 per turn, evoke = stored value. VERIFIED.
- Channel into a full row evokes the oldest orb. VERIFIED. Focus adds to every orb number. VERIFIED.

## Card numbers (changed to official where I knew them)
- Toxic Vial: 6 -> 5 poison. CHANGED.
- Glacier Core: 7 -> 6 block. CHANGED.
- Meteor Strike: 30 damage / 3 energy -> 24 damage / 3 energy (official 24 for 5 energy; kept 3 energy for hand size). CHANGED.
- Core Breach 12 -> 10 and Barrier Pulse 8 -> 7: CHANGED (invented cards, tuning only).
- Palm Flurry: 4 -> 5 damage + draw 1. Pressure Point: 6 -> 8 poison. Third Eye: 7 block, now also draws 1 (stands in for the official scry 3). CHANGED (Monk tuning).
- Cinder Strike 6, Plate Guard 5, Anvil Blow 8 + 2 Vulnerable (cost 2), Sweeping Arc 8 to all, Whirling Gale X x 5 to all, Kindle +2 Strength, Pyre Heart ritual 3 (cost 3),
  Final Gambit 32 (cost 3), Hyperbeam 26 to all with -3 Focus, Noxious Haze 2 poison, double-poison card, 11 damage for 0 (exhaust), Empty Fist 9, Wheel Kick 15 + draw 2,
  Wrath Eruption 9 for 2, Quiet Vigil 8 for 2, Panic Button 30 block, Hand of Greed 20 damage, Bandage Up heal 4. VERIFIED.
- Skull Rap 7 + draw 1 (official 9 + draw 1), Iron Skin 8 block (official 8 + draw 1), Choking Cloud 5 (official 4 + Weak 2),
  Sky Hammer, Zen Burst, Final Verdict 30 (official: kills at 30 or less). UNCHECKED, left as designed.

## Map and rewards
- 9 floors + boss, treasure on floor 5, rest before the boss, three Act-1 bosses. VERIFIED for the Act-1 shape (floor counts in the board version UNCHECKED).
- Card reward: pick 1 of 3 or skip. Elite relic, boss relic choice of 3. VERIFIED. Rest: heal 30% or upgrade. VERIFIED.

`node rules-test.js` re-run after every change: PASS (targeted checks + 300 bot games, 0 stuck / invariant / crash).
