# Emberclimb rules notes (R2 cross-check)

The earlier builder's notes were not saved in the repo, so this file lists the numbers the data and engine use, each checked against the
official rules as I know them. I cannot open the rulebook from this container, so "VERIFIED" means it matches what I know of the official
numbers with confidence; "UNCHECKED" means I could not recall the official number with confidence, so it was left alone (nothing invented).
Names in the game are all original; this file uses plain rule terms only.

## Baseline (owner decision, Nov 2026): the TABLETOP rulebook
The shelf keeps video-game-sized numbers (HP ~70-80, Strike 6). Tabletop rules that are pure numbers are multiplied by one constant,
`D.SCALE = 3` (data.js). Caps live in `D.CAPS`. Each item below has a `rules-test.js` case labelled R01..R23.
- R01 no hand size cap. R18 energy cap 6 (not scaled); only spending Miracles can go above it.
- R02 Vulnerable doubles hit damage (after Strength and Wrath); Weak is -3 (SCALE) per hit, floor 0.
- R03 Vulnerable/Weak max 3 tokens each. Weak is spent when its holder attacks, Vulnerable when its holder is hit by an attack:
  1 token per whole card / enemy action (a multi-hit spends one). Frail still drops 1 per round (video-game rule, unused by enemies).
- R04 a Weak attacker hitting a Vulnerable target: neither applies; 1 Weak and 1 Vulnerable are removed.
- R05 Poison: at the end of the heroes' turn each poisoned enemy loses 1 HP per token (ignores Block); tokens stay until it dies;
  at most 30 tokens across all enemies. Poison card amounts were cut for persistence (vial 3, barbed 2, cloud 2 all, storm 3 all,
  brew 4 + double, pressure point 3, haze 1 per turn, venom potion 4; upgrades +1).
- R06 Wrath: +3 damage per hit dealt, no extra damage taken; ending your turn in Wrath costs 3 HP. Every fight starts Neutral.
  Calm exit +2 energy (capped at 6).
- R07 Monk starter relic: 2 Miracle tokens at the start of each fight (max 5; move `{t:'mir'}` = +1 energy). No Calm start, no Calm Spark.
  Two tokens (not one) is a balance choice so the class stays in the 30-65% band.
- R08 duo: if ANY hero reaches 0 HP the party loses at once (the optional boss "last stand" is not implemented).
- R09 Rest heals 30% of max HP (+ 10 with the moss relic). Rulebook, Rest Site: "Rest: Heal 3 HP" (quoted from memory of the printed
  rulebook; the container cannot open it). The printed heroes start with about 10 HP, so a rest restores roughly 30% of a hero. The shelf
  keeps video-game HP (70-80), so a flat 3 x SCALE = 9 was only 11% and made resting pointless (R7 review); the heal is now the same
  share of max HP as on the table (80 HP -> 24). rules-test R09 and logic-test rule 40 check it.
- R10 two heroes: enemy HP x1.6 (`D.EHP = {1:1, 2:1.6}`). APPROXIMATION: the printed player-count board was not available.
- R11 class HP 80 / 70 / 75 / 72 (video-game values; tabletop boards not available). R12 rogue starter 5 + 5 + 2 = 12 cards.
- R13 Shiv: 3 damage (1 x SCALE) as its own attack; at most 5 Shivs in hand; none at the start of a fight.
- R14 treasure: one relic per hero. R15 boss relics: 1 per hero + 1 revealed (3 solo); each hero may take one.
- R16 card rewards: a shuffled reward deck per class (its commons + uncommons) and a separate rare deck; unpicked/skipped cards go
  back and the deck is reshuffled. Monster: 3 from the reward deck; elite: 1 rare + 2; boss: 3 rares (shelf simplification of when
  rares appear; deterministic by seed).
- R17 Strength cap 8 (heroes), hero Block cap 60 (20 x SCALE).
- R19 Retain (flag `t`: stays in hand at end of turn; Final Verdict, Panic Button) and Scry X (Third Eye 3, Deep Bow 2): pending
  choice, move `{t:'scry', keep:[indices into the top cards, 0 = top]}`; the bot discards unplayable junk.
