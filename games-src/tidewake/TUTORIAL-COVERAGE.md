# Tidewake: tutorial coverage (the Lantern Race, a guided first game)

Since W498 the tutorial is a short FIXED game against Cobalt, one step at a time. It replaces the free coached game (W411) and its
"Things you'll meet later" list: every base rule is now shown on the board, in order, when it happens.

- Script (engine layer): `game/src/tutscript.js`. Fixed seed, leviathans, hands, tile pile, dice and Cobalt's moves. Proof: `game/tutscript-test.js`.
- Steps (page layer): `game/ui10.js` (`tutSteps`, ids in `TUT_RULES`), run through the shared tutor kit (`shell/gx-tutor.js`).
- Each step = one sentence of 12 words or fewer + one highlighted thing to tap. Only the highlight takes input; Cobalt waits while a step is up.
- At the end: "You know the rules" card, then **Play a real game** (2 captains, base rules, random everything). From Story: **Start chapter 1**.
- Proof: `game/tutor-test.js` (real touch taps on the highlight only, 390x844 and 375x667): every rule step shown in order,
  every sentence <= 12 words, one highlight per step, bubble never over the highlight, the real game starts after, 0 console errors.
  Shots: `playable-shots/w498/tut-1..tut-34.png`.

| # | step id | rule taught | sentence |
|--:|---|---|---|
| 1 | goal | last junk afloat wins | Last junk afloat wins. Tap the sea chart to begin. |
| 2 | order | turn order; every junk starts before any tile | Cobalt chose his start first. Every junk starts before any tile. |
| 3-4 | mark, mark2 | pick a start mark on the edge | Tap this gold mark on the edge to start there. / Tap this mark. Your junk starts here. |
| 5 | reloc | blocked start: move to another free mark | A leviathan on your start square? Move to another free mark. |
| 6 | roll | a turn starts with two dice | Every turn starts with a roll of two dice. |
| 7 | wake | 6, 7 or 8 wakes the leviathans | 6, 7 or 8 wakes the leviathans. Any other total: calm. |
| 8 | levmove | one die per leviathan: step or turn | Each leviathan rolled one die: one square, or a quarter turn. |
| 9 | six | a 6 raises a new leviathan | A 6 on its die raises a new leviathan instead. |
| 10 | hand | three tiles in hand | These are your three tiles. This one would sink you. |
| 11 | edge | sailing off the edge sinks you | Its line runs to the chart edge. Off the edge, you sink. |
| 12 | turn | turn a tile a quarter | Tap Turn to spin the tile a quarter. |
| 13 | never | no loops, leviathans or shared wakes | Also never into a loop, a leviathan or a rival's path. |
| 14 | place | lay the tile at your bow | Tap Place. The tile goes on the square at your bow. |
| 15 | sail | sail along the line to its open end | Your junk sailed along that line to its open end. |
| 16 | calm | calm roll: nothing moves | Cobalt laid a tile. Now you rolled a 3: calm, nothing moved. |
| 17 | draw | draw back up to three | After each turn you draw back up to three tiles. |
| 18 | chain | sail on through other tiles | This tile meets Cobalt's tile. Tap Place: you sail through both. |
| 19 | push | a tile at another junk's line end moves it too | Lay a tile at any junk's line end, and it sails too. |
| 20 | keep | Deck Cannon: keep or discard (expansion piece in the script) | You drew a Deck Cannon. Keep it for a leviathan. |
| 21 | collide | two junks on one wake both sink | Two junks on one line, same way, both sink. |
| 22-23 | wave, waveroll | Rogue Wave (expansion piece in the script) | A Rogue Wave! It sweeps its whole row each round. / In its row, roll its strength or capsize. Tap Place. |
| 24 | blocked | a leviathan at your bow sinks you | A leviathan swam in front of your bow. That sinks you! |
| 25 | cannon | fire a Deck Cannon to be saved | Tap Fire. Your Deck Cannon blasts it away. |
| 26 | offboard | a leviathan off the chart is gone | A leviathan pushed off the chart is gone for good. |
| 27 | min3 | at least 3 leviathans | Fewer than three leviathans? The next turn adds new ones. |
| 28-30 | turn2, turn2b, place2 | (practice: two turns, then place) | This tile needs two quarter turns. Tap Turn. / Tap Turn once more. / Tap Place. |
| 31 | levsink | a leviathan on a tile destroys it and sinks junks there | A leviathan swam onto Cobalt's tile. He sinks with it! |
| 32 | swap | elimination bonus: swap tiles | Sink rivals with your tile, and swap tiles with their hands. |
| 33 | win | last junk afloat wins | Yours is the last junk afloat. You win the lantern! |

Not in the tutorial: the Rift Gate and the Maelstrom (expansion pieces, off in a default game; the Rules drawer explains them when switched on),
teams and solo (variants picked in the setup).
