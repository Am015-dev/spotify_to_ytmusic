// ---------- How to play (an original summary of the rules as this game applies them) ----------
const RULES_HTML=`<h2>How to play</h2>
<p>You are castaways on a wild island. Everyone wins or loses together. Finish the scenario's goal before the last round ends, and keep every castaway alive: if anyone dies (Friday aside), you all lose.</p>
<h3>A round, in six phases</h3>
<ol><li><b>Event</b> (not in round 1). Draw an event card: its effect happens now, and the card becomes a <b>threat</b> in the right-hand slot. The older threat slides left; a threat pushed off the left slot fires its <i>if ignored</i> effect. Cards with a book icon trigger the scenario's book effect; the others put a "?" marker on the build, gather or explore action.</li>
<li><b>Morale</b>. The first player gains or loses determination to match morale (−3 to +2; at +3 choose 2 determination or 1 heal). Solo: morale rises by 1 first.</li>
<li><b>Production</b>. Each unused source on the camp tile gives 1: wood gives wood, fish and birds give food.</li>
<li><b>Actions</b>. Place every character pawn (2 each), then resolve in order: threats, hunting, building, gathering, exploring, arranging the camp, resting. Resources you gain arrive only after all actions.</li>
<li><b>Weather</b>. Roll the dice the scenario shows for this round, plus any cloud markers. Each snow cloud burns 1 wood for heating. Every cloud (rain or snow) above your roof level ruins 1 food and 1 wood. The animals die can take food, knock down the palisade or attack (strength 3 against your weapon). A storm lowers the palisade.</li>
<li><b>Night</b>. Each castaway eats 1 food or takes 2 wounds. Without a shelter everyone takes 1 wound. Normal food spoils; dry food keeps. You may move the camp to a neighbouring tile (roof and palisade are halved, or lost without a built shelter). The first player passes on.</li></ol>
<h3>Actions and pawns</h3>
<table><tr><th>Action</th><th>Pawns</th><th>What it does</th></tr>
<tr><td>Threat</td><td>as printed</td><td>Meet its needs (item, weapon, resources) to take the reward and remove the card.</td></tr>
<tr><td>Hunt</td><td>2</td><td>Fight the top beast of the hunting deck: 1 wound per point its strength beats your weapon, the weapon drops by its loss value, then take its food and fur.</td></tr>
<tr><td>Build</td><td>1 rolls, 2 sure</td><td>Shelter, roof, palisade (wood <i>or</i> fur; 2/1 for 1–2 castaways, 3/2 for three, 4/3 for four), weapon +1 (1 wood), or an invention whose terrain and items you have.</td></tr>
<tr><td>Gather</td><td>1 rolls, 2 sure</td><td>Take 1 resource from one source on a tile off the camp. Two tiles away needs one more pawn.</td></tr>
<tr><td>Explore</td><td>1 rolls, 2 sure</td><td>Reveal a new tile next to explored land (up to two tiles from camp, one more pawn when far). New terrain unlocks inventions; icons add beasts, discovery tokens or totems.</td></tr>
<tr><td>Arrange the camp</td><td>1</td><td>+2 determination and morale +1 (four castaways: one or the other).</td></tr>
<tr><td>Rest</td><td>1</td><td>Heal 1 wound.</td></tr></table>
<p><b>Dice.</b> With one pawn fewer than a sure success you roll three dice. The wound die may hurt the actor. The success die decides the action; on a failure the actor gains 2 determination. The "?" die draws an adventure card from that action's deck. Some adventures have a second half that is shuffled into the event deck and comes back later.</p>
<p><b>Helpers.</b> Friday and extra pawns from items (Map, Belts, Lantern, Raft, Shield), the dog, finds and skills can join actions; only a character or Friday can lead. Friday can act alone: an adventure die only wounds him.</p>
<h3>Wounds, morale and determination</h3>
<p>Each character has a life track. Some spaces carry a morale-down arrow: filling one lowers morale. Anything you are forced to pay but can't costs 1 wound per missing unit. Determination pays for skills (once each a round). Resting, the Pot, the Fireplace and a few cards heal.</p>
<h3>Scenarios</h3>
<p><b>1. Marooned</b> (12 rounds): build Fire and a 15-wood signal pile (stages of 1–5 wood, one stage a round, added before the actions); have both in round 10, 11 or 12. <b>2. The Hexed Isle</b> (10 rounds): raise a Cross on five different tiles; book cards bring fog (+1 pawn, terrain hidden); the first totem is a temple to search, the second hurts, later ones bring fog. <b>3. Stranded Friend</b> (8 rounds): build the Rescue Raft, row out to rescue Ada before her wounds kill her, then build the Lifeboat. <b>6. Settlers</b> (12 rounds): shelter, roof, palisade and weapon at 1 or more plus all 9 dealt inventions; children arrive in rounds 7, 9 and 11 and must be fed.</p>
<p class="muted small">Names, card text and art in this game are original. Its rules and numbers follow a published co-operative survival board game. Details that the sources left open are listed in the game's rules notes.</p>
<section class="credits-audio">
<h3>Credits</h3>
<p>Names and card text are original. The card paintings and the card back were painted for this game by Am015-dev.</p>
<h4>Audio</h4>
<ul>
<li>Art and music by Am015-dev</li></ul>
<p><small>All sounds were trimmed, loudness-normalised and converted to MP3 for this game.</small></p>
</section>`;
