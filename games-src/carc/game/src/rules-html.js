// ---------- the rules, in plain words ----------
const RULES_HTML=`<div class="rules">
<p>Together you build a sunny southern valley, one square tile at a time. Roads, walled towns, priories and fields grow across the table. You claim them with your followers and score when they are finished. <b>Most points at the end wins.</b></p>
<h3>1. Lay a tile</h3>
<p>On your turn you draw one tile and must lay it next to the tiles already down (side by side, not only corner to corner). You may turn it, but every edge that touches another tile must match: town wall to town, road to road, field to field. The glowing squares show every place your tile fits; tap one, turn the tile with ⟳, then press ✓.</p>
<p>If a tile fits nowhere at all (very rare), it is put aside and you draw another.</p>
<h3>2. You may place one follower</h3>
<p>You may then put <b>one</b> of your 7 followers on the tile you just laid — on its road (a <i>wayfarer</i>), a town piece (a <i>warden</i>), the priory (a <i>brother</i>) or a field (a <i>farmer</i>). You may only choose a road, town or field in which <b>nobody</b> stands yet, counting all the tiles it already spreads over. Later, two separately claimed roads or towns can grow together; then they are shared.</p>
<h3>3. Finished features score at once</h3>
<ul>
<li><b>Road:</b> finished when both ends stop (at a crossroads, a town, a priory, a farm) or it forms a loop. 1 point per tile.</li>
<li><b>Town:</b> finished when its walls are closed with no gap. 2 points per tile and 2 per banner. (A finished town of two tiles scores 4.)</li>
<li><b>Priory:</b> finished when all 8 squares around it hold tiles. 9 points.</li>
</ul>
<p>Whoever has the <b>most followers</b> in the finished feature scores all of it; if several players tie for most, each of them scores all of it. Then <b>every</b> follower in that feature goes back to its owner, ready to be used again — even one placed this very turn.</p>
<h3>4. Farmers</h3>
<p>A farmer lies in a field for the rest of the game and never comes home. Fields are split by roads, town walls, the river and the edge of the valley. At the end, each field pays <b>3 points for every finished town it touches</b> to whoever has the most farmers in it (ties: everyone tied). One town can pay several different fields.</p>
<h3>5. The end</h3>
<p>The game ends after the last tile is laid. Then every unfinished feature still holding followers scores: roads 1 per tile, towns 1 per tile and 1 per banner, priories 1 plus 1 per tile around them. Then the farmers are paid. The tiles-left counter in the corner of the map tells you how long you have.</p>
<h3>The Riverlands</h3>
<p>The river spring replaces the usual starting tile (which is shuffled in with the rest). The 12 river tiles are drawn first: each one must carry the river on from where it ends, and the river may not bend the same way twice in a row, so it never curls back on itself. The pond comes last and closes the river. The river splits fields but is never scored. After that the ordinary tiles begin.</p>
<h3>Taverns &amp; Basilicas</h3>
<ul><li><b>Tavern</b> (a small inn beside a pond on a road): the road scores 2 per tile when finished — but 0 if it is still unfinished at the end.</li>
<li><b>Basilica</b> (in a town): the town scores 3 per tile and 3 per banner when finished — but 0 if it is unfinished at the end.</li>
<li><b>Champion:</b> each player also has one big follower. You place it instead of a normal one; it counts as two followers when deciding who holds a feature, and scores like any follower.</li>
<li>A sixth player (Lilac) can join.</li></ul>
<h3>Merchants &amp; Masons</h3>
<ul><li><b>Goods:</b> many new towns show wine, grain or cloth. Whoever lays the tile that <b>finishes</b> a town takes one token for each symbol in it — even with no follower there. At the end, whoever has the most of each kind scores 10 (ties: everyone tied scores 10).</li>
<li><b>Mason:</b> instead of a follower you may place your mason on a road or town piece of your new tile, if you already have a follower in that road or town. From then on, whenever the tile you lay extends that road or town, you take an extra turn straight away (an extra turn never gives another one). The mason comes home when its feature is finished.</li>
<li><b>Hog:</b> instead of a follower you may place your hog in a field where you already have a farmer. If you hold that field at the end, it pays 4 per finished town instead of 3.</li></ul>
<h3>Helpers in this version</h3>
<ul><li>🎓 <b>Guide</b> coaches each step in the panel (turn it on or off in the top bar or on the start screen).</li>
<li>💡 <b>Advice</b> shows what the normal-level computer would do and why; tap “Do it” to play it.</li>
<li>Before you confirm a tile, the panel lists what it would finish or join. The follower buttons show what the feature would score if finished now and at the end, and who holds it.</li>
<li>🧩 <b>Tiles</b> lists every tile in the box with its count.</li></ul>
</div>`;
