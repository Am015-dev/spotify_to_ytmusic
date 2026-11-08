# Emberclimb Story: "The Ember Tower" (design notes)

Premise: Warden Ashgrove guides one climber at a time up the Ember Tower, three acts of three chapters. The last chapter of each act is a guardian.
Every chapter is a short run on the game's own rules: a fixed hero, a fixed starting relic, a shorter map, and a named guardian at the top.
Data: `campaign.json` (validated with `node -e "console.log(require('../shell/gx-campaign.js').validate(require('./campaign.json')))"`).

| Ch | Title | Hero | Floors | Top foe | Starting relic | Enemy HP |
|---|---|---|---|---|---|---|
| 1 | First Ember | guide | - | Gnawer | - | the guided first fight (gx-tutor), never saved |
| 2 | Mire Road | Warrior | 2 | Iron Warden | Iron Bangle | 100% |
| 3 | Thorn Gate (boss) | Rogue | 3 | Thorn Brute | Bag of Marbles | 100% |
| 4 | Ash Stair | Automaton | 4 | Sleeper Statue | Candle Stub | 100% |
| 5 | Quiet Hall | Monk | 5 | Sleeper Statue | Tin Lantern | 110% |
| 6 | Behemoth's Mire (boss) | Warrior | 6 | Mire Behemoth | Tin Flute | 85% |
| 7 | Wraith Stair | Rogue | 6 | Ashen Wraith | Smoking Censer | 110% |
| 8 | Hall of Gears | Automaton | 8 | Ashen Wraith | Iron Bangle | 105% |
| 9 | The Cinder Gate (boss) | Monk | 9 | Gate Colossus | Dawnstone | 110% (act 3 boss twist) |
| 10 | Finale: The Ember Heart (boss) | Warrior + Monk | 6 | Ember Tyrant | Phoenix Ash | 32% (final act, last stand) |

W420: chapters 3-10 now start in their act (startAct) and meet every guardian; full table in RULES-COVERAGE.md.

Twists (menu): `start-relic` (setup.relic), `tough-foes` (setup.hpPct), `short-climb` (setup.floors). Engine options in `src/engine.js` `newGame`: `floors`, `boss`, `relic`, `hpPct`.
Difficulty curve: act 1 teaches (short climbs, easy bosses), act 2 normal, act 3 long and tough. Bot win rates per chapter (`node camp-cfg.js 100`, a human wins less):
ch2 100, ch3 94, ch4 99, ch5 86, ch6 66, ch7 72, ch8 66, ch9 31 percent.
Goal: reach the top and win. Stars: win, finish with half your HP, finish with 100 gold. "Make it easier" sets enemy HP to 80% and removes the twist.
Campaign runs are never saved as the Quick game save (`EC_NOSAVE`); chapter progress is saved by the kit.