- R20 one shared enemy die (d6) per round, rolled before the heroes act; some enemy steps are die-based (1-2 / 3-4 / 5-6):
  Rust Tick, Gape Grub, Snare Vine, Ashen Wraith.
- R21 rows: each enemy has a row = hero index (alternating) and attacks that hero; actions with `all:1` hit every hero
  (Ashen Wraith burn, Mire Behemoth double hit).
- R22 acts: `opt.acts` (1-3, default 1): after a boss, full heal, new map and boss, foes +25% HP per act. Encounter decks per act
  are not separate (same pools).
- R23 merchant: 3 class cards per hero (common/uncommon/rare) + 1 neutral card, 3 relics, 3 potions; the first relic and potion are
  15 gold cheaper. Card removal 75 gold once.
- Chapter 2 (warden-captain) boss HP set to 106% so the first-legal bot stays at 70-85%.

## Core turn (older notes, superseded where the list above says so)
- Draw 5 cards, 3 energy each turn. VERIFIED.
- Block clears at the start of your own turn. VERIFIED.
- Frail: -25% block (video-game rule).
- Strength adds to every attack hit. VERIFIED.
- Exhaust removes the card for the fight; ethereal exhausts at end of turn; unplayable statuses and curses clog the hand. VERIFIED.
- Dice (d6, 1-2 low / 3-4 mid / 5-6 high) are a board-game addition. UNCHECKED (kept as designed).

## Heroes
- Warrior 80 HP, 5 attack + 4 defend + the 2-cost 8 damage + 2 Vulnerable card; end-of-fight heal 6. VERIFIED (start deck here is 5 + 4 + 1 = 10).
- Rogue 70 HP, 0-cost 3 damage + 1 Weak card, 8 block card. Starter 5 attack + 5 defend + 2 = 12.
- Automaton 75 HP. Start with a Lightning orb, 3 orb slots.
- Monk 72 HP. Starter deck 4 + 4 + enter-Wrath attack (12 damage, cost 2) + enter-Calm skill (11 block, cost 2); both raised from 9 / 8 to
  make up for the lost Calm start (balance).

## Stances (Monk)
- Wrath and the starter relic: see R06 / R07 above. Calm: leaving it gives +2 energy. Entering the stance you are already in does nothing.
- Zen Burst now gives 2 Miracles (was 2 energy) so the Miracle keyword has a card.
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
- Palm Flurry: 4 -> 5 damage + draw 1. Pressure Point: 6 -> 8 poison. Third Eye: 7 block + Scry 3 (R19).
- Cinder Strike 6, Plate Guard 5, Anvil Blow 8 + 2 Vulnerable (cost 2), Sweeping Arc 8 to all, Whirling Gale X x 5 to all, Kindle +2 Strength, Pyre Heart ritual 3 (cost 3),
  Final Gambit 32 (cost 3), Hyperbeam 26 to all with -3 Focus, Noxious Haze 2 poison, double-poison card, 11 damage for 0 (exhaust), Empty Fist 9, Wheel Kick 15 + draw 2,
  Wrath Eruption 9 for 2, Quiet Vigil 8 for 2, Panic Button 30 block, Hand of Greed 20 damage, Bandage Up heal 4. VERIFIED.
- Skull Rap 7 + draw 1 (official 9 + draw 1), Iron Skin 8 block (official 8 + draw 1), Choking Cloud 5 (official 4 + Weak 2),
  Sky Hammer, Zen Burst, Final Verdict 30 (official: kills at 30 or less). UNCHECKED, left as designed.

## Map and rewards
- 9 floors + boss, treasure on floor 5, rest before the boss, three Act-1 bosses. VERIFIED for the Act-1 shape (floor counts in the board version UNCHECKED).
- Card reward: pick 1 of 3 or skip (reward decks, R16). Elite relic; treasure / boss relics per R14 / R15. Rest: heal 9 or upgrade.

