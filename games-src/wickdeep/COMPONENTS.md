# Wickdeep: components and how they map to the original's structure

All content is original (names, card effects, monsters, maps, story). Counts and kinds follow the compact starter edition.
`rules-test.js` asserts every count below.

| Component | Count | Wickdeep version | Original structure |
|---|---|---|---|
| Heroes | 4 | Wickwarden, Bellringer, Ratcatcher, Lamplighter | 4 starting classes |
| Hand size | 10 / 10 / 9 / 11 | Wickwarden 10, Bellringer 10, Ratcatcher 9, Lamplighter 11 | same hand sizes [unverified exact pairing] |
| HP curve (L1..L9) | high / medium / medium / low | 10..26, 8..20, 8..20, 6..14 | same three curves |
| Ability cards per hero | hand + 3 X + 2 per level 2-9 | 29 / 29 / 28 / 30 (116 total) | same per-level distribution |
| Initiative | 1..99 per card | our own values | same range |
| Summons | 4 kinds | Ferret, Ferret Pack, Rat Swarm, Rat King | class summons |
| Monster types | 16 | Mire Rat, Bell Bat, Loom Spider, Ink Ooze, Hush, Drowned Monk, Tallow Wight, Quarry Ogre, Brine Crab, Bilge Hound, Lid Biter, Chain Ghoul, Saltknife, Wax Archer, Ash Acolyte, Tide Thrall | normal + elite stat sides [count unverified] |
| Bosses | 4 | Wax Matron, Knell Engine, Drowned Abbot, The Unlit | boss stat cards with specials and immunities [count unverified] |
| Monster ability decks | 9 families x 8 cards (2 reshuffle each) | brute, swarm, stalker, archer, caster, guard, ooze, beast, boss | 8-card decks shared by archetype |
| Attack modifier deck | 20 per hero + 20 monster | 6x+0, 5x+1, 5x-1, +2, -2, x2, MISS | identical |
| Bless / curse cards | temporary x2 / MISS | added by cards and effects, leave after drawn | identical |
| Elements | 6 | Fire, Frost, Wind, Earth, Light, Dark | 6 elements, strong / waning / inert |
| Conditions | 10 | Poison, Wound, Stuck, Disarm, Stun, Muddle, Hidden, Strong, Curse, Bless | identical set |
| Perks | 7-10 slots per hero | modifier-deck changes (remove -1, add rolling, add condition cards...) | class perk lists [count unverified] |
| Secret goals | 10 | Butcher, Untouched, Hoarder, ... | battle goal deck, 1 check each [count unverified] |
| Items | 30 | head, body, legs, hand, two-hand, small; spent or once | item deck by slot [count unverified] |
| Scenarios | 25 | 4 acts, branching unlocks, 4 boss fights | 25-scenario campaign |
| Map tiles | per scenario ASCII hex maps | rooms, doors, obstacles, traps, brine, rubble, coins, chests, exits | hex map tiles and overlays |
| Goals used | kill all, boss, loot N chests, escape, reach, survive N rounds, destroy N objectives | same kinds of goals |
| Level table | L0-7 | trap 2+L, coin 2,2,3,3,4,4,5,6, bonus XP 4+2L | identical formulas |
| XP thresholds | 8 | 45, 95, 150, 210, 275, 345, 420, 500 | identical |

## Art and code sources
- Hero and monster sprites, doors, traps, chests, pillars: Kenney "Tiny Dungeon" (CC0), recoloured in code for some monsters.
- Stone floor, brine, coins, walls, torchlight: our own code art.
- Hit, slash, heal and shield effects: Sprite Fusion pixel VFX (MIT), one-shot only.
- Font: Silkscreen (OFL) for numbers and headings; Alegreya Sans (OFL, shared shelf font) for text.
