# Emberclimb rules coverage (W420, 8 Nov 2026)

Source list: `games-src/rules-check/emberclimb.md` (15 WRONG, 8 MISSING, 6 SIMPLIFIED) + `rules-notes.md`. Baseline: the tabletop rulebook
(owner decision), with numbers x `D.SCALE = 3`. Each built rule has a case in `rules-test.js` (label in the Test column).

| # | Rules-check finding | Status | Where | Test |
|---|---|---|---|---|
| 1 | No hand size cap | built (R2) | engine draw | R01 |
| 2 | Vulnerable doubles, Weak -1 (x3) per hit | built (R2) | engine hitCalc | R02 |
| 3 | Weak/Vulnerable max 3, spent per attack / enemy action | built (R2) | engine addSt, ATK | R03 |
| 4 | Weak attacker vs Vulnerable target: neither applies | built (R2) | engine hitCalc | R04 |
| 5 | Poison: 1 per token at end of turn, stays, cap 30 | built (R2) | engine end of turn | R05 |
| 6 | Wrath +1 (x3) per hit, ending in Wrath costs HP, start Neutral | built (R2) | engine stance | R06 |
| 7 | Stance class starts Neutral with Miracles | built (R2) | data H.m, engine | R07 |
| 8 | ANY hero at 0 HP loses at once | built (R2) | engine killHero | R08 |
| 9 | Rest heals 3 (x3) | built (R2) | engine rest | R09 |
| 10 | Enemy HP by player count | approximated x1.6 for 2 heroes (printed board not available) | data EHP | R10 |
| 11 | Class HP per board | video-game values (boards not available) | data H | R11 |
| 12 | Rogue starter 12 cards | built (R2) | data H.s | R12 |
| 13 | Shiv 1 (x3) damage, max 5, none at start | built (R2) | engine shiv | R13 |
| 14 | Treasure: a relic per player | built (R2) | engine enterNode | R14 |
| 15 | Boss relics 1 per player + 1, each takes one | built (R2) | engine winBattle | R15 |
| 16 | Card reward deck per class + rare deck, skipped cards go back | built (R2) | engine rewardPool | R16 |
| 17 | Strength cap 8, Block cap 20 (x3) | built (R2) | engine addSt/gainBlk | R17 |
| 18 | Energy cap 6 (Miracles may exceed) | built (R2) | engine | R18 |
| 19 | Retain, Scry | built (R2) | engine flags t, scry move | R19 |
| 20 | Enemy actions: single / die-roll; one shared die per round | built (R2) | engine beginRound, data die steps | R20 |
| 21 | Enemy rows; all-hero actions | built (R2) | engine row/all | R21 |
| 22 | 3 acts, full heal at each act start | built (R2) + W420: act counter in the HUD, Quick game "1 act / 3 acts / 3 acts + finale" | engine leaveNode, ui quick | R22 |
| 23 | Encounter / elite / boss decks PER ACT | **built W420**: act 2 (Cinder Hound, Ash Wisp, Smoke Hexer, elite Skyclaw), act 3 (Grave Knight, Bone Caller, elite Tomb King), act 4 deck; one fixed guardian per act (Mire Behemoth, Ashen Wraith, Gate Wyrm, Ember Tyrant) | data ENCA/ACTBOSS, engine startBattle | R24 |
| 24 | Optional final act | **built W420**: opt.final adds act 4 and the Ember Tyrant boss; a chapter can start in any act (opt.startAct) | engine newGame | R25 |
| 25 | Frail (video-game rule) unused by enemies | **built W420**: Ash Wisp and Tomb King apply Frail (Block -25%) | data, engine blk | R26 |
| 26 | Optional boss "last stand" | **built W420** (shelf version): with 2 heroes in a boss fight the first fall stays at 1 HP with Weak 3; the second fall loses; solo has none | engine killHero | R27 |
| 27 | Merchant 3 cards per player + 3 relics + 3 potions, first one cheaper | built (R2) | engine genShop | R23 |
| 28 | Negative Focus could remove Block (found by the 4-act climbs) | **fixed W420**: block gain is never negative | engine gainBlk | full-climb bot games |
| S1 | Printed branching maps | SIMPLIFIED (generated 4-wide maps; kept) | engine genMap | map test |
| S2 | Dice on cards and events | SIMPLIFIED (board-game addition; kept) | data | R20 |
| S3 | 1-4 players | SIMPLIFIED: 1-2 heroes (phone screen); not built | engine newGame | - |
| S4 | Card numbers tuned | documented in rules-notes.md | data | - |
| S5 | Unlockable characters | the tabletop rules have none (all classes open); Story already unlocks Rogue / Automaton / Monk for the Quick game after chapters 2-4 | campaign.json unlock | - |

Built this round: 5 (rows 23-26, 28) of the 5 still missing; total rules-check rows covered: 28 of 29 (S3 1-4 players left as a documented simplification).

## Story campaign (campaign.json + src/story.js, balance: `node camp-cfg.js 60`)
Ten chapters across the three acts of the kit (the kit allows acts 1-3, so the final act is chapter 10 inside act 3; in the engine it is act 4).
Every guardian appears once as a chapter boss; every chapter has an intro scene, boss lines before/after, win and loss outros.

| Ch | Act (engine) | Hero | Guardian | Enemy HP % | Bot win % |
|---|---|---|---|---|---|
| 1 | 1 | Garrick (coached) | Gnawer | - | coached |
| 2 | 1 | Garrick | Warden Captain | 106 | 98 |
| 3 | 1 (boss) | Sable | Mire Behemoth (act 1 guardian) | 70 | 88 |
| 4 | 2 | Cog-9 | Skyclaw (act 2 elite) | 53 | 82 |
| 5 | 2 | Ione | Sleeper Statue | 86 | 80 |
| 6 | 2 (boss) | Garrick | Ashen Wraith (act 2 guardian) | 75 | 64 |
| 7 | 3 | Sable | Tomb King (act 3 elite) | 49 | 70 |
| 8 | 3 | Cog-9 | Thorn Brute | 42 | 76 |
| 9 | 3 (boss) | Ione | Gate Wyrm (act 3 guardian) | 47 | 36 |
| 10 | final act (engine act 4) | Garrick + Ione (Last Stand) | Ember Tyrant | 32 | 32 |

Enemy HP % compensates for the +25% per act the engine adds (a chapter starts with a starter deck). Story unlocks: Rogue after ch2,
Automaton after ch3, Monk after ch4 (Quick game heroes), plus relics.
