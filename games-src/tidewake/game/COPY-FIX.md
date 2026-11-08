# Tidewake copy-fix
Game: tidewake. Date: 2026-11-08. Paths are relative to games-src/tidewake/game/. Old text is an exact substring of the line; new text keeps placeholders and tags.

## Goal card
Standard and Teams: the strip (ui7.js phGoal) reads "Last junk afloat wins." That is ONE sentence, so it is ok. The tutorial goal line (ui10.js, "Last junk afloat keeps the lantern.") is also one sentence once the first sentence is trimmed (table).
Solo and Easy solo (ui3.js goalHTML, stacked clauses) are fixed in the table:
- Solo current: "Goal: outlast every leviathan. ${toRise} still to rise, ${L} on the board; you win when none are left."  Fixed: "Goal: outlast all leviathans. ${toRise} still to rise, ${L} on board."
- Easy solo current: "Goal: stay afloat for ${G.opts.goal} turns (turn ${G.turn} now), or play out the whole tile pile."  Fixed: "Goal: stay afloat for ${G.opts.goal} turns (now ${G.turn})."

## Table
| file:line | old line | new line |
|---|---|---|
| texts.js:4 | Before any tile is laid, each captain in turn puts their junk on a gold mark on the outer edge. Numbers 1 to 6 run along the edges; each number has two marks. | Take turns putting your junk on a gold edge mark. |
| texts.js:5 | At the start of your turn two dice are rolled and added together. A total of <b>6, 7 or 8</b> wakes every leviathan (see below). Any other total does nothing, except that the Maelstrom, if it is in play, stirs. | Two dice are rolled. <b>6, 7 or 8</b> wakes every leviathan. |
| texts.js:6 | Pick one of your three tiles, turn it any of four ways and lay it on the empty square in front of your junk. A gold line on the board shows the exact route your junk will sail, with a flag where it stops (the line turns red if it sinks you). | Pick a tile, turn it, lay it in front of your junk. |
| texts.js:7 | Your junk follows the wake through the new tile and on through every tile already connected, until it reaches an empty square. Any other junk waiting at the same square sails too. | Your junk follows the line until it reaches an empty square. |
| texts.js:10 | Every captain steers one junk across a 6 by 6 sea chart. You never steer directly: you lay <b>current tiles</b>, and your junk is carried along the wake lines printed on them. Hazards: the edge of the chart, other junks, and <b>leviathans</b> that wander the board. | You lay <b>current tiles</b> and your junk sails along their lines. |
| texts.js:12 | A leviathan lands on the tile it is sitting on, or in front of it when its turn starts. | A leviathan lands on your tile or sits in front of you. |
| texts.js:13 | You may not choose a placement that sinks you or ends two junks on one wake, unless every placement does. | You cannot pick a sinking move if a safe one exists. |
| texts.js:14 | if your tile sinks someone else, you may swap tiles from your hand with the sunken crews' tiles; the rest go to the bottom of the pile. | if you sink a rival, you may swap tiles with their crew. |
| texts.js:16 | At the start, 6 (2 to 4 captains), 5 (5-6) or 4 (7-8) rise at squares chosen by the dice. | At the start, 6 rise (5 with 5-6 captains, 4 with 7-8). |
| texts.js:16 | On a roll of 6, 7 or 8 they move one at a time, in the order of the number on their tile (the gold arrow wins ties). | On a 6, 7 or 8 they move in tile-number order. |
| texts.js:16 | Each rolls one die: <b>1 to 5</b> follow the arrow of that number printed on its tile (one square north, east, south or west, or a quarter-turn), | Each rolls a die: <b>1-5</b> follows that arrow, |
| texts.js:16 | <b>6</b> it stays and another leviathan rises instead. | <b>6</b>: it stays and a new one rises. |
| texts.js:16 | One that lands on a current tile destroys the tile (it goes to the bottom of the pile) and sinks every junk on it. A moving leviathan destroys one that is standing still. | One that lands on a tile destroys it and sinks its junks. |
| texts.js:16 | If fewer than 3 are on the board, the next captain skips the roll and new ones rise. | If under 3 remain, new ones rise instead of a roll. |
| texts.js:19 | Some things happen out of turn. If your junk is about to be lost and you hold a <b>Deck Cannon</b> or the <b>Rift Gate</b>, you are asked what to do, even on someone else's turn. | About to sink? You may play a <b>Deck Cannon</b> or <b>Rift Gate</b>. |
| texts.js:19 | A human has a short timer for that choice; when it runs out the computer's best advice is used. | You get a short timer, then the computer picks for you. |
| texts.js:19 | If your junk is blocked at its start by a leviathan you may slide to another mark on the same edge. | If a leviathan blocks your start, move to another mark. |
| texts.js:21 | play it instead of a current, or to escape a sinking. It stays on its square for the whole game. Junks and leviathans that touch it are thrown to a square rolled on the dice; a junk then picks a wake and a direction to ride from there. | play it instead of a tile, or to escape. It never moves. |
| texts.js:22 | a wave sweeps one whole row or column. Whenever a junk is in that line (by its own move or because the wave moved) the owner rolls a die and must reach the wave's strength (2, then 3, then 4 as it ages) or capsize. | a wave sweeps a row or column. Junks there roll or capsize. |
| texts.js:22 | It moves one square each round and is gone when it leaves the board. Tiles are not harmed. | It moves one square a round. Tiles are safe. |
| texts.js:23 | a whirlpool that moves only on turns when the leviathans stay still (a roll outside 6 to 8). One die: 1 to 4 moves it east, south, west or north, 5 and 6 do not move it. | a whirlpool that moves on calm rolls (1-4: E, S, W, N). |
| texts.js:23 | A current it destroys leaves the game for good (it does not go back to the pile), along with any junks on it. | A tile it destroys is gone for good, with its junks. |
| texts.js:24 | when you draw one you may keep it or show it and draw again. | keep it, or show it and draw again. |
| texts.js:24 | Fire it when a leviathan is about to sink your junk (even out of turn), or on your turn instead of a tile against a leviathan next to your front square. | Fire it at a leviathan about to sink you or beside you. |
| texts.js:26 | one junk, six leviathans. Goal: survive until all ten leviathans have risen and are gone from the board (the top bar shows how many are still to rise). | one junk, six leviathans. Outlast all ten. |
| texts.js:28 | Tap a tile in the panel (or press <b>1 2 3</b>), turn it with the turn buttons, <b>R</b> or <b>Q</b>, then press <b>Place</b> or <b>Enter</b>. | Pick a tile, turn it, then press <b>Place</b> or <b>Enter</b>. |
| texts.js:29 | Collisions: a junk "passing through" another is fine, but two junks forced to end on one wake in one direction both sink; head-on wakes sink both. | Passing through a junk is fine; ending on one wake sinks both. |
| texts.js:32 | You sail one junk; the last junk afloat wins. After this card, tap Best start (or an edge square, then a gold mark) to put your junk on the board. | The last junk afloat wins. Tap Best start to place yours. |
| texts.js:33 | Each turn you lay one tile on the square in front of your junk, and it sails along that tile\'s line. A tick means safe, a cross means you would sink. | Lay a tile and your junk sails its line. Tick means safe. |
| texts.js:34 | Sailing off the edge of the board sinks you. Early on, pick routes that point back inward. | Sailing off the edge sinks you. Pick routes that curve inward. |
| texts.js:35 | Two junks that end on the same line heading the same way both sink. A junk already waiting on your square sails too. | Two junks ending on one line both sink. |
| texts.js:36 | The sea serpents sink any junk that sails into them, or that they swim onto. Keep a square of space between you and them. | Leviathans sink any junk they meet. Keep a square of space. |
| texts.js:37 | Every turn starts with two dice added together. 6, 7 or 8 wakes the leviathans and each one moves; any other total is calm. | Each turn starts with two dice. 6-8 wakes the leviathans. |
| texts.js:38 | Each leviathan rolls its own die and follows the arrow with that number on its tile. On a 6 it stays and a new one rises. Tap a leviathan to read its arrows. | Each leviathan follows the arrow matching its die. Tap to read. |
| texts.js:39 | A sunk captain is out of the game. The card says exactly why it sank. Fewer rivals means fewer wakes to dodge. | A sunk captain is out. The card says why. |
| texts.js:40 | There are always at least three leviathans. When fewer are left, the next captain skips the roll and new ones rise. | There are always three leviathans. If fewer, new ones rise. |
| texts.js:41 | That is the whole game: lay a tile, sail its line, dodge the edge, other junks and leviathans. Start a bigger game from the Menu. | That is the game. Start a bigger one from the Menu. |
| texts.js:52 | Cobalt swears the Reach is his. Last junk afloat keeps the lantern. Pick a gold mark. | Last junk afloat keeps the lantern. Pick a gold mark. |
| texts.js:53 | If a leviathan blocks your start before you sail, move to another free mark on that edge. | If a leviathan blocks your start, pick another mark on that edge. |
| texts.js:55 | Pick a tile, Turn it, Place it at your bow. SAFE floats; SINKS means off the chart. | Pick a tile, Turn it, Place it. SAFE floats; SINKS does not. |
| texts.js:56 | Your junk rode the current to its end. Now you draw back up to three tiles. | Well done. Now draw back up to three tiles. |
| texts.js:57 | {riv} laid a current. You may ride his tiles too, joined to yours. | {riv} laid a tile. You can ride it too. |
| texts.js:58 | Never end on the same line as another junk: two junks on one wake both sink. | Never end on another junk's line. Both would sink. |
| texts.js:59 | A leviathan swims one square along an arrow, or turns. Arrows show where it can go. | A leviathan swims one square along an arrow, or turns. |
| texts.js:60 | A leviathan entering your square sinks you. Keep your bow away from its arrows. | A leviathan entering your square sinks you. Stay clear of arrows. |
| texts.js:61 | Keep it. When a leviathan would sink you, fire it: the beast is gone for good. | Keep it. Fire it when a leviathan would sink you. |
| texts.js:62 | A junk in its band rolls a die: meet its strength or capsize. It grows as it rolls. | Junks in its band must roll its strength or capsize. |
| texts.js:63 | The violet tile is a Rift Gate. Lay it, or keep it to escape to a rolled square when you would sink. | Lay the violet Rift Gate, or keep it to escape a sinking. |
| texts.js:64 | It moves only on calm rolls and swallows any tile, junk or leviathan it enters. | It moves on calm rolls and swallows whatever it enters. |
| texts.js:65 | If your tile sinks Cobalt, you may swap tiles with his hand before you draw. | If you sink Cobalt, you may swap tiles with his hand. |
| texts.js:70 | Bigger games add captains, teams that share a win, and a solo race. | Bigger games add captains, teams and a solo race. |
| texts.js:73 | {riv} sailed {n} square(s). Watch where his line ends: never end on it. | {riv} sailed {n} square(s). Never end on his line. |
| texts.js:73 | {riv} hugs the middle: leviathans have fewer arrows to reach him there. | {riv} hugs the middle, away from leviathan arrows. |
| texts.js:73 | {riv} is getting bold. A tile that sinks him wins you the lantern. | {riv} is getting bold. Sink him to win the lantern. |
| texts.js:73 | {riv} turned his tile to dodge the edge. Turn yours too when you see SINKS. | {riv} turned his tile. Turn yours when you see SINKS. |
| ui10.js:21 | Play freely: every move is yours. Grandmother Osk speaks up when a rule first matters. | Every move is yours. Grandmother Osk speaks up when a rule matters. |
| ui10.js:106 | A tile that ends a rival is the strongest move there is. | Ending a rival is the strongest move. |
| ui10.js:107 | Your junk now sits next to a leviathan. If its arrow points at you, a 6, 7 or 8 can sink you. | A leviathan is beside you. A 6-8 roll may sink you. |
| ui10.js:44 | Play one real game against Cobalt. Grandmother Osk explains each rule when it matters. | Play one real game. Grandmother Osk explains each rule. |
| ui10.js:19 | Cobalt swears the Reach is his. Last junk afloat keeps the lantern. | Last junk afloat keeps the lantern. |
| ui3.js:44 | A <b>Deck Cannon</b> is an optional tile you can hold (two at most). Later you can fire it at a leviathan that is about to sink you, even on someone else's turn. You may keep it, or show it and discard it to draw a different tile instead | Keep the <b>Deck Cannon</b> to fire later, or discard it and redraw |
| ui3.js:45 | If you do nothing, your junk sinks. Pick a rescue below, or accept. | Pick a rescue below, or your junk sinks. |
| ui3.js:66 | Not allowed: another tile is safer. The rule: you may not pick a placement that sinks you while any other placement does not. Tap the bulb for the safest move. | Not allowed: a safer move exists. Tap the bulb for it. |
| ui3.js:69 | You hold a Deck Cannon. It can be fired when a leviathan is next to your front square or about to sink you. | You hold a Deck Cannon. Fire it at a nearby leviathan. |
| ui3.js:70 | You hold two Deck Cannons, the most you may keep: a third you draw is discarded. | You hold two Deck Cannons, the most allowed. |
| ui3.js:87 | Next time: keep your junk off the edges and corners, and tap the <b>bulb</b> when you are unsure. | Next time, avoid edges and corners. Tap the <b>bulb</b> if unsure. |
| ui3.js:92 | The computers play by themselves; you only act on your turn, in step 2 (Place). | The computers play themselves. You act only on your turn. |
| ui3.js:94 | <b>Goal:</b> outlast every leviathan. ${toRise} still to rise, ${L} on the board; you win when none are left. | <b>Goal:</b> outlast all leviathans. ${toRise} still to rise, ${L} on board. |
| ui3.js:95 | <b>Goal:</b> stay afloat for ${G.opts.goal} turns (turn ${G.turn} now), or play out the whole tile pile. | <b>Goal:</b> stay afloat for ${G.opts.goal} turns (now ${G.turn}). |
| ui6.js:42 | If the leviathans wake (dice total 6 to 8) and it rolls ${f.join(' or ')}, it moves onto you and you sink (about ${pc}% each turn). | It sinks you on ${f.join(' or ')} when awake (about ${pc}% a turn). |
| ui6.js:80 | its wake ran off the edge of the chart. A current that points out of the 6 by 6 sea sinks the junk riding it. | its wake ran off the edge of the chart. |
| ui6.js:81 | two junks ended on the same wake heading the same way, so both went down together (a head-on collision). | two junks ended on the same wake, so both sank. |
| ui6.js:82 | the Maelstrom, the whirlpool, moved onto its square and swallowed it. | the Maelstrom moved onto its square and swallowed it. |
| ui6.js:83 | the Rogue Wave caught it: it was in the wave's band and its capsize roll was too low | the Rogue Wave caught it and its roll was too low |
| ui6.js:84 | sat on the square in front of it when its turn began and nothing could save it. | was in front of it when its turn began. |
| ui6.js:86 | swam onto the square it was on (or its tile) and crushed it. | swam onto its square and crushed it. |
| ui6.js:101 | You are out, but you can watch the rest of the game. | You are out, but you can keep watching. |
| ui6.js:172 | : any junk in that band rolls a die and must reach ${waveStr()} or capsize. | : junks in that band must roll ${waveStr()}+ or capsize. |
| ui2.js:24 | A Rift Gate opens at column ${e.x+1}, row ${e.y+1}. Junks and leviathans that touch it are thrown to a rolled square. | A Rift Gate opens at column ${e.x+1}, row ${e.y+1}. |
| ui2.js:27 | The Maelstrom rises at column ${e.x+1}, row ${e.y+1}. It moves on calm rolls and destroys what it enters. | The Maelstrom rises at column ${e.x+1}, row ${e.y+1}. It moves when calm. |
| ui2.js:44 | strength 2. A junk in that band must roll 2 or more or capsize; the wave moves on and gets stronger. | strength 2. Roll 2+ in it or capsize. |
| ui4.js:47 | s left to decide, then the computer\'s best advice is used. | s left to decide, then the computer picks. |
| ui4.js:155 | A portal tile that rescues a junk or flings pieces across the sea. | A portal that rescues your junk or flings pieces. |
| ui4.js:158 | New here? Play one real game against Cobalt; Grandmother Osk explains each rule as it comes up. | New here? Play one game; Grandmother Osk explains each rule. |
| ui4.js:160 | Everyone shares this screen. Hands are hidden between players behind a pass screen. | Everyone shares one screen. Hands stay hidden between turns. |
| ui4.js:161 | One junk, six leviathans. Goal: survive until all ten leviathans have risen and are gone. The top bar counts how many are still to rise. | One junk, six leviathans. Goal: outlast all ten. |
| ui4.js:161 | Easy solo (our variant): one junk, 4 leviathans to start, 24 turns. Survive 24 turns or play out the whole pile. Destroyed tiles are discarded. | Easy solo (our variant): one junk, 4 leviathans, survive 24 turns. |
| ui4.js:161 | Two equal teams (every other seat); you may lay a tile for a teammate. 4, 6 or 8 captains. | Two equal teams of 4, 6 or 8. Play for a teammate. |
| ui7.js:61 | , safe now but a leviathan could swim onto your path next roll | , safe for now, but a leviathan may reach you. |
| ui7.js:114 | When the two dice total 6, 7 or 8 it wakes, rolls one die and swims the way that face points. A junk whose wake ends on its square sinks; so does a tile it swims onto. | On a 6-8 it wakes, rolls and swims that way. |
| ui7.js:121 | It stays on its square. A junk or leviathan that touches it is thrown to a rolled square. | It stays put. Anything touching it is thrown to a rolled square. |
| ui7.js:122 | Any junk in that band rolls a die and capsizes if it does not reach ${waveStr()}. | A junk in that band must roll ${waveStr()} or capsize. |
| ui9.js:49 | Dice may wake leviathans, you lay a tile, your junk sails the new line, then you draw. | Dice may wake leviathans. Then lay a tile, sail, and draw. |
| ui9.js:54 | After you place, your junk sails along every connected current until the line ends. Rivals sail the same way. | Your junk sails every connected current until the line ends. |
| ui9.js:55 | Sail off the board, into a leviathan, or onto another junk\'s wake, and you sink. Check the red cross. | Edges, leviathans and other junks\' wakes sink you. Check the red cross. |
| ui9.js:56 | Dice wake leviathans each turn; one that reaches you sinks you. A rogue wave capsizes junks that roll low. | Dice can wake leviathans. A rogue wave capsizes junks that roll low. |
| ui9.js:60 | A leviathan is about to reach your junk. You get one chance to react before it happens. | A leviathan is about to reach you. React now. |
| ui9.js:62 | If nothing helps, tap Accept. Your junk sinks, but a rival must still outlast the others. | If nothing helps, tap Accept. Your junk sinks. |
| ui9.js:67 | A rift throws a junk to a rolled square, and it lands on a tile you place. | The rift throws your junk to a rolled square. Place a tile. |
| ui9.js:68 | Pick a landing far from the edges and from leviathans, so your junk has room to sail. | Pick a landing far from edges and leviathans. |
| src/engine.js:106 | You drew a Deck Cannon. Keep it, or show it and discard it for a replacement? | You drew a Deck Cannon. Keep it, or discard it and redraw? |
| src/engine.js:134 | The sea restores its leviathans; no monster roll this turn. | New leviathans rise. No roll this turn. |
| src/engine.js:209 | junk is about to be lost (${doomWhy(c)}). | junk is about to sink (${doomWhy(c)}). |
| src/engine.js:242 | Choose which wake to follow, and in which direction. | Pick a wake and a direction. |
| src/engine.js:274 | Elimination bonus: swap your tiles for those of the sunken crews. | Bonus: swap your tiles with the sunken crews' tiles. |
| net.js:35 | The host chooses the game and sets sail. Your seat and your tiles appear here. | The host sets up the game. Your seat appears here. |
| net.js:195 | When a captain does nothing for this long on their own turn, the computer plays that one move. Default: off. | After this long idle, the computer plays the move. Default: off. |
| net.js:200 | Online play needs a recent browser with WebRTC (Chrome, Edge, Firefox or Safari). | Online play needs a recent browser: Chrome, Edge, Firefox or Safari. |
| net.js:206 | Play online (free, peer to peer) | Play online (free) |
| body.html:30 | A tile-laying survival game about steering junks along wake currents while leviathans stir. | A tile-laying game: steer your junk and outlast the leviathans. |

Lines fixed: 110
