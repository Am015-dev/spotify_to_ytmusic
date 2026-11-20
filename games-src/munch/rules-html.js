// the in-game rules, written in our own words
const RULES_HTML=`
<p><b>Goal.</b> Be the first hero to reach <b>level 10</b>. You can only gain that last level by killing a monster (a few special cards are exceptions).</p>
<p><b>Start.</b> Everyone is a level 1 human with no class and gets 4 door cards and 4 treasure cards. Before the first turn you may play any races, classes and items from your hand.</p>
<h3>Your turn</h3>
<ol>
<li><b>Get ready.</b> Play races, classes and items, change what you wear, and sell items worth 1,000 gold for one level. You can't sell your way to level 10.</li>
<li><b>Kick open the door.</b> Turn over the top door card.
 <ul><li>A <b>monster</b>: you must fight it.</li><li>A <b>curse</b>: it hits you at once.</li><li>Anything else goes into your hand.</li></ul></li>
<li><b>If you didn't fight a monster:</b> either <b style="white-space:nowrap">look for trouble</b> (fight a monster from your own hand) or <b>loot the room</b> (draw a door card face down).</li>
<li><b>Charity.</b> If you hold more than 5 cards (6 for dwarves), give the extras to the lowest-level player. If that's you, discard them.</li>
</ol>
<p><b>Quick (faster-play variant), optional.</b> New games play the full base rules. Pick <b>Quick</b> under Game length to use the rulebook's own faster-play option instead. In a Quick game the target stays level 10, but at the start of each turn you <b>listen at the door</b> (draw one door card face down), and if you help a hero win the game in a fight, <b>you win too</b>. The story and the tutorial use the full rules. With it on, the computer heroes default to Easy.</p>
<h3>Fighting</h3>
<ul>
<li>Your <b>combat strength</b> is your level plus the bonuses of the items you wear. The monster's strength is its level plus any boosts.</li>
<li>You win if your strength is <b>higher</b>. Ties go to the monster, unless you are a warrior.</li>
<li>Anyone can join in: <b style="white-space:nowrap">one-shot</b> items (potions and so on) add to either side, and <b style="white-space:nowrap">monster boosts</b> make a monster tougher or weaker. <b style="white-space:nowrap">Wandering monsters</b> add another monster to the fight.</li>
<li>You may <b>ask one player for help</b> and promise them some of the treasure. Their strength adds to yours. You gain the levels; they get what you promised.</li>
<li><b>Winning:</b> gain a level per monster (some big monsters give 2) and draw the treasures shown.</li>
<li><b>Running away:</b> roll a die for each monster. On 5 or 6 you get away. Otherwise that monster's <b>Bad Stuff</b> happens to you. A helper has to run too.</li>
<li><b>Death:</b> you keep your level, race and class, but lose everything else. Starting with the highest level, the other players each take one card from your body. On your next turn you come back with 4 new cards from each deck.</li>
</ul>
<h3>Items</h3>
<ul>
<li>You can wear 1 headgear, 1 armor and 1 footgear, plus items for your 2 hands.</li>
<li>You can have only 1 <b>Big</b> item at a time (dwarves can have any number).</li>
<li>Items you can't use are carried and give no bonus.</li>
<li>You can only change what you wear on your own turn, outside a fight.</li>
</ul>
<h3>Races and classes</h3>
<ul>
<li><b>Elf:</b> Light feet: +1 to run away. Good sport: +1 level for each monster you help someone beat.</li>
<li><b>Dwarf:</b> Strong back: any number of Big items. Deep pockets: a 6-card hand.</li>
<li><b>Halfling:</b> Haggler: sell one item a turn for double. Second try: if you fail to run away, discard a card to roll again.</li>
<li><b>Warrior:</b> War Cry: discard up to 3 cards in a fight for +1 each. You win ties.</li>
<li><b>Wizard:</b> Blink: discard up to 3 cards for +1 each to run away. Banish: discard your whole hand (3+ cards) to send a single monster away and keep its treasure (no level).</li>
<li><b>Thief:</b> Dirty Trick: discard a card to give a player in a fight −2 (once per victim per fight). Pickpocket: discard a card to try to take a small item: roll 4+ or lose a level.</li>
<li><b>Cleric:</b> Second Chance: whenever you would draw a card face-up, you may take the top card of that discard pile instead, and discard a card from your hand for each one. Face-up draws are kicking open the door and the treasure of a fight you won with help. Holy Light: discard up to 3 cards for +3 each against undead.</li>
</ul>
<p class="small muted">Two Bloodlines lets you have two races, and Second Calling two classes. Curses can be played on anyone: here that's on your turn, during fights, or when someone else's turn starts. The rules and the deck's structure (card types and counts) follow the real card game. Every card (name, picture, text and numbers) is our own design.</p>
<section class="credits-audio">
<h3>Credits</h3>
<p>Names, card text and art are original. All card paintings and the six boss reveal clips were painted by Am015-dev.</p>
<h4>Audio</h4>
<ul>
<li>Art and music by Am015-dev</li></ul>
<p><small>All sounds were trimmed, loudness-normalised and converted to MP3 for this game.</small></p>
</section>`;
