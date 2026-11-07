# Tidewake: tutorial coverage (the Lantern Race prologue)

Guide: Grandmother Osk (lantern keeper). Rival: Cobalt, who swears the Lantern Reach is his. One real, fixed-seed, scripted game against the real engine,
played from setup to the result card (17 steps, 4 story chapters). All words live in `game/texts.js` (`TUT_TEXT`). Steps: `game/ui10.js`; fixed cards, dice and Cobalt's
script: `game/src/tutscript.js`. Proven by `game/tutor-test.js` (taps every spotlight's centre, wrong taps must not advance, target not covered) at 390x763 and 1440x860.

| Rule | Step id | Story beat (chapter) |
|---|---|---|
| [x] goal: last junk afloat wins | goal, win | Ch.0 "Cobalt swears the Lantern Reach is his"; Ch.4 "The lantern is yours" |
| [x] choose a start mark, all junks placed first | mark, mark2 | Ch.1 "Cobalt already sailed. Pick your berth", "Cast off" |
| [x] dice roll: 6, 7, 8 wakes the leviathans, other totals calm | stir | "Dice at dawn... watch them go" |
| [x] leviathan move: one die each, an arrow or a turn | stir, cannon | "The sea stirs" |
| [x] lay a tile in front of your junk (pick, turn, place) | pick, turn, place | "Lay your first current", "Safe water" |
| [x] red cross = off the chart, not allowed; green check = safe | turn, place | "Mind the edge!" |
| [x] the junk sails to the end of its wake; draw back to 3 | sail | "Well sailed!" payoff |
| [x] sail on through other captains' tiles | chain | "Ride his current" |
| [x] two junks on one wake both sink | rivals | Ch.2 "Cobalt's wake" |
| [x] Deck Cannon: keep it, fire it at a leviathan about to sink you | keep, cannon, place4 | "A Deck Cannon!", "Fire the cannon!", "Open water" |
| [x] Rogue Wave: roll its strength or capsize; roll again when crossing its row | wave, place3 | Ch.3 "The Rogue Wave", "Cross the wave" |
| [x] a leviathan landing on a tile destroys it and sinks the junk on it | sunk | "Cobalt's luck runs out" |
| [x] last junk afloat wins (end of game) | win | Ch.4 climax, Osk's reaction |
| [ ] NOT in the tutorial (Help / lightbulb / Rules drawer explain them): Rift Gate, Maelstrom, elimination swap bonus, blocked-start relocation, teams, solo, tie when two exit together | - | honest gap |

Chapters are story labels inside one run (the run can be left with Skip and restarted; "leave and come back" resumes). They are not separate resumable levels.
