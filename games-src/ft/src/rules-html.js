// ---------- the rules, in plain words ----------
const RULES_HTML=`<div class="rules">
<p>The old sultan is gone and the sultanate of Qamar is up for grabs. Shift its tribes from tile to tile, claim land with your camels, summon djinns and trade in the bazaar. <b>The most points at the end wins.</b></p>
<h3>1. Bid for turn order</h3>
<p>Each round starts with a bid. In the order of the last round, each player puts a marker on a free spot of the turn-order track and pays its price: 0, 0, 0, 1, 3, 5, 8, 12 or 18 coins. Dearer spots play earlier. If two players sit on spots with the same price, the one who bid later plays first. With 2 players, each of you has two markers and so takes two turns a round.</p>
<h3>2. Your turn: move, then act</h3>
<ol>
<li><b>Lift</b> everyone from one tile.</li>
<li><b>Drop</b> them one by one: one on each next tile, moving up, down, left or right. You may not step straight back onto the tile you just left (you may pass a tile again later). Mountains block the way.</li>
<li>The <b>last</b> person must land on a tile that already holds its colour. Then you take everyone of that colour from that tile.</li>
<li>If the tile is now empty, you claim it: put one of your camels there (or your tent, with the Crafters).</li>
<li>Do the <b>tribe action</b> of the colour you took, then the <b>tile action</b> of the tile you ended on (both optional where the card says “may”).</li>
<li>At the end of your turn you may <b>sell</b> a set of different goods for coins.</li>
</ol>
<h3>3. The tribes</h3>
<ul>
<li><b>Advisors (yellow)</b>: keep them. 1 point each, and 10 more for every rival who has fewer.</li>
<li><b>Sages (white)</b>: keep them. 2 points each. Spend them to summon djinns and use djinn powers.</li>
<li><b>Traders (green)</b>: take that many goods cards from the front of the market row. They go back to the bag.</li>
<li><b>Masons (blue)</b>: earn coins: the number of Masons times the blue tiles around you (the 3×3 square, your tile included). Each Mystic card you spend adds 1 Mason.</li>
<li><b>Shadows (red)</b>: remove one person up to that many steps away, or one Advisor or Sage kept by a rival. Each Mystic adds 1 step. If a tile empties, you claim it.</li>
<li><b>Crafters (purple, expansion)</b>: keep them, draw that many items, keep one.</li>
</ul>
<h3>4. The tiles</h3>
<ul>
<li><b>Hamlet</b>: place a palace here (5 points to whoever holds the tile).</li>
<li><b>Oasis</b>: plant a palm tree (3 points to whoever holds the tile).</li>
<li><b>Shrine</b>: you may summon one face-up djinn by paying 2 Sages, or 1 Sage and 1 Mystic.</li>
<li><b>Bazaar Stall</b>: you may pay 3 coins for one of the first 3 goods. <b>Grand Bazaar</b>: 6 coins for two of the first 6.</li>
</ul>
<h3>5. Goods and Mystics</h3>
<p>Goods score in sets of different kinds: 1, 3, 7, 13, 21, 30, 40, 50 or 60 points for 1 to 9 kinds. Build as many sets as you can. Mystics are special cards: they never score, but they boost Masons and Shadows, stand in for a Sage when summoning, and pay djinn powers.</p>
<h3>6. The end</h3>
<p>When someone places their last camel, the round is finished and the game ends. It also ends if no legal move is left on the board. Score coins, Advisors, Sages, djinns, the tiles you hold (with their palms and palaces), goods, and any expansion extras. Ties go to the player with more coins.</p>
<h3>Expansions (switch them on at the start)</h3>
<ul>
<li><b>The Crafters</b>: purple Crafters, Workshops (pay 1 Crafter or 2 Mystics for an item), Spice Exchanges (4 coins for any face-up good), a Ravine, mountains beside the Workshops, and a tent for each player. The player with the most Crafters scores 3 for each, everyone else 2. Precious items score points; magic items are one-shot powers.</li>
<li><b>Wonder Cities</b>: Wonder City tiles (5, 20, 45, 80 or 125 points for holding 1 to 5), the Great Lake (palms and palaces next to it score double) and room for a 5th player.</li>
<li><b>Cutpurses</b>: at a Shrine you may hire the face-up cutpurse instead of a djinn. Later, when you take people of its colour, send it out: every rival gives something up and you take the best of it.</li>
<li><b>Promo djinns</b>: three extra djinns join the deck.</li>
</ul>
<p class="muted small">Tip: tap the glowing tiles on the board. The panel on the right always says what the game is waiting for; the card list explains every djinn, tile, good and token.</p>
<h3>Credits</h3>
<section class="credits-audio">
<h4>Audio</h4>
<ul>
<li>Art and music by Am015-dev</li></ul>
<p class="muted small">All sounds were trimmed, loudness-normalised and converted to MP3 for this game.</p>
</section>
<p class="muted small">Names, card text and art are original; the paintings are by Am015-dev.</p>
</div>`;
