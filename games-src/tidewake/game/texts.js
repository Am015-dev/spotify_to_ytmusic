// ===================== Tidewake: our own texts =====================
const RULES_HTML=`
<h3>How a round goes</h3>
<ol><li><b>Choose a start mark.</b> Before any tile is laid, each captain in turn puts their junk on a gold mark on the outer edge. Numbers 1 to 6 run along the edges; each number has two marks.</li>
<li><b>Roll.</b> At the start of your turn two dice are rolled and added together. A total of <b>6, 7 or 8</b> wakes every leviathan (see below). Any other total does nothing, except that the Maelstrom, if it is in play, stirs.</li>
<li><b>Place.</b> Pick one of your three tiles, turn it any of four ways and lay it on the empty square in front of your junk. A gold line on the board shows the exact route your junk will sail, with a flag where it stops (the line turns red if it sinks you).</li>
<li><b>Sail.</b> Your junk follows the wake through the new tile and on through every tile already connected, until it reaches an empty square. Any other junk waiting at the same square sails too.</li>
<li><b>Draw</b> back up to three tiles. The turn passes clockwise.</li></ol>
<h3>The idea</h3>
<p>Every captain steers one junk across a 6 by 6 sea chart. You never steer directly: you lay <b>current tiles</b>, and your junk is carried along the wake lines printed on them. Hazards: the edge of the chart, other junks, and <b>leviathans</b> that wander the board. <b>The last junk afloat wins.</b></p>
<h3>What sinks a junk</h3>
<ul><li>Its wake runs off the edge of the chart.</li><li>Its wake ends in a leviathan's square.</li><li>Two junks end on the same wake heading the same way: both sink.</li><li>A leviathan lands on the tile it is sitting on, or in front of it when its turn starts.</li><li>(Expansions) a capsizing Rogue Wave, a Maelstrom.</li></ul>
<p>You may not choose a placement that sinks you or ends two junks on one wake, unless every placement does.</p>
<p><b>Elimination bonus:</b> if your tile sinks someone else, you may swap tiles from your hand with the sunken crews' tiles; the rest go to the bottom of the pile.</p>
<h3>Leviathans</h3>
<p>Ten leviathans lie in a pile. At the start, 6 (2 to 4 captains), 5 (5-6) or 4 (7-8) rise at squares chosen by the dice. On a roll of 6, 7 or 8 they move one at a time, in the order of the number on their tile (the gold arrow wins ties). Each rolls one die: <b>1 to 5</b> follow the arrow of that number printed on its tile (one square north, east, south or west, or a quarter-turn), <b>6</b> it stays and another leviathan rises instead. A leviathan that swims off the board is gone for good. One that lands on a current tile destroys the tile (it goes to the bottom of the pile) and sinks every junk on it. A moving leviathan destroys one that is standing still. If fewer than 3 are on the board, the next captain skips the roll and new ones rise.</p>
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
<details class="guess"><summary>Our guesses (the published rules did not say)</summary><ul><li>Easy solo starts with four leviathans (our variant).</li><li>The board is 6 by 6 squares (the dice only reach 6).</li><li>The 56 currents are the 35 different layouts plus 21 repeats we spread evenly (the real repeats are unknown).</li><li>The arrows on the leviathan tiles, their order numbers and gold tie-breakers are our own design.</li><li>Collisions: a junk "passing through" another is fine, but two junks forced to end on one wake in one direction both sink; head-on wakes sink both.</li><li>Rift Gate during another captain's turn is placed on a free square beside the doomed junk; Deck Cannon range on your own turn is the leviathans orthogonally next to your front square or tile.</li><li>Rogue Wave strength 2, then 3, then 4 from the fourth round.</li><li>Easy solo ends after 24 turns because a 6 by 6 board can never hold the whole pile.</li></ul></details>
<h3>Credits</h3><p>Names, card text and art are original. <button class="btn small" data-gx="credd">Full credits</button></p>`;
const COACH=[
 {id:'start',t:'Welcome aboard',x:'You sail one junk; the last junk afloat wins. Tap Best start (or an edge square, then a gold mark) to put your junk on the board.'},
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
