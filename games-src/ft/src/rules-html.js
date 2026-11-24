// ---------- the rules, in plain words ----------
const RULES_HTML=`<div class="rules">
<h3>Goal</h3>
<p><b>Have the most points when the game ends.</b></p>
<ul><li>Coins and goods score.</li><li>Land and people score.</li><li>Djinns give bonuses.</li></ul>
<p>Move tribes across the bazaar, claim land with camels, and summon djinns.</p>
<h3>How a turn works</h3>
<ol class="turn5"><li><b>Bid</b> coins for a turn-order spot: dearer plays earlier.</li><li><b>Lift</b> everyone from one tile and <b>drop</b> one person per tile as you walk.</li><li>The <b>last</b> person must land on its own colour: take all of that colour.</li><li><b>Act</b>: the tribe you took, then the tile you stopped on. An empty tile gets your camel.</li><li><b>Sell</b> goods if you like.</li></ol>
<h3>1. Bid for turn order</h3>
<p>Each round starts with a bid. Put a marker on a free spot and pay its price. Dearer spots play earlier. Same price? The later bidder plays first. With 2 players, each of you has two markers and two turns.</p>
<h3>2. Your turn: move, then act</h3>
<ol>
<li><b>Lift</b> everyone from one tile.</li>
<li><b>Drop</b> them one by one: one on each next tile, moving up, down, left or right. Never step straight back. Mountains block the way.</li>
<li>The <b>last</b> person must land on its own colour. Take them all.</li>
<li>An emptied tile is yours: put a camel there (or your tent).</li>
<li>Do the <b>tribe action</b>, then the <b>tile action</b>. “May” means optional.</li>
<li>At the end of your turn you may <b>sell</b> a set of different goods for coins.</li>
</ol>
<h3>3. The tribes</h3>
<ul>
<li><b>Advisors (yellow)</b>: keep them. 1 point each, and 10 more for every rival who has fewer.</li>
<li><b>Sages (white)</b>: keep them. 2 points each. Spend them to summon djinns and use djinn powers.</li>
<li><b>Traders (green)</b>: take that many goods cards from the front of the market row. They go back to the bag.</li>
<li><b>Masons (blue)</b>: earn 1 coin per Mason for each blue tile around you. A Mystic adds one Mason.</li>
<li><b>Shadows (red)</b>: remove a person within that many steps, or a rival’s Advisor or Sage. A Mystic adds a step. If a tile empties, you claim it.</li>
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
<p>Goods score in sets of different kinds: 1, 3, 7, 13, 21, 30, 40, 50 or 60 points for 1 to 9 kinds. Build as many sets as you can. Mystics never score. They boost Masons and Shadows, or replace a Sage.</p>
<h3>6. The end</h3>
<p>When someone places their last camel, the round is finished and the game ends. It also ends if no legal move is left on the board. Add up coins, people, tiles, palms, palaces, djinns, goods and extras. Equal scores share the win.</p>
<h3>Setup by player count</h3>
<ul><li><b>2 players</b>: 11 camels each and two turn markers each, so you play twice a round.</li><li><b>3 or 4 players</b>: 8 camels and one marker each.</li><li><b>5 players</b>: 8 camels each, a 12-spot track (18, 12, 8, 5, 5, 3, 3, 1, 1, 0, 0, 0) and the Wonder Cities board.</li>
<li>Everyone starts with 50 coins. 3 people on every tile, 9 goods face up, 3 djinns face up. Track: 18, 12, 8, 5, 3, 1, then three free spots.</li></ul>
<h3>Small print</h3>
<ul><li>Only three markers fit on the free spots; after that you must pay.</li><li>Next round you bid in the order you played.</li>
<li>You must move if you can. You may pass through empty tiles and loop back later, but you may never end on an empty tile.</li>
<li>A camel never leaves its tile. Empty a tile someone owns and you take the people, not the land. No camels left: no claim.</li>
<li>Shadows may reach diagonally (2 steps). If your Shadow empties a tile, you claim it too, but only your final tile gives a tile action.</li>
<li>Palms and palaces score only for the player who holds their tile. When the supply runs out, they are not built.</li>
<li>Advisor ties give no +10. You may sell several sets in one turn. At the end, goods score as your best sets.</li>
<li>Goods and djinns refill only after everyone has played. A djinn power works once per turn, from the turn you get it.</li>
<li>Equal final scores share the win.</li></ul>
<h3>Learn more: the expansions</h3>
<ul><li><b>The Crafters</b>: 6×6 board. 3 Workshops (pay 1 Crafter or 2 Mystics for an item), 2 Spice Exchanges (4 coins for any face-up good), 1 Ravine nobody may cross, 2 mountains beside each Workshop. Your tent claims a tile: it scores the tile plus 1 per red tile around it. Precious items score 5, 7 or 9; magic items are one-shot powers.</li>
<li><b>Wonder Cities</b>: 6×6 board (6×7 with the Crafters). 5 Wonder Cities: holding 1 to 5 scores 5, 20, 45, 80 or 125 on top of the tiles. Palms and palaces beside the Great Lake score double.</li>
<li><b>Cutpurses</b>: one face-up cutpurse; hire it at a Shrine like a djinn. When you later take its colour, every rival gives something up and you keep the best.</li>
<li><b>Djinns</b>: 22 in the base game, 3 promos, 2 with the Crafters, 1 with the Cutpurses (28 in all). Each card says its points and power: see Djinns in the top bar.</li></ul>
<h3>Expansions (switch them on at the start)</h3>
<ul>
<li><b>The Crafters</b>: adds purple Crafters, Workshops, Spice Exchanges, a Ravine and a tent each. The player with the most Crafters scores 3 for each, everyone else 2. Precious items score points; magic items are one-shot powers.</li>
<li><b>Wonder Cities</b>: Wonder Cities score more as you hold more. Adds a Great Lake.</li>
<li><b>Cutpurses</b>: hire a cutpurse at a Shrine; it later makes rivals give something up.</li>
<li><b>Promo djinns</b>: three extra djinns join the deck.</li>
</ul>
<p class="muted small">Tip: tap the glowing tiles. The status line says what the game needs.</p>
<h3>Credits</h3>
<section class="credits-audio">
<h4>Audio</h4>
<ul>
<li>Art and music by Am015-dev</li></ul>
<p class="muted small">All sounds were trimmed, loudness-normalised and converted to MP3 for this game.</p>
</section>
<p class="muted small">Names, card text and art are original; the paintings are by Am015-dev.</p>
</div>`;