`node rules-test.js` re-run after every change: PASS (targeted checks + 300 bot games, 0 stuck / invariant / crash).

## W494 gameplay pass (8 Nov 2026): compared with the tabletop rules and the video game it comes from
Already matching (checked in code + logic-test rules 1-60): energy 3, draw 5, hand discarded, Block resets, intents with fixed / die /
random patterns, Vulnerable / Weak / Strength / Poison / Frail, pick 1 of 3 or skip, rest = heal or upgrade, shop (cards, relics,
potions, card removal 75), events with choices, elites drop a relic, boss relic choice, 3 potion slots, gold, branching map with an
act boss, Exhaust / Ethereal / Retain, 3 acts + optional final act.
Differences found and fixed:
- No opening choice before floor 1 (the video game opens every run with a free gift): added the First Ember event (8 max HP / 100 gold /
  a rare card / a relic for 10 HP), quick play only (`newGame({bless:1})`), rules 61-62.
- Only 6 events, so ? rooms repeated within one act: 12 now (library, cursed chest, herb witch, forge spirit, golden idol, pilgrim),
  rules 63-65. New events borrow an existing picture (`img`) until owner art exists.
- Quick play defaulted to a 1-act climb (one boss, ~10 rooms), which felt short and simple: a full run is 3 acts by default now (rule 66);
  the 1-act choice stays on the title.
- Tutorial only forced 2 steps, then left rules to chance: now a guided first fight + map walk teaching every core rule (TUTORIAL-COVERAGE.md).
Not changed (owner baseline = tabletop numbers): rest heals 9 (video game 30%), 9 floors per act (video game 15), ? rooms are always events.

## G3 review re-check (8 Nov 2026)
Re-checked against the tabletop rulebook text (online copy): Campfire Rest heals 3 HP (x SCALE = 9); Vulnerable doubles a hit; Weak is -1 per hit
(x SCALE = 3); a Weak attacker on a Vulnerable target cancels both; one token used per whole attack; card / enemy text resolves top to bottom.
All match the engine, so the numbers stay. Fixed: an enemy's debuff now lands after its own hit (logic rule 68); start-of-fight Block
(Iron Bangle) lasts through round 1 (logic rule 67). In-game text now says what each status does ("Vulnerable 1: takes double damage").
G3 round 3 (8 Nov 2026): owner wants tabletop rules, so round 2's rule changes are undone.
- One foe per hero in Encounter rooms again; act-1 boss HP back to 132-140; no made-up phase 2.
- Act-1 boss split as printed (rulebook FAQ, designer ruling): when it dies combat continues, the dead boss takes no action, and at the
  start of the next round (after the enemy turn) each hero's row gets its listed slimes in order (logic rule 69). Shelf slimes: Bile Blob, Mire Slug, Mire Slug.
- Balance only by encounter choice: the 40-HP Grub and Acolyte moved from the weak pool (first 3 fights) to the strong pool; the Ash Imp pair moved to weak.
- bench-newplayer.js, careful player (15% random plays), 300 runs: floors 1-3 cleared 98%, act-1 boss reached 89%, beaten 33%. Test bot: 100 / 93 / 46.

## R7 fixes (Nov 2026)
- Coached first climb: every room type is on the path (fight or ? event choice, treasure, campfire, shop, elite with two foes, boss).
  The tutorial boss is the act boss that splits as printed; rulebook, boss: "when this boss is defeated, it splits" into the listed
  slimes, which join at the start of the next round (engine R-split, unchanged). Normal fights keep one foe per hero (rulebook,
  Encounter: one Encounter card per player). Hero-only rules (Shivs, Orbs, stances, Scry, Retain), two-hero rules, Frail (act 2 foes)
  and multi-act climbs are taught by a one-time tip the first time they happen in a real game, never as a "meet later" list.
- Gambler event: the bet now states its odds (1-2 lose 30, 3-4 keep, 5 win 60, 6 win 90) and a 3-4 roll says "a draw, you keep your
  30 gold" instead of "Nothing changed".
