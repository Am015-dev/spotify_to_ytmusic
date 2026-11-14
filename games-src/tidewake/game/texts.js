// ===================== Tidewake: our own texts =====================
const RULES_HTML=`
<h3>How a round goes</h3>
<p><b>Last junk afloat wins the lantern.</b></p>
<ol><li><b>Start:</b> put your junk on a gold mark at the edge.</li>
<li><b>Roll:</b> two dice. A 6, 7 or 8 wakes the leviathans.</li>
<li><b>Place:</b> lay one tile in front of your junk. Drag it, or tap Place.</li>
<li><b>Sail:</b> your junk follows the new line to its end.</li>
<li><b>Draw</b> back to three tiles. Next captain.</li></ol>
<h3>The idea</h3>
<p>Every captain steers one junk across a 7 by 7 sea chart. You never steer directly: you lay <b>current tiles</b>, and your junk is carried along the wake lines printed on them. Hazards: the edge of the chart, other junks, and <b>leviathans</b> that wander the board. <b>The last junk afloat wins.</b></p>
<h3>What sinks a junk</h3>
<ul><li>Its wake runs off the edge of the chart.</li><li>Its wake ends in a leviathan's square.</li><li>Two junks end on the same wake heading the same way: both sink.</li><li>A leviathan lands on the tile it is sitting on, or in front of it when its turn starts.</li><li>(Expansions) a capsizing Rogue Wave, a Maelstrom.</li></ul>
<p>You may not choose a placement that sinks you or ends two junks on one wake, unless every placement does.</p>
<p><b>Elimination bonus:</b> if your tile sinks someone else, you may swap tiles from your hand with the sunken crews' tiles; the rest go to the bottom of the pile.</p>
<h3>Leviathans</h3>
<p>Ten leviathans lie in a pile. At the start, 6 (2 to 4 captains), 5 (5-6) or 4 (7-8) rise at squares chosen by the dice (gold die = column 1-6, blue die = row 1-6; column 7 and row 7 have no number). On a roll of 6, 7 or 8 they move one at a time, in the order of the number on their tile (the gold arrow wins ties). Each rolls one die: <b>1 to 5</b> follow the arrow of that number printed on its tile (one square north, east, south or west, or a quarter-turn), <b>6</b> it stays and another leviathan rises instead. A leviathan that swims off the board is gone for good. One that lands on a current tile destroys the tile (it goes to the bottom of the pile) and sinks every junk on it. A moving leviathan destroys one that is standing still. If fewer than 3 are on the board, the next captain skips the roll and new ones rise.</p>
<p>A Rogue Wave or Maelstrom drawn while the starting leviathans are placed counts as one of the 6, 5 or 4 starting tiles.</p>
<h3>Interrupts</h3>
<p>Some things happen out of turn. If your junk is about to be lost and you hold a <b>Deck Cannon</b> or the <b>Rift Gate</b>, you are asked what to do, even on someone else's turn. A human has a short timer for that choice; when it runs out the computer's best advice is used. If your junk is blocked at its start by a leviathan you may slide to another mark on the same edge.</p>
<h3>Expansion pieces (Deepwater Perils, each can be switched on or off)</h3>
<ul><li><b>Rift Gate</b> (1, shuffled into the current pile): play it instead of a current, or to escape a sinking. It stays on its square for the whole game. Junks and leviathans that touch it are thrown to a square rolled on the dice; a junk then picks a wake and a direction to ride from there.</li>
<li><b>Rogue Wave</b> (1, in the leviathan pile, with a blue edge marker): a wave sweeps one whole row or column. Whenever a junk is in that line (by its own move or because the wave moved) the owner rolls a die and must reach the wave's strength (2, then 3, then 4 as it ages) or capsize. It moves one square each round and is gone when it leaves the board. Tiles are not harmed.</li>
<li><b>Maelstrom</b> (1, in the leviathan pile): a whirlpool that moves only on turns when the leviathans stay still (a roll outside 6 to 8). One die: 1 to 4 moves it east, south, west or north, 5 and 6 do not move it. It destroys whatever it enters, leviathans included. A current it destroys leaves the game for good (it does not go back to the pile), along with any junks on it. It does not count towards the minimum of three.</li>
<li><b>Deck Cannon</b> (5, shuffled into the current pile, two per hand at most): when you draw one you may keep it or show it and draw again. Fire it when a leviathan is about to sink your junk (even out of turn), or on your turn instead of a tile against a leviathan next to your front square. The leviathan goes to the bottom of its pile.</li></ul>
<h3>Variants</h3>
<ul><li><b>Solo:</b> one junk, six leviathans. Goal: survive until all ten leviathans have risen and are gone from the board (the top bar shows how many are still to rise).</li><li><b>Easy solo:</b> one junk; destroyed tiles are discarded, not recycled. <i>Our variant:</i> start with four leviathans and survive 24 turns, or play out the whole pile if that happens first.</li><li><b>Teams:</b> four, six or eight captains in two equal teams (every other seat). You may lay your tile in front of a teammate's junk. The last team afloat wins.</li></ul>
<h3>Controls</h3>
<p>Tap a tile in the panel (or press <b>1 2 3</b>), turn it with the turn buttons, <b>R</b> or <b>Q</b>, then press <b>Place</b> or <b>Enter</b>. Tap a gold mark on the edge to start. <b>Esc</b> closes popups.</p>
<details class="guess"><summary>Our guesses (the published rules did not say)</summary><ul><li>Easy solo starts with four leviathans (our variant).</li><li>The board is 7 by 7 squares; the gold and blue numbers 1-6 run over columns and rows 1-6, so leviathans never rise on column 7 or row 7 (the gold-framed 6 by 6 area is where the dice can reach).</li><li>The 56 currents are the 35 different layouts plus 21 repeats we spread evenly (the real repeats are unknown).</li><li>The arrows on the leviathan tiles, their order numbers and gold tie-breakers are our own design.</li><li>Collisions: a junk "passing through" another is fine, but two junks forced to end on one wake in one direction both sink; head-on wakes sink both.</li><li>Rift Gate during another captain's turn is placed on a free square beside the doomed junk; Deck Cannon range on your own turn is the leviathans orthogonally next to your front square or tile.</li><li>Rogue Wave strength 2, then 3, then 4 from the fourth round.</li><li>Easy solo ends after 24 turns because a 6 by 6 board can never hold the whole pile.</li></ul></details>
<h3>Credits</h3><p>Names, card text and art are original. <button class="btn small" data-gx="credd">Full credits</button></p>`;
const COACH=[
 {id:'start',t:'Welcome aboard',x:'You sail one junk; the last junk afloat wins. After this card, tap Best start (or an edge square, then a gold mark) to put your junk on the board.'},
 {id:'cur',t:'Your move',x:'Each turn you lay one tile on the square in front of your junk, and it sails along that tile\'s line. A tick means safe, a cross means you would sink. Press Turn to change the route.'},
 {id:'edge',t:'The edge',x:'Sailing off the edge of the board sinks you. Early on, pick routes that point back inward.'},
 {id:'coll',t:'Collisions',x:'Two junks that end on the same line heading the same way both sink. A junk already waiting on your square sails too.'},
 {id:'lev',t:'Leviathans',x:'The sea serpents sink any junk that sails into them, or that they swim onto. Keep a square of space between you and them.'},
 {id:'roll',t:'The roll',x:'Every turn starts with two dice added together. 6, 7 or 8 wakes the leviathans and each one moves; any other total is calm.'},
 {id:'move',t:'How leviathans move',x:'Each leviathan rolls its own die and follows the arrow with that number on its tile. On a 6 it stays and a new one rises. Tap a leviathan to read its arrows.'},
 {id:'sunk',t:'A junk goes down',x:'A sunk captain is out of the game. The card says exactly why it sank. Fewer rivals means fewer wakes to dodge.'},
 {id:'min3',t:'Leviathans refill',x:'There are always at least three leviathans. When fewer are left, the next captain skips the roll and new ones rise.'},
 {id:'end',t:'Nicely sailed',x:'That is the whole game: lay a tile, sail its line, dodge the edge, other junks and leviathans. Start a bigger game from the Menu.'}];
const GLOSS_HTML='';
function dirName(a){return ['north','east','south','west'][a]}
const ARR_TXT={N:'north',E:'east',S:'south',W:'west'};
function levArrowRows(L){return L.arr.map((a,i)=>`<tr><td>${i+1}</td><td>${a==='R'?(L.rd>0?'turn clockwise':'turn anticlockwise'):'swim '+ARR_TXT[a]}</td></tr>`).join('')+'<tr><td>6</td><td>stay; another leviathan rises</td></tr>'}
// ---- Tutorial prologue: "The Lantern Race". Guide = Grandmother Osk (lantern keeper, same cast as Story mode), rival = Cobalt (the cocky newcomer who claims the Lantern Reach).
// Every line: a story reason, then what to do (the glow shows where). All tutorial words live here (title <= 4 words, say <= 26 words).
// A step's ch = the chapter it opens (1 Your first turn, 2 Rivals and leaving others' wake, 3 Leviathans and the wave, 4 The last junk afloat).
// The coached first game ("The Lantern Race", ui10.js): what Grandmother Osk says the first time each rule matters. [title, line]; max 2 short lines each.
// {me} {riv} {n} {why} are filled in from the real game. The ids are the rule ids in TUTORIAL-COVERAGE.md.
const OSK_TEXT={
 goal:['The Lantern Race','Cobalt swears the Reach is his. Last junk afloat keeps the lantern. Pick a gold mark.'],
 reloc:['Your berth','A leviathan blocks your start? Move to another free mark there.'],
 roll:['Dice at dawn','Each turn starts with two dice. {n}: {wake}'],
 lay:['Lay a current','Pick a tile, Turn it, Place it at your bow. SAFE floats; SINKS means off the chart.'],
 sail:['Well sailed!','Your junk rode the current to its end. Now draw back to three.'],
 chain:['Cobalt moves','{riv} laid a current. His tiles join yours. You can ride them.'],
 collide:['Mind his wake','Never stop on another junk\'s line. Two junks on one wake both sink.'],
 levmove:['The deep stirs','A leviathan swims one square along an arrow, or turns.'],
 levsink:['Leviathans bite','A leviathan entering your square sinks you. Stay clear of its arrows.'],
 cannon:['A Deck Cannon!','Keep it. If a leviathan would sink you, fire. It is gone.'],
 wave:['Rogue Wave!','Junks in its row roll a die. Roll low and you capsize.'],
 gate:['A Rift Gate','The violet tile is a Rift Gate. Keep it to escape a sinking.'],
 mael:['The Maelstrom','It moves on calm rolls. It swallows whatever it enters.'],
 swap:['Sink him, gain tiles','Sink Cobalt with your tile, and you may swap hands.'],
 good:['Good move!','{why}'],
 poor:['Careful','{why}'],
 end:['The lantern','{why}'],
 tie:['A shared fate','If the last junks sink together, it is a draw.'],
 more:['Teams and solo','Bigger games add more captains, teams, and a solo race.']
};
// rival comments (Osk on Cobalt's moves), picked in turn; {riv} {n}
const OSK_RIVAL=['{riv} sailed {n} square(s). Watch where his line ends: never end on it.','{riv} hugs the middle: leviathans have fewer arrows to reach him there.','{riv} is getting bold. A tile that sinks him wins you the lantern.','{riv} turned his tile to dodge the edge. Turn yours too when you see SINKS.'];

